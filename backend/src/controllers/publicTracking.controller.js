"use strict";

/**
 * PUBLIC TRACKING CONTROLLER
 *
 * No authentication required — token is the credential.
 *
 * GET  /api/public/track/:token  → validate token → return client + projects
 * POST /api/management/clients/:clientId/send-tracking-link → generate token + send email
 */

const crypto      = require('crypto');
const catchAsync  = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError    = require('../utils/appError');
const logger      = require('../utils/logger');
const { sendClientTrackingLinkEmail } = require('../services/email.service');

// ── status / priority maps ────────────────────────────────────────────────────
const STATUS_MAP = {
  NOT_STARTED:  'Not Started',
  WORK_STARTED: 'Work Started',
  IN_PROGRESS:  'In Progress',
  REVIEW:       'Review Stage',
  FINALIZATION: 'Finalization',
  COMPLETED:    'Completed',
  DELIVERED:    'Delivered',
  DELAYED:      'Delayed',
};
const PRIORITY_MAP = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };

// ── shape a project for the client-facing view ────────────────────────────────
function mapProjectForClient(p, payments = []) {
  const tl  = p.teamLeader  || {};
  const mgr = p.manager     || {};
  const cl  = p.client      || {};

  return {
    id:             String(p._id),
    projectNumber:  p.projectNumber || String(p._id).slice(-6).toUpperCase(),
    name:           p.name,
    description:    p.description || '',
    status:         STATUS_MAP[p.status]    || p.status,
    priority:       PRIORITY_MAP[p.priority] || p.priority,
    startDate:      p.startDate        ? p.startDate.toISOString().slice(0, 10)        : null,
    expectedDelivery: p.expectedDelivery ? p.expectedDelivery.toISOString().slice(0, 10) : null,
    deliveredAt:    p.deliveredAt      ? p.deliveredAt.toISOString().slice(0, 10)      : null,
    progressPercent: p.progressPercent || 0,
    driveLink:      p.driveLink    || null,
    handoverLink:   p.handoverLink || null,
    totalAmount:    p.totalAmount   || 0,
    paidAmount:     p.paidAmount    || 0,
    remainingAmount: Math.max(0, (p.totalAmount || 0) - (p.paidAmount || 0)),
    teamLeader: tl._id ? { name: tl.name, role: 'Management Team Leader', email: tl.email } : null,
    updates: (p.updates || [])
      .filter((u) => u.isClientVisible !== false)
      .map((u) => ({
        date:   u.date ? new Date(u.date).toISOString().slice(0, 10) : '',
        status: STATUS_MAP[u.status] || u.status,
        note:   u.note,
      })),
    payments: payments.map((pay) => ({
      date:    pay.paidAt ? new Date(pay.paidAt).toISOString().slice(0, 10) : '',
      amount:  pay.amount,
      method:  'Online',
      status:  pay.status === 'SUCCESS' ? 'Paid' : pay.status,
      ref:     pay.razorpayPaymentId || pay.razorpayOrderId || '—',
    })),
    workOrder: p.workOrder ? {
      woNumber:   p.workOrder.woNumber || '—',
      signed:     p.workOrder.isSigned  || false,
      signedDate: p.workOrder.signedAt ? new Date(p.workOrder.signedAt).toISOString().slice(0, 10) : null,
    } : null,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// PUBLIC: GET /api/public/track/:token
// Validates the token, increments access counter, returns projects.
// No auth required — token IS the credential.
// ═════════════════════════════════════════════════════════════════════════════
exports.getTrackingData = catchAsync(async (req, res, next) => {
  const { ProjectTrackingToken, Project, Payment, Admin } = require('../models');

  const { token } = req.params;
  if (!token || token.length < 10) return next(new AppError('Invalid tracking link', 400));

  // 1. Find token
  const record = await ProjectTrackingToken.findOne({ token, isActive: true })
    .populate('client', 'name email mobile companyName')
    .lean();

  if (!record) return next(new AppError('This tracking link is invalid or has been revoked.', 404));

  // 2. Expiry check
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return next(new AppError('This tracking link has expired. Please contact your account manager for a new link.', 410));
  }

  // 3. Increment access count (fire-and-forget)
  ProjectTrackingToken.updateOne(
    { _id: record._id },
    { $inc: { accessCount: 1 }, $set: { lastAccessedAt: new Date() } },
  ).catch(() => {});

  // 4. Load admin's company branding
  const admin = await Admin.findOne({ _id: record.admin }).select('company').lean();

  // 5. Load all projects for this client under this admin
  const projects = await Project.find({
    admin:     record.admin,
    client:    record.client._id,
    isDeleted: false,
  })
    .populate('teamLeader', 'name email phone')
    .populate('workOrder',  'woNumber isSigned signedAt')
    .sort({ createdAt: -1 })
    .lean();

  // 6. Load payments for each project
  const projectIds = projects.map((p) => p._id);
  const allPayments = await Payment.find({
    admin:   record.admin,
    project: { $in: projectIds },
    status:  'SUCCESS',
  }).lean();

  const paymentsByProject = {};
  for (const pay of allPayments) {
    const pid = String(pay.project);
    if (!paymentsByProject[pid]) paymentsByProject[pid] = [];
    paymentsByProject[pid].push(pay);
  }

  // 7. Shape response
  const client = record.client;
  const mappedProjects = projects.map((p) =>
    mapProjectForClient(p, paymentsByProject[String(p._id)] || []),
  );

  const ACTIVE = ['NOT_STARTED', 'WORK_STARTED', 'IN_PROGRESS', 'REVIEW', 'FINALIZATION', 'DELAYED'];

  return res.status(200).json(
    new ApiResponse(200, {
      client: {
        id:          String(client._id),
        name:        client.name,
        email:       client.email,
        mobile:      client.mobile,
        companyName: client.companyName,
      },
      company: {
        name:    admin?.company?.name  || 'Graphura CRM',
        logo:    admin?.company?.logo  || null,
        email:   admin?.company?.email || null,
        phone:   admin?.company?.phone || null,
        website: admin?.company?.website || null,
      },
      stats: {
        total:     mappedProjects.length,
        active:    mappedProjects.filter((p) => ACTIVE.includes(projects.find((x) => String(x._id) === p.id)?.status)).length,
        delivered: mappedProjects.filter((p) => p.status === 'Completed' || p.status === 'Delivered').length,
      },
      projects: mappedProjects,
    }, 'Tracking data loaded'),
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// MANAGER: POST /api/management/clients/:clientId/send-tracking-link
// Generates / refreshes a token, sends email.
// Requires MANAGEMENT_MANAGER role.
// ═════════════════════════════════════════════════════════════════════════════
exports.sendTrackingLink = catchAsync(async (req, res, next) => {
  const { Project, Client, ProjectTrackingToken, Admin } = require('../models');

  // Auth: management manager only
  if (!req.user || req.user.role !== 'MANAGEMENT_MANAGER') {
    return next(new AppError('Only Management Manager can send tracking links', 403));
  }

  const { clientId } = req.params;
  const adminId      = req.admin._id;

  // 1. Validate client belongs to this admin
  const client = await Client.findOne({ _id: clientId, admin: adminId, isDeleted: false });
  if (!client) return next(new AppError('Client not found', 404));
  if (!client.email) return next(new AppError('Client has no email address on record', 400));

  // 2. Count their projects
  const projectCount = await Project.countDocuments({
    admin: adminId, client: clientId, isDeleted: false,
  });

  // 3. Generate a new UUID token (crypto-random, not guessable)
  const token = crypto.randomUUID(); // requires Node 14.17+

  // 4. Upsert token record (one per client per admin — revoke old, issue new)
  await ProjectTrackingToken.findOneAndUpdate(
    { admin: adminId, client: clientId },
    {
      admin:          adminId,
      client:         clientId,
      project:        null,   // client-level token, not project-level
      token,
      isActive:       true,
      expiresAt:      null,   // permanent (admin can revoke manually)
      accessCount:    0,
      lastAccessedAt: null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  // 5. Build tracking URL
  const frontendUrl  = process.env.FRONTEND_URL || 'http://localhost:5173';
  const trackingUrl  = `${frontendUrl}/track/${token}`;

  // 6. Load admin branding for email
  const admin = await Admin.findOne({ _id: adminId }).select('company').lean();
  const senderName = admin?.company?.name || 'Graphura CRM';

  // 7. Send email via Brevo
  await sendClientTrackingLinkEmail({
    email:        client.email,
    clientName:   client.name,
    companyName:  senderName,
    trackingUrl,
    senderName,
    projectCount,
  });

  logger.info(`Tracking link sent to ${client.email} | client: ${clientId} | token: ${token.slice(0, 8)}…`);

  return res.status(200).json(
    new ApiResponse(200, {
      trackingUrl,
      clientEmail: client.email,
      clientName:  client.name,
      projectCount,
    }, `Tracking link sent to ${client.email}`),
  );
});
