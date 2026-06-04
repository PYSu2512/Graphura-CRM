"use strict";

const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const FINANCE_ROLES = ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'];
const MGMT_ROLES = ['MANAGEMENT_MANAGER', 'MANAGEMENT_TL', 'MANAGEMENT_EMPLOYEE'];

const requireRole = (req, next, roles) => {
  if (!req.user || !roles.includes(req.user.role)) {
    next(new AppError('Access denied', 403));
    return false;
  }
  return true;
};

async function nextWoNumber(adminId) {
  const { WoCounter } = require('../models');
  const counter = await WoCounter.findOneAndUpdate(
    { admin: adminId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  return `${counter.prefix || 'WO'}-${String(counter.seq).padStart(6, '0')}`;
}

function calcFinancials(requirements = [], discountMode = 'None', discountValue = '') {
  const totalCost = requirements.reduce((s, r) => s + (Number(r.cost) || 0), 0);
  const dv = parseFloat(discountValue) || 0;
  let discountAmt = 0;
  if (discountMode === 'Percentage') discountAmt = Math.round((totalCost * Math.min(dv, 99.99)) / 100);
  else if (discountMode === 'Rupees' || discountMode === 'Flat') discountAmt = Math.min(dv, totalCost);
  const netPayable = Math.max(0, totalCost - discountAmt);
  return { totalCost, discountAmt, netPayable };
}

function mapWo(wo) {
  return {
    id: String(wo._id),
    woNumber: wo.woNumber,
    prospectId: wo.prospectForm ? String(wo.prospectForm) : null,
    paymentId: wo.payment ? String(wo.payment) : null,
    client: wo.clientName || '',
    clientEmail: wo.clientEmail || '',
    clientMobile: wo.clientMobile || '',
    companyName: wo.clientCompany || '',
    salesExec: wo.salesExecName || '',
    service: wo.service || '',
    requirements: wo.requirements || [],
    terms: wo.terms || '',
    deliveryDate: wo.deliveryDate || null,
    totalCost: wo.totalCost || 0,
    discountMode: wo.discountMode || 'None',
    discountValue: wo.discountValue || '',
    discountAmt: wo.discountAmt || 0,
    netPayable: wo.netPayable || 0,
    paymentStatus: wo.paymentStatus || 'Unpaid',
    advanceAmount: wo.advanceAmount || 0,
    advancePayments: wo.advancePayments || [],
    signedStatus: wo.signedStatus || 'Unsigned',
    isSigned: wo.isSigned || false,
    signedAt: wo.signedAt || null,
    signedByName: wo.signedByName || null,
    approvalStatus: wo.approvalStatus || 'Pending',
    isApproved: wo.isApproved || false,
    approvedAt: wo.approvedAt || null,
    approvalComment: wo.approvalComment || '',
    sentToEmail: wo.sentToEmail || null,
    sentAt: wo.sentAt || null,
    sentToManagement: wo.sentToManagement || false,
    sentToManagementAt: wo.sentToManagementAt || null,
    generatedDate: wo.createdAt,
    createdAt: wo.createdAt,
    updatedAt: wo.updatedAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/finance/work-orders
 * List all work orders for this tenant (finance view).
 */
exports.listWorkOrders = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, FINANCE_ROLES)) return;
  const { WorkOrder } = require('../models');

  const wos = await WorkOrder.find({ admin: req.admin._id })
    .sort({ createdAt: -1 })
    .lean();

  const mapped = wos.map(mapWo);

  const stats = {
    total: mapped.length,
    signed: mapped.filter((w) => w.signedStatus === 'Signed').length,
    unsigned: mapped.filter((w) => w.signedStatus === 'Unsigned').length,
    pendingApproval: mapped.filter((w) => w.approvalStatus === 'Pending').length,
    approved: mapped.filter((w) => w.approvalStatus === 'Approved').length,
    rejected: mapped.filter((w) => w.approvalStatus === 'Rejected').length,
    sentToManagement: mapped.filter((w) => w.sentToManagement).length,
  };

  return res.status(200).json(new ApiResponse(200, { workOrders: mapped, stats }, 'Work orders listed'));
});

/**
 * GET /api/finance/work-orders/:id
 */
exports.getWorkOrder = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, FINANCE_ROLES)) return;
  const { WorkOrder } = require('../models');

  const wo = await WorkOrder.findOne({ _id: req.params.id, admin: req.admin._id }).lean();
  if (!wo) return next(new AppError('Work order not found', 404));

  return res.status(200).json(new ApiResponse(200, { workOrder: mapWo(wo) }, 'Work order retrieved'));
});

