"use strict";

const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError = require('../utils/appError');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const requireFinanceRole = (req, next) => {
  const allowed = ['FINANCE_MANAGER', 'FINANCE_EXECUTIVE'];
  if (!req.user || !allowed.includes(req.user.role)) {
    next(new AppError('Only finance users can access this resource', 403));
    return false;
  }
  return true;
};

/** Generate the next invoice number atomically */
async function nextInvoiceNumber(adminId) {
  const { InvoiceCounter } = require('../models');
  const counter = await InvoiceCounter.findOneAndUpdate(
    { admin: adminId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  const prefix = counter.prefix || 'INV';
  return `${prefix}-${String(counter.seq).padStart(6, '0')}`;
}

/** Calculate GST and total */
function calcAmounts(amount, gstPercent, discount) {
  const totalAmount = Number(amount) || 0;
  const gst = Number(gstPercent) || 18;
  const gstAmount = Math.round((totalAmount * gst) / (100 + gst));
  return { gstAmount, totalAmount };
}

/** Map an Invoice document to the shape the frontend expects */
function mapInvoice(inv) {
  return {
    id: String(inv._id),
    invoiceNumber: inv.invoiceNumber,
    prospectId: inv.prospectForm ? String(inv.prospectForm) : null,
    paymentId: inv.payment ? String(inv.payment) : null,
    client: inv.clientName || '',
    mobile: inv.clientMobile || '',
    email: inv.clientEmail || '',
    companyName: inv.clientCompany || '',
    amount: inv.amount || 0,
    gstPct: inv.gstPercent || 18,
    gstAmount: inv.gstAmount || 0,
    discount: inv.discount || 0,
    total: inv.totalAmount || 0,
    lineItems: inv.lineItems || [],
    notes: inv.notes || '',
    status: inv.status || 'DRAFT',
    date: inv.createdAt,
    dueDate: inv.dueDate || null,
    sentAt: inv.sentAt || null,
    sentToEmail: inv.sentToEmail || null,
    paidAt: inv.paidAt || null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/finance/invoices
 * List all invoices for this admin tenant.
 */
exports.listInvoices = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { Invoice } = require('../models');

  const invoices = await Invoice.find({ admin: req.admin._id })
    .sort({ createdAt: -1 })
    .lean();

  const mapped = invoices.map(mapInvoice);

  const stats = {
    total: mapped.length,
    paid: mapped.filter((i) => i.status === 'PAID').length,
    unpaid: mapped.filter((i) => i.status === 'SENT').length,
    draft: mapped.filter((i) => i.status === 'DRAFT').length,
    overdue: mapped.filter((i) => i.status === 'OVERDUE').length,
    cancelled: mapped.filter((i) => i.status === 'CANCELLED').length,
    totalAmount: mapped.reduce((s, i) => s + (i.total || 0), 0),
  };

  return res.status(200).json(new ApiResponse(200, { invoices: mapped, stats }, 'Invoices listed'));
});

/**
 * GET /api/finance/invoices/:id
 * Get a single invoice.
 */
exports.getInvoice = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { Invoice } = require('../models');

  const inv = await Invoice.findOne({ _id: req.params.id, admin: req.admin._id }).lean();
  if (!inv) return next(new AppError('Invoice not found', 404));

  return res.status(200).json(new ApiResponse(200, { invoice: mapInvoice(inv) }, 'Invoice retrieved'));
});

/**
 * POST /api/finance/invoices
 * Manually create an invoice.
 */
exports.createInvoice = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { Invoice } = require('../models');

  const {
    prospectId,
    paymentId,
    clientName,
    clientEmail,
    clientMobile,
    clientCompany,
    amount,
    gstPercent = 18,
    discount = 0,
    lineItems = [],
    notes = '',
    dueDate,
    status = 'DRAFT',
  } = req.body;

  if (!amount || Number(amount) <= 0) return next(new AppError('Amount is required', 400));
  if (!clientName) return next(new AppError('Client name is required', 400));

  const invoiceNumber = await nextInvoiceNumber(req.admin._id);
  const { gstAmount, totalAmount } = calcAmounts(amount, gstPercent, discount);

  const inv = await Invoice.create({
    admin: req.admin._id,
    prospectForm: prospectId || null,
    payment: paymentId || null,
    createdBy: req.user._id,
    invoiceNumber,
    clientName,
    clientEmail: clientEmail || '',
    clientMobile: clientMobile || '',
    clientCompany: clientCompany || '',
    amount: Number(amount),
    gstPercent: Number(gstPercent),
    gstAmount,
    discount: Number(discount),
    totalAmount,
    lineItems,
    notes,
    status,
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  return res.status(201).json(new ApiResponse(201, { invoice: mapInvoice(inv.toObject()) }, 'Invoice created'));
});

