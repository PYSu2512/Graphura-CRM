'use strict';

/**
 * SALES MANAGER REPORTS CONTROLLER
 * ─────────────────────────────────────────────────────────────
 * Tenant-scoped (admin._id). Scoped to all SALES_EXECUTIVE users.
 * Role guard: 403 if not SALES_MANAGER.
 * NO revenue fields anywhere.
 *
 * GET /api/sales-manager/reports/overview
 * GET /api/sales-manager/reports/teams
 * GET /api/sales-manager/reports/team-leaders
 * GET /api/sales-manager/reports/executives
 */

const catchAsync  = require('../utils/catchAsync');
const AppError    = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const guardSM = (req, next) => {
  if (req.user?.role !== 'SALES_MANAGER') {
    next(new AppError('Only Sales Managers can access this resource', 403));
    return false;
  }
  return true;
};

// ─────────────────────────────────────────────────────────────
// 1. OVERVIEW
// GET /api/sales-manager/reports/overview
// ─────────────────────────────────────────────────────────────
exports.getOverview = catchAsync(async (req, res, next) => {
  if (!guardSM(req, next)) return;

  const { Lead, LeadActivity, ProspectForm, Reminder, Team, User } = require('../models');

  const adminId = req.admin._id;
  const now     = new Date();
  const day7    = new Date(now);
  day7.setDate(day7.getDate() - 6);
  day7.setHours(0, 0, 0, 0);

  // Get all SALES_EXECUTIVE IDs
  const executives = await User.find({
    admin: adminId, role: 'SALES_EXECUTIVE', isDeleted: false,
  }).select('_id').lean();
  const execIds = executives.map((e) => e._id);

  if (execIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, {
      kpis: { totalLeads: 0, totalCalls: 0, totalProspects: 0, totalSales: 0, dumpLeads: 0, missedFollowUps: 0, conversionRate: 0 },
      callsVsSales: DAY_NAMES.slice(0, 7).map((n) => ({ name: n, calls: 0, sales: 0 })),
      leadsVsProspects: DAY_NAMES.slice(0, 7).map((n) => ({ name: n, leads: 0, prospects: 0 })),
      teamPerfComparison: [],
      leadStatusBreakdown: [],
    }, 'Overview retrieved successfully'));
  }

  // ── KPIs ──
  const [totalLeads, totalCalls, totalProspects, totalSales, dumpLeads, missedFollowUps] =
    await Promise.all([
      Lead.countDocuments({ admin: adminId, assignedTo: { $in: execIds }, isDeleted: { $ne: true }, isDumped: { $ne: true } }),
      LeadActivity.countDocuments({ admin: adminId, user: { $in: execIds } }),
      ProspectForm.countDocuments({ admin: adminId, filledBy: { $in: execIds } }),
      Lead.countDocuments({ admin: adminId, assignedTo: { $in: execIds }, status: 'CONVERTED', isDeleted: { $ne: true } }),
      Lead.countDocuments({ admin: adminId, assignedTo: { $in: execIds }, isDumped: true, isDeleted: { $ne: true } }),
      Reminder.countDocuments({ admin: adminId, user: { $in: execIds }, isMissed: true, isDone: false }),
    ]);

  const conversionRate = totalLeads > 0
    ? parseFloat(((totalSales / totalLeads) * 100).toFixed(1))
    : 0;

  // ── callsVsSales — last 7 days ──
  const [callsDayAgg, salesDayAgg] = await Promise.all([
    LeadActivity.aggregate([
      { $match: { admin: adminId, user: { $in: execIds }, createdAt: { $gte: day7, $lte: now } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: execIds }, status: 'CONVERTED', convertedAt: { $gte: day7, $lte: now }, isDeleted: { $ne: true } } },
      { $group: { _id: { $dayOfWeek: '$convertedAt' }, count: { $sum: 1 } } },
    ]),
  ]);

  const callsDayMap = Object.fromEntries(callsDayAgg.map((r) => [r._id, r.count]));
  const salesDayMap = Object.fromEntries(salesDayAgg.map((r) => [r._id, r.count]));
  const callsVsSales = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay() + 1;
    callsVsSales.push({ name: DAY_NAMES[d.getDay()], calls: callsDayMap[dow] || 0, sales: salesDayMap[dow] || 0 });
  }

  // ── leadsVsProspects — last 7 days ──
  const [leadsDayAgg, prospectsDayAgg] = await Promise.all([
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: execIds }, createdAt: { $gte: day7, $lte: now }, isDeleted: { $ne: true } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ]),
    ProspectForm.aggregate([
      { $match: { admin: adminId, filledBy: { $in: execIds }, createdAt: { $gte: day7, $lte: now } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ]),
  ]);

  const leadsDayMap     = Object.fromEntries(leadsDayAgg.map((r) => [r._id, r.count]));
  const prospectsDayMap = Object.fromEntries(prospectsDayAgg.map((r) => [r._id, r.count]));
  const leadsVsProspects = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay() + 1;
    leadsVsProspects.push({ name: DAY_NAMES[d.getDay()], leads: leadsDayMap[dow] || 0, prospects: prospectsDayMap[dow] || 0 });
  }

  // ── teamPerfComparison — per team ──
  const teams = await Team.find({ admin: adminId, isDeleted: false }).lean();

  const teamPerfComparison = await Promise.all(
    teams.map(async (team) => {
      const memberIds = team.members.map((m) => m.user).filter(Boolean);
      if (memberIds.length === 0) return { name: team.name, calls: 0, prospects: 0, sales: 0 };
      const [calls, prospects, sales] = await Promise.all([
        LeadActivity.countDocuments({ admin: adminId, user: { $in: memberIds } }),
        ProspectForm.countDocuments({ admin: adminId, filledBy: { $in: memberIds } }),
        Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, status: 'CONVERTED', isDeleted: { $ne: true } }),
      ]);
      return { name: team.name, calls, prospects, sales };
    })
  );

  // ── leadStatusBreakdown ──
  const statusAgg = await Lead.aggregate([
    { $match: { admin: adminId, assignedTo: { $in: execIds }, isDeleted: { $ne: true } } },
    { $group: { _id: '$status', value: { $sum: 1 } } },
  ]);

  const STATUS_LABEL = { UNTOUCHED: 'New', TALK: 'In Progress', NOT_TALK: 'Not Talk', INTERESTED: 'Prospect', CONVERTED: 'Converted', DUMP: 'Dump' };
  const leadStatusBreakdown = statusAgg
    .map((r) => ({ name: STATUS_LABEL[r._id] || r._id, value: r.value }))
    .sort((a, b) => b.value - a.value);

  res.status(200).json(new ApiResponse(200, {
    kpis: { totalLeads, totalCalls, totalProspects, totalSales, dumpLeads, missedFollowUps, conversionRate },
    callsVsSales,
    leadsVsProspects,
    teamPerfComparison,
    leadStatusBreakdown,
  }, 'Overview retrieved successfully'));
});

