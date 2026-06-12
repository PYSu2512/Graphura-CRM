"use strict";

const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

/**
 * GET /api/payments/razorpay-success
 *
 * Razorpay redirects the CLIENT here after payment (callback_url).
 * This is a PUBLIC endpoint — no auth required.
 *
 * Query params from Razorpay:
 *   razorpay_payment_id  — payment ID (only on success)
 *   razorpay_payment_link_id — payment link ID
 *   razorpay_payment_link_reference_id — our reference_id (PROSPECT-<id>)
 *   razorpay_payment_link_status — 'paid' | 'cancelled'
 *   razorpay_signature — HMAC signature to verify
 *
 * We verify the callback signature, update the Payment/ProspectForm immediately
 * (before the webhook arrives), then redirect to the frontend success page.
 */
exports.razorpaySuccess = catchAsync(async (req, res, next) => {
  const {
    razorpay_payment_id,
    razorpay_payment_link_id,
    razorpay_payment_link_reference_id,
    razorpay_payment_link_status,
    razorpay_signature,
    prospectId: queryProspectId,
  } = req.query || {};

  const { Payment, ProspectForm, ApiConfig } = require('../models');
  const { decrypt } = require('../utils/encrypt');
  const crypto = require('crypto');

  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';

  // ── Resolve prospectId ───────────────────────────────────────────────────
  let prospectId = queryProspectId;

  // Try to extract from reference_id (PROSPECT-<mongoId>)
  if (!prospectId && razorpay_payment_link_reference_id) {
    const m = String(razorpay_payment_link_reference_id).match(/PROSPECT-([a-f0-9]{24})/i);
    if (m) prospectId = m[1];
  }

  logger.info('razorpaySuccess callback received', {
    prospectId,
    razorpay_payment_link_id,
    razorpay_payment_link_status,
    razorpay_payment_id: razorpay_payment_id ? razorpay_payment_id.substring(0, 12) + '...' : null,
    hasSignature: !!razorpay_signature,
  });

  // ── Verify Razorpay callback signature ───────────────────────────────────
  // Razorpay signs: payment_link_id + "|" + payment_link_reference_id + "|" + payment_link_status + "|" + payment_id
  let signatureValid = false;

  if (
    razorpay_payment_id &&
    razorpay_payment_link_id &&
    razorpay_payment_link_reference_id &&
    razorpay_payment_link_status &&
    razorpay_signature
  ) {
    const message = [
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_payment_id,
    ].join('|');

    const tryVerify = (secret) => {
      if (!secret) return false;
      try {
        const expected = crypto
          .createHmac('sha256', String(secret).trim())
          .update(message)
          .digest('hex');
        return expected === String(razorpay_signature).trim();
      } catch {
        return false;
      }
    };

    // 1. Try global env secrets
    signatureValid =
      tryVerify(process.env.RAZORPAY_WEBHOOK_SECRET) ||
      tryVerify(process.env.RAZORPAY_KEY_SECRET);

    // 2. Try tenant secret — look up admin via Payment doc (by link ID)
    if (!signatureValid && razorpay_payment_link_id) {
      try {
        const payment = await Payment.findOne({ paymentLinkId: razorpay_payment_link_id }).lean();
        if (payment?.admin) {
          const configs = await ApiConfig.find({
            admin: payment.admin,
            key: { $in: ['RAZORPAY_WEBHOOK_SECRET', 'RAZORPAY_KEY_SECRET'] },
          }).lean();
          for (const c of configs) {
            const secret = c.isEncrypted ? decrypt(c.value) : c.value;
            if (tryVerify(secret)) {
              signatureValid = true;
              logger.info('razorpaySuccess: verified via tenant secret (Payment lookup)');
              break;
            }
          }
        }
      } catch (err) {
        logger.warn('razorpaySuccess: tenant secret lookup via Payment failed', { error: err.message });
      }
    }

    // 3. Try tenant secret — look up admin via ProspectForm (by reference_id)
    if (!signatureValid && prospectId) {
      try {
        const prospect = await ProspectForm.findById(prospectId).lean();
        if (prospect?.admin) {
          const configs = await ApiConfig.find({
            admin: prospect.admin,
            key: { $in: ['RAZORPAY_WEBHOOK_SECRET', 'RAZORPAY_KEY_SECRET'] },
          }).lean();
          for (const c of configs) {
            const secret = c.isEncrypted ? decrypt(c.value) : c.value;
            if (tryVerify(secret)) {
              signatureValid = true;
              logger.info('razorpaySuccess: verified via tenant secret (ProspectForm lookup)');
              break;
            }
          }
        }
      } catch (err) {
        logger.warn('razorpaySuccess: tenant secret lookup via ProspectForm failed', { error: err.message });
      }
    }

    logger.info('razorpaySuccess: signature check result', { signatureValid });

    // ── Update payment status immediately (before webhook arrives) ──────────
    if (razorpay_payment_link_status === 'paid' && razorpay_payment_id) {
      try {
        // Find Payment doc by link ID or payment ID
        let payment = await Payment.findOne({
          $or: [
            { paymentLinkId: razorpay_payment_link_id },
            { razorpayPaymentId: razorpay_payment_id },
          ],
        });

        if (payment && payment.status !== 'SUCCESS') {
          payment.status = 'SUCCESS';
          payment.razorpayPaymentId = razorpay_payment_id;
          payment.paidAt = new Date();
          payment.signatureVerified = signatureValid;
          await payment.save();

          if (payment.prospectForm) {
            await ProspectForm.findByIdAndUpdate(payment.prospectForm, {
              paymentStatus: 'SUCCESS',
              paymentVerifiedAt: new Date(),
              razorpayPaymentId: razorpay_payment_id,
            });
          }

          logger.info('razorpaySuccess: Payment updated via callback', {
            paymentId: String(payment._id),
          });

          // Auto-generate invoice (fire-and-forget)
          setImmediate(async () => {
            try {
              const { autoCreateInvoice } = require('./invoice.controller');
              await autoCreateInvoice({
                adminId: payment.admin,
                paymentId: String(payment._id),
                prospectId: payment.prospectForm ? String(payment.prospectForm) : null,
              });
            } catch (err) {
              logger.error('razorpaySuccess: autoCreateInvoice failed', { error: err.message });
            }

            try {
              const { autoCreateWorkOrder } = require('./workOrder.controller');
              await autoCreateWorkOrder({
                adminId: payment.admin,
                paymentId: String(payment._id),
                prospectId: payment.prospectForm ? String(payment.prospectForm) : null,
              });
            } catch (err) {
              logger.error('razorpaySuccess: autoCreateWorkOrder failed', { error: err.message });
            }

            // Sync Lead → CONVERTED + Client → CLOSED_WON
            try {
              const { syncLeadConversionOnPayment } = require('./paymentWebhook.controller');
              await syncLeadConversionOnPayment({
                adminId:    payment.admin,
                prospectId: payment.prospectForm ? String(payment.prospectForm) : null,
                paidAt:     payment.paidAt,
              });
            } catch (err) {
              logger.error('razorpaySuccess: syncLeadConversion failed', { error: err.message });
            }
          });
        } else if (!payment && prospectId) {
          // No Payment doc exists (created before schema fix) — update ProspectForm directly
          // and create a Payment record so the webhook can find it later
          const prospect = await ProspectForm.findById(prospectId);
          if (prospect && prospect.paymentStatus !== 'SUCCESS') {
            prospect.paymentStatus = 'SUCCESS';
            prospect.paymentVerifiedAt = new Date();
            prospect.razorpayPaymentId = razorpay_payment_id;
            if (razorpay_payment_link_id) prospect.razorpayPaymentLinkId = razorpay_payment_link_id;
            await prospect.save();

            // Create a Payment record for audit trail
            try {
              await Payment.create({
                admin: prospect.admin,
                prospectForm: prospect._id,
                client: prospect.client || undefined,
                amount: prospect.finalAmount || prospect.totalAmount || 0,
                paymentType: prospect.paymentType || 'FULL',
                status: 'SUCCESS',
                paymentProvider: 'RAZORPAY',
                paymentLinkId: razorpay_payment_link_id || null,
                paymentLinkUrl: null,
                paymentLinkStatus: 'SENT',
                razorpayPaymentId: razorpay_payment_id,
                paidAt: new Date(),
                signatureVerified: signatureValid,
              });
            } catch (createErr) {
              logger.warn('razorpaySuccess: could not create Payment record', { error: createErr.message });
            }

            logger.info('razorpaySuccess: ProspectForm updated directly (no Payment doc)', {
              prospectId,
            });
          }
        }
      } catch (err) {
        logger.error('razorpaySuccess: failed to update payment', { error: err.message });
      }
    }
  }

  // ── Redirect to frontend success page ────────────────────────────────────
  const params = new URLSearchParams();
  if (prospectId) params.set('prospectId', prospectId);
  if (razorpay_payment_id) params.set('razorpay_payment_id', razorpay_payment_id);
  if (razorpay_payment_link_status) params.set('status', razorpay_payment_link_status);

  const redirectUrl = `${frontendBase}/payment-success?${params.toString()}`;
  logger.info('razorpaySuccess: redirecting to frontend', { redirectUrl });
  return res.redirect(302, redirectUrl);
});

