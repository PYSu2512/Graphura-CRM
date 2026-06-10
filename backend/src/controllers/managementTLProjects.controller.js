"use strict";

/**
 * MANAGEMENT TL — PROJECTS & TASKS CONTROLLER
 *
 * Flow:
 *   Manager assigns a Project to a TL (teamLeader field on Project).
 *   TL fetches their projects → creates tasks within each project →
 *   assigns tasks to their team employees (MANAGEMENT_EMPLOYEE).
 *   TL can update task status/progress. Progress auto-computes project %.
 *
 * Role guard: MANAGEMENT_TL only.
 */

const catchAsync  = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError    = require('../utils/appError');
const logger      = require('../utils/logger');

// ─── role guard ───────────────────────────────────────────────────────────────
const requireTL = (req, next) => {
  if (!req.user || req.user.role !== 'MANAGEMENT_TL') {
    next(new AppError('Only Management Team Leader can access this resource', 403));
    return false;
  }
  return true;
};

// ─── constants ────────────────────────────────────────────────────────────────
const TASK_STATUS_MAP = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS:  'In Progress',
  REVIEW:       'Review',
  COMPLETED:    'Completed',
  DELAYED:      'Delayed',
};
const TASK_STATUS_REVERSE = Object.fromEntries(
  Object.entries(TASK_STATUS_MAP).map(([k, v]) => [v.toLowerCase(), k])
);

const TASK_PRIORITY_MAP = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical',
};
const TASK_PRIORITY_REVERSE = Object.fromEntries(
  Object.entries(TASK_PRIORITY_MAP).map(([k, v]) => [v.toLowerCase(), k])
);

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

/** Map a raw task doc → clean frontend object */
function mapTask(t, projectName = '') {
  const assignee = t.assignedTo || {};
  return {
    id:              String(t._id),
    projectId:       t.project ? String(t.project._id || t.project) : null,
    projectName:     t.project?.name || projectName,
    title:           t.title,
    description:     t.description || '',
    assigneeId:      assignee._id ? String(assignee._id) : null,
    assignee:        assignee.name || '—',
    assigneeEmail:   assignee.email || '',
    priority:        TASK_PRIORITY_MAP[t.priority] || t.priority,
    status:          TASK_STATUS_MAP[t.status]   || t.status,
    deadline:        t.deadline ? t.deadline.toISOString().slice(0, 10) : null,
    completedAt:     t.completedAt ? t.completedAt.toISOString().slice(0, 10) : null,
    progressPercent: t.progressPercent || 0,
    statusNote:      t.statusNote || '',
    createdAt:       t.createdAt,
  };
}

/** Map a project doc + its tasks → frontend object */
function mapProject(p, tasks = []) {
  const tl = p.teamLeader || {};
  const cl = p.client    || {};

  const total     = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const inProg    = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const delayed   = tasks.filter((t) => t.status === 'DELAYED').length;
  const notStart  = tasks.filter((t) => t.status === 'NOT_STARTED').length;
  const progress  = total > 0 ? Math.round((completed / total) * 100) : (p.progressPercent || 0);

  return {
    id:             String(p._id),
    projectNumber:  p.projectNumber || String(p._id).slice(-6).toUpperCase(),
    name:           p.name,
    description:    p.description || '',
    clientName:     cl.name  || '',
    clientEmail:    cl.email || '',
    priority:       TASK_PRIORITY_MAP[p.priority] || p.priority,
    status:         PROJ_STATUS_MAP[p.status]      || p.status,
    startDate:      p.startDate        ? p.startDate.toISOString().slice(0, 10)        : null,
    deadline:       p.expectedDelivery ? p.expectedDelivery.toISOString().slice(0, 10) : null,
    driveLink:      p.driveLink    || null,
    handoverLink:   p.handoverLink || null,
    assignedTLName: tl.name  || '',
    progressPercent: progress,
    taskStats: { total, completed, inProgress: inProg, delayed, notStarted: notStart },
    tasks: tasks.map((t) => mapTask(t, p.name)),
    createdAt: p.createdAt,
  };
}

/**
 * Recompute + persist project progressPercent whenever tasks change.
 * Uses completed task ratio. Does NOT alter project status — TL read-only on status.
 */
async function syncProjectProgress(projectId, adminId) {
  const { Project, ProjectTask } = require('../models');
  const tasks = await ProjectTask.find({
    project: projectId, admin: adminId, isDeleted: false,
  }).lean();

  if (tasks.length === 0) return;
  const pct = Math.round(
    (tasks.filter((t) => t.status === 'COMPLETED').length / tasks.length) * 100,
  );
  await Project.updateOne({ _id: projectId }, { progressPercent: pct }).catch(() => {});
}

