"use strict";

/**
 * PROJECT CONTROLLER — Management Manager
 *
 * Flow:
 *   Finance approves WorkOrder → Management Manager creates a Project
 *   from that WorkOrder (client, amount, services pre-filled).
 *   MM can also create projects manually without a work order.
 *
 * Status lifecycle (matches planning.md):
 *   NOT_STARTED → WORK_STARTED → IN_PROGRESS → REVIEW →
 *   FINALIZATION → COMPLETED → DELIVERED  (or DELAYED at any stage)
 *
 * handoverLink MUST be set before status = COMPLETED/DELIVERED.
 * driveLink    MUST be set at creation.
 * paidAmount   ONLY via $inc (atomic — never $set).
 */

const catchAsync     = require('../utils/catchAsync');
const ApiResponse    = require('../utils/apiResponse');
const AppError       = require('../utils/appError');
const logger         = require('../utils/logger');

const MGMT_ROLES = ['MANAGEMENT_MANAGER'];

const requireMgmt = (req, next) => {
  if (!req.user || !MGMT_ROLES.includes(req.user.role)) {
    next(new AppError('Only Management Manager can access this resource', 403));
    return false;
  }
  return true;
};

// ── DB → frontend mapping ─────────────────────────────────────────────────────
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
const STATUS_REVERSE = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [v, k]),
);

const PRIORITY_MAP = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent',
};
const PRIORITY_REVERSE = Object.fromEntries(
  Object.entries(PRIORITY_MAP).map(([k, v]) => [v, k]),
);

