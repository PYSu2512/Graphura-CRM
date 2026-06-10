"use strict";

/**
 * MANAGEMENT TL — DASHBOARD, REPORTS, NOTIFICATIONS CONTROLLER
 * All endpoints require MANAGEMENT_TL role.
 */

const catchAsync  = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError    = require('../utils/appError');

const requireTL = (req, next) => {
  if (!req.user || req.user.role !== 'MANAGEMENT_TL') {
    next(new AppError('Only Management Team Leader can access this resource', 403));
    return false;
  }
  return true;
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const TASK_STATUS_MAP = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS:  'In Progress',
  REVIEW:       'Review',
  COMPLETED:    'Completed',
  DELAYED:      'Delayed',
};
const TASK_PRIORITY_MAP = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical',
};
const PROJ_STATUS_MAP = {
  NOT_STARTED: 'Not Started', WORK_STARTED: 'Work Started',
  IN_PROGRESS: 'In Progress', REVIEW: 'Review Stage',
  FINALIZATION: 'Finalization', COMPLETED: 'Completed',
  DELIVERED: 'Delivered', DELAYED: 'Delayed',
};

// ═════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// GET /api/management-tl/dashboard
// ═════════════════════════════════════════════════════════════════════════════
exports.getDashboard = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;

  const { Project, ProjectTask, ManagementTeam, Leave } = require('../models');

  const adminId = req.admin._id;
  const tlId    = req.user._id;
  const today   = new Date();

  // 1. All projects assigned to this TL
  const projects = await Project.find({
    admin: adminId, teamLeader: tlId, isDeleted: false,
  })
    .populate('client', 'name')
    .select('name status priority expectedDelivery progressPercent projectNumber')
    .lean();

  const projectIds = projects.map((p) => p._id);

  // 2. All tasks across TL's projects
  const allTasks = await ProjectTask.find({
    admin: adminId, project: { $in: projectIds }, isDeleted: false,
  })
    .populate('assignedTo', 'name email')
    .lean();

  // 3. KPI counts
  const taskStats = {
    total:      allTasks.length,
    completed:  allTasks.filter((t) => t.status === 'COMPLETED').length,
    inProgress: allTasks.filter((t) => ['IN_PROGRESS', 'REVIEW'].includes(t.status)).length,
    notStarted: allTasks.filter((t) => t.status === 'NOT_STARTED').length,
    delayed:    allTasks.filter((t) => t.status === 'DELAYED').length,
    overdue:    allTasks.filter((t) => t.deadline && new Date(t.deadline) < today && !['COMPLETED', 'DELAYED'].includes(t.status)).length,
  };

  // 4. Project task breakdown (for column chart)
  const projectTaskBreakdown = projects.map((p) => {
    const pTasks = allTasks.filter((t) => String(t.project) === String(p._id));
    return {
      name:      p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name,
      completed: pTasks.filter((t) => t.status === 'COMPLETED').length,
      remaining: pTasks.filter((t) => t.status !== 'COMPLETED').length,
    };
  });

  // 5. Task status distribution (for pie chart)
  const taskStatusDistribution = [
    { name: 'Completed',   value: taskStats.completed  },
    { name: 'In Progress', value: taskStats.inProgress },
    { name: 'Not Started', value: taskStats.notStarted },
    { name: 'Delayed',     value: taskStats.delayed    },
  ].filter((s) => s.value > 0);

  // 6. Upcoming tasks (sorted by deadline)
  const upcomingTasks = allTasks
    .filter((t) => !['COMPLETED'].includes(t.status))
    .sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    })
    .slice(0, 10)
    .map((t) => ({
      id:          String(t._id),
      title:       t.title,
      projectId:   String(t.project),
      projectName: projects.find((p) => String(p._id) === String(t.project))?.name || '—',
      assignee:    t.assignedTo?.name || '—',
      assigneeId:  t.assignedTo?._id  ? String(t.assignedTo._id) : null,
      priority:    TASK_PRIORITY_MAP[t.priority] || t.priority,
      status:      TASK_STATUS_MAP[t.status]     || t.status,
      deadline:    t.deadline ? t.deadline.toISOString().slice(0, 10) : null,
      progressPercent: t.progressPercent || 0,
      isOverdue:   t.deadline && new Date(t.deadline) < today && !['COMPLETED','DELAYED'].includes(t.status),
    }));

  // 7. Employee workload summary
  const employeeMap = {};
  for (const t of allTasks) {
    if (!t.assignedTo) continue;
    const uid = String(t.assignedTo._id);
    if (!employeeMap[uid]) {
      employeeMap[uid] = { id: uid, name: t.assignedTo.name, total: 0, completed: 0, inProgress: 0, delayed: 0 };
    }
    employeeMap[uid].total++;
    if (t.status === 'COMPLETED')                            employeeMap[uid].completed++;
    if (['IN_PROGRESS','REVIEW'].includes(t.status))         employeeMap[uid].inProgress++;
    if (t.status === 'DELAYED')                              employeeMap[uid].delayed++;
  }
  const employeeWorkload = Object.values(employeeMap);

  return res.status(200).json(
    new ApiResponse(200, {
      kpis: {
        totalProjects: projects.length,
        ...taskStats,
      },
      projectTaskBreakdown,
      taskStatusDistribution,
      upcomingTasks,
      employeeWorkload,
    }, 'Dashboard data fetched'),
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// REPORTS
// GET /api/management-tl/reports?type=daily|weekly
// ═════════════════════════════════════════════════════════════════════════════
exports.getReports = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;

  const { Project, ProjectTask } = require('../models');

  const adminId = req.admin._id;
  const tlId    = req.user._id;
  const type    = req.query.type || 'daily'; // 'daily' | 'weekly'
  const today   = new Date();

  const projects = await Project.find({
    admin: adminId, teamLeader: tlId, isDeleted: false,
  }).select('name status priority expectedDelivery progressPercent projectNumber').lean();

  const projectIds = projects.map((p) => p._id);

  const allTasks = await ProjectTask.find({
    admin: adminId, project: { $in: projectIds }, isDeleted: false,
  })
    .populate('assignedTo', 'name')
    .lean();

  // ── Daily report ──────────────────────────────────────────────────────────
  if (type === 'daily') {
    const total     = allTasks.length;
    const completed = allTasks.filter((t) => t.status === 'COMPLETED').length;
    const pending   = allTasks.filter((t) => t.status === 'NOT_STARTED').length;
    const delayed   = allTasks.filter((t) => t.status === 'DELAYED').length;

    // Per-project task report rows
    const projectRows = projects.map((p) => {
      const pTasks  = allTasks.filter((t) => String(t.project) === String(p._id));
      const pdone   = pTasks.filter((t) => t.status === 'COMPLETED').length;
      const ppend   = pTasks.filter((t) => t.status === 'NOT_STARTED').length;
      const pdelay  = pTasks.filter((t) => t.status === 'DELAYED').length;
      const progress = pTasks.length > 0 ? Math.round((pdone / pTasks.length) * 100) : p.progressPercent || 0;
      const isOverdue = p.expectedDelivery && new Date(p.expectedDelivery) < today && !['COMPLETED','DELIVERED'].includes(p.status);
      return {
        id:          p.projectNumber || String(p._id).slice(-6).toUpperCase(),
        projectId:   String(p._id),
        projectName: p.name,
        status:      PROJ_STATUS_MAP[p.status] || p.status,
        progress,
        deadline:    p.expectedDelivery ? p.expectedDelivery.toISOString().slice(0, 10) : null,
        priority:    TASK_PRIORITY_MAP[p.priority] || p.priority,
        totalTasks:  pTasks.length,
        completed:   pdone,
        pending:     ppend,
        delayed:     pdelay,
        isOverdue,
      };
    });

    // Daily completion trend — last 7 days
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d); nextD.setDate(d.getDate() + 1);
      const dayCompleted = allTasks.filter((t) => {
        if (t.status !== 'COMPLETED') return false;
        const u = new Date(t.updatedAt);
        return u >= d && u < nextD;
      }).length;
      const dayPending = allTasks.filter((t) => {
        const u = new Date(t.updatedAt);
        return u >= d && u < nextD && t.status === 'NOT_STARTED';
      }).length;
      dailyTrend.push({
        name: d.toLocaleDateString('en', { weekday: 'short' }),
        completed: dayCompleted,
        pending:   dayPending,
      });
    }

    const statusData = [
      { name: 'Completed', value: completed },
      { name: 'Pending',   value: pending   },
      { name: 'Delayed',   value: delayed   },
    ].filter((s) => s.value > 0);

    return res.status(200).json(
      new ApiResponse(200, {
        type: 'daily',
        metrics: {
          total, completed, pending, delayed,
          submitted: completed, // completed = submitted for TL
        },
        projectRows,
        dailyTrend,
        statusData,
      }, 'Daily report fetched'),
    );
  }

  // ── Weekly report ─────────────────────────────────────────────────────────
  // Per-employee task summary
  const employeeMap = {};
  for (const t of allTasks) {
    if (!t.assignedTo) continue;
    const uid  = String(t.assignedTo._id);
    const name = t.assignedTo.name;
    if (!employeeMap[uid]) {
      employeeMap[uid] = { id: uid, name, totalTasks: 0, completed: 0, pending: 0, delayed: 0 };
    }
    employeeMap[uid].totalTasks++;
    if (t.status === 'COMPLETED')   employeeMap[uid].completed++;
    if (t.status === 'NOT_STARTED') employeeMap[uid].pending++;
    if (t.status === 'DELAYED')     employeeMap[uid].delayed++;
  }

  const weeklyRows = Object.values(employeeMap).map((e) => {
    const productivity = e.totalTasks > 0
      ? Math.round((e.completed / e.totalTasks) * 100)
      : 0;
    return {
      ...e,
      productivity: `${productivity}%`,
      weeklyStatus: productivity >= 90 ? 'Excellent' : productivity >= 70 ? 'Good' : productivity >= 50 ? 'Average' : 'Delayed',
    };
  });

  const productivityData = weeklyRows.map((e) => ({
    name: e.name.split(' ')[0],
    productivity: parseInt(e.productivity),
  }));

  const performanceData = weeklyRows.map((e) => ({
    name:      e.name.split(' ')[0],
    completed: e.completed,
    pending:   e.pending,
  }));

  const weeklyMetrics = {
    totalReports:       weeklyRows.length,
    excellent:          weeklyRows.filter((e) => e.weeklyStatus === 'Excellent').length,
    delayed:            weeklyRows.filter((e) => e.weeklyStatus === 'Delayed').length,
    avgProductivity:    weeklyRows.length > 0
      ? `${Math.round(weeklyRows.reduce((s, e) => s + parseInt(e.productivity), 0) / weeklyRows.length)}%`
      : '0%',
  };

  return res.status(200).json(
    new ApiResponse(200, {
      type: 'weekly',
      metrics: weeklyMetrics,
      weeklyRows,
      productivityData,
      performanceData,
    }, 'Weekly report fetched'),
  );
});

