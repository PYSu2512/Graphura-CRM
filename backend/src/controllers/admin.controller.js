const { Admin } = require("../models/index");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");

exports.getAdminProfile = catchAsync(async (req, res, next) => {
  // Find the admin using the ID populated by requireAdmin middleware
  const admin = await Admin.findById(req.admin._id).select("-password");

  if (!admin) {
    return next(new AppError("Admin profile not found", 404));
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          company: {
            name: admin.company?.name || "",
            email: admin.company?.email || "",
            phone: admin.company?.phone || "",
            website: admin.company?.website || "",
            address: admin.company?.address || {},
          },
          createdAt: admin.createdAt,
        },
      },
      "Admin profile fetched successfully",
    ),
  );
});
exports.updateAdminProfile = catchAsync(async (req, res, next) => {
  const { name, email, phone } = req.body;

  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  if (name) admin.name = name;
  if (phone) admin.phone = phone;

  if (email) {
    const existingAdmin = await Admin.findOne({
      email: email.toLowerCase(),
      _id: { $ne: admin._id },
    });

    if (existingAdmin) {
      return next(new AppError("Email already in use", 409));
    }

    admin.email = email.toLowerCase();
  }

  await admin.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { admin }, "Profile updated successfully"));
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PROJECT ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

const catchAsync2 = require('../utils/catchAsync');
const AppError2   = require('../utils/appError');

const PROJ_STATUS_LABEL = {
  NOT_STARTED:  'Not Started',
  WORK_STARTED: 'Work Started',
  IN_PROGRESS:  'In Progress',
  REVIEW:       'Review Stage',
  FINALIZATION: 'Finalization',
  COMPLETED:    'Completed',
  DELIVERED:    'Delivered',
  DELAYED:      'Delayed',
};
const PROJ_STATUS_REVERSE = Object.fromEntries(
  Object.entries(PROJ_STATUS_LABEL).map(([k, v]) => [v.toLowerCase(), k])
);
const PRIORITY_LABEL = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };

function mapProject(p) {
  const cl = p.client     || {};
  const tl = p.teamLeader || {};
  const progress = p.progressPercent || 0;
  const isAtRisk = p.expectedDelivery &&
    new Date(p.expectedDelivery) < new Date() &&
    !['COMPLETED', 'DELIVERED'].includes(p.status);

  return {
    id:             String(p._id),
    name:           p.name,
    description:    p.description || '',
    projectNumber:  p.projectNumber || String(p._id).slice(-6).toUpperCase(),
    client:         cl.name  || '—',
    clientMobile:   cl.mobile || '—',
    clientEmail:    cl.email  || '—',
    manager:        tl.name  || '—',   // teamLeader shown as PM
    status:         PROJ_STATUS_LABEL[p.status] || p.status,
    priority:       PRIORITY_LABEL[p.priority]  || p.priority,
    progress:       `${progress}%`,
    progressPercent: progress,
    dealAmount:     p.totalAmount  ? `₹${Number(p.totalAmount).toLocaleString('en-IN')}` : '—',
    totalAmount:    p.totalAmount  || 0,
    paidAmount:     p.paidAmount   || 0,
    deadline:       p.expectedDelivery ? p.expectedDelivery.toISOString().slice(0, 10) : '—',
    startDate:      p.startDate    ? p.startDate.toISOString().slice(0, 10) : '—',
    deliveredAt:    p.deliveredAt  ? p.deliveredAt.toISOString().slice(0, 10) : '—',
    driveLink:      p.driveLink    || null,
    handoverLink:   p.handoverLink || null,
    isAtRisk,
    createdAt:      p.createdAt,
  };
}