/**
 * POST /api/finance/work-orders
 * Create a work order from a prospect (after payment success).
 * Idempotent — one work order per prospect.
 */
exports.createWorkOrder = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, FINANCE_ROLES)) return;
  const { WorkOrder, ProspectForm, Payment } = require('../models');

  const {
    prospectId,
    paymentId,
    clientName, clientEmail, clientMobile, clientCompany, salesExecName,
    service,
    requirements = [],
    terms = '',
    deliveryDate,
    discountMode = 'None',
    discountValue = '',
    paymentStatus = 'Unpaid',
    advanceAmount = 0,
    advancePayments = [],
  } = req.body;

  // Idempotency: one WO per prospect
  if (prospectId) {
    const existing = await WorkOrder.findOne({ admin: req.admin._id, prospectForm: prospectId }).lean();
    if (existing) {
      return res.status(200).json(new ApiResponse(200, { workOrder: mapWo(existing) }, 'Work order already exists'));
    }
  }

  const { totalCost, discountAmt, netPayable } = calcFinancials(requirements, discountMode, discountValue);
  const woNumber = await nextWoNumber(req.admin._id);

  // Populate from prospect if prospectId provided
  let resolvedClientName = clientName || '';
  let resolvedClientEmail = clientEmail || '';
  let resolvedClientMobile = clientMobile || '';
  let resolvedClientCompany = clientCompany || '';
  let resolvedSalesExec = salesExecName || '';
  let resolvedService = service || '';
  let resolvedRequirements = requirements;
  let resolvedTerms = terms;
  let resolvedPaymentStatus = paymentStatus;
  let resolvedAdvanceAmount = Number(advanceAmount) || 0;
  let resolvedPaymentId = paymentId || null;

  if (prospectId) {
    const prospect = await ProspectForm.findById(prospectId)
      .populate('client', 'name email mobile companyName')
      .populate('filledBy', 'name')
      .lean();

    if (prospect) {
      resolvedClientName = prospect.client?.name || prospect.contactPerson || resolvedClientName;
      resolvedClientEmail = prospect.client?.email || resolvedClientEmail;
      resolvedClientMobile = prospect.client?.mobile || resolvedClientMobile;
      resolvedClientCompany = prospect.client?.companyName || prospect.company || resolvedClientCompany;
      resolvedSalesExec = prospect.filledBy?.name || resolvedSalesExec;
      resolvedService = (prospect.finalServices || prospect.suggestedServices || []).map((s) => s.name).filter(Boolean).join(', ') || resolvedService;
      resolvedTerms = prospect.notes || resolvedTerms;

      if (resolvedRequirements.length === 0) {
        resolvedRequirements = (prospect.finalServices || []).map((s) => ({
          title: s.name || 'Service',
          cost: (s.price || 0) * (s.qty || 1),
          description: '',
        }));
      }

      // Determine payment status from prospect
      if (prospect.paymentStatus === 'SUCCESS') {
        resolvedPaymentStatus = 'Paid';
        resolvedAdvanceAmount = prospect.finalAmount || 0;
      }

      // Find latest payment if not provided
      if (!resolvedPaymentId) {
        const latestPayment = await Payment.findOne({ prospectForm: prospectId, status: 'SUCCESS' })
          .sort({ createdAt: -1 })
          .lean();
        if (latestPayment) resolvedPaymentId = String(latestPayment._id);
      }
    }
  }

  const { totalCost: tc, discountAmt: da, netPayable: np } = calcFinancials(
    resolvedRequirements, discountMode, discountValue,
  );

  const wo = await WorkOrder.create({
    admin: req.admin._id,
    prospectForm: prospectId || null,
    payment: resolvedPaymentId || null,
    generatedBy: req.user._id,
    woNumber,
    clientName: resolvedClientName,
    clientEmail: resolvedClientEmail,
    clientMobile: resolvedClientMobile,
    clientCompany: resolvedClientCompany,
    salesExecName: resolvedSalesExec,
    service: resolvedService,
    requirements: resolvedRequirements,
    terms: resolvedTerms,
    deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
    totalCost: tc,
    discountMode,
    discountValue: String(discountValue),
    discountAmt: da,
    netPayable: np,
    paymentStatus: resolvedPaymentStatus,
    advanceAmount: resolvedAdvanceAmount,
    advancePayments,
    signedStatus: 'Unsigned',
    approvalStatus: 'Pending',
    isGenerated: true,
  });

  logger.info('WorkOrder created', { woId: String(wo._id), woNumber, adminId: String(req.admin._id) });

  return res.status(201).json(new ApiResponse(201, { workOrder: mapWo(wo.toObject()) }, 'Work order created'));
});

