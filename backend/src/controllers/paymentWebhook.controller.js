"use strict";

const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * Razorpay webhook handler
 *
 * Signature verification strategy (in order):
 *  1. Global env secrets (RAZORPAY_WEBHOOK_SECRET, RAZORPAY_KEY_SECRET)
 *  2. Tenant-scoped secrets — resolved by finding the Payment record that
 *     matches the incoming event, then loading that admin's ApiConfig.
 *
 * Razorpay sends the raw JSON body and signs it with HMAC-SHA256.
 * We MUST use the exact bytes received — no re-serialisation.
 */
exports.razorpay = catchAsync(async (req, res, next) => {
  const { WebhookLog, Payment, ProspectForm, Project, ApiConfig } = require('../models');
  const { decrypt } = require('../utils/encrypt');

  // ── 1. Extract raw body ──────────────────────────────────────────────────
  let raw = '';
  if (Buffer.isBuffer(req.body)) {
    raw = req.body.toString('utf8');
  } else if (req.rawBody) {
    raw = Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8') : String(req.rawBody);
  } else if (typeof req.body === 'string') {
    raw = req.body;
  } else {
    // Last resort — re-serialise. Signature will almost certainly fail but we
    // still want to log the event.
    raw = JSON.stringify(req.body || {});
    logger.warn('Webhook: raw body unavailable, falling back to JSON.stringify — signature will likely fail');
  }

  const signatureHeader = (
    req.headers['x-razorpay-signature'] || ''
  ).trim();

  logger.info('Webhook received', {
    event: 'pending-parse',
    rawLength: raw.length,
    signaturePresent: !!signatureHeader,
  });

  // ── 2. Parse payload (best-effort) ──────────────────────────────────────
  let payload = {};
  try {
    payload = JSON.parse(raw);
  } catch (e) {
    logger.warn('Webhook: failed to parse JSON body', { error: e.message });
    payload = req.body || {};
  }

  const event = payload?.event || 'razorpay.unknown';

  // ── 3. Helper: try one secret ────────────────────────────────────────────
  const tryVerify = (secret, label) => {
    if (!secret) return false;
    try {
      const expected = crypto
        .createHmac('sha256', String(secret).trim())
        .update(raw)
        .digest('hex');
      const match = expected === signatureHeader;
      if (match) {
        logger.info('Webhook signature verified', { label });
      } else {
        logger.warn('Webhook signature mismatch', {
          label,
          expectedPrefix: expected.substring(0, 16),
          receivedPrefix: signatureHeader.substring(0, 16),
        });
      }
      return match;
    } catch (err) {
      logger.error('Webhook verify error', { label, error: err.message });
      return false;
    }
  };

  // ── 4. Try global secrets first ──────────────────────────────────────────
  let isVerified = false;

  if (!isVerified && process.env.RAZORPAY_WEBHOOK_SECRET) {
    isVerified = tryVerify(process.env.RAZORPAY_WEBHOOK_SECRET, 'ENV_WEBHOOK_SECRET');
  }
  if (!isVerified && process.env.RAZORPAY_KEY_SECRET) {
    isVerified = tryVerify(process.env.RAZORPAY_KEY_SECRET, 'ENV_KEY_SECRET');
  }

  // ── 5. Tenant-scoped lookup ──────────────────────────────────────────────
  if (!isVerified) {
    try {
      const adminId = await resolveAdminFromPayload(payload, Payment);

      if (adminId) {
        logger.info('Tenant lookup succeeded', { adminId: String(adminId) });

        const configs = await ApiConfig.find({
          admin: adminId,
          key: { $in: ['RAZORPAY_WEBHOOK_SECRET', 'RAZORPAY_KEY_SECRET'] },
        }).lean();

        const configMap = {};
        configs.forEach((c) => {
          configMap[c.key] = c.isEncrypted ? decrypt(c.value) : c.value;
        });

        if (!isVerified && configMap.RAZORPAY_WEBHOOK_SECRET) {
          isVerified = tryVerify(configMap.RAZORPAY_WEBHOOK_SECRET, 'TENANT_WEBHOOK_SECRET');
        }
        if (!isVerified && configMap.RAZORPAY_KEY_SECRET) {
          isVerified = tryVerify(configMap.RAZORPAY_KEY_SECRET, 'TENANT_KEY_SECRET');
        }
      } else {
        logger.warn('Webhook: could not resolve admin from payload — tenant verification skipped');
      }
    } catch (err) {
      logger.error('Webhook tenant lookup error', { error: err.message });
    }
  }

  // ── 6. Persist webhook log ───────────────────────────────────────────────
  const wlog = await WebhookLog.create({
    source: 'RAZORPAY',
    event,
    payload,
    rawBody: raw,
    signature: signatureHeader,
    isVerified,
  });

  if (!isVerified) {
    wlog.error = 'Signature verification failed';
    await wlog.save();
    logger.warn('Razorpay webhook rejected — signature invalid');
    // Return 200 to prevent Razorpay retries for permanently bad secrets,
    // but include a body that signals failure for debugging.
    // NOTE: returning 400 causes Razorpay to retry indefinitely.
    return res.status(200).json({ status: 'signature_failed' });
  }

  // ── 7. Process event ─────────────────────────────────────────────────────
  try {
    const result = await processWebhookEvent(payload, event, Payment, ProspectForm, Project);

    wlog.isProcessed = true;
    wlog.processedAt = new Date();
    if (result.razorpayPaymentId) wlog.razorpayPaymentId = result.razorpayPaymentId;
    if (result.razorpayOrderId) wlog.razorpayOrderId = result.razorpayOrderId;
    await wlog.save();

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    logger.error('Webhook processing error', { error: err.message, stack: err.stack });
    wlog.error = String(err.message || err);
    await wlog.save();
    // Still return 200 — we logged it, no point in Razorpay retrying
    return res.status(200).json({ status: 'processing_error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the admin (tenant) from the webhook payload.
 * Tries multiple strategies in order of reliability.
 */
async function resolveAdminFromPayload(payload, Payment) {
  const paymentEntity = payload?.payload?.payment?.entity;
  const linkEntity = payload?.payload?.payment_link?.entity;

  logger.info('resolveAdmin: payload keys', {
    event: payload?.event,
    hasPaymentEntity: !!paymentEntity,
    hasLinkEntity: !!linkEntity,
    paymentId: paymentEntity?.id,
    orderId: paymentEntity?.order_id,
    linkId: linkEntity?.id,
    shortUrl: linkEntity?.short_url,
    referenceId: linkEntity?.reference_id,
  });

  // Strategy A: payment entity — look up by Razorpay payment ID or order ID
  if (paymentEntity?.id || paymentEntity?.order_id) {
    const query = [];
    if (paymentEntity.id) query.push({ razorpayPaymentId: paymentEntity.id });
    if (paymentEntity.order_id) query.push({ razorpayOrderId: paymentEntity.order_id });

    const p = await Payment.findOne({ $or: query }).lean();
    if (p?.admin) {
      logger.info('resolveAdmin: found via Strategy A (payment entity)', { adminId: String(p.admin) });
      return p.admin;
    }
  }

  // Strategy B: payment link entity — look up by link ID (plink_xxx)
  if (linkEntity?.id) {
    const p = await Payment.findOne({ paymentLinkId: linkEntity.id }).lean();
    if (p?.admin) {
      logger.info('resolveAdmin: found via Strategy B (link ID)', { adminId: String(p.admin) });
      return p.admin;
    }
    logger.warn('resolveAdmin: Strategy B miss', { linkId: linkEntity.id });
  }

  // Strategy C: payment link entity — look up by short_url
  if (linkEntity?.short_url) {
    const p = await Payment.findOne({ paymentLinkUrl: linkEntity.short_url }).lean();
    if (p?.admin) {
      logger.info('resolveAdmin: found via Strategy C (short_url)', { adminId: String(p.admin) });
      return p.admin;
    }
    logger.warn('resolveAdmin: Strategy C miss', { shortUrl: linkEntity.short_url });
  }

  // Strategy D: extract PROSPECT-<id> from reference_id and look up ProspectForm
  const referenceId = linkEntity?.reference_id || paymentEntity?.description || '';
  const notes = paymentEntity?.notes || linkEntity?.notes || {};
  const description = paymentEntity?.description || linkEntity?.description || '';

  const prospectMatch = String(referenceId || description || JSON.stringify(notes))
    .match(/PROSPECT-([a-f0-9]{24})/i);

  if (prospectMatch) {
    const { ProspectForm } = require('../models');
    const prospect = await ProspectForm.findById(prospectMatch[1]).lean();
    if (prospect?.admin) {
      logger.info('resolveAdmin: found via Strategy D (reference_id)', {
        prospectId: prospectMatch[1],
        adminId: String(prospect.admin),
      });
      return prospect.admin;
    }
    logger.warn('resolveAdmin: Strategy D miss', { prospectId: prospectMatch[1] });
  }

  // Strategy E: scan recent payments for any that match the link URL pattern
  // This is a last-resort fallback for when the Payment doc was created but
  // the paymentLinkId wasn't stored correctly.
  if (linkEntity?.short_url) {
    // Try partial URL match — Razorpay short URLs are like https://rzp.io/l/xxx
    const p = await Payment.findOne({
      paymentLinkUrl: { $regex: linkEntity.short_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') },
    }).lean();
    if (p?.admin) {
      logger.info('resolveAdmin: found via Strategy E (URL regex)', { adminId: String(p.admin) });
      return p.admin;
    }
  }

  logger.warn('resolveAdmin: all strategies exhausted — no admin found');
  return null;
}

/**
 * Process a verified webhook event and update Payment / ProspectForm / Project.
 * Returns metadata for the webhook log.
 */
async function processWebhookEvent(payload, event, Payment, ProspectForm, Project) {
  const paymentEntity = payload?.payload?.payment?.entity;
  const linkEntity = payload?.payload?.payment_link?.entity;

  // ── payment.captured / payment.authorized ───────────────────────────────
  if (paymentEntity) {
    const razorpayPaymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id;

    const query = [];
    if (razorpayPaymentId) query.push({ razorpayPaymentId });
    if (razorpayOrderId) query.push({ razorpayOrderId });

    const payment = query.length
      ? await Payment.findOne({ $or: query })
      : null;

    if (payment && payment.status !== 'SUCCESS') {
      await markPaymentSuccess(payment, {
        razorpayPaymentId,
        paidAt: paymentEntity.created_at
          ? new Date(paymentEntity.created_at * 1000)
          : new Date(),
      }, ProspectForm, Project);
    }

    return { razorpayPaymentId, razorpayOrderId };
  }

  // ── payment_link.paid ────────────────────────────────────────────────────
  if (linkEntity) {
    const linkId = linkEntity.id; // plink_xxx — always present
    const shortUrl = linkEntity.short_url;
    const referenceId = linkEntity.reference_id || '';

    // Find by link ID first, then by URL as fallback
    const query = [];
    if (linkId) query.push({ paymentLinkId: linkId });
    if (shortUrl) query.push({ paymentLinkUrl: shortUrl });

    let payments = query.length ? await Payment.find({ $or: query }) : [];

    // Also extract the Razorpay payment ID from the nested payment entity
    const nestedPaymentId = payload?.payload?.payment?.entity?.id || null;

    // If no Payment doc found (e.g. created before the schema fix), try to
    // find the ProspectForm via reference_id and create a Payment on the fly.
    if (payments.length === 0) {
      const prospectMatch = referenceId.match(/PROSPECT-([a-f0-9]{24})/i);
      if (prospectMatch) {
        const prospect = await ProspectForm.findById(prospectMatch[1]);
        if (prospect) {
          logger.info('processWebhook: no Payment found, creating from ProspectForm', {
            prospectId: String(prospect._id),
          });
          try {
            const newPayment = await Payment.create({
              admin: prospect.admin,
              prospectForm: prospect._id,
              client: prospect.client || undefined,
              amount: prospect.finalAmount || prospect.totalAmount || 0,
              paymentType: prospect.paymentType || 'FULL',
              status: 'PENDING',
              paymentProvider: 'RAZORPAY',
              paymentLinkId: linkId || null,
              paymentLinkUrl: shortUrl || null,
              paymentLinkStatus: 'SENT',
              razorpayPaymentId: nestedPaymentId || null,
            });
            payments = [newPayment];
          } catch (createErr) {
            logger.error('processWebhook: failed to create Payment from ProspectForm', {
              error: createErr.message,
            });
            // Still try to update the ProspectForm directly
            if (prospect.paymentStatus !== 'SUCCESS') {
              prospect.paymentStatus = 'SUCCESS';
              prospect.paymentVerifiedAt = new Date();
              if (nestedPaymentId) prospect.razorpayPaymentId = nestedPaymentId;
              await prospect.save();
              logger.info('processWebhook: ProspectForm updated directly (no Payment doc)', {
                prospectId: String(prospect._id),
              });
            }
            return { razorpayPaymentId: nestedPaymentId };
          }
        }
      }
    }

    for (const payment of payments) {
      if (payment.status !== 'SUCCESS') {
        await markPaymentSuccess(payment, {
          razorpayPaymentId: nestedPaymentId || payment.razorpayPaymentId,
          paidAt: new Date(),
        }, ProspectForm, Project);
      }
    }

    return { razorpayPaymentId: nestedPaymentId };
  }

  // Unknown event — nothing to process
  logger.info('Webhook: unhandled event type', { event });
  return {};
}

/**
 * Mark a Payment as SUCCESS and mirror the status to ProspectForm + Project.
 * Also syncs Lead → CONVERTED and Client → CLOSED_WON.
 * Also auto-generates an invoice if one doesn't exist yet.
 */
async function markPaymentSuccess(payment, { razorpayPaymentId, paidAt }, ProspectForm, Project) {
  payment.status = 'SUCCESS';
  if (razorpayPaymentId) payment.razorpayPaymentId = razorpayPaymentId;
  payment.paidAt = paidAt || new Date();
  payment.signatureVerified = true;
  payment.webhookVerified = true;
  payment.paymentLinkStatus = 'SENT';
  await payment.save();

  logger.info('Payment marked SUCCESS', {
    paymentId: String(payment._id),
    razorpayPaymentId: payment.razorpayPaymentId,
  });

  // Mirror to ProspectForm
  if (payment.prospectForm) {
    const prospect = await ProspectForm.findById(payment.prospectForm);
    if (prospect) {
      prospect.paymentStatus = 'SUCCESS';
      prospect.paymentVerifiedAt = payment.paidAt;
      if (razorpayPaymentId) prospect.razorpayPaymentId = razorpayPaymentId;
      prospect.updatedBy = null;
      await prospect.save();

      // ── Sync Lead → CONVERTED + Client → CLOSED_WON ──────────────────
      setImmediate(async () => {
        try {
          await syncLeadConversionOnPayment({
            adminId:    payment.admin,
            prospectId: String(prospect._id),
            paidAt:     payment.paidAt,
          });
        } catch (err) {
          logger.error('markPaymentSuccess: syncLeadConversion failed', { error: err.message });
        }
      });

      // Update Project paidAmount atomically
      await Project.updateOne(
        { prospectForm: prospect._id },
        { $inc: { paidAmount: payment.amount } },
      );
    }
  }

  // Auto-generate invoice (fire-and-forget — don't block webhook response)
  setImmediate(async () => {
    try {
      const { autoCreateInvoice } = require('./invoice.controller');
      await autoCreateInvoice({
        adminId: payment.admin,
        paymentId: String(payment._id),
        prospectId: payment.prospectForm ? String(payment.prospectForm) : null,
      });
    } catch (err) {
      logger.error('markPaymentSuccess: autoCreateInvoice failed', { error: err.message });
    }

    try {
      const { autoCreateWorkOrder } = require('./workOrder.controller');
      await autoCreateWorkOrder({
        adminId: payment.admin,
        paymentId: String(payment._id),
        prospectId: payment.prospectForm ? String(payment.prospectForm) : null,
      });
    } catch (err) {
      logger.error('markPaymentSuccess: autoCreateWorkOrder failed', { error: err.message });
    }
  });
}

/**
 * syncLeadConversionOnPayment
 *
 * When a payment is confirmed (SUCCESS), this ensures:
 *  1. Lead.status  → CONVERTED  (if not already)
 *  2. Client.prospectStatus → CLOSED_WON
 *  3. Lead.convertedAt is stamped
 *  4. AuditLog entry is written
 *
 * This is idempotent — running it twice has no effect.
 */
async function syncLeadConversionOnPayment({ adminId, prospectId, paidAt }) {
  const { ProspectForm, Lead, Client, AuditLog } = require('../models');

  const prospect = await ProspectForm.findById(prospectId).lean();
  if (!prospect) {
    logger.warn('syncLeadConversion: ProspectForm not found', { prospectId });
    return;
  }

  // ── Update Lead ──────────────────────────────────────────────────────────
  if (prospect.lead) {
    const lead = await Lead.findOne({
      _id:    prospect.lead,
      admin:  adminId,
      isDeleted: { $ne: true },
    });

    if (lead && lead.status !== 'CONVERTED') {
      const prevStatus = lead.status;
      lead.status      = 'CONVERTED';
      lead.isDumped    = false;
      lead.convertedAt = paidAt || new Date();
      // convertedBy is the exec who filled the prospect form
      if (prospect.filledBy) lead.convertedBy = prospect.filledBy;
      await lead.save();

      logger.info('syncLeadConversion: Lead marked CONVERTED', {
        leadId: String(lead._id),
        prevStatus,
      });

      // AuditLog
      await AuditLog.create({
        admin:         adminId,
        performedBy:   prospect.filledBy || adminId,
        performerType: 'USER',
        action:        'LEAD_STATUS_CHANGED',
        targetModel:   'Lead',
        targetId:      lead._id,
        before:        { status: prevStatus },
        after:         { status: 'CONVERTED', convertedAt: lead.convertedAt },
        note:          'Lead auto-converted on successful payment',
      }).catch(() => {});
    }
  }

  // ── Update Client ────────────────────────────────────────────────────────
  if (prospect.client) {
    await Client.updateOne(
      {
        _id:   prospect.client,
        admin: adminId,
      },
      {
        $set: { prospectStatus: 'CLOSED_WON' },
      },
    ).catch((err) => {
      logger.warn('syncLeadConversion: Client update failed', { error: err.message });
    });

    logger.info('syncLeadConversion: Client prospectStatus → CLOSED_WON', {
      clientId: String(prospect.client),
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

// Export the sync helper so paymentSuccess.controller can call it
exports.syncLeadConversionOnPayment = syncLeadConversionOnPayment;

/**
 * POST /api/payments/webhook/test
 * Verify a signature locally without hitting Razorpay.
 */
exports.test = catchAsync(async (req, res) => {
  const { signature, payload, secret } = req.body;

  if (!signature || !payload || !secret) {
    return res.status(400).json({
      error: 'Missing required fields: signature, payload, secret',
    });
  }

  const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const expected = crypto
    .createHmac('sha256', String(secret).trim())
    .update(raw)
    .digest('hex');
  const matches = expected === String(signature).trim();

  return res.status(200).json({
    matches,
    expected: expected.substring(0, 20) + '...',
    received: String(signature).substring(0, 20) + '...',
    rawLength: raw.length,
  });
});

/**
 * GET /api/payments/webhook/status
 */
exports.status = catchAsync(async (req, res) => {
  const { WebhookLog } = require('../models');

  const recent = await WebhookLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return res.status(200).json({
    status: 'ok',
    globalSecretConfigured: !!process.env.RAZORPAY_WEBHOOK_SECRET,
    recentWebhooks: recent.length,
    failures: recent.filter((w) => !w.isVerified).length,
    successes: recent.filter((w) => w.isVerified).length,
    last: recent[0]
      ? {
          event: recent[0].event,
          isVerified: recent[0].isVerified,
          isProcessed: recent[0].isProcessed,
          error: recent[0].error,
          createdAt: recent[0].createdAt,
        }
      : null,
  });
});

/**
 * GET /api/payments/webhook/last-payload
 * Returns the raw payload of the most recent webhook for debugging.
 */
exports.lastPayload = catchAsync(async (req, res) => {
  const { WebhookLog } = require('../models');
  const last = await WebhookLog.findOne().sort({ createdAt: -1 }).lean();
  if (!last) return res.status(404).json({ error: 'No webhooks received yet' });
  return res.status(200).json({
    event: last.event,
    isVerified: last.isVerified,
    isProcessed: last.isProcessed,
    error: last.error,
    createdAt: last.createdAt,
    rawBody: last.rawBody,
    payload: last.payload,
    signature: last.signature ? last.signature.substring(0, 20) + '...' : null,
  });
});
