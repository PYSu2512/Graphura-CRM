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
    method: payment.paymentProvider === 'OFFLINE' ? 'Global Payment' : (payment.paymentProvider || 'Razorpay'),
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

  const q = {
    admin: req.admin._id,
    $or: [
      { finalAmount: { $gt: 0 } },
      { status: 'SENT_TO_FINANCE' },
      { stage: 'Interested' },
    ],
  };
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

  // Razorpay redirects the CLIENT (not logged-in) here after payment.
  // Must be a public URL — use the backend public success endpoint which
  // then serves the standalone success page.
  const backendBase = process.env.BACKEND_PUBLIC_URL || process.env.NGROK_URL || `http://localhost:${process.env.PORT || 5000}`;
  const callbackUrl = `${backendBase}/api/payments/razorpay-success?prospectId=${prospectId}`;
  
  const randomSuffix = require('crypto').randomBytes(3).toString('hex');
  const uniqueRefId = `PROSPECT-${String(prospect._id)}-${randomSuffix}`;
  const linkResult = await createPaymentLink({
    adminId: req.admin._id,
    amount,
    currency: 'INR',
    description: receipt,
    referenceId: uniqueRefId,
    customer,
    callbackUrl,
  });

  // If createPaymentLink returned ok:false and contained no link, try fetching existing link explicitly
  if (linkResult && linkResult.ok === false) {
    try {
      const { fetchPaymentLinkByReference } = require('../services/razorpay.service');
      const existing = await fetchPaymentLinkByReference(uniqueRefId, req.admin._id);
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
    client: prospect.client?._id || undefined, // optional — schema allows null
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
  prospect.razorpayPaymentId = null;
  prospect.razorpayOrderId = linkResult.orderId || null;
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
          referenceId: uniqueRefId,
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

  // Sync Lead → CONVERTED + Client → CLOSED_WON when payment succeeds
  if (payment.status === 'SUCCESS') {
    setImmediate(async () => {
      try {
        const { syncLeadConversionOnPayment } = require('./paymentWebhook.controller');
        await syncLeadConversionOnPayment({
          adminId:    req.admin._id,
          prospectId: String(prospect._id),
          paidAt:     payment.paidAt || new Date(),
        });
      } catch (err) {
        console.error('verifyPayment: syncLeadConversion failed', err.message);
      }
    });
  }

  res.status(200).json(new ApiResponse(200, { payment: mapPaymentForFrontend(payment.toObject(), prospect) }, 'Payment verified/updated'));
});

exports.markFailed = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { ProspectForm, Payment, AuditLog } = require('../models');
  const { prospectId } = req.params;
  const { note } = req.body || {};

  const prospect = await ProspectForm.findOne({ _id: prospectId, admin: req.admin._id });
  if (!prospect) return next(new AppError('Prospect not found', 404));

  let payment = await Payment.findOne({ prospectForm: prospect._id }).sort({ createdAt: -1 });
  
  const failureReason = note || 'Cancelled by finance manager';

  if (!payment) {
    // If no payment record exists yet, create one marked as FAILED
    payment = await Payment.create({
      admin: req.admin._id,
      prospectForm: prospect._id,
      client: prospect.client?._id || undefined,
      amount: prospect.finalAmount || prospect.totalAmount || 0,
      paymentType: prospect.paymentType || 'FULL',
      status: 'FAILED',
      paymentProvider: 'RAZORPAY',
      failureReason,
    });
  } else {
    payment.status = 'FAILED';
    payment.failureReason = failureReason;
    if (['PENDING', 'SENT'].includes(payment.paymentLinkStatus)) {
      payment.paymentLinkStatus = 'EXPIRED';
    }
    await payment.save();
  }

  prospect.paymentStatus = 'FAILED';
  prospect.paymentFailedAt = new Date();
  prospect.paymentFailureReason = failureReason;
  prospect.updatedBy = req.user?._id || null;
  await prospect.save();

  // Add audit log
  await AuditLog.create({
    admin: req.admin._id,
    performedBy: req.user._id,
    performerType: 'USER',
    action: 'PAYMENT_FAILED',
    targetModel: 'Payment',
    targetId: payment._id,
    note: `Payment marked failed for ${prospect.contactPerson || 'Client'}. ${failureReason}`,
  });

  res.status(200).json(new ApiResponse(200, { payment: mapPaymentForFrontend(payment.toObject(), prospect) }, 'Payment marked failed'));
});