// ─────────────────────────────────────────────────────────────
// 2. TEAMS
// GET /api/sales-manager/reports/teams
// ─────────────────────────────────────────────────────────────
exports.getTeams = catchAsync(async (req, res, next) => {
  if (!guardSM(req, next)) return;

  const { Lead, LeadActivity, ProspectForm, Reminder, Team } = require('../models');

  const adminId  = req.admin._id;
  const page     = Math.max(1, parseInt(req.query.page)     || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
  const search   = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const sortDir  = req.query.sortDir === 'asc' ? 1 : -1;
  const ALLOWED  = ['completedCalls', 'sales', 'prospects', 'dumpLeads', 'missedFollowups'];
  const sortBy   = ALLOWED.includes(req.query.sortBy) ? req.query.sortBy : 'completedCalls';

  const teams = await Team.find({ admin: adminId, isDeleted: false })
    .populate('leader', 'name isActive')
    .lean();

  if (teams.length === 0) {
    return res.status(200).json(new ApiResponse(200, {
      teams: [],
      pagination: { total: 0, page, pageSize, totalPages: 0 },
    }, 'Team reports retrieved successfully'));
  }

  const rows = await Promise.all(
    teams.map(async (team) => {
      const memberIds = team.members.map((m) => m.user).filter(Boolean);
      const execCount = memberIds.length;

      if (execCount === 0) {
        return {
          id: String(team._id), teamName: team.name,
          teamLeader: team.leader?.name || 'Unassigned',
          totalExec: 0, assignedLeads: 0, completedCalls: 0,
          prospects: 0, sales: 0, dumpLeads: 0, missedFollowups: 0,
          conversion: '0%', status: team.isActive ? 'Active' : 'Inactive',
        };
      }

      const [assignedLeads, completedCalls, prospects, sales, dumpLeads, missedFollowups] =
        await Promise.all([
          Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, isDeleted: { $ne: true }, isDumped: { $ne: true } }),
          LeadActivity.countDocuments({ admin: adminId, user: { $in: memberIds } }),
          ProspectForm.countDocuments({ admin: adminId, filledBy: { $in: memberIds } }),
          Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, status: 'CONVERTED', isDeleted: { $ne: true } }),
          Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, isDumped: true, isDeleted: { $ne: true } }),
          Reminder.countDocuments({ admin: adminId, user: { $in: memberIds }, isMissed: true, isDone: false }),
        ]);

      const conversion = completedCalls > 0
        ? `${((sales / completedCalls) * 100).toFixed(1)}%`
        : '0%';

      return {
        id: String(team._id), teamName: team.name,
        teamLeader: team.leader?.name || 'Unassigned',
        totalExec: execCount, assignedLeads, completedCalls,
        prospects, sales, dumpLeads, missedFollowups, conversion,
        status: team.isActive ? 'Active' : 'Inactive',
      };
    })
  );

  let filtered = search ? rows.filter((r) => r.teamName.toLowerCase().includes(search)) : rows;
  filtered.sort((a, b) => (a[sortBy] - b[sortBy]) * sortDir);

  const total  = filtered.length;
  const paged  = filtered.slice((page - 1) * pageSize, page * pageSize);

  res.status(200).json(new ApiResponse(200, {
    teams: paged,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  }, 'Team reports retrieved successfully'));
});