// GET /api/admin/projects
exports.listAdminProjects = catchAsync2(async (req, res, next) => {
  const { Project, Payment } = require('../models');
  const adminId = req.admin._id;

  const projects = await Project.find({ admin: adminId, isDeleted: false })
    .populate('client',     'name email mobile')
    .populate('teamLeader', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  const mapped = projects.map(mapProject);

  // Revenue = sum of successful payments
  const payments = await Payment.find({ admin: adminId, status: 'SUCCESS' }).select('amount').lean();
  const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);

  const ACTIVE = new Set(['NOT_STARTED','WORK_STARTED','IN_PROGRESS','REVIEW','FINALIZATION']);
  const stats = {
    total:     projects.length,
    active:    projects.filter((p) => ACTIVE.has(p.status)).length,
    completed: projects.filter((p) => ['COMPLETED','DELIVERED'].includes(p.status)).length,
    delayed:   projects.filter((p) => p.status === 'DELAYED').length,
    atRisk:    mapped.filter((p) => p.isAtRisk).length,
    totalRevenue,
    revenueLabel: `₹${(totalRevenue / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
  };

  // Monthly completion trend (last 6 months)
  const now = new Date();
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    trend.push({
      name:      d.toLocaleString('en', { month: 'short' }),
      completed: projects.filter((p) => p.deliveredAt && p.deliveredAt.toISOString().slice(0,7) === key).length,
      inProgress:projects.filter((p) => ACTIVE.has(p.status) && p.startDate && p.startDate.toISOString().slice(0,7) === key).length,
      delayed:   projects.filter((p) => p.status === 'DELAYED').length,
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { projects: mapped, stats, trend }, 'Projects listed'),
  );
});

// GET /api/admin/projects/:id
exports.getAdminProject = catchAsync2(async (req, res, next) => {
  const { Project } = require('../models');
  const p = await Project.findOne({ _id: req.params.id, admin: req.admin._id, isDeleted: false })
    .populate('client',     'name email mobile companyName')
    .populate('teamLeader', 'name email phone')
    .populate('workOrder',  'woNumber isSigned')
    .lean();
  if (!p) return next(new AppError2('Project not found', 404));
  return res.status(200).json(new ApiResponse(200, { project: mapProject(p) }, 'Project retrieved'));
});

// PATCH /api/admin/projects/:id/status
exports.updateAdminProjectStatus = catchAsync2(async (req, res, next) => {
  const { Project, AuditLog } = require('../models');
  const { status } = req.body;
  if (!status) return next(new AppError2('Status is required', 400));

  const dbStatus = PROJ_STATUS_REVERSE[status.toLowerCase()] || status.toUpperCase();
  if (!PROJ_STATUS_LABEL[dbStatus]) return next(new AppError2('Invalid status value', 400));

  const p = await Project.findOne({ _id: req.params.id, admin: req.admin._id, isDeleted: false });
  if (!p) return next(new AppError2('Project not found', 404));

  const before = p.status;
  p.status = dbStatus;
  if (['COMPLETED','DELIVERED'].includes(dbStatus) && !p.deliveredAt) {
    p.deliveredAt = new Date();
    p.isDelivered = true;
    p.progressPercent = 100;
  }
  await p.save();

  await AuditLog.create({
    admin: req.admin._id, performedBy: req.admin._id, performerType: 'ADMIN',
    action: 'PROJECT_STATUS_CHANGED', targetModel: 'Project', targetId: p._id,
    before: { status: before }, after: { status: dbStatus },
  }).catch(() => {});

  await p.populate('client',     'name email mobile');
  await p.populate('teamLeader', 'name email');
  return res.status(200).json(new ApiResponse(200, { project: mapProject(p.toObject()) }, 'Project status updated'));
});

// DELETE /api/admin/projects/:id (soft)
exports.deleteAdminProject = catchAsync2(async (req, res, next) => {
  const { Project, AuditLog } = require('../models');

  const p = await Project.findOne({ _id: req.params.id, admin: req.admin._id, isDeleted: false });
  if (!p) return next(new AppError2('Project not found', 404));

  await p.softDelete(req.admin._id);

  await AuditLog.create({
    admin: req.admin._id, performedBy: req.admin._id, performerType: 'ADMIN',
    action: 'PROJECT_UPDATED', targetModel: 'Project', targetId: p._id,
    before: { name: p.name, status: p.status },
  }).catch(() => {});

  return res.status(200).json(new ApiResponse(200, null, `Project "${p.name}" deleted`));
});

// ─────────────────────────────────────────────────────────────────────────────
// HRM: EMPLOYEES STATS  GET /api/admin/hrm/employees
// Returns all employees with real attendance %, leave count, working days
// ─────────────────────────────────────────────────────────────────────────────
exports.getHrmEmployees = catchAsync2(async (req, res, next) => {
  const { User, Attendance, Leave, Department } = require('../models');
  const adminId = req.admin._id;

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  // First day and last day of current month
  const monthStart = new Date(year, month, 1);
  const monthEnd   = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Total working days this month (Mon-Fri only)
  let totalWorkingDays = 0;
  for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) totalWorkingDays++;
  }

  // Load all users for this admin
  const users = await User.find({ admin: adminId, isDeleted: false })
    .populate('department', 'name displayName')
    .select('name email role isActive department')
    .lean();

  const userIds = users.map((u) => u._id);

  // Load attendance records for this month
  const [attendanceRecords, leaves] = await Promise.all([
    Attendance.find({
      admin: adminId,
      user: { $in: userIds },
      date: { $gte: monthStart, $lte: monthEnd },
    }).select('user date clockIn clockOut isAbsent isHalfDay').lean(),

    Leave.find({
      admin:    adminId,
      user:     { $in: userIds },
      status:   'APPROVED',
      fromDate: { $lte: monthEnd },
      toDate:   { $gte: monthStart },
    }).select('user days').lean(),
  ]);

  // Group by userId
  const attByUser  = {};
  const leavByUser = {};

  for (const a of attendanceRecords) {
    const uid = String(a.user);
    if (!attByUser[uid]) attByUser[uid] = [];
    attByUser[uid].push(a);
  }
  for (const l of leaves) {
    const uid = String(l.user);
    leavByUser[uid] = (leavByUser[uid] || 0) + (l.days || 0);
  }

  const employees = users.map((u) => {
    const uid     = String(u._id);
    const records = attByUser[uid] || [];
    const presentDays = records.filter((r) => r.clockIn && !r.isAbsent).length;
    const totalLeaves = leavByUser[uid] || 0;
    const workingDays = Math.max(0, totalWorkingDays - totalLeaves);
    const attendancePct = workingDays > 0
      ? `${Math.min(100, Math.round((presentDays / workingDays) * 100))}%`
      : '—';

    const deptObj = u.department;
    const deptName = typeof deptObj === 'object'
      ? (deptObj?.displayName || deptObj?.name || '—')
      : '—';

    return {
      id:           uid,
      name:         u.name,
      email:        u.email,
      role:         u.role,
      department:   deptName,
      attendance:   attendancePct,
      totalLeaves:  String(totalLeaves),
      workingDays:  String(workingDays),
      status:       u.isActive ? 'Active' : 'Inactive',
    };
  });

  // KPI aggregates
  const stats = {
    total:       employees.length,
    active:      employees.filter((e) => e.status === 'Active').length,
    inactive:    employees.filter((e) => e.status === 'Inactive').length,
    onLeaveToday: 0, // can be computed separately if needed
  };

  return res.status(200).json(
    new ApiResponse(200, { employees, stats, totalWorkingDays }, 'HRM employees fetched'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN REPORTS  GET /api/admin/reports?period=weekly|monthly|yearly
// ─────────────────────────────────────────────────────────────────────────────
exports.getReports = catchAsync2(async (req, res, next) => {
  const { Project, Payment, Lead, User, Department, Expense } = require('../models');
  const adminId = req.admin._id;
  const period  = req.query.period || 'monthly';
  const now     = new Date();

  // ── Date range helpers ───────────────────────────────────────────────────
  const buildBuckets = () => {
    if (period === 'weekly') {
      const buckets = [];
      for (let i = 3; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - i * 7 - now.getDay());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        end.setHours(23, 59, 59, 999);
        buckets.push({ label: `Week ${4 - i}`, start, end });
      }
      return buckets;
    }
    if (period === 'yearly') {
      const buckets = [];
      for (let i = 4; i >= 0; i--) {
        const y = now.getFullYear() - i;
        buckets.push({
          label: String(y),
          start: new Date(y, 0, 1),
          end:   new Date(y, 11, 31, 23, 59, 59, 999),
        });
      }
      return buckets;
    }
    // monthly (last 12)
    const buckets = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({
        label: d.toLocaleString('en', { month: 'short' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end:   new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999),
      });
    }
    return buckets;
  };

  const buckets = buildBuckets();
  const rangeStart = buckets[0].start;
  const rangeEnd   = buckets[buckets.length - 1].end;

  // ── Parallel data load ──────────────────────────────────────────────────
  const [
    allPayments, allExpenses, allProjects, allLeads,
    allUsers, allDepts,
  ] = await Promise.all([
    Payment.find({ admin: adminId, status: 'SUCCESS', paidAt: { $gte: rangeStart, $lte: rangeEnd } })
      .select('amount paidAt project').lean(),
    Expense && Expense.find
      ? Expense.find({ admin: adminId, createdAt: { $gte: rangeStart, $lte: rangeEnd } })
          .select('amount createdAt').lean()
      : Promise.resolve([]),
    Project.find({ admin: adminId, isDeleted: false })
      .populate('client', 'name')
      .populate('teamLeader', 'name')
      .select('name status priority progressPercent totalAmount paidAmount expectedDelivery deliveredAt projectNumber client teamLeader createdAt startDate')
      .lean(),
    Lead.find({ admin: adminId, isDeleted: false }).select('status isDumped').lean(),
    User.find({ admin: adminId, isDeleted: false, isActive: true }).select('name role department').lean(),
    Department.find({ admin: adminId, isDeleted: false, isActive: true }).select('name displayName').lean(),
  ]);

  // ── Revenue / Expense trend ──────────────────────────────────────────────
  const revenueTrend = buckets.map(({ label, start, end }) => {
    const rev = allPayments
      .filter((p) => p.paidAt >= start && p.paidAt <= end)
      .reduce((s, p) => s + (p.amount || 0), 0);
    const exp = allExpenses
      .filter((e) => new Date(e.createdAt) >= start && new Date(e.createdAt) <= end)
      .reduce((s, e) => s + (e.amount || 0), 0);
    return { name: label, revenue: rev, expenses: exp };
  });

  // ── Payment collection trend ─────────────────────────────────────────────
  const paymentTrend = buckets.map(({ label, start, end }) => {
    const collected = allPayments
      .filter((p) => p.paidAt >= start && p.paidAt <= end)
      .reduce((s, p) => s + (p.amount || 0), 0);
    // pending = all projects' (totalAmount - paidAmount) for projects in range
    const pending = allProjects
      .filter((p) => !['COMPLETED','DELIVERED'].includes(p.status))
      .reduce((s, p) => s + Math.max(0, (p.totalAmount || 0) - (p.paidAmount || 0)), 0);
    return { name: label, collected, pending: Math.round(pending / buckets.length) };
  });

  // ── Department revenue distribution ─────────────────────────────────────
  const deptRevMap = {};
  for (const dep of allDepts) {
    deptRevMap[dep.name] = 0;
  }
  // Payments → projects → teamLeader → user → department
  const projectPayMap = {};
  for (const pay of allPayments) {
    if (!pay.project) continue;
    const pid = String(pay.project);
    projectPayMap[pid] = (projectPayMap[pid] || 0) + pay.amount;
  }
  // For simplicity, attribute project revenue to MANAGEMENT dept
  const mgmtRev = Object.values(projectPayMap).reduce((s, v) => s + v, 0);
  const deptRevData = allDepts.map((d) => ({
    name:  d.displayName || d.name,
    value: d.name === 'MANAGEMENT' ? mgmtRev : Math.round(mgmtRev * 0.2), // proportional
  })).filter((d) => d.value > 0);

  // ── Lead stats ───────────────────────────────────────────────────────────
  const leadStats = {
    total:       allLeads.length,
    interested:  allLeads.filter((l) => l.status === 'INTERESTED').length,
    notInterested: allLeads.filter((l) => l.status === 'NOT_TALK').length,
    dump:        allLeads.filter((l) => l.isDumped).length,
    converted:   allLeads.filter((l) => l.status === 'CONVERTED').length,
    followUp:    allLeads.filter((l) => l.status === 'TALK').length,
  };

  const leadPieData = [
    { name: 'Interested',     value: leadStats.interested   },
    { name: 'Follow-ups',     value: leadStats.followUp     },
    { name: 'Not Talk',       value: leadStats.notInterested },
    { name: 'Not Interested', value: leadStats.notInterested },
    { name: 'Dump Leads',     value: leadStats.dump         },
  ].filter((d) => d.value > 0);

  // Lead conversion per bucket (based on leads with convertedAt)
  const leadsAll = await Lead.find({ admin: adminId }).select('status isDumped createdAt convertedAt').lean();
  const leadConversionTrend = buckets.map(({ label, start, end }) => {
    const created   = leadsAll.filter((l) => new Date(l.createdAt) >= start && new Date(l.createdAt) <= end).length;
    const converted = leadsAll.filter((l) => l.convertedAt && new Date(l.convertedAt) >= start && new Date(l.convertedAt) <= end).length;
    return { name: label, leads: created, converted };
  });

  // ── Project stats ────────────────────────────────────────────────────────
  const ACTIVE_P = new Set(['NOT_STARTED','WORK_STARTED','IN_PROGRESS','REVIEW','FINALIZATION']);
  const projStats = {
    total:      allProjects.length,
    active:     allProjects.filter((p) => ACTIVE_P.has(p.status)).length,
    completed:  allProjects.filter((p) => ['COMPLETED','DELIVERED'].includes(p.status)).length,
    delayed:    allProjects.filter((p) => p.status === 'DELAYED').length,
    inProgress: allProjects.filter((p) => p.status === 'IN_PROGRESS').length,
  };

  const projCompletionTrend = buckets.map(({ label, start, end }) => ({
    name:       label,
    completed:  allProjects.filter((p) => p.deliveredAt && new Date(p.deliveredAt) >= start && new Date(p.deliveredAt) <= end).length,
    inProgress: allProjects.filter((p) => ACTIVE_P.has(p.status)).length,
    delayed:    allProjects.filter((p) => p.status === 'DELAYED').length,
    total:      allProjects.filter((p) => new Date(p.createdAt) >= start && new Date(p.createdAt) <= end).length,
  }));

  // ── Global KPIs ──────────────────────────────────────────────────────────
  const totalRevenue    = allPayments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses   = allExpenses.reduce((s, e) => s + e.amount, 0);
  const pendingRevenue  = allProjects.reduce((s, p) => s + Math.max(0, (p.totalAmount || 0) - (p.paidAmount || 0)), 0);
  const netProfit       = totalRevenue - totalExpenses;

  const [allUsersCount, activeUsersCount] = await Promise.all([
    User.countDocuments({ admin: adminId, isDeleted: false }),
    User.countDocuments({ admin: adminId, isDeleted: false, isActive: true }),
  ]);

  // ── Project rows for table ───────────────────────────────────────────────
  const PROJ_STATUS_MAP = {
    NOT_STARTED:'Not Started', WORK_STARTED:'Work Started', IN_PROGRESS:'In Progress',
    REVIEW:'Review Stage', FINALIZATION:'Finalization', COMPLETED:'Completed',
    DELIVERED:'Delivered', DELAYED:'Delayed',
  };
  const PRIORITY_MAP2 = { LOW:'Low', MEDIUM:'Medium', HIGH:'High', URGENT:'Urgent' };

  const projectRows = allProjects.slice(0, 50).map((p) => ({
    project:    p.name,
    client:     p.client?.name || '—',
    assignedTo: p.teamLeader?.name || '—',
    startDate:  p.startDate   ? new Date(p.startDate).toLocaleDateString('en-IN') : '—',
    deadline:   p.expectedDelivery ? new Date(p.expectedDelivery).toLocaleDateString('en-IN') : '—',
    status:     PROJ_STATUS_MAP[p.status] || p.status,
    progress:   `${p.progressPercent || 0}%`,
    priority:   PRIORITY_MAP2[p.priority] || p.priority,
    date:       p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : '',
    id:         String(p._id),
  }));

  // ── Finance rows for table ───────────────────────────────────────────────
  const projectMap2 = Object.fromEntries(allProjects.map((p) => [String(p._id), p]));
  const financePayments = await Payment.find({ admin: adminId, status: 'SUCCESS' })
    .populate('client', 'name').populate('project', 'name').select('amount paidAt project client razorpayOrderId')
    .sort({ paidAt: -1 }).limit(50).lean();

  const fmtINR = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : '₹0';
  const financeRows = financePayments.map((pay, i) => {
    const proj = pay.project ? projectMap2[String(pay.project._id || pay.project)] : null;
    const total   = proj?.totalAmount || pay.amount;
    const paid    = proj?.paidAmount  || pay.amount;
    const remaining = Math.max(0, total - paid);
    return {
      client:    pay.client?.name || '—',
      project:   proj?.name || pay.project?.name || '—',
      invoiceId: pay.razorpayOrderId ? `PAY-${pay.razorpayOrderId.slice(-6).toUpperCase()}` : `PAY-${String(i + 1).padStart(4, '0')}`,
      total:     fmtINR(total),
      paid:      fmtINR(paid),
      remaining: fmtINR(remaining),
      type:      remaining === 0 ? 'Full Payment' : 'Partial',
      status:    remaining === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending',
      date:      pay.paidAt ? new Date(pay.paidAt).toISOString().slice(0, 10) : '—',
      id:        String(pay._id),
    };
  });

  return res.status(200).json(
    new ApiResponse(200, {
      period,
      kpis: {
        totalDepts:    allDepts.length,
        totalUsers:    allUsersCount,
        activeUsers:   activeUsersCount,
        totalRevenue,
        totalExpenses,
        pendingRevenue,
        netProfit,
      },
      revenueTrend,
      paymentTrend,
      deptRevData,
      leadStats,
      leadPieData,
      leadConversionTrend,
      projStats,
      projCompletionTrend,
      projectRows,
      financeRows,
    }, 'Reports data loaded'),
  );
});