// ═════════════════════════════════════════════════════════════════════════════
// ── PROJECTS ─────────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/management-tl/projects
 * Return all projects assigned to this TL with task stats.
 */
exports.listMyProjects = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;
  const { Project, ProjectTask } = require('../models');

  const projects = await Project.find({
    admin:       req.admin._id,
    teamLeader:  req.user._id,
    isDeleted:   false,
  })
    .populate('client',     'name email mobile companyName')
    .populate('teamLeader', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  if (!projects.length) {
    return res.status(200).json(
      new ApiResponse(200, { projects: [], stats: { total: 0, active: 0, completed: 0, delayed: 0, totalTasks: 0 } }, 'No projects assigned'),
    );
  }

  const projectIds = projects.map((p) => p._id);
  const allTasks   = await ProjectTask.find({
    admin:     req.admin._id,
    project:   { $in: projectIds },
    isDeleted: false,
  }).lean();

  // Group tasks by project
  const tasksByProject = {};
  for (const t of allTasks) {
    const pid = String(t.project);
    if (!tasksByProject[pid]) tasksByProject[pid] = [];
    tasksByProject[pid].push(t);
  }

  const mapped = projects.map((p) => mapProject(p, tasksByProject[String(p._id)] || []));

  const ACTIVE_STATUSES = ['NOT_STARTED', 'WORK_STARTED', 'IN_PROGRESS', 'REVIEW', 'FINALIZATION'];
  const stats = {
    total:      mapped.length,
    active:     projects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length,
    completed:  projects.filter((p) => ['COMPLETED', 'DELIVERED'].includes(p.status)).length,
    delayed:    projects.filter((p) => p.status === 'DELAYED').length,
    totalTasks: allTasks.length,
  };

  return res.status(200).json(
    new ApiResponse(200, { projects: mapped, stats }, 'Projects fetched'),
  );
});

/**
 * GET /api/management-tl/projects/:id
 * Single project with full task list.
 */
exports.getProject = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;
  const { Project, ProjectTask } = require('../models');

  const p = await Project.findOne({
    _id: req.params.id, admin: req.admin._id, teamLeader: req.user._id, isDeleted: false,
  })
    .populate('client',     'name email mobile companyName')
    .populate('teamLeader', 'name email')
    .lean();

  if (!p) return next(new AppError('Project not found or not assigned to you', 404));

  const tasks = await ProjectTask.find({ project: p._id, admin: req.admin._id, isDeleted: false })
    .populate('assignedTo', 'name email phone role')
    .sort({ createdAt: 1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { project: mapProject(p, tasks) }, 'Project retrieved'),
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// ── TASKS ─────────────────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/management-tl/projects/:id/tasks
 * All tasks for a specific project.
 */
exports.getProjectTasks = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;
  const { Project, ProjectTask } = require('../models');

  // Verify the project belongs to this TL
  const p = await Project.findOne({
    _id: req.params.id, admin: req.admin._id, teamLeader: req.user._id, isDeleted: false,
  }).lean();
  if (!p) return next(new AppError('Project not found or not assigned to you', 404));

  const tasks = await ProjectTask.find({ project: p._id, admin: req.admin._id, isDeleted: false })
    .populate('assignedTo', 'name email phone role')
    .sort({ createdAt: 1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, { tasks: tasks.map((t) => mapTask(t, p.name)) }, 'Tasks fetched'),
  );
});

/**
 * GET /api/management-tl/tasks  (all tasks across all TL's projects)
 * Used by Task Board tab.
 */
exports.getAllTasks = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;
  const { Project, ProjectTask } = require('../models');

  // Get all projects owned by this TL first
  const projects = await Project.find({
    admin: req.admin._id, teamLeader: req.user._id, isDeleted: false,
  }).select('name').lean();

  const projectIds = projects.map((p) => p._id);
  const projectMap = Object.fromEntries(projects.map((p) => [String(p._id), p.name]));

  const tasks = await ProjectTask.find({
    admin:     req.admin._id,
    project:   { $in: projectIds },
    isDeleted: false,
  })
    .populate('assignedTo', 'name email phone role')
    .sort({ createdAt: -1 })
    .lean();

  const mapped = tasks.map((t) => mapTask(t, projectMap[String(t.project)] || ''));

  const stats = {
    total:      mapped.length,
    inProgress: mapped.filter((t) => t.status === 'In Progress').length,
    completed:  mapped.filter((t) => t.status === 'Completed').length,
    delayed:    mapped.filter((t) => t.status === 'Delayed').length,
    notStarted: mapped.filter((t) => t.status === 'Not Started').length,
  };

  return res.status(200).json(
    new ApiResponse(200, { tasks: mapped, stats, projects: projects.map((p) => ({ id: String(p._id), name: p.name })) }, 'All tasks fetched'),
  );
});