/**
 * PUT /api/finance/work-orders/:id
 * Update a work order (finance can edit until approved).
 */
exports.updateWorkOrder = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, FINANCE_ROLES)) return;
  const { WorkOrder } = require('../models');

  const wo = await WorkOrder.findOne({ _id: req.params.id, admin: req.admin._id });
  if (!wo) return next(new AppError('Work order not found', 404));
  if (wo.isApproved) return next(new AppError('Cannot edit an approved work order', 400));

  const {
    clientName, clientEmail, clientMobile, clientCompany, salesExecName,
    service, requirements, terms, deliveryDate,
    discountMode, discountValue, paymentStatus, advanceAmount, advancePayments,
    signedStatus, signedByName, totalCost,
  } = req.body;

  if (clientName !== undefined) wo.clientName = clientName;
  if (clientEmail !== undefined) wo.clientEmail = clientEmail;
  if (clientMobile !== undefined) wo.clientMobile = clientMobile;
  if (clientCompany !== undefined) wo.clientCompany = clientCompany;
  if (salesExecName !== undefined) wo.salesExecName = salesExecName;
  if (service !== undefined) wo.service = service;
  if (terms !== undefined) wo.terms = terms;
  if (deliveryDate !== undefined) wo.deliveryDate = deliveryDate ? new Date(deliveryDate) : null;
  if (paymentStatus !== undefined) wo.paymentStatus = paymentStatus;
  if (advanceAmount !== undefined) wo.advanceAmount = Number(advanceAmount) || 0;
  if (advancePayments !== undefined) wo.advancePayments = advancePayments;

  if (signedStatus !== undefined) {
    wo.signedStatus = signedStatus;
    wo.isSigned = signedStatus === 'Signed';
    if (signedStatus === 'Signed' && !wo.signedAt) wo.signedAt = new Date();
    if (signedByName !== undefined) wo.signedByName = signedByName;
  }

  // Consolidate financial update logic
  const dm = discountMode !== undefined ? discountMode : wo.discountMode;
  const dv = discountValue !== undefined ? discountValue : wo.discountValue;

  if (requirements !== undefined && requirements.length > 0) {
    wo.requirements = requirements;
    const { totalCost: tc, discountAmt, netPayable } = calcFinancials(requirements, dm, dv);
    wo.totalCost = tc;
    wo.discountAmt = discountAmt;
    wo.netPayable = netPayable;
  } 
  else if (totalCost !== undefined || (wo.requirements || []).length === 0) {
    if (totalCost !== undefined) wo.totalCost = Number(totalCost) || 0;
    if (requirements !== undefined) wo.requirements = requirements;

    let da = 0;
    const val = parseFloat(dv) || 0;
    if (dm === 'Percentage') da = Math.round((wo.totalCost * Math.min(val, 99.99)) / 100);
    else if (dm === 'Rupees' || dm === 'Flat') da = Math.min(val, wo.totalCost);
    
    wo.discountAmt = da;
    wo.netPayable = Math.max(0, wo.totalCost - da);
  }

  if (discountMode !== undefined) wo.discountMode = discountMode;
  if (discountValue !== undefined) wo.discountValue = String(discountValue);

  await wo.save();
  return res.status(200).json(new ApiResponse(200, { workOrder: mapWo(wo.toObject()) }, 'Work order updated'));
});

/**
 * POST /api/finance/work-orders/:id/approve
 * Finance Manager approves the work order → sends to Management Manager.
 */
exports.approveWorkOrder = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, FINANCE_ROLES)) return;
  const { WorkOrder } = require('../models');

  const wo = await WorkOrder.findOne({ _id: req.params.id, admin: req.admin._id });
  if (!wo) return next(new AppError('Work order not found', 404));
  if (wo.isApproved) return next(new AppError('Work order is already approved', 400));

  const { comment = '' } = req.body;

  wo.approvalStatus = 'Approved';
  wo.isApproved = true;
  wo.approvedAt = new Date();
  wo.approvedBy = req.user._id;
  wo.approvalComment = comment;
  wo.sentToManagement = true;
  wo.sentToManagementAt = new Date();
  await wo.save();

  logger.info('WorkOrder approved → sent to management', {
    woId: String(wo._id),
    woNumber: wo.woNumber,
    approvedBy: String(req.user._id),
  });

  return res.status(200).json(new ApiResponse(200, { workOrder: mapWo(wo.toObject()) }, 'Work order approved and sent to management'));
});

/**
 * POST /api/finance/work-orders/:id/reject
 * Finance Manager rejects the work order.
 */
