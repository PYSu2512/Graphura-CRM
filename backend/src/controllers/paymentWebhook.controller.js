"use strict";

const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * Razorpay webhook handler
 * Verifies signature, logs webhook, and updates Payment/Prospect/Project atomically
 */

exports.razorpay = catchAsync(async (req, res, next) => {
  const models = require('../models');
  const { WebhookLog, Payment, ProspectForm, Project } = models;

  const ApiConfig = require('../models').ApiConfig;
  const { decrypt } = require('../utils/encrypt');
  const signatureHeader = req.headers['x-razorpay-signature'] || req.headers['x-razorpay-signature'.toLowerCase()];
  
  // Priority: use req.body directly if it's a Buffer from express.raw()
  // Otherwise use req.rawBody from verify callback
  let raw = '';
  if (Buffer.isBuffer(req.body)) {
    raw = req.body.toString('utf8');
    logger.info('Webhook: Using req.body (Buffer from express.raw)', { bodyLength: req.body.length });
  } else if (req.rawBody) {
    raw = req.rawBody.toString('utf8');
    logger.info('Webhook: Using req.rawBody (from verify callback)', { bodyLength: req.rawBody.length });
  } else if (typeof req.body === 'string') {
    raw = req.body;
    logger.info('Webhook: Using req.body (string)', { bodyLength: req.body.length });
  } else {
    raw = JSON.stringify(req.body || {});
    logger.info('Webhook: Using JSON.stringify(req.body)', { bodyLength: raw.length });
  }
  
  logger.info('Webhook signature check', { 
    signatureHeader: signatureHeader ? signatureHeader.substring(0, 20) + '...' : 'MISSING',
    rawLength: raw.length,
    rawPreview: raw.substring(0, 100)
  });
  
  let isVerified = false;

  const tryVerify = (secret, label = 'secret') => {
    try {
      if (!secret) {
        logger.warn('Webhook verify attempt: secret is empty', { label });
        return false;
      }
      const secretStr = String(secret).trim();
      const signatureStr = String(signatureHeader || '').trim();
      
      const expected = crypto.createHmac('sha256', secretStr).update(raw).digest('hex');
      const matches = expected === signatureStr;
      
      if (!matches) {
        logger.warn('Webhook signature mismatch', {
          label,
          expectedStart: expected.substring(0, 20),
          actualStart: signatureStr.substring(0, 20),
          rawLength: raw.length,
        });
      } else {
        logger.info('Webhook signature verified!', { label });
      }
      return matches;
    } catch (err) {
      logger.error('Webhook signature verification attempt error', { label, error: err.message });
      return false;
    }
  };

  // Try global secrets first
  const globalCandidates = [process.env.RAZORPAY_WEBHOOK_SECRET, process.env.RAZORPAY_KEY_SECRET];
  for (let i = 0; i < globalCandidates.length; i++) {
    const s = globalCandidates[i];
    logger.info('Trying global secret', { index: i, secretAvailable: !!s });
    if (s && tryVerify(s, `GLOBAL_${i === 0 ? 'WEBHOOK_SECRET' : 'KEY_SECRET'}`)) {
      isVerified = true;
      logger.info('Verified with global secret', { index: i });
      break;
    }
  }

  const payload = (() => { try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { logger.warn('Failed to parse payload JSON', { error: e.message }); return req.body || {}; } })();
  
  // If not verified yet, attempt tenant-scoped secret lookup by finding associated Payment -> admin
  if (!isVerified) {
    logger.info('Attempting tenant-scoped secret lookup...');
    try {
      const paymentEntity = payload?.payload?.payment?.entity;
      const linkEntity = payload?.payload?.payment_link?.entity;
      let adminId = null;
      
      if (paymentEntity) {
        logger.info('Payment entity found, searching by payment ID or order ID', { paymentId: paymentEntity.id, orderId: paymentEntity.order_id });
        const p = await Payment.findOne({ $or: [{ razorpayPaymentId: paymentEntity.id }, { razorpayOrderId: paymentEntity.order_id }] });
        if (p) {
          adminId = p.admin;
          logger.info('Payment found by paymentEntity', { adminId: adminId?.toString() });
        }
      }
      
      if (!adminId && linkEntity) {
        const linkId = linkEntity?.id || linkEntity?.short_url;
        logger.info('Link entity found, searching by link ID', { linkId });
        const p = await Payment.findOne({ paymentLinkId: linkId });
        if (p) {
          adminId = p.admin;
          logger.info('Payment found by linkEntity', { adminId: adminId?.toString() });
        }
      }
      
      if (adminId) {
        logger.info('Looking up tenant secrets', { adminId: adminId.toString() });
        const configs = await ApiConfig.find({ admin: adminId, key: { $in: ['RAZORPAY_WEBHOOK_SECRET', 'RAZORPAY_KEY_SECRET'] } });
        logger.info('Found API configs', { count: configs.length });
        
        const configMap = {};
        (configs || []).forEach((c) => { 
          configMap[c.key] = c.isEncrypted ? decrypt(c.value) : c.value;
          logger.info('Loaded API config', { key: c.key, isEncrypted: c.isEncrypted });
        });
        
        const tenantCandidates = [configMap.RAZORPAY_WEBHOOK_SECRET, configMap.RAZORPAY_KEY_SECRET];
        for (let i = 0; i < tenantCandidates.length; i++) {
          const s = tenantCandidates[i];
          logger.info('Trying tenant secret', { index: i, secretAvailable: !!s });
          if (s && tryVerify(s, `TENANT_${adminId.toString()}_${i === 0 ? 'WEBHOOK_SECRET' : 'KEY_SECRET'}`)) {
            isVerified = true;
            logger.info('Verified with tenant secret', { adminId: adminId.toString(), index: i });
            break;
          }
        }
      } else {
        logger.warn('No admin found for tenant-scoped verification');
      }
    } catch (err) {
      logger.error('Tenant secret verification attempt error', { error: err.message, stack: err.stack });
    }
  }
  const event = payload?.event || (payload?.payload ? Object.keys(payload.payload)[0] : 'razorpay.unknown');

  // Persist webhook log
  const wlog = await WebhookLog.create({ source: 'RAZORPAY', event, payload, rawBody: raw, signature: signatureHeader, isVerified });

  if (!isVerified) {
    wlog.error = 'Signature verification failed';
    await wlog.save();
    logger.warn('Razorpay webhook signature failed');
    return res.status(400).send('signature verification failed');
  }

  // Process known events
  try {
    // Payment captured (classic)
    const paymentEntity = payload?.payload?.payment?.entity;
    const linkEntity = payload?.payload?.payment_link?.entity;

    if (paymentEntity) {
      const razorpayPaymentId = paymentEntity.id;
      const razorpayOrderId = paymentEntity.order_id;
      // Find associated Payment
      const payment = await Payment.findOne({ $or: [{ razorpayPaymentId }, { razorpayOrderId }] });
      if (payment) {
        if (payment.status !== 'SUCCESS') {
          payment.status = 'SUCCESS';
          payment.razorpayPaymentId = razorpayPaymentId;
          payment.paidAt = paymentEntity?.created_at ? new Date(paymentEntity.created_at * 1000) : new Date();
          payment.signatureVerified = true;
          payment.webhookVerified = true;
          await payment.save();

          // Mirror to prospect and project atomically
          if (payment.prospectForm) {
            const prospect = await ProspectForm.findById(payment.prospectForm);
            if (prospect) {
              prospect.paymentStatus = 'SUCCESS';
              prospect.paymentVerifiedAt = payment.paidAt || new Date();
              prospect.razorpayPaymentId = razorpayPaymentId;
              prospect.updatedBy = null;
              await prospect.save();
              // Update project paidAmount if there's a project referencing this prospect
              await Project.updateOne({ prospectForm: prospect._id }, { $inc: { paidAmount: payment.amount } });
            }
          }
        }
        wlog.isProcessed = true;
        wlog.processedAt = new Date();
        wlog.razorpayPaymentId = razorpayPaymentId;
        wlog.razorpayOrderId = razorpayOrderId;
        await wlog.save();
        return res.status(200).json({ success: true });
      }
    }

    // Payment link paid event
    if (linkEntity) {
      const linkId = linkEntity?.id || linkEntity?.short_url;
      const payments = await Payment.find({ paymentLinkId: linkId });
      if (payments && payments.length > 0) {
        for (const payment of payments) {
          if (payment.status !== 'SUCCESS') {
            payment.status = 'SUCCESS';
            payment.paidAt = new Date();
            payment.webhookVerified = true;
            await payment.save();
            if (payment.prospectForm) {
              const prospect = await ProspectForm.findById(payment.prospectForm);
              if (prospect) {
                prospect.paymentStatus = 'SUCCESS';
                prospect.paymentVerifiedAt = payment.paidAt;
                prospect.updatedBy = null;
                await prospect.save();
              }
            }
          }
        }
        wlog.isProcessed = true;
        wlog.processedAt = new Date();
        await wlog.save();
        return res.status(200).json({ success: true });
      }
    }

    // Unknown event — mark processed to avoid retries
    wlog.isProcessed = true;
    wlog.processedAt = new Date();
    await wlog.save();
    return res.status(200).json({ success: true, note: 'event noted' });
  } catch (err) {
    logger.error('Failed processing webhook', err.message || err);
    wlog.error = String(err.message || err);
    await wlog.save();
    return res.status(500).json({ success: false });
  }
});