function mapProject(p) {
  const cl = p.client || {};
  const tl = p.teamLeader || {};
  const wo = p.workOrder || {};
  return {
    id:             String(p._id),
    projectNumber:  p.projectNumber || String(p._id).slice(-6).toUpperCase(),
    name:           p.name,
    description:    p.description || '',
    clientId:       cl._id ? String(cl._id) : (p.client ? String(p.client) : null),
    clientName:     cl.name  || '',
    clientMobile:   cl.mobile || '',
    clientEmail:    cl.email  || '',
    clientCompany:  cl.companyName || '',
    driveLink:      p.driveLink    || null,
    handoverLink:   p.handoverLink || null,
    priority:       STATUS_MAP[p.priority] || PRIORITY_MAP[p.priority] || p.priority,
    status:         STATUS_MAP[p.status]   || p.status,
    startDate:      p.startDate         ? p.startDate.toISOString().slice(0, 10)         : null,
    deadline:       p.expectedDelivery  ? p.expectedDelivery.toISOString().slice(0, 10)  : null,
    deliveredAt:    p.deliveredAt       ? p.deliveredAt.toISOString().slice(0, 10)       : null,
    assignedTL:     tl._id   ? String(tl._id)  : (p.teamLeader  ? String(p.teamLeader)  : null),
    assignedTLName: tl.name  || '',
    totalCost:      p.totalAmount   || 0,
    paidAmount:     p.paidAmount    || 0,
    progressPercent: p.progressPercent || 0,
    isDelivered:    p.isDelivered   || false,
    workOrderId:    wo._id ? String(wo._id) : (p.workOrder ? String(p.workOrder) : null),
    workOrderNumber: wo.woNumber || null,
    updates:        (p.updates || []).map((u) => ({
      date:   u.date ? new Date(u.date).toISOString().slice(0, 10) : '',
      status: STATUS_MAP[u.status] || u.status,
      note:   u.note,
      isClientVisible: u.isClientVisible !== false,
    })),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

async function nextProjectNumber(adminId) {
  const { ProjectCounter } = require('../models');
  const c = await ProjectCounter.findOneAndUpdate(
    { admin: adminId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  return `${c.prefix || 'PRJ'}-${String(c.seq).padStart(6, '0')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST  GET /api/management/projects
// ─────────────────────────────────────────────────────────────────────────────
exports.listProjects = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project } = require('../models');

  const filter = { admin: req.admin._id, isDeleted: false };
  if (req.query.status) filter.status = STATUS_REVERSE[req.query.status] || req.query.status;

  const projects = await Project.find(filter)
    .populate('client',     'name email mobile companyName')
    .populate('teamLeader', 'name email phone role')
    .populate('workOrder',  'woNumber')
    .sort({ createdAt: -1 })
    .lean();

  const mapped = projects.map(mapProject);

  const ACTIVE = ['NOT_STARTED', 'WORK_STARTED', 'IN_PROGRESS', 'REVIEW', 'FINALIZATION'];
  const stats = {
    total:               mapped.length,
    active:              projects.filter((p) => ACTIVE.includes(p.status)).length,
    delayed:             projects.filter((p) => p.status === 'DELAYED').length,
    completed:           projects.filter((p) => ['COMPLETED', 'DELIVERED'].includes(p.status)).length,
    pendingHandoverLink: projects.filter(
      (p) => ['COMPLETED', 'DELIVERED'].includes(p.status) && !p.handoverLink
    ).length,
  };

  return res.status(200).json(
    new ApiResponse(200, { projects: mapped, stats }, 'Projects listed'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET ONE  GET /api/management/projects/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.getProject = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project } = require('../models');

  const p = await Project.findOne({ _id: req.params.id, admin: req.admin._id, isDeleted: false })
    .populate('client',     'name email mobile companyName')
    .populate('teamLeader', 'name email phone role')
    .populate('workOrder',  'woNumber clientName netPayable')
    .lean();

  if (!p) return next(new AppError('Project not found', 404));

  return res.status(200).json(
    new ApiResponse(200, { project: mapProject(p) }, 'Project retrieved'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// CREATE  POST /api/management/projects
// Body: { name, clientId, driveLink, startDate, deadline, priority,
//         teamLeaderId, description?, workOrderId?, totalAmount? }
// ─────────────────────────────────────────────────────────────────────────────
exports.createProject = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project, Client, User, WorkOrder, AuditLog } = require('../models');

  const {
    name, driveLink, startDate, deadline,
    priority = 'Medium', teamLeaderId, description = '',
    workOrderId, totalAmount = 0,
  } = req.body;

  // clientId may come directly (manual mode) or be derived from the WO (WO mode)
  let clientId = req.body.clientId;

  // ── Basic field validation (clientId checked after WO lookup) ─────────────
  if (!name?.trim())      return next(new AppError('Project name is required', 400));
  if (!driveLink?.trim()) return next(new AppError('Drive link is mandatory per spec', 400));
  if (!startDate)         return next(new AppError('Start date is required', 400));
  if (!deadline)          return next(new AppError('Deadline is required', 400));
  if (!teamLeaderId)      return next(new AppError('Team Leader is required', 400));
  if (startDate > deadline) return next(new AppError('Deadline must be on or after start date', 400));

  // ── If from work order, validate WO and derive clientId from it ───────────
  let workOrder = null;
  let finalTotalAmount = Number(totalAmount) || 0;
  if (workOrderId) {
    workOrder = await WorkOrder.findOne({
      _id: workOrderId, admin: req.admin._id,
      approvalStatus: 'Approved', sentToManagement: true,
    });

    if (!workOrder) return next(new AppError('Work order not found or not yet approved', 400));

    // Idempotency: one project per work order
    const existing = await Project.findOne({ admin: req.admin._id, workOrder: workOrderId, isDeleted: false });
    if (existing) return next(new AppError('A project already exists for this work order', 409));

    // 1st choice: WO has a direct client ObjectId ref
    if (!clientId && workOrder.client) {
      clientId = String(workOrder.client);
    }

    // 2nd choice: WO has clientMobile snapshot — look up client by mobile
    if (!clientId && workOrder.clientMobile) {
      const found = await Client.findOne({
        admin: req.admin._id,
        mobile: workOrder.clientMobile,
        isDeleted: false,
      }).lean();
      if (found) clientId = String(found._id);
    }

    // 3rd choice: WO has clientEmail snapshot
    if (!clientId && workOrder.clientEmail) {
      const found = await Client.findOne({
        admin: req.admin._id,
        email: workOrder.clientEmail,
        isDeleted: false,
      }).lean();
      if (found) clientId = String(found._id);
    }

    if (!finalTotalAmount) finalTotalAmount = workOrder.netPayable || 0;
  }

  // ── clientId must be present now (either passed directly or derived from WO) ──
  if (!clientId) return next(new AppError('Client is required — work order has no linked client record', 400));

  // ── Validate client belongs to this admin ────────────────────────────────
  const client = await Client.findOne({ _id: clientId, admin: req.admin._id, isDeleted: false });
  if (!client) return next(new AppError('Client not found', 404));

  // ── Validate team leader is MANAGEMENT_TL ────────────────────────────────
  const tl = await User.findOne({
    _id: teamLeaderId, admin: req.admin._id,
    role: 'MANAGEMENT_TL', isDeleted: false,
  });
  if (!tl) return next(new AppError('Team Leader not found or not a MANAGEMENT_TL', 400));

  const dbPriority    = PRIORITY_REVERSE[priority]    || priority.toUpperCase();
  const projectNumber = await nextProjectNumber(req.admin._id);

  const project = await Project.create({
    admin:            req.admin._id,
    client:           clientId,
    name:             name.trim(),
    description:      description.trim(),
    driveLink:        driveLink.trim(),
    priority:         dbPriority,
    status:           'NOT_STARTED',
    startDate:        new Date(startDate),
    expectedDelivery: new Date(deadline),
    teamLeader:       teamLeaderId,
    totalAmount:      finalTotalAmount,
    paidAmount:       workOrder?.paymentStatus === 'Paid' ? finalTotalAmount : 0,
    progressPercent:  0,
    workOrder:        workOrderId || null,
    projectNumber,
    updates: [{
      date:   new Date(),
      status: 'NOT_STARTED',
      note:   `Project created${workOrder ? ` from Work Order ${workOrder.woNumber}` : ''}.`,
      isClientVisible: false,
    }],
  });

  // Mark work order as having a project
  if (workOrder) {
    workOrder.project = project._id;
    await workOrder.save().catch(() => {});
  }

  await AuditLog.create({
    admin: req.admin._id, performedBy: req.user._id, performerType: 'USER',
    action: 'PROJECT_CREATED', targetModel: 'Project', targetId: project._id,
    after: { name: project.name, projectNumber, clientId, teamLeaderId },
  }).catch(() => {});

  await project.populate('client',     'name email mobile companyName');
  await project.populate('teamLeader', 'name email phone role');

  logger.info('Project created', { projectId: String(project._id), projectNumber });

  return res.status(201).json(
    new ApiResponse(201, { project: mapProject(project.toObject()) }, 'Project created'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE  PUT /api/management/projects/:id
// ─────────────────────────────────────────────────────────────────────────────
exports.updateProject = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project, User, AuditLog } = require('../models');

  const p = await Project.findOne({ _id: req.params.id, admin: req.admin._id, isDeleted: false });
  if (!p) return next(new AppError('Project not found', 404));

  const {
    name, description, driveLink, handoverLink,
    startDate, deadline, priority, status,
    teamLeaderId, progressPercent,
  } = req.body;

  const before = { status: p.status, progressPercent: p.progressPercent };

  // Status gate: handoverLink required before COMPLETED/DELIVERED
  const newStatus = status ? (STATUS_REVERSE[status] || status.toUpperCase()) : p.status;
  if (['COMPLETED', 'DELIVERED'].includes(newStatus) && !handoverLink && !p.handoverLink) {
    return next(new AppError('Handover link is mandatory before marking project as Completed/Delivered', 400));
  }

  if (name          !== undefined) p.name             = name.trim();
  if (description   !== undefined) p.description      = description;
  if (driveLink     !== undefined) p.driveLink        = driveLink || null;
  if (handoverLink  !== undefined) p.handoverLink     = handoverLink || null;
  if (startDate     !== undefined) p.startDate        = new Date(startDate);
  if (deadline      !== undefined) p.expectedDelivery = new Date(deadline);
  if (priority      !== undefined) p.priority         = PRIORITY_REVERSE[priority]  || priority.toUpperCase();
  if (status        !== undefined) {
    p.status = newStatus;
    if (['COMPLETED', 'DELIVERED'].includes(newStatus) && !p.deliveredAt) {
      p.deliveredAt = new Date();
      p.isDelivered = true;
    }
  }
  if (progressPercent !== undefined) p.progressPercent = Math.max(0, Math.min(100, Number(progressPercent) || 0));

  if (teamLeaderId !== undefined && teamLeaderId !== String(p.teamLeader)) {
    const tl = await User.findOne({ _id: teamLeaderId, admin: req.admin._id, role: 'MANAGEMENT_TL', isDeleted: false });
    if (!tl) return next(new AppError('Team Leader not found or not a MANAGEMENT_TL', 400));
    p.teamLeader = teamLeaderId;
  }

  await p.save();

  await AuditLog.create({
    admin: req.admin._id, performedBy: req.user._id, performerType: 'USER',
    action: 'PROJECT_UPDATED', targetModel: 'Project', targetId: p._id,
    before, after: { status: p.status, progressPercent: p.progressPercent },
  }).catch(() => {});

  await p.populate('client',     'name email mobile companyName');
  await p.populate('teamLeader', 'name email phone role');

  return res.status(200).json(
    new ApiResponse(200, { project: mapProject(p.toObject()) }, 'Project updated'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ADD UPDATE  POST /api/management/projects/:id/updates
// Body: { status, note, isClientVisible? }
// ─────────────────────────────────────────────────────────────────────────────
exports.addUpdate = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project, AuditLog } = require('../models');

  const { status, note, isClientVisible = true } = req.body;
  if (!note?.trim()) return next(new AppError('Note is required', 400));

  const p = await Project.findOne({ _id: req.params.id, admin: req.admin._id, isDeleted: false });
  if (!p) return next(new AppError('Project not found', 404));

  const dbStatus = STATUS_REVERSE[status] || p.status;

  p.updates.push({
    date:   new Date(),
    status: dbStatus,
    note:   note.trim(),
    isClientVisible,
  });
  p.status = dbStatus;
  await p.save();

  await p.populate('client',     'name email mobile companyName');
  await p.populate('teamLeader', 'name email phone role');

  return res.status(200).json(
    new ApiResponse(200, { project: mapProject(p.toObject()) }, 'Update added'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// MARK COMPLETED  POST /api/management/projects/:id/complete
// ─────────────────────────────────────────────────────────────────────────────
exports.markCompleted = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project, AuditLog } = require('../models');

  const p = await Project.findOne({ _id: req.params.id, admin: req.admin._id, isDeleted: false });
  if (!p) return next(new AppError('Project not found', 404));

  const missing = [];
  if (!p.driveLink)    missing.push('Drive link is missing');
  if (!p.handoverLink) missing.push('Handover link is missing');
  if (missing.length)  return next(new AppError(`Cannot complete: ${missing.join('; ')}`, 400));

  p.status      = 'COMPLETED';
  p.progressPercent = 100;
  p.isDelivered = true;
  p.deliveredAt = new Date();
  p.updates.push({
    date:   new Date(),
    status: 'COMPLETED',
    note:   'Project marked completed. Handover link shared.',
    isClientVisible: true,
  });
  await p.save();

  await AuditLog.create({
    admin: req.admin._id, performedBy: req.user._id, performerType: 'USER',
    action: 'PROJECT_DELIVERED', targetModel: 'Project', targetId: p._id,
  }).catch(() => {});

  await p.populate('client',     'name email mobile companyName');
  await p.populate('teamLeader', 'name email phone role');

  return res.status(200).json(
    new ApiResponse(200, { project: mapProject(p.toObject()) }, 'Project completed'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE  DELETE /api/management/projects/:id  (soft)
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteProject = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project } = require('../models');

  const p = await Project.findOne({ _id: req.params.id, admin: req.admin._id, isDeleted: false });
  if (!p) return next(new AppError('Project not found', 404));
  if (['COMPLETED', 'DELIVERED'].includes(p.status)) {
    return next(new AppError('Cannot delete a completed/delivered project', 400));
  }

  await p.softDelete(req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Project deleted'));
});

// ─────────────────────────────────────────────────────────────────────────────
// FORM DATA  GET /api/management/projects/form-data
// Returns clients + management TLs + approved work orders — for the create form
// ─────────────────────────────────────────────────────────────────────────────
exports.getFormData = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Client, User, WorkOrder, Department } = require('../models');

  const dept = await Department.findOne({
    admin: req.admin._id, name: 'MANAGEMENT', isDeleted: false,
  }).lean();

  const [clients, leaders, workOrders] = await Promise.all([
    // Only return clients who have at least one SUCCESS payment — paying customers only
    (async () => {
      const { Payment } = require('../models');
      // Get distinct client IDs that have a successful payment under this admin
      const paidClientIds = await Payment.distinct('client', {
        admin:  req.admin._id,
        status: 'SUCCESS',
        client: { $ne: null },
      });

      if (paidClientIds.length === 0) return [];

      return Client.findActive(
        { admin: req.admin._id, _id: { $in: paidClientIds } },
        'name email mobile companyName',
        { sort: { name: 1 } },
      );
    })(),
    User.findActive(
      { admin: req.admin._id, department: dept?._id, role: 'MANAGEMENT_TL' },
      'name email phone',
      { sort: { name: 1 } },
    ),
    WorkOrder.find({
      admin: req.admin._id,
      approvalStatus: 'Approved',
      sentToManagement: true,
      project: null,  // not yet linked to a project
    }).lean(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      clients: clients.map((c) => ({
        id: String(c._id), name: c.name, mobile: c.mobile, email: c.email,
        companyName: c.companyName,
      })),
      leaders: leaders.map((l) => ({
        id: String(l._id), name: l.name, phone: l.phone, email: l.email,
      })),
      workOrders: workOrders.map((w) => ({
        id:            String(w._id),
        woNumber:      w.woNumber,
        clientId:      w.client ? String(w.client) : null,   // ← added so frontend can use it
        clientName:    w.clientName,
        service:       w.service,
        netPayable:    w.netPayable,
        paymentStatus: w.paymentStatus,
        signedStatus:  w.signedStatus,
      })),
    }, 'Form data loaded'),
  );
});
