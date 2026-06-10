"use strict";

/**
 * MANAGEMENT CONTROLLER — Dashboard + Clients
 *
 * GET /api/management/dashboard
 *   KPIs, project status funnel, monthly throughput, per-TL load,
 *   recent projects — all computed from live DB data.
 *
 * GET /api/management/clients
 *   All clients scoped to this admin that have at least one project.
 *   Read-only for Management Manager (client master data is owned by
 *   Finance / Sales; MM sees them in context of projects).
 */

const catchAsync  = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError    = require('../utils/appError');

const MGMT_ROLES = ['MANAGEMENT_MANAGER'];

const requireMgmt = (req, next) => {
  if (!req.user || !MGMT_ROLES.includes(req.user.role)) {
    next(new AppError('Only Management Manager can access this resource', 403));
    return false;
  }
  return true;
};

// ── DB → UI status label ─────────────────────────────────────────────────────
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

const PRIORITY_MAP = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent',
};

// Status groups
const ACTIVE_STATUSES    = ['NOT_STARTED', 'WORK_STARTED', 'IN_PROGRESS', 'REVIEW', 'FINALIZATION'];
const COMPLETED_STATUSES = ['COMPLETED', 'DELIVERED'];
const ALL_STATUSES       = Object.keys(STATUS_MAP);

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD  GET /api/management/dashboard
// ─────────────────────────────────────────────────────────────────────────────
exports.getDashboard = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project, User, Department } = require('../models');

  const adminId = req.admin._id;

  // Fetch all non-deleted projects for this admin in one query
  const projects = await Project.find({ admin: adminId, isDeleted: false })
    .populate('teamLeader', 'name')
    .populate('client',     'name mobile')
    .lean();

  // ── KPI stats ────────────────────────────────────────────────────────────
  const now      = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const kpis = {
    totalProjects:       projects.length,
    activeProjects:      projects.filter(p => ACTIVE_STATUSES.includes(p.status)).length,
    completedThisMonth:  projects.filter(p =>
      COMPLETED_STATUSES.includes(p.status) &&
      p.deliveredAt &&
      p.deliveredAt.toISOString().slice(0, 7) === thisMonth,
    ).length,
    delayed:             projects.filter(p => p.status === 'DELAYED').length,
    pendingHandoverLink: projects.filter(p =>
      COMPLETED_STATUSES.includes(p.status) && !p.handoverLink,
    ).length,
  };

  // On-time delivery % (completed projects delivered on or before expectedDelivery)
  const completedWithDeadline = projects.filter(p =>
    COMPLETED_STATUSES.includes(p.status) && p.expectedDelivery && p.deliveredAt,
  );
  kpis.onTimeDeliveryPct = completedWithDeadline.length === 0
    ? 0
    : Math.round(
        (completedWithDeadline.filter(p => p.deliveredAt <= p.expectedDelivery).length /
          completedWithDeadline.length) * 100,
      );

  // ── Status funnel ─────────────────────────────────────────────────────────
  const statusFunnel = ALL_STATUSES.map(s => ({
    name:  STATUS_MAP[s],
    value: projects.filter(p => p.status === s).length,
  }));

  // ── Monthly throughput — last 12 months ───────────────────────────────────
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const name = d.toLocaleString('en-IN', { month: 'short' });
    monthly.push({
      name,
      started:   projects.filter(p =>
        p.startDate && p.startDate.toISOString().slice(0, 7) === key,
      ).length,
      delivered: projects.filter(p =>
        p.deliveredAt && p.deliveredAt.toISOString().slice(0, 7) === key,
      ).length,
    });
  }

  // ── Per-TL load ───────────────────────────────────────────────────────────
  const dept = await Department.findOne({
    admin: adminId, name: 'MANAGEMENT', isDeleted: false,
  }).lean();

  const tls = await User.findActive(
    { admin: adminId, department: dept?._id, role: 'MANAGEMENT_TL' },
    'name',
    { sort: { name: 1 } },
  );

  const tlLoad = tls.map(tl => {
    const tlProjects = projects.filter(p =>
      p.teamLeader && String(p.teamLeader._id || p.teamLeader) === String(tl._id),
    );
    return {
      name:      tl.name.split(' ')[0],
      fullName:  tl.name,
      active:    tlProjects.filter(p => ACTIVE_STATUSES.includes(p.status)).length,
      completed: tlProjects.filter(p => COMPLETED_STATUSES.includes(p.status)).length,
      delayed:   tlProjects.filter(p => p.status === 'DELAYED').length,
    };
  });

  // ── Recent projects (last 8, sorted by updatedAt) ─────────────────────────
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 8)
    .map(p => ({
      id:             String(p._id),
      projectNumber:  p.projectNumber || String(p._id).slice(-6).toUpperCase(),
      name:           p.name,
      clientName:     p.client?.name    || '',
      clientMobile:   p.client?.mobile  || '',
      assignedTLName: p.teamLeader?.name || '',
      deadline:       p.expectedDelivery ? p.expectedDelivery.toISOString().slice(0, 10) : null,
      progressPercent: p.progressPercent || 0,
      status:         STATUS_MAP[p.status]   || p.status,
      priority:       PRIORITY_MAP[p.priority] || p.priority,
      driveLink:      p.driveLink    || null,
      handoverLink:   p.handoverLink || null,
      startDate:      p.startDate   ? p.startDate.toISOString().slice(0, 10) : null,
      deliveredAt:    p.deliveredAt ? p.deliveredAt.toISOString().slice(0, 10) : null,
    }));

  return res.status(200).json(
    new ApiResponse(200, {
      kpis,
      statusFunnel,
      monthlyThroughput: monthly,
      tlLoad,
      recentProjects,
      totalTLs: tls.length,
    }, 'Dashboard loaded'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTS  GET /api/management/clients
// Returns all clients that have at least one project under this admin.
// MM views clients in context of their projects (read-only).
// ─────────────────────────────────────────────────────────────────────────────
exports.listClients = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project, Client } = require('../models');

  const adminId = req.admin._id;

  // Get all projects (need client refs + status for KPIs)
  const projects = await Project.find({ admin: adminId, isDeleted: false })
    .select('client status handoverLink driveLink name projectNumber expectedDelivery progressPercent priority')
    .lean();

  // Unique client IDs across all projects
  const clientIds = [...new Set(
    projects.map(p => p.client?.toString()).filter(Boolean),
  )];

  const clients = clientIds.length === 0
    ? []
    : await Client.findActive(
        { admin: adminId, _id: { $in: clientIds } },
        'name email mobile companyName',
        { sort: { name: 1 } },
      );

  // Map clients with embedded project summary
  const STATUS_ACTIVE = new Set(ACTIVE_STATUSES);

  const mappedClients = clients.map(c => {
    const clientProjects = projects.filter(p => String(p.client) === String(c._id));
    return {
      id:          String(c._id),
      name:        c.name,
      email:       c.email  || '',
      mobile:      c.mobile || '',
      companyName: c.companyName || '',
      projectCount: clientProjects.length,
      activeCount:  clientProjects.filter(p => STATUS_ACTIVE.has(p.status)).length,
      // Summarised project list for the view modal
      projects: clientProjects.map(p => ({
        id:             String(p._id),
        projectNumber:  p.projectNumber || String(p._id).slice(-6).toUpperCase(),
        name:           p.name,
        status:         STATUS_MAP[p.status] || p.status,
        priority:       PRIORITY_MAP[p.priority] || p.priority,
        deadline:       p.expectedDelivery ? p.expectedDelivery.toISOString().slice(0, 10) : null,
        progressPercent: p.progressPercent || 0,
        driveLink:      p.driveLink    || null,
        handoverLink:   p.handoverLink || null,
      })),
    };
  });

  // KPI stats
  const stats = {
    total:        mappedClients.length,
    withActive:   mappedClients.filter(c => c.activeCount > 0).length,
    totalProjects: projects.length,
    pendingHandover: projects.filter(p =>
      ['COMPLETED', 'DELIVERED'].includes(p.status) && !p.handoverLink,
    ).length,
  };

  return res.status(200).json(
    new ApiResponse(200, { clients: mappedClients, stats }, 'Clients listed'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS  GET /api/management/reports?period=today|week|month|year
// Returns all data needed by the 4 report tabs:
//   projectReports, teamReports, deliveryReports, tlReports, kpis
// ─────────────────────────────────────────────────────────────────────────────
exports.getReports = catchAsync(async (req, res, next) => {
  if (!requireMgmt(req, next)) return;
  const { Project, User, Department, ProjectTask } = require('../models');

  const adminId = req.admin._id;
  const period  = req.query.period || 'today'; // today | week | month | year

  const now   = new Date();
  let since   = new Date(now);
  since.setHours(0, 0, 0, 0);
  if (period === 'week')  since.setDate(now.getDate() - 7);
  if (period === 'month') since.setMonth(now.getMonth() - 1);
  if (period === 'year')  since.setFullYear(now.getFullYear() - 1);

  const projects = await Project.find({ admin: adminId, isDeleted: false })
    .populate('teamLeader', 'name')
    .lean();

  const dept = await Department.findOne({
    admin: adminId, name: 'MANAGEMENT', isDeleted: false,
  }).lean();

  const tls = await User.findActive(
    { admin: adminId, department: dept?._id, role: 'MANAGEMENT_TL' },
    'name',
    { sort: { name: 1 } },
  );

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const completed     = projects.filter(p => COMPLETED_STATUSES.includes(p.status));
  const withDeadline  = completed.filter(p => p.expectedDelivery && p.deliveredAt);
  const onTime        = withDeadline.filter(p => p.deliveredAt <= p.expectedDelivery);
  const onTimePct     = withDeadline.length === 0 ? 0
    : Math.round((onTime.length / withDeadline.length) * 100);

  const avgDays = completed.length === 0 ? 0 : Math.round(
    completed.filter(p => p.startDate && p.deliveredAt).reduce((sum, p) => {
      return sum + Math.max(0, Math.ceil((p.deliveredAt - p.startDate) / 86400000));
    }, 0) / completed.filter(p => p.startDate && p.deliveredAt).length,
  ) || 0;

  const kpis = {
    totalProjects:    projects.length,
    completed:        completed.length,
    onTimePercentage: onTimePct,
    avgCompletionDays: avgDays,
  };

  // ── Project reports — daily trend (last 7 days or period buckets) ─────────
  const buildDailyTrend = (buckets, bucketFn) => buckets.map(b => ({
    name:       b.name,
    delivered:  projects.filter(p => COMPLETED_STATUSES.includes(p.status) && bucketFn(p, b)).length,
    inProgress: projects.filter(p => ACTIVE_STATUSES.includes(p.status) && bucketFn(p, b)).length,
    delayed:    projects.filter(p => p.status === 'DELAYED' && bucketFn(p, b)).length,
  }));

  // Build buckets based on period
  let projectTrend = [];
  if (period === 'today' || period === 'week') {
    const days = period === 'today' ? 1 : 7;
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const dayName = d.toLocaleDateString('en', { weekday: 'short' });
      projectTrend.push({
        name:       dayName,
        delivered:  projects.filter(p => COMPLETED_STATUSES.includes(p.status) && p.deliveredAt && p.deliveredAt >= d && p.deliveredAt < next).length,
        inProgress: projects.filter(p => ACTIVE_STATUSES.includes(p.status) && p.updatedAt && p.updatedAt >= d && p.updatedAt < next).length,
        delayed:    projects.filter(p => p.status === 'DELAYED' && p.updatedAt && p.updatedAt >= d && p.updatedAt < next).length,
      });
    }
  } else if (period === 'month') {
    for (let w = 1; w <= 4; w++) {
      const wStart = new Date(now); wStart.setDate(now.getDate() - (4 - w) * 7);
      const wEnd   = new Date(wStart); wEnd.setDate(wStart.getDate() + 7);
      projectTrend.push({
        name:       `Week ${w}`,
        delivered:  projects.filter(p => COMPLETED_STATUSES.includes(p.status) && p.deliveredAt && p.deliveredAt >= wStart && p.deliveredAt < wEnd).length,
        inProgress: projects.filter(p => ACTIVE_STATUSES.includes(p.status)).length,
        delayed:    projects.filter(p => p.status === 'DELAYED').length,
      });
    }
  } else { // year
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const name = d.toLocaleString('en', { month: 'short' });
      projectTrend.push({
        name,
        delivered:  projects.filter(p => p.deliveredAt && p.deliveredAt.toISOString().slice(0,7) === key).length,
        inProgress: projects.filter(p => ACTIVE_STATUSES.includes(p.status) && p.startDate && p.startDate.toISOString().slice(0,7) === key).length,
        delayed:    projects.filter(p => p.status === 'DELAYED').length,
      });
    }
  }

  // ── Team reports — per TL breakdown ──────────────────────────────────────
  const teamReports = tls.map(tl => {
    const tlProjects = projects.filter(p =>
      p.teamLeader && String(p.teamLeader._id || p.teamLeader) === String(tl._id),
    );
    return {
      id:            String(tl._id),
      name:          tl.name,
      totalProjects: tlProjects.length,
      completed:     tlProjects.filter(p => COMPLETED_STATUSES.includes(p.status)).length,
      inProgress:    tlProjects.filter(p => ACTIVE_STATUSES.includes(p.status)).length,
      delayed:       tlProjects.filter(p => p.status === 'DELAYED').length,
    };
  });

  // ── Delivery reports — delivered vs delayed per bucket ───────────────────
  const deliveryTrend = projectTrend.map(b => ({
    name:      b.name,
    delivered: b.delivered,
    delayed:   b.delayed,
  }));

  // Monthly delivery (last 12 months always — for delivery tab)
  const monthlyDelivery = [];
  for (let i = 11; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyDelivery.push({
      name:      d.toLocaleString('en', { month: 'short' }),
      delivered: projects.filter(p => p.deliveredAt && p.deliveredAt.toISOString().slice(0,7) === key).length,
      delayed:   projects.filter(p => p.status === 'DELAYED' && p.updatedAt && p.updatedAt.toISOString().slice(0,7) === key).length,
    });
  }

  // ── TL chart data ─────────────────────────────────────────────────────────
  const tlChartData = teamReports.map(t => ({
    name:       t.name.split(' ')[0],
    completed:  t.completed,
    inProgress: t.inProgress,
    delayed:    t.delayed,
  }));

  return res.status(200).json(
    new ApiResponse(200, {
      kpis,
      projectTrend,
      teamReports,
      deliveryTrend,
      monthlyDelivery,
      tlReports: teamReports,
      tlChartData,
    }, 'Reports loaded'),
  );
});