exports.rejectWorkOrder = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, FINANCE_ROLES)) return;
  const { WorkOrder } = require('../models');

  const wo = await WorkOrder.findOne({ _id: req.params.id, admin: req.admin._id });
  if (!wo) return next(new AppError('Work order not found', 404));

  const { comment = '' } = req.body;
  if (!comment.trim()) return next(new AppError('Rejection reason is required', 400));

  wo.approvalStatus = 'Rejected';
  wo.isApproved = false;
  wo.approvalComment = comment;
  wo.approvedBy = req.user._id;
  await wo.save();

  return res.status(200).json(new ApiResponse(200, { workOrder: mapWo(wo.toObject()) }, 'Work order rejected'));
});

/**
 * POST /api/finance/work-orders/:id/send-email
 * Send work order email to client.
 */
exports.sendWorkOrderEmail = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, FINANCE_ROLES)) return;
  const { WorkOrder, Admin } = require('../models');
  const { sendWorkOrderEmail } = require('../services/email.service');

  const wo = await WorkOrder.findOne({ _id: req.params.id, admin: req.admin._id }).lean();
  if (!wo) return next(new AppError('Work order not found', 404));

  const email = req.body.email || wo.clientEmail;
  if (!email) return next(new AppError('Client email is required', 400));

  const admin = await Admin.findById(req.admin._id).lean();

  try {
    await sendWorkOrderEmail({
      email,
      clientName: wo.clientName || 'Client',
      companyName: wo.clientCompany || '',
      woNumber: wo.woNumber,
      service: wo.service || '',
      requirements: wo.requirements || [],
      terms: wo.terms || '',
      deliveryDate: wo.deliveryDate,
      totalCost: wo.totalCost,
      discountAmt: wo.discountAmt,
      netPayable: wo.netPayable,
      paymentStatus: wo.paymentStatus,
      senderName: admin?.company?.name || 'Graphura CRM',
      senderEmail: admin?.company?.email || process.env.BREVO_SENDER_EMAIL,
    });

    await WorkOrder.findByIdAndUpdate(wo._id, {
      sentToEmail: email,
      sentAt: new Date(),
      isGenerated: true,
    });

    return res.status(200).json(new ApiResponse(200, { sent: true, email }, 'Work order email sent'));
  } catch (err) {
    logger.error('sendWorkOrderEmail failed', { error: err.message });
    return next(new AppError(`Failed to send email: ${err.message}`, 500));
  }
});

/**
 * DELETE /api/finance/work-orders/:id
 * Cancel a work order (only if not approved).
 */
exports.deleteWorkOrder = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, FINANCE_ROLES)) return;
  const { WorkOrder } = require('../models');

  const wo = await WorkOrder.findOne({ _id: req.params.id, admin: req.admin._id });
  if (!wo) return next(new AppError('Work order not found', 404));
  if (wo.isApproved) return next(new AppError('Cannot delete an approved work order', 400));

  await wo.deleteOne();
  return res.status(200).json(new ApiResponse(200, null, 'Work order deleted'));
});

// ─────────────────────────────────────────────────────────────────────────────
// MANAGEMENT MANAGER CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/management/work-orders
 * Management Manager sees all approved work orders sent to management.
 */
exports.listForManagement = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, MGMT_ROLES)) return;
  const { WorkOrder } = require('../models');

  const filter = {
    admin: req.admin._id,
    sentToManagement: true,
    approvalStatus: 'Approved',
  };

  const wos = await WorkOrder.find(filter).sort({ sentToManagementAt: -1 }).lean();
  const mapped = wos.map(mapWo);

  const stats = {
    total: mapped.length,
    signed: mapped.filter((w) => w.signedStatus === 'Signed').length,
    unsigned: mapped.filter((w) => w.signedStatus === 'Unsigned').length,
    paid: mapped.filter((w) => w.paymentStatus === 'Paid').length,
    unpaid: mapped.filter((w) => w.paymentStatus === 'Unpaid').length,
    advance: mapped.filter((w) => w.paymentStatus === 'Advance').length,
  };

  return res.status(200).json(new ApiResponse(200, { workOrders: mapped, stats }, 'Management work orders listed'));
});

/**
 * GET /api/management/work-orders/:id
 */
exports.getForManagement = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, MGMT_ROLES)) return;
  const { WorkOrder } = require('../models');

  const wo = await WorkOrder.findOne({
    _id: req.params.id,
    admin: req.admin._id,
    sentToManagement: true,
  }).lean();

  if (!wo) return next(new AppError('Work order not found', 404));
  return res.status(200).json(new ApiResponse(200, { workOrder: mapWo(wo) }, 'Work order retrieved'));
});