/**
 * GET /api/finance/payments/search-prospect
 * Search for prospects by client email (tenant-scoped)
 */
exports.searchProspectByEmail = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { ProspectForm, Payment, Client } = require('../models');
  const { email } = req.query;

  if (!email) return next(new AppError('Email is required', 400));

  // Find ALL clients with this email (might be multiple entities)
  const clients = await Client.find({ 
    admin: req.admin._id, 
    email: email.toLowerCase().trim() 
  }).lean();

  if (!clients || clients.length === 0) {
    return res.status(200).json(new ApiResponse(200, { found: false }, 'No client found with this email'));
  }

  const clientIds = clients.map(c => c._id);
  const clientMap = {};
  clients.forEach(c => { clientMap[String(c._id)] = c; });

  // Find all prospects for all these clients
  const prospects = await ProspectForm.find({ 
    admin: req.admin._id, 
    client: { $in: clientIds } 
  })
  .populate('filledBy', 'name email')
  .sort({ createdAt: -1 });

  if (!prospects || prospects.length === 0) {
    return res.status(200).json(new ApiResponse(200, { found: false }, 'No prospects found for this email'));
  }

  // Map and filter out prospects with zero remaining balance
  const eligibleProspects = await Promise.all(prospects.map(async (p) => {
    const payments = await Payment.find({ prospectForm: p._id, status: 'SUCCESS' }).lean();
    const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const totalAmount = p.finalAmount || p.totalAmount || 0;
    const remainingAmount = Math.max(0, totalAmount - totalPaid);

    if (remainingAmount <= 0) return null;

    const client = clientMap[String(p.client)];

    return {
      prospectId: String(p._id),
      name: client?.name || p.contactPerson || '',
      email: client?.email || '',
      mobile: client?.mobile || '',
      service: (p.finalServices || p.suggestedServices || []).map(s => s.name).filter(Boolean).join(', ') || p.requirement || 'General Service',
      totalAmount,
      paidAmount: totalPaid,
      remainingAmount,
      date: p.createdAt
    };
  }));

  const filtered = eligibleProspects.filter(Boolean);

  if (filtered.length === 0) {
    return res.status(200).json(new ApiResponse(200, { found: false, allPaid: true }, 'All payments for this client/email are already completed'));
  }

  res.status(200).json(new ApiResponse(200, { found: true, prospects: filtered }, 'Prospects found'));
});

/**
 * POST /api/finance/payments/offline-payment
 * Process a cash/offline payment for a prospect
 */
