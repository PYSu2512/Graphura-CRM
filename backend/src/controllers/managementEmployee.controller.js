"use strict";

/**
 * MANAGEMENT EMPLOYEE CONTROLLER
 *
 * An employee sees only tasks assigned to them.
 * They can update: status (limited set), progressPercent, statusNote.
 *
 * Allowed status transitions for employee:
 *   NOT_STARTED → IN_PROGRESS → REVIEW
 *   (COMPLETED and DELAYED are set only by TL)
 */

const catchAsync  = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError    = require('../utils/appError');

// ─── role guard ───────────────────────────────────────────────────────────────
const requireEmployee = (req, next) => {
  if (!req.user || req.user.role !== 'MANAGEMENT_EMPLOYEE') {
    next(new AppError('Only Management Employee can access this resource', 403));
    return false;
  }
  return true;
};

// ─── constants ────────────────────────────────────────────────────────────────
const TASK_STATUS_MAP = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  REVIEW:      'Review',
  COMPLETED:   'Completed',
  DELAYED:     'Delayed',
};

const TASK_PRIORITY_MAP = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical',
};

// Statuses an employee is allowed to self-set
const EMPLOYEE_ALLOWED_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'REVIEW'];

const PROJ_STATUS_MAP = {
  NOT_STARTED:  'Not Started',
  WORK_STARTED: 'Work Started',
  IN_PROGRESS:  'In Progress',
  REVIEW:       'Review Stage',
  FINALIZATION: 'Finalization',
  COMPLETED:    'Completed',
  DELIVERED:    'Delivered',
  DELAYED:      'Delayed',
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function mapTask(t) {
  const project = t.project || {};
  const tl      = project.teamLeader || {};
  const today   = new Date();
  const isOverdue = t.deadline && new Date(t.deadline) < today
    && !['COMPLETED', 'DELAYED'].includes(t.status);

  return {
    id:              String(t._id),
    projectId:       project._id ? String(project._id) : String(t.project),
    projectName:     project.name || '—',
    projectStatus:   PROJ_STATUS_MAP[project.status] || project.status || '—',
    projectDeadline: project.expectedDelivery ? project.expectedDelivery.toISOString().slice(0, 10) : null,
    tlName:          tl.name  || '—',
    tlEmail:         tl.email || '—',

    title:           t.title,
    description:     t.description || '',
    priority:        TASK_PRIORITY_MAP[t.priority] || t.priority,
    status:          TASK_STATUS_MAP[t.status] || t.status,
    deadline:        t.deadline ? t.deadline.toISOString().slice(0, 10) : null,
    completedAt:     t.completedAt ? t.completedAt.toISOString().slice(0, 10) : null,
    progressPercent: t.progressPercent || 0,
    statusNote:      t.statusNote || '',
    isOverdue,

    // Flags
    canUpdate: EMPLOYEE_ALLOWED_STATUSES.includes(t.status),
    createdAt: t.createdAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/management-employee/tasks
// All tasks assigned to this employee.
// Query: ?filter=active|completed|overdue (optional, default = all)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyTasks = catchAsync(async (req, res, next) => {
  if (!requireEmployee(req, next)) return;
  const { ProjectTask } = require('../models');

  const tasks = await ProjectTask.find({
    admin:      req.admin._id,
    assignedTo: req.user._id,
    isDeleted:  false,
  })
    .populate({
      path:     'project',
      select:   'name status expectedDelivery teamLeader projectNumber',
      populate: { path: 'teamLeader', select: 'name email' },
    })
    .sort({ deadline: 1, createdAt: -1 })
    .lean();

  const mapped = tasks.map(mapTask);

  // Apply optional filter
  const filter = req.query.filter;
  let filtered = mapped;
  if (filter === 'active') {
    filtered = mapped.filter((t) => ['In Progress', 'Review'].includes(t.status));
  } else if (filter === 'completed') {
    filtered = mapped.filter((t) => t.status === 'Completed');
  } else if (filter === 'overdue') {
    filtered = mapped.filter((t) => t.isOverdue);
  }

  const today = new Date();
  const stats = {
    total:     mapped.length,
    active:    mapped.filter((t) => ['In Progress', 'Review'].includes(t.status)).length,
    completed: mapped.filter((t) => t.status === 'Completed').length,
    overdue:   mapped.filter((t) => t.isOverdue).length,
    notStarted:mapped.filter((t) => t.status === 'Not Started').length,
  };

  // Group tasks by project for the "by project" view
  const byProject = {};
  for (const t of filtered) {
    if (!byProject[t.projectId]) {
      byProject[t.projectId] = {
        projectId:      t.projectId,
        projectName:    t.projectName,
        projectStatus:  t.projectStatus,
        projectDeadline:t.projectDeadline,
        tlName:         t.tlName,
        tasks: [],
      };
    }
    byProject[t.projectId].tasks.push(t);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      tasks: filtered,
      stats,
      byProject: Object.values(byProject),
    }, 'Tasks fetched'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/management-employee/tasks/:taskId
// Single task detail.
// ─────────────────────────────────────────────────────────────────────────────
exports.getTask = catchAsync(async (req, res, next) => {
  if (!requireEmployee(req, next)) return;
  const { ProjectTask } = require('../models');

  const task = await ProjectTask.findOne({
    _id:        req.params.taskId,
    admin:      req.admin._id,
    assignedTo: req.user._id,
    isDeleted:  false,
  })
    .populate({
      path:     'project',
      select:   'name status expectedDelivery teamLeader projectNumber driveLink',
      populate: { path: 'teamLeader', select: 'name email phone' },
    })
    .lean();

  if (!task) return next(new AppError('Task not found', 404));

  return res.status(200).json(
    new ApiResponse(200, { task: mapTask(task) }, 'Task fetched'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/management-employee/tasks/:taskId
// Employee updates their own task status + progress + note.
// Body: { status?, progressPercent?, statusNote? }
// ─────────────────────────────────────────────────────────────────────────────
exports.updateMyTask = catchAsync(async (req, res, next) => {
  if (!requireEmployee(req, next)) return;
  const { ProjectTask, AuditLog } = require('../models');

  const task = await ProjectTask.findOne({
    _id:        req.params.taskId,
    admin:      req.admin._id,
    assignedTo: req.user._id,
    isDeleted:  false,
  });

  if (!task) return next(new AppError('Task not found', 404));

  // Guard: employee cannot touch COMPLETED or DELAYED (TL-only)
  if (!EMPLOYEE_ALLOWED_STATUSES.includes(task.status)) {
    return next(new AppError(
      `Task status "${TASK_STATUS_MAP[task.status]}" is locked — only your Team Leader can change it`,
      403,
    ));
  }

  const { status, progressPercent, statusNote } = req.body;

  const before = { status: task.status, progressPercent: task.progressPercent };

  if (status !== undefined) {
    // Normalise: accept both "In Progress" and "IN_PROGRESS"
    const dbStatus = status.toUpperCase().replace(/ /g, '_');
    if (!EMPLOYEE_ALLOWED_STATUSES.includes(dbStatus)) {
      return next(new AppError(
        `You can only set status to: ${EMPLOYEE_ALLOWED_STATUSES.map((s) => TASK_STATUS_MAP[s]).join(', ')}`,
        400,
      ));
    }
    task.status = dbStatus;
  }

  if (progressPercent !== undefined) {
    const pct = Math.max(0, Math.min(100, Number(progressPercent) || 0));
    task.progressPercent = pct;
    // Auto-push to Review when employee manually marks 100%
    if (pct === 100 && task.status === 'IN_PROGRESS') {
      task.status = 'REVIEW';
    }
  }

  if (statusNote !== undefined) task.statusNote = statusNote.trim();

  await task.save();

  // Sync project-level progress
  const { Project } = require('../models');
  const allTasks = await ProjectTask.find({
    project: task.project, admin: req.admin._id, isDeleted: false,
  }).lean();
  if (allTasks.length > 0) {
    const pct = Math.round(
      (allTasks.filter((t) => t.status === 'COMPLETED').length / allTasks.length) * 100,
    );
    await Project.updateOne({ _id: task.project }, { progressPercent: pct }).catch(() => {});
  }

  await AuditLog.create({
    admin: req.admin._id, performedBy: req.user._id, performerType: 'USER',
    action: 'PROJECT_UPDATED', targetModel: 'ProjectTask', targetId: task._id,
    before, after: { status: task.status, progressPercent: task.progressPercent },
  }).catch(() => {});

  await task.populate({
    path:     'project',
    select:   'name status expectedDelivery teamLeader',
    populate: { path: 'teamLeader', select: 'name email' },
  });

  return res.status(200).json(
    new ApiResponse(200, { task: mapTask(task.toObject()) }, 'Task updated'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/management-employee/stats
// Quick overview stats for dashboard.
// ─────────────────────────────────────────────────────────────────────────────
exports.getStats = catchAsync(async (req, res, next) => {
  if (!requireEmployee(req, next)) return;
  const { ProjectTask } = require('../models');

  const today = new Date();

  const [tasks, projectIds] = await Promise.all([
    ProjectTask.find({
      admin:      req.admin._id,
      assignedTo: req.user._id,
      isDeleted:  false,
    }).select('status deadline progressPercent project createdAt updatedAt').lean(),
    ProjectTask.distinct('project', {
      admin:      req.admin._id,
      assignedTo: req.user._id,
      isDeleted:  false,
    }),
  ]);

  const stats = {
    totalTasks:    tasks.length,
    activeTasks:   tasks.filter((t) => ['IN_PROGRESS', 'REVIEW'].includes(t.status)).length,
    completed:     tasks.filter((t) => t.status === 'COMPLETED').length,
    overdue:       tasks.filter((t) => t.deadline && new Date(t.deadline) < today && !['COMPLETED', 'DELAYED'].includes(t.status)).length,
    notStarted:    tasks.filter((t) => t.status === 'NOT_STARTED').length,
    delayed:       tasks.filter((t) => t.status === 'DELAYED').length,
    totalProjects: projectIds.length,
    avgProgress:   tasks.length
      ? Math.round(tasks.reduce((s, t) => s + t.progressPercent, 0) / tasks.length)
      : 0,
  };

  // Status mix for pie chart
  const statusMix = [
    { name: 'Not Started', value: stats.notStarted },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'IN_PROGRESS').length },
    { name: 'Review',      value: tasks.filter((t) => t.status === 'REVIEW').length },
    { name: 'Completed',   value: stats.completed },
    { name: 'Delayed',     value: stats.delayed },
  ].filter((s) => s.value > 0);

  // Weekly completion trend — last 8 weeks
  const weeks = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - i * 7 - today.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const completed = tasks.filter((t) => {
      if (t.status !== 'COMPLETED') return false;
      const updated = new Date(t.updatedAt);
      return updated >= weekStart && updated < weekEnd;
    }).length;

    const label = `W${Math.ceil((weekStart.getDate()) / 7)}-${weekStart.toLocaleString('default', { month: 'short' })}`;
    weeks.push({ name: label, completed });
  }

  return res.status(200).json(
    new ApiResponse(200, { stats, statusMix, weeklyTrend: weeks }, 'Stats fetched'),
  );
});