/**
 * PUT /api/finance/invoices/:id
 * Update an invoice (only DRAFT or SENT invoices can be edited).
 */
exports.updateInvoice = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { Invoice } = require('../models');

  const inv = await Invoice.findOne({ _id: req.params.id, admin: req.admin._id });
  if (!inv) return next(new AppError('Invoice not found', 404));
  if (inv.status === 'PAID') return next(new AppError('Cannot edit a paid invoice', 400));

  const {
    clientName, clientEmail, clientMobile, clientCompany,
    amount, gstPercent, discount, lineItems, notes, dueDate, status,
  } = req.body;

  if (clientName !== undefined) inv.clientName = clientName;
  if (clientEmail !== undefined) inv.clientEmail = clientEmail;
  if (clientMobile !== undefined) inv.clientMobile = clientMobile;
  if (clientCompany !== undefined) inv.clientCompany = clientCompany;
  if (notes !== undefined) inv.notes = notes;
  if (dueDate !== undefined) inv.dueDate = dueDate ? new Date(dueDate) : null;
  if (status !== undefined && ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].includes(status)) {
    inv.status = status;
    if (status === 'PAID' && !inv.paidAt) inv.paidAt = new Date();
  }

  if (amount !== undefined || gstPercent !== undefined || discount !== undefined) {
    const newAmount = amount !== undefined ? Number(amount) : inv.amount;
    const newGst = gstPercent !== undefined ? Number(gstPercent) : inv.gstPercent;
    const newDisc = discount !== undefined ? Number(discount) : inv.discount;
    const { gstAmount, totalAmount } = calcAmounts(newAmount, newGst, newDisc);
    inv.amount = newAmount;
    inv.gstPercent = newGst;
    inv.discount = newDisc;
    inv.gstAmount = gstAmount;
    inv.totalAmount = totalAmount;
  }

  if (lineItems !== undefined) inv.lineItems = lineItems;

  await inv.save();
  return res.status(200).json(new ApiResponse(200, { invoice: mapInvoice(inv.toObject()) }, 'Invoice updated'));
});

/**
 * POST /api/finance/invoices/:id/send
 * Send invoice email to client with PDF download link.
 */
exports.sendInvoice = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { Invoice, Admin } = require('../models');
  const { sendInvoiceEmail } = require('../services/email.service');

  const inv = await Invoice.findOne({ _id: req.params.id, admin: req.admin._id }).lean();
  if (!inv) return next(new AppError('Invoice not found', 404));

  const email = req.body.email || inv.clientEmail || inv.sentToEmail;
  if (!email) return next(new AppError('Client email is required to send invoice', 400));

  // Load admin company info for the invoice header
  const admin = await Admin.findById(req.admin._id).lean();

  try {
    await sendInvoiceEmail({
      email,
      invoiceId: inv._id,
      clientName: inv.clientName || 'Client',
      companyName: inv.clientCompany || '',
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: inv.createdAt,
      dueDate: inv.dueDate,
      amount: inv.amount,
      gstPercent: inv.gstPercent,
      gstAmount: inv.gstAmount,
      discount: inv.discount,
      totalAmount: inv.totalAmount,
      lineItems: inv.lineItems || [],
      notes: inv.notes || '',
      status: inv.status,
      // Sender company info
      senderName: admin?.company?.name || 'Graphura CRM',
      senderEmail: admin?.company?.email || process.env.BREVO_SENDER_EMAIL,
      senderPhone: admin?.company?.phone || '',
      senderAddress: admin?.company?.address
        ? `${admin.company.address.line1 || ''}, ${admin.company.address.city || ''}`
        : '',
    });

    // Update invoice status to SENT if it was DRAFT
    await Invoice.findByIdAndUpdate(inv._id, {
      status: inv.status === 'DRAFT' ? 'SENT' : inv.status,
      sentAt: new Date(),
      sentToEmail: email,
    });

    return res.status(200).json(new ApiResponse(200, { sent: true, email }, 'Invoice sent successfully'));
  } catch (err) {
    logger.error('sendInvoice: email failed', { error: err.message });
    return next(new AppError(`Failed to send invoice email: ${err.message}`, 500));
  }
});