// ─────────────────────────────────────────────────────────────
// 3. TEAM LEADERS
// GET /api/sales-manager/reports/team-leaders
// ─────────────────────────────────────────────────────────────
exports.getTeamLeaders = catchAsync(async (req, res, next) => {
  if (!guardSM(req, next)) return;

  const { Lead, LeadActivity, ProspectForm, Reminder, Team, User, SalesTarget } = require('../models');

  const adminId  = req.admin._id;
  const now      = new Date();
  const page     = Math.max(1, parseInt(req.query.page)     || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
  const search   = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const sortDir  = req.query.sortDir === 'asc' ? 1 : -1;
  const ALLOWED  = ['completedCalls', 'sales', 'prospects', 'dumpLeads', 'missedFollowups'];
  const sortBy   = ALLOWED.includes(req.query.sortBy) ? req.query.sortBy : 'completedCalls';

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const tls = await User.find({ admin: adminId, role: 'SALES_TL', isDeleted: false })
    .select('name isActive').lean();

  if (tls.length === 0) {
    return res.status(200).json(new ApiResponse(200, {
      teamLeaders: [],
      pagination: { total: 0, page, pageSize, totalPages: 0 },
    }, 'Team leader reports retrieved successfully'));
  }

  const rows = await Promise.all(
    tls.map(async (tl) => {
      const team = await Team.findOne({ admin: adminId, leader: tl._id, isDeleted: false }).lean();
      const memberIds = team ? team.members.map((m) => m.user).filter(Boolean) : [];

      let assignedLeads = 0, completedCalls = 0, prospects = 0, sales = 0, dumpLeads = 0, missedFollowups = 0;

      if (memberIds.length > 0) {
        [assignedLeads, completedCalls, prospects, sales, dumpLeads, missedFollowups] =
          await Promise.all([
            Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, isDeleted: { $ne: true }, isDumped: { $ne: true } }),
            LeadActivity.countDocuments({ admin: adminId, user: { $in: memberIds } }),
            ProspectForm.countDocuments({ admin: adminId, filledBy: { $in: memberIds } }),
            Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, status: 'CONVERTED', isDeleted: { $ne: true } }),
            Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, isDumped: true, isDeleted: { $ne: true } }),
            Reminder.countDocuments({ admin: adminId, user: { $in: memberIds }, isMissed: true, isDone: false }),
          ]);
      }

      // Target (calls-based, no revenue)
      let targetCalls = 0, achievedCalls = 0, achievedPct = '0%';
      if (team) {
        const target = await SalesTarget.findOne({
          admin: adminId, targetFor: 'TEAM', team: team._id,
          period: 'MONTHLY', fromDate: { $lte: monthEnd }, toDate: { $gte: monthStart },
        }).lean();
        if (target) {
          targetCalls   = target.targetCalls   || 0;
          achievedCalls = target.achievedCalls || 0;
          achievedPct   = targetCalls > 0
            ? `${((achievedCalls / targetCalls) * 100).toFixed(1)}%`
            : '0%';
        }
      }

      const conversion = completedCalls > 0
        ? `${((sales / completedCalls) * 100).toFixed(1)}%`
        : '0%';

      return {
        id: String(tl._id), tlName: tl.name,
        teamName: team?.name || 'No Team',
        assignedLeads, completedCalls, prospects, sales,
        dumpLeads, missedFollowups, targetCalls, achievedCalls,
        achievedPct, conversion,
        status: tl.isActive ? 'Active' : 'Inactive',
      };
    })
  );

  let filtered = search ? rows.filter((r) => r.tlName.toLowerCase().includes(search)) : rows;
  filtered.sort((a, b) => (a[sortBy] - b[sortBy]) * sortDir);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  res.status(200).json(new ApiResponse(200, {
    teamLeaders: paged,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  }, 'Team leader reports retrieved successfully'));
});