/**
 * POST /api/finance/work-orders/backfill
 * Creates work orders for all successful payments that don't have one yet.
 * Finance Manager can call this once to fix historical data.
 */
exports.backfillWorkOrders = catchAsync(async (req, res, next) => {
  if (!requireRole(req, next, FINANCE_ROLES)) return;
  const { Payment, WorkOrder } = require('../models');

  // Find all SUCCESS payments for this admin that have no work order
  const payments = await Payment.find({
    admin: req.admin._id,
    status: 'SUCCESS',
  }).lean();

  let created = 0;
  let skipped = 0;
  const errors = [];

  for (const payment of payments) {
    try {
      // Check if work order already exists
      const existing = await WorkOrder.findOne({
        admin: req.admin._id,
        $or: [
          { payment: payment._id },
          ...(payment.prospectForm ? [{ prospectForm: payment.prospectForm }] : []),
        ],
      }).lean();

      if (existing) {
        skipped++;
        continue;
      }

      const result = await exports.autoCreateWorkOrder({
        adminId: req.admin._id,
        paymentId: String(payment._id),
        prospectId: payment.prospectForm ? String(payment.prospectForm) : null,
      });

      if (result) {
        created++;
        logger.info('backfillWorkOrders: created', { woNumber: result.woNumber, paymentId: String(payment._id) });
      } else {
        errors.push({ paymentId: String(payment._id), error: 'autoCreateWorkOrder returned null' });
      }
    } catch (err) {
      errors.push({ paymentId: String(payment._id), error: err.message });
    }
  }

  return res.status(200).json(
    new ApiResponse(200, { created, skipped, errors }, `Backfill complete: ${created} created, ${skipped} skipped`),
  );
});

/**
 * Auto-create work order when payment is marked SUCCESS.
 * Called from paymentWebhook.controller and paymentSuccess.controller.
 */
exports.autoCreateWorkOrder = async ({ adminId, prospectId, paymentId, createdBy = null }) => {
  try {
    const { WorkOrder, ProspectForm, Payment, WoCounter } = require('../models');

    // Idempotency
    if (prospectId) {
      const existing = await WorkOrder.findOne({ admin: adminId, prospectForm: prospectId }).lean();
      if (existing) {
        logger.info('autoCreateWorkOrder: already exists', { woId: String(existing._id) });
        return existing;
      }
    }

    const prospect = prospectId
      ? await ProspectForm.findById(prospectId)
          .populate('client', 'name email mobile companyName')
          .populate('filledBy', 'name')
          .lean()
      : null;

    const payment = paymentId ? await Payment.findById(paymentId).lean() : null;

    const requirements = (prospect?.finalServices || []).map((s) => ({
      title: s.name || 'Service',
      cost: (s.price || 0) * (s.qty || 1),
      description: '',
    }));

    if (requirements.length === 0 && payment?.amount) {
      requirements.push({ title: 'Professional Services', cost: payment.amount, description: '' });
    }

    const totalCost = prospect?.totalAmount || 0;
    const discountAmt = prospect?.discount || 0;
    const netPayable = prospect?.finalAmount || 0;

    const counter = await WoCounter.findOneAndUpdate(
      { admin: adminId },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
    const woNumber = `${counter.prefix || 'WO'}-${String(counter.seq).padStart(6, '0')}`;

    const wo = await WorkOrder.create({
      admin: adminId,
      prospectForm: prospectId || null,
      payment: paymentId || null,
      generatedBy: createdBy || null,
      woNumber,
      clientName: prospect?.client?.name || prospect?.contactPerson || '',
      clientEmail: prospect?.client?.email || '',
      clientMobile: prospect?.client?.mobile || '',
      clientCompany: prospect?.client?.companyName || prospect?.company || '',
      salesExecName: prospect?.filledBy?.name || '',
      service: (prospect?.finalServices || []).map((s) => s.name).filter(Boolean).join(', '),
      requirements,
      terms: prospect?.notes || '',
      totalCost,
      discountAmt,
      netPayable,
      paymentStatus: payment?.status === 'SUCCESS' ? 'Paid' : 'Unpaid',
      advanceAmount: payment?.amount || 0,
      signedStatus: 'Unsigned',
      approvalStatus: 'Pending',
      isGenerated: true,
    });

    logger.info('autoCreateWorkOrder: created', { woId: String(wo._id), woNumber });
    return wo.toObject();
  } catch (err) {
    logger.error('autoCreateWorkOrder: failed', { error: err.message });
    return null;
  }
};