/**
 * GET /api/finance/invoices/:id/pdf-data
 * Returns all data needed to render the PDF on the frontend.
 */
exports.getPdfData = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { Invoice, Admin } = require('../models');

  const inv = await Invoice.findOne({ _id: req.params.id, admin: req.admin._id }).lean();
  if (!inv) return next(new AppError('Invoice not found', 404));

  const admin = await Admin.findById(req.admin._id).lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        invoice: mapInvoice(inv),
        company: {
          name: admin?.company?.name || 'Graphura CRM',
          email: admin?.company?.email || '',
          phone: admin?.company?.phone || '',
          website: admin?.company?.website || '',
          address: admin?.company?.address || {},
          logo: admin?.company?.logo || '',
        },
      },
      'PDF data retrieved',
    ),
  );
});

/**
 * DELETE /api/finance/invoices/:id
 * Cancel (soft-delete) an invoice.
 */
exports.cancelInvoice = catchAsync(async (req, res, next) => {
  if (!requireFinanceRole(req, next)) return;
  const { Invoice } = require('../models');

  const inv = await Invoice.findOne({ _id: req.params.id, admin: req.admin._id });
  if (!inv) return next(new AppError('Invoice not found', 404));
  if (inv.status === 'PAID') return next(new AppError('Cannot cancel a paid invoice', 400));

  inv.status = 'CANCELLED';
  await inv.save();

  return res.status(200).json(new ApiResponse(200, { invoice: mapInvoice(inv.toObject()) }, 'Invoice cancelled'));
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-GENERATE INVOICE ON PAYMENT SUCCESS
// Called from paymentWebhook.controller and paymentSuccess.controller
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create an invoice automatically when a payment is marked SUCCESS.
 * Idempotent — won't create a duplicate if one already exists for this payment.
 */
exports.autoCreateInvoice = async ({ adminId, paymentId, prospectId, createdBy = null }) => {
  try {
    const { Invoice, Payment, ProspectForm, InvoiceCounter } = require('../models');

    // Idempotency check
    const existing = await Invoice.findOne({ admin: adminId, payment: paymentId }).lean();
    if (existing) {
      logger.info('autoCreateInvoice: invoice already exists', { invoiceId: String(existing._id) });
      return existing;
    }

    const payment = await Payment.findById(paymentId).lean();
    if (!payment) {
      logger.warn('autoCreateInvoice: payment not found', { paymentId });
      return null;
    }

    const prospect = prospectId
      ? await ProspectForm.findById(prospectId).populate('client', 'name email mobile companyName').lean()
      : null;

    const client = prospect?.client || {};
    const amount = payment.amount || prospect?.finalAmount || 0;
    const gstPercent = 18;
    const discount = 0;
    const { gstAmount, totalAmount } = calcAmounts(amount, gstPercent, discount);

    // Build line items from prospect's finalServices
    const lineItems = (prospect?.finalServices || []).map((s) => ({
      name: s.name || 'Service',
      qty: s.qty || 1,
      price: s.price || 0,
      amount: (s.price || 0) * (s.qty || 1),
    }));

    if (lineItems.length === 0 && amount > 0) {
      lineItems.push({ name: 'Professional Services', qty: 1, price: amount, amount });
    }

    const counter = await InvoiceCounter.findOneAndUpdate(
      { admin: adminId },
      { $inc: { seq: 1 } },
      { upsert: true, new: true },
    );
    const invoiceNumber = `${counter.prefix || 'INV'}-${String(counter.seq).padStart(6, '0')}`;

    const inv = await Invoice.create({
      admin: adminId,
      prospectForm: prospectId || null,
      payment: paymentId,
      client: client._id || null,
      createdBy: createdBy || null,
      invoiceNumber,
      clientName: client.name || prospect?.contactPerson || '',
      clientEmail: client.email || '',
      clientMobile: client.mobile || '',
      clientCompany: client.companyName || prospect?.company || '',
      amount,
      gstPercent,
      gstAmount,
      discount,
      totalAmount,
      lineItems,
      notes: '',
      status: 'PAID',
      paidAt: payment.paidAt || new Date(),
    });

    logger.info('autoCreateInvoice: invoice created', {
      invoiceId: String(inv._id),
      invoiceNumber,
      paymentId,
    });

    return inv.toObject();
  } catch (err) {
    logger.error('autoCreateInvoice: failed', { error: err.message, stack: err.stack });
    return null;
  }
};