exports.processOfflinePayment = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { ProspectForm, Payment } = require('../models');
  const { prospectId, amount, paymentType, note } = req.body;

  if (!prospectId || !amount) {
    return next(new AppError('Prospect ID and amount are required', 400));
  }

  const prospect = await ProspectForm.findOne({ _id: prospectId, admin: req.admin._id });
  if (!prospect) return next(new AppError('Prospect not found', 404));

  const payAmount = Number(amount);
  const isFull = String(paymentType).toUpperCase() === 'FULL';

  // 1. Create Payment Record
  const payment = await Payment.create({
    admin: req.admin._id,
    prospectForm: prospect._id,
    client: prospect.client || undefined,
    amount: payAmount,
    paymentType: isFull ? 'FULL' : 'PARTIAL',
    status: 'SUCCESS',
    paymentProvider: 'OFFLINE',
    paidAt: new Date(),
    verifiedBy: req.user._id,
    notes: note || 'Global Payment (Cash/Offline)',
    signatureVerified: true,
  });

  // 2. Update Prospect Form
  prospect.paymentStatus = 'SUCCESS';
  prospect.paymentVerifiedAt = new Date();
  prospect.paymentMethod = 'GLOBAL_PAYMENT';
  prospect.updatedBy = req.user._id;
  prospect.payments = prospect.payments || [];
  prospect.payments.push(payment._id);
  await prospect.save();

  // 3. Sync Lead → CONVERTED + Client → CLOSED_WON (same as Razorpay webhook)
  setImmediate(async () => {
    try {
      const { syncLeadConversionOnPayment } = require('./paymentWebhook.controller');
      await syncLeadConversionOnPayment({
        adminId:    req.admin._id,
        prospectId: String(prospect._id),
        paidAt:     payment.paidAt || new Date(),
      });
    } catch (err) {
      console.error('processOfflinePayment: syncLeadConversion failed', err.message);
    }
  });

  // 4. Trigger Work Order and Invoice (Async)
  const { autoCreateWorkOrder } = require('./workOrder.controller');
  const { autoCreateInvoice } = require('./invoice.controller');

  // We want to ensure these are created
  try {
    await autoCreateWorkOrder({
      adminId: req.admin._id,
      paymentId: String(payment._id),
      prospectId: String(prospect._id),
      createdBy: req.user._id,
    });
    
    await autoCreateInvoice({
      adminId: req.admin._id,
      paymentId: String(payment._id),
      prospectId: String(prospect._id),
    });
  } catch (err) {
    console.error('Offline Payment: Auto-creation failed', err);
    // We don't fail the whole request because the payment IS recorded
  }

  res.status(200).json(new ApiResponse(200, {
    success: true,
    paymentId: String(payment._id),
    amount: payAmount,
    txnId: `OFFLINE-${Date.now()}`
  }, 'Offline payment processed successfully'));
});

/**
 * GET /api/finance/payments/:prospectId/fetch-razorpay-link
 * Debug endpoint: attempts to fetch existing Razorpay payment link by reference id
 */
exports.fetchExistingRazorpayLink = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { prospectId } = req.params;
  const { ProspectForm, Payment } = require('../models');
  const prospect = await ProspectForm.findOne({ _id: prospectId, admin: req.admin._id });
  if (!prospect) return next(new AppError('Prospect not found', 404));

  // Find latest payment for this prospect
  const payment = await Payment.findOne({ prospectForm: prospect._id, paymentLinkId: { $ne: null } }).sort({ createdAt: -1 });
  if (!payment) return res.status(404).json(new ApiResponse(404, null, 'No payment link found for this prospect'));

  const { loadRazorpayCredentials } = require('../services/razorpay.service');
  const axios = require('axios');
  const creds = await loadRazorpayCredentials(req.admin._id);
  if (!creds.keyId || !creds.keySecret) {
    return res.status(400).json(new ApiResponse(400, null, 'Razorpay credentials not configured'));
  }
  const auth = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
  try {
    const response = await axios.get(`https://api.razorpay.com/v1/payment_links/${payment.paymentLinkId}`, {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 10000,
    });
    const found = response.data;
    return res.status(200).json(new ApiResponse(200, { link: { id: found.id, url: found.short_url || found.url }, raw: found }, 'Existing link found'));
  } catch (err) {
    return res.status(404).json(new ApiResponse(404, null, 'No payment link found for this prospect on Razorpay'));
  }
});

/**
 * POST /api/finance/payments/:prospectId/recreate-link
 * Force-creates a new Razorpay payment link (marks old one as EXPIRED first).
 * Use this when the old link has a dead callback URL (e.g. stale ngrok URL).
 */
