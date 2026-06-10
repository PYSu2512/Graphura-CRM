"use strict";

const path = require('path');
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/apiResponse");
const AppError = require("../utils/appError");
const { sendProspectQuotationEmail } = require('../services/email.service');

const normalizeCurrency = (value) => Number(value || 0);

const mapRequirements = (prospect) => {
  const fromFinal = (prospect.finalServices || []).map((item, idx) => ({
    id: item._id || `final-${idx}-${item.name}`,
    title: item.name || 'Service',
    cost: normalizeCurrency(item.price),
    description: item.description || '',
    discountMode: item.discountMode || 'None',
    discountValue: item.discountValue || 0,
    discountAmount: item.discountAmount || 0,
    netCost: item.netCost || (normalizeCurrency(item.price) - (item.discountAmount || 0)),
    isPaid: item.isPaid || false,
  }));

  if (fromFinal.length > 0) return fromFinal;

  const fromSuggested = (prospect.suggestedServices || []).map((item, idx) => ({
    id: item._id || `suggested-${idx}-${item.name}`,
    title: item.name || 'Service',
    cost: normalizeCurrency(item.price),
    description: '',
    discountMode: 'None',
    discountValue: 0,
    discountAmount: 0,
    netCost: normalizeCurrency(item.price),
    isPaid: false,
  }));

  if (fromSuggested.length > 0) return fromSuggested;

  if (prospect.requirement) {
    return [{
      id: String(prospect._id),
      title: prospect.requirement,
      cost: normalizeCurrency(prospect.value),
      description: prospect.notes || '',
      discountMode: 'None',
      discountValue: 0,
      discountAmount: 0,
      netCost: normalizeCurrency(prospect.value),
      isPaid: false,
    }];
  }

  return [];
};

const toDisplayLeadStatus = (status, isDumped = false) => {
  if (isDumped) return "Dumped";
  if (!status) return "Untouched";
  const normalized = String(status).toUpperCase();
  const map = {
    NOT_TALK: "Not Talk",
    INTERESTED: "Interested",
    TALK: "Talk",
    CONVERTED: "Converted",
    DUMP: "Dumped",
    UNTOUCHED: "Untouched",
  };
  return map[normalized] || status;
};

const formatForFrontend = (p, paidAmount = 0) => {
  const client = p.client || {};
  const filledBy = p.filledBy || {};
  const requirements = mapRequirements(p);
  const selectedService = (p.finalServices || p.suggestedServices || []).map((s) => s.name).filter(Boolean).join(', ');

  const totalCost = requirements.reduce((s, r) => s + r.cost, 0);
  const totalDiscount = requirements.reduce((s, r) => s + r.discountAmount, 0);

  return {
    id: p._id,
    clientId: client._id || p.client,
    client: client.name || p.contactPerson || '',
    mobile: client.mobile || '',
    email: client.email || '',
    suggestedServices: selectedService || p.requirement || '',
    suggestedAmount: p.finalAmount ?? p.totalAmount ?? p.value ?? 0,
    salesExec: filledBy.name || '',
    status: toDisplayLeadStatus(p.lead?.status, Boolean(p.lead?.isDumped)),
    rawStatus: p.status,
    priority: p.priority,
    requirement: p.requirement,
    prospectStage: p.stage,
    requirements,
    selectedService,
    termsAndConditions: p.notes || '',
    totalPaid: paidAmount, // Use the actual total paid from payments
    totalUnpaid: Math.max(0, (p.finalAmount || 0) - paidAmount),
    totalCost,
    totalDiscount,
    discountValue: p.discount ?? 0,
    discountMode: 'None', // Global discount is deprecated in favor of itemized
    paymentStatus: paidAmount >= (p.finalAmount || 0) && (p.finalAmount || 0) > 0 
      ? 'Paid' 
      : paidAmount > 0 
        ? 'Advance' 
        : 'Unpaid',
    advanceAmount: String(p.advanceAmount || 0),
    advancePayments: p.advancePayments || [],
    netPayable: p.finalAmount ?? p.totalAmount ?? p.value ?? 0,
    sentToClientAt: p.sentToClientAt || null,
    sentToClientBy: p.sentToClientBy || null,
    clientEmailStatus: p.clientEmailStatus || 'PENDING',
    clientEmailMessageId: p.clientEmailMessageId || null,
    termsAndConditionsPdf: p.termsAndConditionsPdf || null,
    createdAt: p.createdAt,
  };
};

