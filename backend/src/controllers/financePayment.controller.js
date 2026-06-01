"use strict";

const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const { sendRazorpayLinkEmail } = require('../services/email.service');

/**
 * Finance Payments Controller
 * - creates Payment documents for prospect-based payments
 * - sends payment link email
 * - verifies and marks payments
 */

const requireFinanceRole = (req, next) => {
  const allowed = ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'];
  if (!req.user || !allowed.includes(req.user.role)) return next(new AppError('Only finance users', 403));
  return true;
};

const toStatusLabel = (status) => {
  if (!status) return 'Pending';
  const s = String(status).toUpperCase();
  if (s === 'SUCCESS' || s === 'SENT') return 'Successful';
  if (s === 'FAILED') return 'Failed';
  return 'Pending';
};

const mapPaymentForFrontend = (payment, prospect) => {
  const client = (prospect && prospect.client) || {};
  return {
    id: String(payment._id),
    prospectId: String(prospect?._id || payment.prospectForm),
    client: client.name || prospect?.contactPerson || 'Client',
    companyName: client.companyName || prospect?.company || '',
    mobile: client.mobile || '',
    email: client.email || '',
    amount: payment.amount || 0,
    type: payment.paymentType === 'PARTIAL' ? 'Partial' : 'Full',
    method: payment.paymentProvider || 'Razorpay',
    status: toStatusLabel(payment.status),
    date: payment.sentAt || payment.createdAt,
    notes: payment.failureReason || '',
    razorOrderId: payment.razorpayOrderId || payment.paymentLinkId || null,
    razorPayId: payment.razorpayPaymentId || null,
    razorpayLinkUrl: payment.paymentLinkUrl || null,
    linkStatus: payment.paymentLinkStatus || 'PENDING',
  };
};

exports.listPayments = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { ProspectForm, Payment } = require('../models');

  const q = { admin: req.admin._id, finalAmount: { $gt: 0 } };
  const rows = await ProspectForm.find(q).populate('client', 'name email mobile companyName').lean();

  // For each prospect, find latest payment if any
  const payments = await Promise.all(rows.map(async (p) => {
    const pay = await Payment.findOne({ prospectForm: p._id }).sort({ createdAt: -1 }).lean();
    if (pay) return mapPaymentForFrontend(pay, p);
    // If no payment created yet, map prospect data as pending row
    return {
      id: String(p._id),
      prospectId: String(p._id),
      client: p.client?.name || p.contactPerson || '',
      companyName: p.client?.companyName || p.company || '',
      mobile: p.client?.mobile || '',
      email: p.client?.email || '',
      amount: p.finalAmount || p.totalAmount || 0,
      type: (p.paymentType === 'PARTIAL') ? 'Partial' : 'Full',
      method: p.paymentMethod || 'Razorpay',
      status: toStatusLabel(p.paymentStatus),
      date: p.razorpayLinkSentAt || p.sentToClientAt || p.updatedAt,
      notes: p.paymentFailureReason || p.notes || '',
      razorOrderId: p.razorpayOrderId || null,
      razorPayId: p.razorpayPaymentId || null,
      razorpayLinkUrl: p.razorpayLinkUrl || null,
      linkStatus: p.razorpayLinkStatus || 'PENDING',
    };
  }));

  const stats = {
    total: payments.length,
    successful: payments.filter(p => p.status === 'Successful').length,
    pending: payments.filter(p => p.status === 'Pending').length,
    failed: payments.filter(p => p.status === 'Failed').length,
    partial: payments.filter(p => p.type === 'Partial').length,
    full: payments.filter(p => p.type === 'Full').length,
  };

  res.status(200).json(new ApiResponse(200, { payments, stats }, 'Payments listed'));
});