// ─────────────────────────────────────────────────────────────
// 4. EXECUTIVES
// GET /api/sales-manager/reports/executives
// ─────────────────────────────────────────────────────────────
exports.getExecutives = catchAsync(async (req, res, next) => {
  if (!guardSM(req, next)) return;

  const { Lead, LeadActivity, ProspectForm, Reminder, Team, User } = require('../models');

  const adminId  = req.admin._id;
  const page     = Math.max(1, parseInt(req.query.page)     || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
  const search   = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const sortDir  = req.query.sortDir === 'asc' ? 1 : -1;
  const ALLOWED  = ['completedCalls', 'sales', 'prospects', 'dumpLeads', 'missedFollowups'];
  const sortBy   = ALLOWED.includes(req.query.sortBy) ? req.query.sortBy : 'completedCalls';

  const execs = await User.find({ admin: adminId, role: 'SALES_EXECUTIVE', isDeleted: false })
    .select('name email isActive').lean();

  if (execs.length === 0) {
    return res.status(200).json(new ApiResponse(200, {
      executives: [],
      pagination: { total: 0, page, pageSize, totalPages: 0 },
    }, 'Executive reports retrieved successfully'));
  }

  const execIds = execs.map((e) => e._id);

  // Parallel aggregations for all execs at once
  const [callsAgg, leadsAgg, prospectsAgg, dumpAgg, missedAgg] = await Promise.all([
    LeadActivity.aggregate([
      { $match: { admin: adminId, user: { $in: execIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: execIds }, isDeleted: { $ne: true } } },
      {
        $group: {
          _id:        '$assignedTo',
          assigned:   { $sum: 1 },
          talk:       { $sum: { $cond: [{ $eq: ['$status', 'TALK'] }, 1, 0] } },
          notTalk:    { $sum: { $cond: [{ $eq: ['$status', 'NOT_TALK'] }, 1, 0] } },
          interested: { $sum: { $cond: [{ $eq: ['$status', 'INTERESTED'] }, 1, 0] } },
          converted:  { $sum: { $cond: [{ $eq: ['$status', 'CONVERTED'] }, 1, 0] } },
        },
      },
    ]),
    ProspectForm.aggregate([
      { $match: { admin: adminId, filledBy: { $in: execIds } } },
      { $group: { _id: '$filledBy', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: execIds }, isDumped: true, isDeleted: { $ne: true } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]),
    Reminder.aggregate([
      { $match: { admin: adminId, user: { $in: execIds }, isMissed: true, isDone: false } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
  ]);

  const callsMap     = Object.fromEntries(callsAgg.map((r) => [String(r._id), r.count]));
  const leadsMap     = Object.fromEntries(leadsAgg.map((r) => [String(r._id), r]));
  const prospectsMap = Object.fromEntries(prospectsAgg.map((r) => [String(r._id), r.count]));
  const dumpMap      = Object.fromEntries(dumpAgg.map((r) => [String(r._id), r.count]));
  const missedMap    = Object.fromEntries(missedAgg.map((r) => [String(r._id), r.count]));

  // Get team info for each exec
  const allTeams = await Team.find({ admin: adminId, isDeleted: false })
    .populate('leader', 'name').lean();

  // Build exec→team map
  const execTeamMap = {};
  for (const team of allTeams) {
    for (const m of team.members) {
      if (m.user) execTeamMap[String(m.user)] = team;
    }
  }

  let rows = execs.map((e) => {
    const idStr    = String(e._id);
    const ld       = leadsMap[idStr] || { assigned: 0, talk: 0, notTalk: 0, interested: 0, converted: 0 };
    const calls    = callsMap[idStr]     || 0;
    const prospects = prospectsMap[idStr] || 0;
    const sales    = ld.converted || 0;
    const dump     = dumpMap[idStr]      || 0;
    const missed   = missedMap[idStr]    || 0;
    const team     = execTeamMap[idStr];
    const conversion = calls > 0 ? `${((sales / calls) * 100).toFixed(1)}%` : '0%';

    return {
      id:              idStr,
      execName:        e.name,
      teamLeader:      team?.leader?.name || 'Unassigned',
      teamName:        team?.name         || 'No Team',
      assignedLeads:   ld.assigned  || 0,
      completedCalls:  calls,
      talk:            ld.talk      || 0,
      notTalk:         ld.notTalk   || 0,
      interested:      ld.interested|| 0,
      prospects,
      sales,
      dumpLeads:       dump,
      missedFollowups: missed,
      conversion,
      status:          e.isActive ? 'Active' : 'Inactive',
    };
  });

  if (search) rows = rows.filter((r) => r.execName.toLowerCase().includes(search));
  rows.sort((a, b) => (a[sortBy] - b[sortBy]) * sortDir);

  const total = rows.length;
  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  res.status(200).json(new ApiResponse(200, {
    executives: paged,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  }, 'Executive reports retrieved successfully'));
});