/**
 * GET /api/finance/prospects
 * Returns prospect forms for finance department (tenant-scoped)
 */
exports.getProspects = catchAsync(async (req, res, next) => {
  const { ProspectForm, Payment } = require("../models");

  // Role guard: finance roles only
  const allowed = ["FINANCE_MANAGER", "FINANCE_EXECUTIVE"];
  if (!req.user || !allowed.includes(req.user.role)) {
    return next(new AppError('Only Finance users can access prospects', 403));
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 25);
  const skip = (page - 1) * limit;

  const q = { admin: req.admin._id };
  if (req.query.status) q.status = req.query.status;

  if (req.query.search) {
    const term = req.query.search.trim();
    q.$or = [
      { contactPerson: { $regex: term, $options: 'i' } },
      { company: { $regex: term, $options: 'i' } },
    ];
  }

  const [total, rows] = await Promise.all([
    ProspectForm.countDocuments(q),
    ProspectForm.find(q)
      .populate('client', 'name email mobile companyName')
      .populate('filledBy', 'name email')
      .populate({ path: 'lead', select: 'status isDumped' })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  // Aggregate successful payments for all prospects on the page
  const prospectIds = rows.map(r => r._id);
  const payments = await Payment.aggregate([
    { $match: { prospectForm: { $in: prospectIds }, status: 'SUCCESS' } },
    { $group: { _id: '$prospectForm', total: { $sum: '$amount' } } }
  ]);

  const paymentMap = {};
  payments.forEach(p => { paymentMap[String(p._id)] = p.total; });

  const mapped = rows.map(p => formatForFrontend(p, paymentMap[String(p._id)] || 0));

  const stats = {
    total,
    sentToFinance: mapped.filter(r => r.rawStatus === 'SENT_TO_FINANCE').length,
    open: mapped.filter(r => r.rawStatus === 'OPEN').length,
    inNegotiation: mapped.filter(r => r.rawStatus === 'IN_NEGOTIATION').length,
  };

  res.status(200).json(new ApiResponse(200, { prospects: mapped, stats, page, limit }, 'Finance prospects retrieved'));
});

/**
 * POST /api/finance/prospects/:prospectId/send
 * Persist finance quote details and send the quotation email to the client.
 */
exports.sendToClient = catchAsync(async (req, res, next) => {
  const { ProspectForm, Lead } = require('../models');

  const allowed = ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'];
  if (!req.user || !allowed.includes(req.user.role)) {
    return next(new AppError('Only Finance users can send quotations', 403));
  }

  const { prospectId } = req.params;
  let {
    status,
    selectedService,
    requirements = [],
    termsAndConditions = '',
    paymentStatus = 'Unpaid',
    advanceAmount = '',
    advancePayments = [],
    notInterestedReason = '',
    conversationNotes = '',
    notTalkReason = '',
  } = req.body || {};

  // If sent via FormData, arrays/objects might be JSON strings
  if (typeof requirements === 'string') {
    try { requirements = JSON.parse(requirements); } catch (e) { requirements = []; }
  }
  if (typeof advancePayments === 'string') {
    try { advancePayments = JSON.parse(advancePayments); } catch (e) { advancePayments = []; }
  }

  const prospect = await ProspectForm.findOne({
    _id: prospectId,
    admin: req.admin._id,
  }).populate('client', 'name email mobile companyName').populate('filledBy', 'name email role');

  if (!prospect) {
    return next(new AppError('Prospect not found', 404));
  }

  const normalizedStatus = String(status || 'Interested').trim();
  const validStatuses = ['Interested', 'Not Interested', 'Talk', 'Not Talk'];
  if (!validStatuses.includes(normalizedStatus)) {
    return next(new AppError('Invalid client status', 400));
  }

  // Process requirements with itemized discounts
  const finalServices = (requirements || []).map((item) => {
    const cost = Number(item.cost || 0);
    const dm = item.discountMode || 'None';
    const dv = Number(item.discountValue || 0);
    
    let da = 0;
    if (dm === 'Percentage') da = Math.round((cost * Math.min(dv, 99.99)) / 100);
    else if (dm === 'Rupees') da = Math.min(dv, cost);

    return {
      name: String(item.title || '').trim(),
      price: cost,
      qty: 1,
      discountMode: dm,
      discountValue: dv,
      discountAmount: da,
      netCost: Math.max(0, cost - da),
      isPaid: Boolean(item.isPaid),
    };
  }).filter(s => s.name);

  const totalCost = finalServices.reduce((sum, s) => sum + s.price, 0);
  const totalDiscount = finalServices.reduce((sum, s) => sum + s.discountAmount, 0);
  const baseCost = Math.max(0, totalCost - totalDiscount);
  const gstAmount = Math.round(baseCost * 0.18);
  const finalAmount = baseCost + gstAmount;

  const leadStatusMap = {
    Interested: 'INTERESTED',
    Talk: 'TALK',
    'Not Interested': 'NOT_TALK',
    'Not Talk': 'NOT_TALK',
  };

  prospect.status = 'SENT_TO_FINANCE';
  prospect.finalServices = finalServices;
  prospect.totalAmount = totalCost;
  prospect.discount = totalDiscount;
  prospect.finalAmount = finalAmount;
  prospect.paymentType = Number(advanceAmount || 0) > 0 || (advancePayments && advancePayments.length > 0) ? 'PARTIAL' : 'FULL';
  prospect.paymentStatus = 'PENDING';
  prospect.paymentMethod = null;
  prospect.stage = normalizedStatus;
  prospect.priority = prospect.priority || 'Medium';
  prospect.notes = termsAndConditions?.trim() || prospect.notes || '';
  prospect.updatedBy = req.user._id;
  prospect.sentToClientAt = new Date();
  prospect.sentToClientBy = req.user._id;
  prospect.clientEmailStatus = 'PENDING';
  prospect.clientEmailMessageId = null;
  prospect.clientEmailError = null;
  prospect.requirement = notInterestedReason || conversationNotes || notTalkReason || prospect.requirement || '';
  prospect.advanceAmount = Number(advanceAmount) || 0;
  prospect.advancePayments = advancePayments || [];
  
  if (req.file) {
    prospect.termsAndConditionsPdf = req.file.path;
  }
  
  await prospect.save();

  const lead = await Lead.findOne({ _id: prospect.lead, admin: req.admin._id });
  if (lead) {
    lead.status = leadStatusMap[normalizedStatus] || 'INTERESTED';
    lead.lastContactedAt = new Date();
    await lead.save();
  }

  let emailResult = null;
  try {
    const recipientEmail = String(prospect.client?.email || '').trim();
    if (!recipientEmail) {
      throw new AppError('Client email is missing. Please update the client record before sending the quotation.', 400);
    }

    const pdfUrl = prospect.termsAndConditionsPdf || null;

    emailResult = await sendProspectQuotationEmail({
      email: recipientEmail,
      clientName: prospect.client.name || 'Client',
      companyName: prospect.client.companyName || prospect.company || '',
      serviceName: selectedService || finalServices[0]?.name || 'Custom package',
      requirements: finalServices.map(s => ({
        title: s.name,
        cost: s.price,
        description: s.discountAmount > 0 ? `Discount: ₹${s.discountAmount}` : ''
      })),
      baseCost: totalCost,
      discountAmount: totalDiscount,
      finalAmount,
      paymentStatus,
      termsAndConditions,
      pdfPath: prospect.termsAndConditionsPdf,
      pdfUrl: prospect.termsAndConditionsPdf?.startsWith('http') ? prospect.termsAndConditionsPdf : null,
    });

    prospect.clientEmailStatus = 'SENT';
    prospect.clientEmailMessageId = emailResult.messageId || null;
    prospect.clientEmailError = null;
    await prospect.save();
  } catch (error) {
    prospect.clientEmailStatus = 'FAILED';
    prospect.clientEmailError = error.message;
    await prospect.save();
    return next(new AppError(error.message || 'Failed to send quotation email', 502));
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        prospect: formatForFrontend({
          ...prospect.toObject(),
          client: prospect.client,
          filledBy: prospect.filledBy,
          lead: lead || prospect.lead,
        }),
        email: emailResult ? { success: true, messageId: emailResult.messageId || null } : { success: false },
      },
      'Quotation sent to client successfully'
    )
  );
});