/**
 * GET /api/payments/status/:prospectId
 *
 * Public polling endpoint — frontend calls this to check payment status.
 * No auth required (client is not logged in).
 */
exports.checkPaymentStatus = catchAsync(async (req, res, next) => {
  const { prospectId } = req.params;
  const { ProspectForm, Payment } = require('../models');

  const prospect = await ProspectForm.findById(prospectId).lean();
  if (!prospect) return next(new AppError('Prospect not found', 404));

  // Check Payment doc first, then fall back to ProspectForm.paymentStatus
  const payment = await Payment.findOne({ prospectForm: prospectId })
    .sort({ createdAt: -1 })
    .lean();

  // Determine effective status — ProspectForm is the source of truth
  const effectiveStatus = prospect.paymentStatus || payment?.status || 'PENDING';

  if (!payment) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          status: effectiveStatus,
          payment: effectiveStatus === 'SUCCESS'
            ? {
                id: null,
                status: 'SUCCESS',
                amount: prospect.finalAmount || prospect.totalAmount || 0,
                paidAt: prospect.paymentVerifiedAt || null,
                razorpayPaymentId: prospect.razorpayPaymentId || null,
                webhookVerified: false,
                signatureVerified: false,
              }
            : null,
        },
        'Payment status retrieved',
      ),
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        status: effectiveStatus,
        payment: {
          id: payment._id,
          status: effectiveStatus,
          amount: payment.amount,
          paidAt: payment.paidAt || prospect.paymentVerifiedAt,
          razorpayPaymentId: payment.razorpayPaymentId || prospect.razorpayPaymentId,
          webhookVerified: payment.webhookVerified,
          signatureVerified: payment.signatureVerified,
        },
      },
      'Payment status retrieved',
    ),
  );
});