exports.recreatePaymentLink = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { ProspectForm, Payment } = require('../models');
  const { prospectId } = req.params;

  const prospect = await ProspectForm.findOne({ _id: prospectId, admin: req.admin._id }).populate('client', 'name email mobile companyName');
  if (!prospect) return next(new AppError('Prospect not found', 404));

  const amount = Number(prospect.finalAmount || prospect.totalAmount || prospect.value || 0);
  if (!amount || amount <= 0) return next(new AppError('Payment amount is not set on this record', 400));

  const recipientEmail = String(prospect.client?.email || req.body?.email || '').trim();
  if (!recipientEmail) return next(new AppError('Client email is missing', 400));

  // Mark all existing PENDING/SENT payment links as EXPIRED
  await Payment.updateMany(
    {
      admin: req.admin._id,
      prospectForm: prospect._id,
      paymentLinkStatus: { $in: ['SENT', 'PENDING'] },
      status: { $ne: 'SUCCESS' },
    },
    { $set: { paymentLinkStatus: 'EXPIRED' } },
  );

  // Force-create a brand new link without sending it immediately
  const { createPaymentLink } = require('../services/razorpay.service');
  const customer = {
    name: prospect.client?.name || prospect.contactPerson || '',
    email: recipientEmail,
    contact: prospect.client?.mobile || req.body?.mobile,
  };
  const receipt = `PROSPECT-${String(prospect._id)}`;
  const backendBase = process.env.BACKEND_PUBLIC_URL || process.env.NGROK_URL || `http://localhost:${process.env.PORT || 5000}`;
  const callbackUrl = `${backendBase}/api/payments/razorpay-success?prospectId=${prospectId}`;
  
  const randomSuffix = require('crypto').randomBytes(3).toString('hex');
  const uniqueRefId = `PROSPECT-${String(prospect._id)}-${randomSuffix}`;
  const linkResult = await createPaymentLink({
    adminId: req.admin._id,
    amount,
    currency: 'INR',
    description: receipt,
    referenceId: uniqueRefId,
    customer,
    callbackUrl,
  });

  // If createPaymentLink returned ok:false and contained no link, try fetching existing link explicitly
  if (linkResult && linkResult.ok === false) {
    try {
      const { fetchPaymentLinkByReference } = require('../services/razorpay.service');
      const existing = await fetchPaymentLinkByReference(uniqueRefId, req.admin._id);
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
    client: prospect.client?._id || undefined,
    amount,
    paymentType: prospect.paymentType || 'FULL',
    status: 'PENDING',
    paymentProvider: 'RAZORPAY',
    paymentLinkId: linkResult.linkId || null,
    paymentLinkUrl: linkResult.linkUrl || null,
    paymentLinkStatus: linkResult.ok === false ? 'FAILED' : 'PENDING',
    razorpayOrderId: linkResult.orderId || null,
    sentAt: null,
    sentBy: null,
    rawResponse: linkResult.raw || null,
  });

  // Attach payment to prospect
  prospect.payments = prospect.payments || [];
  prospect.payments.push(paymentDoc._id);
  prospect.razorpayLinkUrl = linkResult.linkUrl || paymentDoc.paymentLinkUrl;
  prospect.razorpayLinkStatus = 'PENDING';
  prospect.razorpayPaymentLinkId = linkResult.linkId || paymentDoc.paymentLinkId || null;
  prospect.razorpayPaymentId = null;
  prospect.razorpayOrderId = linkResult.orderId || null;
  prospect.razorpayLinkSentAt = null;
  prospect.paymentStatus = 'PENDING';
  prospect.updatedBy = req.user?._id || null;
  await prospect.save();

  const responsePayload = {
    payment: mapPaymentForFrontend(paymentDoc.toObject(), prospect),
    link: { id: paymentDoc.paymentLinkId, url: paymentDoc.paymentLinkUrl },
    email: { success: false, reason: 'Link created but not sent yet. Click Send Link to notify the client.' }
  };
  if (linkResult && linkResult.ok === false) responsePayload.linkError = linkResult.error || 'Link creation failed';

  return res.status(200).json(new ApiResponse(200, responsePayload, 'Payment link recreated successfully'));
});