/**
 * Test endpoint to verify webhook signature verification
 * POST /api/payments/webhook/test
 * Body: { signature: "...", payload: {...} }
 */
exports.test = catchAsync(async (req, res, next) => {
  const crypto = require('crypto');
  const { signature, payload, secret } = req.body;
  
  if (!signature || !payload || !secret) {
    return res.status(400).json({ 
      error: 'Missing required fields: signature, payload, secret',
      example: { signature: 'xxx', payload: {}, secret: 'webhook_secret' }
    });
  }
  
  const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const expected = crypto.createHmac('sha256', String(secret).trim()).update(raw).digest('hex');
  const matches = expected === String(signature).trim();
  
  return res.status(200).json({
    signatureProvided: signature.substring(0, 20) + '...',
    signatureExpected: expected.substring(0, 20) + '...',
    matches,
    rawLength: raw.length,
    rawPreview: raw.substring(0, 200),
  });
});

/**
 * GET /api/payments/webhook/status
 * Shows webhook configuration and health status
 */
exports.status = catchAsync(async (req, res, next) => {
  const { ApiConfig, WebhookLog } = require('../models');
  
  const globalSecretSet = !!process.env.RAZORPAY_WEBHOOK_SECRET;
  const recentWebhooks = await WebhookLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  
  const recentFailures = recentWebhooks.filter(w => !w.isVerified).length;
  const recentSuccesses = recentWebhooks.filter(w => w.isVerified).length;
  
  return res.status(200).json({
    status: 'ok',
    webhook: {
      globalSecretConfigured: globalSecretSet,
      recentWebhooks: recentWebhooks.length,
      recentFailures,
      recentSuccesses,
      lastWebhook: recentWebhooks[0] ? {
        event: recentWebhooks[0].event,
        isVerified: recentWebhooks[0].isVerified,
        createdAt: recentWebhooks[0].createdAt,
        error: recentWebhooks[0].error,
      } : null,
    },
    diagnostics: {
      message: 'If you see recent webhook failures with "Signature verification failed", check:',
      steps: [
        '1. Verify RAZORPAY_WEBHOOK_SECRET in .env matches Razorpay dashboard settings',
        '2. For tenant-specific secrets, check Admin > API Config > Razorpay Webhook Secret',
        '3. Use POST /api/payments/webhook/test to verify signature logic',
        '4. Check logs for detailed signature mismatch information',
      ],
    },
  });
});