/**
 * POST /api/management-tl/projects/:id/tasks
 * Create a task within a project and assign to an employee.
 * Body: { title, description, assignedTo, priority, deadline }
 */
exports.createTask = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;
  const { Project, ProjectTask, User, ManagementTeam, AuditLog } = require('../models');

  const { title, description = '', assignedTo, priority = 'Medium', deadline } = req.body;

  if (!title?.trim())  return next(new AppError('Task title is required', 400));
  if (!assignedTo)     return next(new AppError('Assignee is required', 400));
  if (!deadline)       return next(new AppError('Deadline is required', 400));

  // Verify project belongs to this TL
  const p = await Project.findOne({
    _id: req.params.id, admin: req.admin._id, teamLeader: req.user._id, isDeleted: false,
  }).lean();
  if (!p) return next(new AppError('Project not found or not assigned to you', 404));

  // Verify assignee is MANAGEMENT_EMPLOYEE in one of TL's teams
  const tlTeams = await ManagementTeam.find({
    admin: req.admin._id, leader: req.user._id, isDeleted: false,
  }).lean();
  const memberIds = new Set(
    tlTeams.flatMap((t) => t.members.map((m) => String(m.user))),
  );
  if (!memberIds.has(String(assignedTo))) {
    return next(new AppError('Assignee is not a member of your team', 400));
  }

  const employee = await User.findOne({
    _id: assignedTo, admin: req.admin._id,
    role: 'MANAGEMENT_EMPLOYEE', isDeleted: false,
  });
  if (!employee) return next(new AppError('Employee not found', 404));

  const dbPriority = TASK_PRIORITY_REVERSE[priority.toLowerCase()] || 'MEDIUM';

  const task = await ProjectTask.create({
    admin:      req.admin._id,
    project:    p._id,
    createdBy:  req.user._id,
    title:      title.trim(),
    description: description.trim(),
    assignedTo:  assignedTo,
    priority:    dbPriority,
    status:     'NOT_STARTED',
    deadline:   new Date(deadline),
    progressPercent: 0,
  });

  await syncProjectProgress(p._id, req.admin._id);

  await AuditLog.create({
    admin: req.admin._id, performedBy: req.user._id, performerType: 'USER',
    action: 'PROJECT_UPDATED', targetModel: 'Project', targetId: p._id,
    after: { taskCreated: title.trim(), assignedTo: employee.name },
  }).catch(() => {});

  await task.populate('assignedTo', 'name email phone role');

  logger.info('Task created', { taskId: String(task._id), project: p.name, assignee: employee.name });

  return res.status(201).json(
    new ApiResponse(201, { task: mapTask(task.toObject(), p.name) }, 'Task created and assigned'),
  );
});

/**
 * PUT /api/management-tl/tasks/:taskId
 * Update task — status, progress, reassign, priority, deadline, statusNote.
 * Body: { status?, progressPercent?, assignedTo?, priority?, deadline?, statusNote? }
 */