// ═════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// GET /api/management-tl/notifications-data
// Returns real notifications from the Notification model + task-based alerts
// ═════════════════════════════════════════════════════════════════════════════
exports.getNotificationsData = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;

  const { Notification, Project, ProjectTask, ManagementTeam } = require('../models');

  const adminId = req.admin._id;
  const tlId    = req.user._id;
  const today   = new Date();

  // 1. Real notifications for this user
  const notifications = await Notification.find({
    admin:   adminId,
    user:    tlId,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // 2. Task-based smart alerts (generated on-the-fly from ProjectTask data)
  const projects = await Project.find({
    admin: adminId, teamLeader: tlId, isDeleted: false,
  }).select('name status expectedDelivery').lean();

  const projectIds = projects.map((p) => p._id);
  const projectMap = Object.fromEntries(projects.map((p) => [String(p._id), p.name]));

  const allTasks = await ProjectTask.find({
    admin: adminId, project: { $in: projectIds }, isDeleted: false,
  })
    .populate('assignedTo', 'name')
    .lean();

  // Smart alerts
  const smartAlerts = [];

  // Overdue tasks
  const overdueTasks = allTasks.filter((t) =>
    t.deadline && new Date(t.deadline) < today && !['COMPLETED','DELAYED'].includes(t.status)
  );
  if (overdueTasks.length > 0) {
    smartAlerts.push({
      id:       'ALT-OVERDUE',
      type:     'Deadline Alert',
      message:  `${overdueTasks.length} task${overdueTasks.length > 1 ? 's are' : ' is'} overdue`,
      priority: 'High',
      action1:  'View Tasks',
      action2:  'Send Reminder',
    });
  }

  // Delayed tasks
  const delayedTasks = allTasks.filter((t) => t.status === 'DELAYED');
  if (delayedTasks.length > 0) {
    smartAlerts.push({
      id:       'ALT-DELAYED',
      type:     'Delay Alert',
      message:  `${delayedTasks.length} task${delayedTasks.length > 1 ? 's' : ''} marked as Delayed`,
      priority: 'Medium',
      action1:  'View Tasks',
      action2:  'Send Reminder',
    });
  }

  // Projects past deadline
  const overdueProjects = projects.filter((p) =>
    p.expectedDelivery && new Date(p.expectedDelivery) < today && !['COMPLETED','DELIVERED'].includes(p.status)
  );
  if (overdueProjects.length > 0) {
    smartAlerts.push({
      id:       'ALT-PROJECT',
      type:     'Deadline Alert',
      message:  `${overdueProjects.length} project${overdueProjects.length > 1 ? 's are' : ' is'} past deadline`,
      priority: 'High',
      action1:  'View Project',
      action2:  'Reassign Task',
    });
  }

  // Pad to 4 alerts max
  while (smartAlerts.length < 4 && smartAlerts.length > 0) {
    smartAlerts.push({
      id:       `ALT-INFO-${smartAlerts.length}`,
      type:     'Project Update',
      message:  `${allTasks.filter((t) => t.status === 'IN_PROGRESS').length} tasks currently in progress`,
      priority: 'Normal',
      action1:  'View Tasks',
      action2:  'View Project',
    });
  }

  // 3. KPI counts
  const unread = notifications.filter((n) => !n.isRead).length;
  const deadlineAlerts = smartAlerts.filter((a) => a.type === 'Deadline Alert').length;

  // 4. Activity rows from recent task updates
  const recentActivity = allTasks
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 8)
    .map((t, i) => ({
      id:       `ACT-${i + 1}`,
      activity: `${t.assignedTo?.name || 'Employee'} — task "${t.title}" is ${TASK_STATUS_MAP[t.status] || t.status}`,
      time:     formatTimeAgo(t.updatedAt),
      type:     t.status === 'DELAYED' ? 'Delay' : t.status === 'COMPLETED' ? 'Task' : 'Update',
      user:     t.assignedTo?.name || '—',
    }));

  // 5. Shape notification rows
  const notificationRows = notifications.map((n) => ({
    id:            String(n._id),
    type:          n.type || 'General',
    priority:      n.priority || 'Medium',
    subject:       n.message || n.title || '—',
    employeeName:  '—',
    projectName:   '—',
    date:          n.createdAt ? new Date(n.createdAt).toISOString().slice(0, 16).replace('T', ' ') : '—',
    status:        n.isRead ? 'Read' : 'Unread',
  }));

  // 6. Notification type distribution (for pie chart)
  const typeCounts = {};
  for (const n of notifications) {
    const t = n.type || 'General';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }
  const notificationTypeData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  return res.status(200).json(
    new ApiResponse(200, {
      kpis: {
        total:          notifications.length,
        unread,
        deadlineAlerts,
        taskReminders:  allTasks.filter((t) => t.status === 'NOT_STARTED').length,
      },
      notifications: notificationRows,
      smartAlerts:   smartAlerts.slice(0, 4),
      recentActivity,
      notificationTypeData: notificationTypeData.length > 0 ? notificationTypeData : [
        { name: 'Alerts', value: smartAlerts.length },
        { name: 'Tasks',  value: allTasks.length },
      ],
    }, 'Notifications data fetched'),
  );
});

// ── helper ────────────────────────────────────────────────────────────────────
function formatTimeAgo(date) {
  if (!date) return '—';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
