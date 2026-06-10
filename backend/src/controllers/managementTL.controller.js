"use strict";

/**
 * MANAGEMENT TEAM LEADER CONTROLLER
 * Teams section — member list + overview stats.
 * Task stats pulled from ProjectTask collection (separate model).
 */

const catchAsync  = require('../utils/catchAsync');
const ApiResponse = require('../utils/apiResponse');
const AppError    = require('../utils/appError');

// ─── role guard ───────────────────────────────────────────────────────────────
const requireTL = (req, next) => {
  if (!req.user || req.user.role !== 'MANAGEMENT_TL') {
    next(new AppError('Only Management Team Leader can access this resource', 403));
    return false;
  }
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET MY TEAM MEMBERS
// GET /api/management-tl/teams/members
//
// Returns all unique members across every team this TL leads.
// Task counts (assigned/inProgress/completed/delayed) come from ProjectTask.
// ─────────────────────────────────────────────────────────────────────────────
exports.getMyTeamMembers = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;

  const { ManagementTeam, Leave, ProjectTask } = require('../models');

  const adminId = req.admin._id;
  const tlId    = req.user._id;

  // 1. All teams led by this TL
  const teams = await ManagementTeam.find({
    admin: adminId, leader: tlId, isDeleted: false,
  })
    .populate('members.user', 'name email phone role isActive')
    .lean();

  if (!teams.length) {
    return res.status(200).json(
      new ApiResponse(200, {
        members: [],
        stats:   { total: 0, active: 0, onLeave: 0, delayed: 0 },
        teams:   [],
      }, 'No teams found for this team leader'),
    );
  }

  // 2. Deduplicate members (employee can be in multiple teams)
  const memberMap = new Map(); // userId → { user, teamNames[] }
  for (const team of teams) {
    for (const m of team.members) {
      if (!m.user) continue;
      const uid = String(m.user._id);
      if (!memberMap.has(uid)) memberMap.set(uid, { user: m.user, teamNames: [] });
      memberMap.get(uid).teamNames.push(team.name);
    }
  }

  const uniqueMembers = [...memberMap.values()];
  const memberIds     = uniqueMembers.map((m) => m.user._id);

  // 3. Leave check
  const today = new Date();
  const onLeaveIds = await Leave.find({
    admin:    adminId,
    user:     { $in: memberIds },
    status:   'APPROVED',
    fromDate: { $lte: today },
    toDate:   { $gte: today },
  }).distinct('user').catch(() => []);
  const onLeaveSet = new Set(onLeaveIds.map(String));

  // 4. Task stats per member from ProjectTask collection
  const allTasks = await ProjectTask.find({
    admin:      adminId,
    assignedTo: { $in: memberIds },
    isDeleted:  false,
  }).select('assignedTo status').lean();

  const tasksByMember = {}; // uid → { assigned, inProgress, completed, delayed }
  for (const t of allTasks) {
    const uid = String(t.assignedTo);
    if (!tasksByMember[uid]) tasksByMember[uid] = { assigned: 0, inProgress: 0, completed: 0, delayed: 0 };
    const bucket = tasksByMember[uid];
    bucket.assigned += 1;
    const s = t.status;
    if (s === 'IN_PROGRESS' || s === 'REVIEW') bucket.inProgress += 1;
    else if (s === 'COMPLETED')                bucket.completed  += 1;
    else if (s === 'DELAYED')                  bucket.delayed    += 1;
  }

  // 5. Shape response
  const members = uniqueMembers.map(({ user, teamNames }) => {
    const uid    = String(user._id);
    const tasks  = tasksByMember[uid] || { assigned: 0, inProgress: 0, completed: 0, delayed: 0 };
    const status = onLeaveSet.has(uid) ? 'On Leave' : (user.isActive ? 'Active' : 'Inactive');
    return {
      id:         uid,
      name:       user.name,
      email:      user.email,
      mobile:     user.phone || '—',
      role:       user.role,
      isActive:   user.isActive,
      status,
      teamNames:  teamNames.join(', '),
      assigned:   tasks.assigned,
      inProgress: tasks.inProgress,
      completed:  tasks.completed,
      delayed:    tasks.delayed,
    };
  });

  // 6. Stats
  const stats = {
    total:   members.length,
    active:  members.filter((m) => m.status === 'Active').length,
    onLeave: members.filter((m) => m.status === 'On Leave').length,
    delayed: members.reduce((sum, m) => sum + m.delayed, 0),
  };

  const teamsSummary = teams.map((t) => ({
    id:          String(t._id),
    name:        t.name,
    memberCount: t.members.length,
  }));

  return res.status(200).json(
    new ApiResponse(200, { members, stats, teams: teamsSummary }, 'Team members fetched'),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// GET OVERVIEW (stat cards)
// GET /api/management-tl/teams/overview
// ─────────────────────────────────────────────────────────────────────────────
exports.getOverview = catchAsync(async (req, res, next) => {
  if (!requireTL(req, next)) return;

  const { ManagementTeam, Leave, ProjectTask } = require('../models');

  const adminId = req.admin._id;
  const tlId    = req.user._id;

  const teams = await ManagementTeam.find({
    admin: adminId, leader: tlId, isDeleted: false,
  }).lean();

  // Unique member IDs
  const memberIdSet = new Set();
  for (const t of teams) {
    for (const m of t.members) memberIdSet.add(String(m.user));
  }
  const memberIdsArr = [...memberIdSet];
  const totalMembers = memberIdsArr.length;

  const today = new Date();

  const [onLeaveCount, delayedCount] = await Promise.all([
    Leave.countDocuments({
      admin:    adminId,
      user:     { $in: memberIdsArr },
      status:   'APPROVED',
      fromDate: { $lte: today },
      toDate:   { $gte: today },
    }).catch(() => 0),
    // Delayed tasks assigned to TL's members
    ProjectTask.countDocuments({
      admin:      adminId,
      assignedTo: { $in: memberIdsArr },
      status:     'DELAYED',
      isDeleted:  false,
    }).catch(() => 0),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      totalMembers,
      activeMembers: totalMembers - onLeaveCount,
      onLeave:       onLeaveCount,
      delayedTasks:  delayedCount,
      teamCount:     teams.length,
    }, 'Overview fetched'),
  );
});