exports.updateTask = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;
  const { Project, ProjectTask, User, ManagementTeam, AuditLog } = require('../models');

  const task = await ProjectTask.findOne({
    _id: req.params.taskId, admin: req.admin._id, isDeleted: false,
  });
  if (!task) return next(new AppError('Task not found', 404));

  // Verify project belongs to this TL
  const p = await Project.findOne({
    _id: task.project, admin: req.admin._id, teamLeader: req.user._id, isDeleted: false,
  }).lean();
  if (!p) return next(new AppError('Not authorized to update this task', 403));

  const before = { status: task.status, progressPercent: task.progressPercent };

  const { status, progressPercent, assignedTo, priority, deadline, statusNote } = req.body;

  if (status !== undefined) {
    const dbStatus = TASK_STATUS_REVERSE[status.toLowerCase()] || status.toUpperCase();
    if (!['NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'DELAYED'].includes(dbStatus)) {
      return next(new AppError('Invalid status value', 400));
    }
    task.status = dbStatus;
    if (dbStatus === 'COMPLETED') {
      task.completedAt    = new Date();
      task.progressPercent = 100;
    }
  }

  if (progressPercent !== undefined) {
    task.progressPercent = Math.max(0, Math.min(100, Number(progressPercent) || 0));
  }

  if (statusNote !== undefined) task.statusNote = statusNote;
  if (priority   !== undefined) task.priority   = TASK_PRIORITY_REVERSE[priority.toLowerCase()] || 'MEDIUM';
  if (deadline   !== undefined) task.deadline   = new Date(deadline);

  if (assignedTo !== undefined && assignedTo !== String(task.assignedTo)) {
    // Validate reassignment target is in TL's team
    const tlTeams = await ManagementTeam.find({
      admin: req.admin._id, leader: req.user._id, isDeleted: false,
    }).lean();
    const memberIds = new Set(
      tlTeams.flatMap((t) => t.members.map((m) => String(m.user))),
    );
    if (!memberIds.has(String(assignedTo))) {
      return next(new AppError('Reassignee is not a member of your team', 400));
    }
    const emp = await User.findOne({ _id: assignedTo, admin: req.admin._id, role: 'MANAGEMENT_EMPLOYEE', isDeleted: false });
    if (!emp) return next(new AppError('Employee not found', 404));
    task.assignedTo = assignedTo;
  }

  await task.save();
  await syncProjectProgress(task.project, req.admin._id);

  await AuditLog.create({
    admin: req.admin._id, performedBy: req.user._id, performerType: 'USER',
    action: 'PROJECT_UPDATED', targetModel: 'ProjectTask', targetId: task._id,
    before, after: { status: task.status, progressPercent: task.progressPercent },
  }).catch(() => {});

  await task.populate('assignedTo', 'name email phone role');

  return res.status(200).json(
    new ApiResponse(200, { task: mapTask(task.toObject(), p.name) }, 'Task updated'),
  );
});

/**
 * DELETE /api/management-tl/tasks/:taskId  (soft delete)
 */
exports.deleteTask = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;
  const { Project, ProjectTask } = require('../models');

  const task = await ProjectTask.findOne({
    _id: req.params.taskId, admin: req.admin._id, isDeleted: false,
  });
  if (!task) return next(new AppError('Task not found', 404));

  // Verify project belongs to this TL
  const p = await Project.findOne({
    _id: task.project, admin: req.admin._id, teamLeader: req.user._id, isDeleted: false,
  }).lean();
  if (!p) return next(new AppError('Not authorized to delete this task', 403));

  await task.softDelete(req.user._id);
  await syncProjectProgress(task.project, req.admin._id);

  return res.status(200).json(new ApiResponse(200, null, 'Task deleted'));
});

/**
 * GET /api/management-tl/projects/form-data
 * Returns list of TL's team members for the assign-task form dropdown.
 */
exports.getFormData = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;
  const { Project, ManagementTeam, User } = require('../models');

  const [projects, tlTeams] = await Promise.all([
    Project.find({
      admin: req.admin._id, teamLeader: req.user._id, isDeleted: false,
    }).select('name expectedDelivery priority status progressPercent').lean(),
    ManagementTeam.find({
      admin: req.admin._id, leader: req.user._id, isDeleted: false,
    }).lean(),
  ]);

  // Get unique member IDs across all TL's teams
  const memberIdSet = new Set(
    tlTeams.flatMap((t) => t.members.map((m) => String(m.user))),
  );

  const employees = memberIdSet.size > 0
    ? await User.findActive(
        { _id: { $in: [...memberIdSet] }, admin: req.admin._id, role: 'MANAGEMENT_EMPLOYEE' },
        'name email phone role',
        { sort: { name: 1 } },
      )
    : [];

  return res.status(200).json(
    new ApiResponse(200, {
      projects: projects.map((p) => ({
        id:       String(p._id),
        name:     p.name,
        deadline: p.expectedDelivery ? p.expectedDelivery.toISOString().slice(0, 10) : null,
        priority: TASK_PRIORITY_MAP[p.priority] || p.priority,
        status:   PROJ_STATUS_MAP[p.status]      || p.status,
        progressPercent: p.progressPercent || 0,
      })),
      employees: employees.map((e) => ({
        id:    String(e._id),
        name:  e.name,
        email: e.email,
        role:  e.role,
      })),
    }, 'Form data fetched'),
  );
});