exports.sendRazorpayLink = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { ProspectForm, Payment } = require('../models');
  const { prospectId } = req.params;

  const prospect = await ProspectForm.findOne({ _id: prospectId, admin: req.admin._id }).populate('client', 'name email mobile companyName');
  if (!prospect) return next(new AppError('Prospect not found', 404));

  const amount = Number(prospect.finalAmount || prospect.totalAmount || prospect.value || 0);
  if (!amount || amount <= 0) return next(new AppError('Payment amount is not set on this record', 400));

  // Create payment link using Razorpay service (real or simulated)
  const { createPaymentLink } = require('../services/razorpay.service');
  const recipientEmail = String(prospect.client?.email || req.body?.email || '').trim();
  if (!recipientEmail) {
    return next(new AppError('Client email is missing. Please update the client record before sending the payment link.', 400));
  }

  const customer = {
    name: prospect.client?.name || prospect.contactPerson || '',
    email: recipientEmail,
    contact: prospect.client?.mobile || req.body?.mobile,
  };
  const receipt = `PROSPECT-${String(prospect._id)}`;

  // Idempotent repeat click handling:
  // If an active link already exists for this prospect, reuse it and resend the email.
  const existingPayment = await Payment.findOne({
    admin: req.admin._id,
    prospectForm: prospect._id,
    paymentProvider: 'RAZORPAY',
    paymentLinkId: { $ne: null },
    paymentLinkUrl: { $ne: null },
    paymentLinkStatus: { $in: ['SENT', 'PENDING'] },
  }).sort({ createdAt: -1 });

  if (existingPayment) {
    let emailResult = null;
    try {
      emailResult = await sendRazorpayLinkEmail({
        email: recipientEmail,
        clientName: prospect.client?.name || prospect.contactPerson || 'Client',
        companyName: prospect.client?.companyName || prospect.company || '',
        linkUrl: existingPayment.paymentLinkUrl,
        amount,
        referenceId: receipt,
      });
      existingPayment.sentAt = new Date();
      existingPayment.sentBy = req.user?._id || null;
      existingPayment.paymentLinkStatus = 'SENT';
      existingPayment.emailMessageId = emailResult?.messageId || existingPayment.emailMessageId || null;
      await existingPayment.save();
    } catch (err) {
      existingPayment.paymentLinkStatus = 'FAILED';
      existingPayment.failureReason = String(err.message || err) || 'Email send failed';
      await existingPayment.save();
    }

    prospect.razorpayLinkUrl = existingPayment.paymentLinkUrl;
    prospect.razorpayLinkStatus = 'SENT';
    prospect.razorpayPaymentLinkId = existingPayment.paymentLinkId;
    prospect.razorpayLinkSentAt = new Date();
    prospect.paymentStatus = 'PENDING';
    prospect.updatedBy = req.user?._id || null;
    await prospect.save();

    return res.status(200).json(new ApiResponse(200, {
      payment: mapPaymentForFrontend(existingPayment.toObject(), prospect),
      link: { id: existingPayment.paymentLinkId, url: existingPayment.paymentLinkUrl, reused: true },
      email: emailResult ? { success: true, messageId: emailResult.messageId || null } : { success: false, reason: existingPayment.failureReason || 'Email not sent' },
    }, 'Existing payment link reused and resent'));
  }

  // Pass tenant adminId and proper parameter names expected by razorpay.service
  // Include callback URL for Razorpay to redirect after payment
  const callbackUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/finance/payments/success?prospectId=${prospectId}`;
  
  const linkResult = await createPaymentLink({
    adminId: req.admin._id,
    amount,
    currency: 'INR',
    description: receipt,
    referenceId: receipt,
    customer,
    callbackUrl,
  });

  // If createPaymentLink returned ok:false and contained no link, try fetching existing link explicitly
  if (linkResult && linkResult.ok === false) {
    try {
      const { fetchPaymentLinkByReference } = require('../services/razorpay.service');
      const existing = await fetchPaymentLinkByReference(receipt, req.admin._id);
      if (existing) {
        linkResult.ok = true;
        linkResult.linkId = existing.id;
        linkResult.linkUrl = existing.short_url || existing.url;
        linkResult.raw = existing;
        linkResult.note = linkResult.note || 'found_existing_by_reference_id_after_retry';
      }
    } catch (err) {
      console.warn('Failed fetching existing payment link after create failure', err && err.message ? err.message : err);
    }
  }

  const paymentDoc = await Payment.create({
    admin: req.admin._id,
    prospectForm: prospect._id,
    client: prospect.client?._id || null,
    amount,
    paymentType: prospect.paymentType || 'FULL',
    status: 'PENDING',
    paymentProvider: 'RAZORPAY',
    paymentLinkId: linkResult.linkId || null,
    paymentLinkUrl: linkResult.linkUrl || null,
    paymentLinkStatus: linkResult.ok === false ? 'FAILED' : (linkResult.linkUrl ? 'SENT' : 'PENDING'),
    razorpayOrderId: linkResult.orderId || null,
    sentAt: new Date(),
    sentBy: req.user?._id || null,
    rawResponse: linkResult.raw || null,
  });

  // Attach payment to prospect
  prospect.payments = prospect.payments || [];
  prospect.payments.push(paymentDoc._id);
  prospect.razorpayLinkUrl = linkResult.linkUrl || paymentDoc.paymentLinkUrl;
  prospect.razorpayLinkStatus = linkResult.linkUrl ? 'SENT' : 'PENDING';
  prospect.razorpayPaymentLinkId = linkResult.linkId || paymentDoc.paymentLinkId || null;
  prospect.razorpayLinkSentAt = new Date();
  prospect.paymentStatus = 'PENDING';
  prospect.updatedBy = req.user?._id || null;
  await prospect.save();

  // Send email with link (best-effort)
  let emailResult = null;
  try {
    if (recipientEmail) {
      if (linkResult.ok === false || !linkResult.linkUrl) {
        // Link creation failed — mark and throw to signal failure
        paymentDoc.paymentLinkStatus = 'FAILED';
        paymentDoc.failureReason = linkResult.error || 'Payment link creation failed';
      } else {
        emailResult = await sendRazorpayLinkEmail({
          email: recipientEmail,
          clientName: prospect.client.name || prospect.contactPerson || 'Client',
          companyName: prospect.client.companyName || prospect.company || '',
          linkUrl: linkResult.linkUrl || paymentDoc.paymentLinkUrl,
          amount,
          referenceId: `PROSPECT-${String(prospect._id)}`,
        });
        paymentDoc.paymentLinkStatus = 'SENT';
      }
    }
  } catch (err) {
    paymentDoc.paymentLinkStatus = 'FAILED';
    paymentDoc.failureReason = String(err.message || err) || 'Email send failed';
  }

  if (emailResult?.messageId) {
    paymentDoc.emailMessageId = emailResult.messageId;
  }
  await paymentDoc.save();

  const responsePayload = {
    payment: mapPaymentForFrontend(paymentDoc.toObject(), prospect),
    link: { id: paymentDoc.paymentLinkId, url: paymentDoc.paymentLinkUrl },
    email: emailResult ? { success: true, messageId: emailResult.messageId || null } : { success: false, reason: paymentDoc.paymentLinkStatus === 'FAILED' ? paymentDoc.failureReason : 'Email not sent' }
  };
  if (linkResult && linkResult.ok === false) responsePayload.linkError = linkResult.error || 'Link creation failed';

  res.status(200).json(new ApiResponse(200, responsePayload, 'Payment link created'));
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { ProspectForm, Payment } = require('../models');
  const { prospectId } = req.params;
  const { status, amount, method, note, razorpayPaymentId } = req.body || {};

  const prospect = await ProspectForm.findOne({ _id: prospectId, admin: req.admin._id });
  if (!prospect) return next(new AppError('Prospect not found', 404));

  // Find latest payment for this prospect
  const payment = await Payment.findOne({ prospectForm: prospect._id }).sort({ createdAt: -1 });
  if (!payment) return next(new AppError('Payment record not found', 404));

  payment.status = String(status || 'SUCCESS').toUpperCase() === 'FAILED' ? 'FAILED' : 'SUCCESS';
  payment.paymentType = String(method || payment.paymentType || 'FULL').toUpperCase() === 'PARTIAL' ? 'PARTIAL' : 'FULL';
  if (Number(amount)) payment.amount = Number(amount);
  if (razorpayPaymentId) payment.razorpayPaymentId = razorpayPaymentId;
  if (payment.status === 'SUCCESS') payment.paidAt = new Date();
  payment.failureReason = payment.status === 'FAILED' ? (note || payment.failureReason) : null;
  payment.signatureVerified = true;
  await payment.save();

  // Mirror to prospect
  prospect.paymentStatus = payment.status === 'SUCCESS' ? 'SUCCESS' : payment.status === 'FAILED' ? 'FAILED' : 'PENDING';
  prospect.finalAmount = Number(payment.amount || prospect.finalAmount || prospect.totalAmount || 0);
  prospect.razorpayPaymentId = payment.razorpayPaymentId || prospect.razorpayPaymentId;
  prospect.paymentVerifiedAt = payment.paidAt || prospect.paymentVerifiedAt;
  prospect.paymentFailedAt = payment.status === 'FAILED' ? new Date() : prospect.paymentFailedAt;
  prospect.paymentFailureReason = payment.failureReason || prospect.paymentFailureReason;
  prospect.updatedBy = req.user?._id || null;
  await prospect.save();

  res.status(200).json(new ApiResponse(200, { payment: mapPaymentForFrontend(payment.toObject(), prospect) }, 'Payment verified/updated'));
});

exports.markFailed = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { ProspectForm, Payment } = require('../models');
  const { prospectId } = req.params;
  const { note } = req.body || {};

  const prospect = await ProspectForm.findOne({ _id: prospectId, admin: req.admin._id });
  if (!prospect) return next(new AppError('Prospect not found', 404));

  const payment = await Payment.findOne({ prospectForm: prospect._id }).sort({ createdAt: -1 });
  if (!payment) return next(new AppError('Payment record not found', 404));

  payment.status = 'FAILED';
  payment.failureReason = note || 'Marked failed from finance UI';
  await payment.save();

  prospect.paymentStatus = 'FAILED';
  prospect.paymentFailedAt = new Date();
  prospect.paymentFailureReason = note || prospect.paymentFailureReason || 'Marked failed by finance';
  prospect.updatedBy = req.user?._id || null;
  await prospect.save();

  res.status(200).json(new ApiResponse(200, { payment: mapPaymentForFrontend(payment.toObject(), prospect) }, 'Payment marked failed'));
});

/**
 * GET /api/finance/payments/:prospectId/fetch-razorpay-link
 * Debug endpoint: attempts to fetch existing Razorpay payment link by reference id
 */
exports.fetchExistingRazorpayLink = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { prospectId } = req.params;
  const { ProspectForm } = require('../models');
  const prospect = await ProspectForm.findOne({ _id: prospectId, admin: req.admin._id });
  if (!prospect) return next(new AppError('Prospect not found', 404));
  const receipt = `PROSPECT-${String(prospect._id)}`;
  const { fetchPaymentLinkByReference } = require('../services/razorpay.service');
  const found = await fetchPaymentLinkByReference(receipt, req.admin._id);
  if (!found) return res.status(404).json(new ApiResponse(404, null, 'No payment link found for this prospect'));
  return res.status(200).json(new ApiResponse(200, { link: { id: found.id, url: found.short_url || found.url }, raw: found }, 'Existing link found'));
});
