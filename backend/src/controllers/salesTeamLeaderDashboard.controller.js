'use strict';

/**
 * SALES TEAM LEADER DASHBOARD CONTROLLER
 * ─────────────────────────────────────────────────────────────
 * Fully dynamic, DB-backed data for the Sales TL Dashboard.
 * All queries are tenant-scoped (admin._id) and team-scoped.
 *
 * Endpoints:
 *   GET /api/sales-team-leader/dashboard/summary
 *   GET /api/sales-team-leader/dashboard/calls-sales-trend
 *   GET /api/sales-team-leader/dashboard/lead-funnel
 *   GET /api/sales-team-leader/dashboard/executive-performance
 *   GET /api/sales-team-leader/dashboard/sales-trend
 *   GET /api/sales-team-leader/dashboard/leaderboard
 */

const catchAsync  = require('../utils/catchAsync');
const AppError    = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Normalize a Date to midnight (start of day) */
const startOfDay = (d = new Date()) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

/** Return start of a given month (year, 0-indexed month) */
const startOfMonth = (year, month) => new Date(year, month, 1, 0, 0, 0, 0);

/** Return end of a given month */
const endOfMonth = (year, month) => new Date(year, month + 1, 0, 23, 59, 59, 999);

/** Role guard — throws 403 if caller is not SALES_TL */
const guardTL = (req, next) => {
  if (req.user?.role !== 'SALES_TL') {
    next(new AppError('Only Sales Team Leaders can access this resource', 403));
    return false;
  }
  return true;
};

/**
 * Resolve the TL's team and member IDs.
 * Returns { team, memberIds } — memberIds excludes the TL themselves.
 */
const resolveTeam = async (adminId, userId) => {
  const { Team } = require('../models');
  const team = await Team.findOne({
    admin:     adminId,
    leader:    userId,
    isDeleted: false,
    isActive:  true,
  }).lean();

  const memberIds = team
    ? team.members
        .map((m) => m.user)
        .filter((id) => id && String(id) !== String(userId))
    : [];

  return { team, memberIds };
};

// ─────────────────────────────────────────────────────────────
// 1. SUMMARY CARDS (8 KPIs)
// GET /api/sales-team-leader/dashboard/summary
// ─────────────────────────────────────────────────────────────
/**
 * Returns:
 *  totalCalls       — LeadActivity count for all team members (all time)
 *  todayCalls       — LeadActivity count for all team members today
 *  totalProspects   — ProspectForm count for all team members
 *  todaySales       — Leads converted today by team members
 *  talkRatio        — (TALK+INTERESTED+CONVERTED leads / total non-dump leads) × 100
 *  untouchedLeads   — Leads with status UNTOUCHED assigned to team
 *  dumpCount        — isDumped leads assigned to team members
 *  followUpMissed   — Reminders where isMissed=true for team members
 */
exports.getSummary = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead, LeadActivity, ProspectForm, Reminder } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const { team, memberIds } = await resolveTeam(adminId, userId);

  // If no team, return zeros gracefully
  if (!team || memberIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        totalCalls:      0,
        todayCalls:      0,
        totalProspects:  0,
        todaySales:      0,
        talkRatio:       0,
        untouchedLeads:  0,
        dumpCount:       0,
        followUpMissed:  0,
        teamName:        team?.name || 'No Team',
        executiveCount:  0,
      }, 'Dashboard summary retrieved successfully')
    );
  }

  const now        = new Date();
  const todayStart = startOfDay(now);
  const todayEnd   = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  // All team member IDs (including TL for their own leads)
  const allTeamIds = [...memberIds, userId];

  const [
    totalCalls,
    todayCalls,
    totalProspects,
    todaySales,
    talkLeads,
    totalActiveLeads,
    untouchedLeads,
    dumpCount,
    followUpMissed,
  ] = await Promise.all([
    // Total calls = all LeadActivity by team members
    LeadActivity.countDocuments({
      admin: adminId,
      user:  { $in: memberIds },
    }),

    // Today's calls
    LeadActivity.countDocuments({
      admin:     adminId,
      user:      { $in: memberIds },
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),

    // Total prospects = ProspectForm records by team members
    ProspectForm.countDocuments({
      admin:    adminId,
      filledBy: { $in: memberIds },
    }),

    // Today's sales = leads converted today by team members
    Lead.countDocuments({
      admin:       adminId,
      assignedTo:  { $in: memberIds },
      status:      'CONVERTED',
      convertedAt: { $gte: todayStart, $lte: todayEnd },
      isDeleted:   { $ne: true },
    }),

    // Leads with TALK/INTERESTED/CONVERTED status (for talk ratio numerator)
    Lead.countDocuments({
      admin:      adminId,
      assignedTo: { $in: memberIds },
      status:     { $in: ['TALK', 'INTERESTED', 'CONVERTED'] },
      isDeleted:  { $ne: true },
      isDumped:   { $ne: true },
    }),

    // Total active (non-dump, non-deleted) leads assigned to team
    Lead.countDocuments({
      admin:      adminId,
      assignedTo: { $in: memberIds },
      isDeleted:  { $ne: true },
      isDumped:   { $ne: true },
    }),

    // Untouched leads
    Lead.countDocuments({
      admin:      adminId,
      assignedTo: { $in: memberIds },
      status:     'UNTOUCHED',
      isDeleted:  { $ne: true },
      isDumped:   { $ne: true },
    }),

    // Dump count
    Lead.countDocuments({
      admin:      adminId,
      assignedTo: { $in: memberIds },
      isDumped:   true,
      isDeleted:  { $ne: true },
    }),

    // Follow-up missed
    Reminder.countDocuments({
      admin:    adminId,
      user:     { $in: memberIds },
      isMissed: true,
      isDone:   false,
    }),
  ]);

  const talkRatio = totalActiveLeads > 0
    ? parseFloat(((talkLeads / totalActiveLeads) * 100).toFixed(1))
    : 0;

  res.status(200).json(
    new ApiResponse(200, {
      totalCalls,
      todayCalls,
      totalProspects,
      todaySales,
      talkRatio,
      untouchedLeads,
      dumpCount,
      followUpMissed,
      teamName:       team.name,
      executiveCount: memberIds.length,
    }, 'Dashboard summary retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// 2. CALLS & SALES TREND (Area Chart — last 12 months)
// GET /api/sales-team-leader/dashboard/calls-sales-trend
// ─────────────────────────────────────────────────────────────
/**
 * Returns monthly calls and sales for the current year.
 * Shape: { months: [{ name, calls, sales }] }
 */
exports.getCallsSalesTrend = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead, LeadActivity } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const { memberIds } = await resolveTeam(adminId, userId);

  const now       = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  const yearEnd   = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (memberIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        months: MONTH_NAMES.map((name) => ({ name, calls: 0, sales: 0 })),
      }, 'Calls & sales trend retrieved successfully')
    );
  }

  // Aggregate calls per month
  const callsAgg = await LeadActivity.aggregate([
    {
      $match: {
        admin:     adminId,
        user:      { $in: memberIds },
        createdAt: { $gte: yearStart, $lte: yearEnd },
      },
    },
    {
      $group: {
        _id:   { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
  ]);

  // Aggregate sales (conversions) per month
  const salesAgg = await Lead.aggregate([
    {
      $match: {
        admin:       adminId,
        assignedTo:  { $in: memberIds },
        status:      'CONVERTED',
        convertedAt: { $gte: yearStart, $lte: yearEnd },
        isDeleted:   { $ne: true },
      },
    },
    {
      $group: {
        _id:   { $month: '$convertedAt' },
        count: { $sum: 1 },
      },
    },
  ]);

  const callsMap = Object.fromEntries(callsAgg.map((r) => [r._id, r.count]));
  const salesMap = Object.fromEntries(salesAgg.map((r) => [r._id, r.count]));

  const months = MONTH_NAMES.map((name, i) => ({
    name,
    calls: callsMap[i + 1] || 0,
    sales: salesMap[i + 1] || 0,
  }));

  res.status(200).json(
    new ApiResponse(200, { months }, 'Calls & sales trend retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// 3. LEAD FUNNEL (Pie Chart)
// GET /api/sales-team-leader/dashboard/lead-funnel
// ─────────────────────────────────────────────────────────────
/**
 * Returns lead status distribution for all team members' leads.
 * Shape: { funnel: [{ name, value, percentage }] }
 */
exports.getLeadFunnel = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const { memberIds } = await resolveTeam(adminId, userId);

  if (memberIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        funnel: [],
        total:  0,
      }, 'Lead funnel retrieved successfully')
    );
  }

  const agg = await Lead.aggregate([
    {
      $match: {
        admin:      adminId,
        assignedTo: { $in: memberIds },
        isDeleted:  { $ne: true },
      },
    },
    {
      $group: {
        _id:   '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  // Also count dumped leads separately
  const dumpedCount = await Lead.countDocuments({
    admin:      adminId,
    assignedTo: { $in: memberIds },
    isDumped:   true,
    isDeleted:  { $ne: true },
  });

  const STATUS_LABEL = {
    UNTOUCHED:  'Untouched',
    TALK:       'Talk',
    NOT_TALK:   'Not Talk',
    INTERESTED: 'Interested',
    CONVERTED:  'Converted',
    DUMP:       'Dump',
  };

  const total = agg.reduce((sum, r) => sum + r.count, 0) + (dumpedCount > 0 ? 0 : 0);

  let funnel = agg.map((r) => ({
    name:       STATUS_LABEL[r._id] || r._id,
    value:      r.count,
    percentage: total > 0 ? parseFloat(((r.count / total) * 100).toFixed(1)) : 0,
  }));

  // Sort by value descending
  funnel.sort((a, b) => b.value - a.value);

  res.status(200).json(
    new ApiResponse(200, { funnel, total }, 'Lead funnel retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// 4. EXECUTIVE PERFORMANCE (Grouped Bar Chart)
// GET /api/sales-team-leader/dashboard/executive-performance
// ─────────────────────────────────────────────────────────────
/**
 * Returns per-executive: calls, leads, sales.
 * Shape: { executives: [{ name, calls, leads, sales }] }
 */
exports.getExecutivePerformance = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead, LeadActivity, User } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const { memberIds } = await resolveTeam(adminId, userId);

  if (memberIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { executives: [] }, 'Executive performance retrieved successfully')
    );
  }

  // Fetch executive names
  const executives = await User.find({
    _id:       { $in: memberIds },
    admin:     adminId,
    isDeleted: false,
  }).select('name isActive').lean();

  const execMap = Object.fromEntries(executives.map((e) => [String(e._id), e]));

  // Aggregate calls per executive
  const callsAgg = await LeadActivity.aggregate([
    {
      $match: {
        admin: adminId,
        user:  { $in: memberIds },
      },
    },
    {
      $group: {
        _id:   '$user',
        count: { $sum: 1 },
      },
    },
  ]);

  // Aggregate leads per executive
  const leadsAgg = await Lead.aggregate([
    {
      $match: {
        admin:      adminId,
        assignedTo: { $in: memberIds },
        isDeleted:  { $ne: true },
        isDumped:   { $ne: true },
      },
    },
    {
      $group: {
        _id:   '$assignedTo',
        count: { $sum: 1 },
      },
    },
  ]);

  // Aggregate sales per executive
  const salesAgg = await Lead.aggregate([
    {
      $match: {
        admin:      adminId,
        assignedTo: { $in: memberIds },
        status:     'CONVERTED',
        isDeleted:  { $ne: true },
      },
    },
    {
      $group: {
        _id:   '$assignedTo',
        count: { $sum: 1 },
      },
    },
  ]);

  const callsMap = Object.fromEntries(callsAgg.map((r) => [String(r._id), r.count]));
  const leadsMap = Object.fromEntries(leadsAgg.map((r) => [String(r._id), r.count]));
  const salesMap = Object.fromEntries(salesAgg.map((r) => [String(r._id), r.count]));

  const result = memberIds.map((id) => {
    const idStr = String(id);
    const exec  = execMap[idStr];
    const name  = exec?.name || 'Unknown';
    // Shorten to "First L." format for chart labels
    const parts = name.trim().split(' ');
    const label = parts.length > 1
      ? `${parts[0]} ${parts[1][0]}.`
      : parts[0];

    return {
      id:    idStr,
      name:  label,
      calls: callsMap[idStr] || 0,
      leads: leadsMap[idStr] || 0,
      sales: salesMap[idStr] || 0,
    };
  });

  // Sort by calls descending
  result.sort((a, b) => b.calls - a.calls);

  res.status(200).json(
    new ApiResponse(200, { executives: result }, 'Executive performance retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// 5. SALES TREND (Line Chart — monthly this year)
// GET /api/sales-team-leader/dashboard/sales-trend
// ─────────────────────────────────────────────────────────────
/**
 * Returns monthly sales count for the current year.
 * Shape: { months: [{ name, sales }] }
 */
exports.getSalesTrend = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const { memberIds } = await resolveTeam(adminId, userId);

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (memberIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        months: MONTH_NAMES.map((name) => ({ name, sales: 0 })),
      }, 'Sales trend retrieved successfully')
    );
  }

  const now       = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  const yearEnd   = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const salesAgg = await Lead.aggregate([
    {
      $match: {
        admin:       adminId,
        assignedTo:  { $in: memberIds },
        status:      'CONVERTED',
        convertedAt: { $gte: yearStart, $lte: yearEnd },
        isDeleted:   { $ne: true },
      },
    },
    {
      $group: {
        _id:   { $month: '$convertedAt' },
        count: { $sum: 1 },
      },
    },
  ]);

  const salesMap = Object.fromEntries(salesAgg.map((r) => [r._id, r.count]));

  const months = MONTH_NAMES.map((name, i) => ({
    name,
    sales: salesMap[i + 1] || 0,
  }));

  res.status(200).json(
    new ApiResponse(200, { months }, 'Sales trend retrieved successfully')
  );
});

// ─────────────────────────────────────────────────────────────
// 6. EXECUTIVE LEADERBOARD (Data Table)
// GET /api/sales-team-leader/dashboard/leaderboard
// ─────────────────────────────────────────────────────────────
/**
 * Query params:
 *  page     (default 1)
 *  pageSize (default 10, max 50)
 *  search   (executive name)
 *  sortBy   (calls|prospects|sales|talkRatio|dump|missed, default 'calls')
 *  sortDir  ('asc'|'desc', default 'desc')
 *
 * Returns ranked leaderboard with per-executive metrics.
 */
exports.getLeaderboard = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead, LeadActivity, Reminder, User } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const { memberIds } = await resolveTeam(adminId, userId);

  const page     = Math.max(1, parseInt(req.query.page)     || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
  const search   = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const sortDir  = req.query.sortDir === 'asc' ? 1 : -1;
  const ALLOWED_SORT = ['calls', 'prospects', 'sales', 'talkRatio', 'dump', 'missed'];
  const sortBy   = ALLOWED_SORT.includes(req.query.sortBy) ? req.query.sortBy : 'calls';

  if (memberIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        leaderboard: [],
        pagination: { total: 0, page, pageSize, totalPages: 0 },
      }, 'Leaderboard retrieved successfully')
    );
  }

  // Fetch all executives
  const executives = await User.find({
    _id:       { $in: memberIds },
    admin:     adminId,
    isDeleted: false,
  }).select('name email isActive').lean();

  // Aggregate all metrics in parallel
  const [callsAgg, leadsAgg, salesAgg, dumpAgg, missedAgg] = await Promise.all([
    // Calls per executive
    LeadActivity.aggregate([
      { $match: { admin: adminId, user: { $in: memberIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),

    // Active leads per executive (for talk ratio)
    Lead.aggregate([
      {
        $match: {
          admin:      adminId,
          assignedTo: { $in: memberIds },
          isDeleted:  { $ne: true },
          isDumped:   { $ne: true },
        },
      },
      {
        $group: {
          _id:          '$assignedTo',
          total:        { $sum: 1 },
          talkCount:    { $sum: { $cond: [{ $in: ['$status', ['TALK', 'INTERESTED', 'CONVERTED']] }, 1, 0] } },
          prospects:    { $sum: { $cond: [{ $eq: ['$status', 'INTERESTED'] }, 1, 0] } },
          converted:    { $sum: { $cond: [{ $eq: ['$status', 'CONVERTED'] }, 1, 0] } },
        },
      },
    ]),

    // Sales (converted) per executive
    Lead.aggregate([
      {
        $match: {
          admin:      adminId,
          assignedTo: { $in: memberIds },
          status:     'CONVERTED',
          isDeleted:  { $ne: true },
        },
      },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]),

    // Dump count per executive
    Lead.aggregate([
      {
        $match: {
          admin:      adminId,
          assignedTo: { $in: memberIds },
          isDumped:   true,
          isDeleted:  { $ne: true },
        },
      },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]),

    // Missed follow-ups per executive
    Reminder.aggregate([
      {
        $match: {
          admin:    adminId,
          user:     { $in: memberIds },
          isMissed: true,
          isDone:   false,
        },
      },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
  ]);

  // Build lookup maps
  const callsMap   = Object.fromEntries(callsAgg.map((r) => [String(r._id), r.count]));
  const salesMap   = Object.fromEntries(salesAgg.map((r) => [String(r._id), r.count]));
  const dumpMap    = Object.fromEntries(dumpAgg.map((r) => [String(r._id), r.count]));
  const missedMap  = Object.fromEntries(missedAgg.map((r) => [String(r._id), r.count]));
  const leadsMap   = Object.fromEntries(leadsAgg.map((r) => [String(r._id), r]));

  // Build leaderboard rows
  let rows = executives.map((exec) => {
    const idStr     = String(exec._id);
    const leadsData = leadsMap[idStr] || { total: 0, talkCount: 0, prospects: 0 };
    const calls     = callsMap[idStr]  || 0;
    const prospects = leadsData.prospects || 0;
    const sales     = salesMap[idStr]  || 0;
    const dump      = dumpMap[idStr]   || 0;
    const missed    = missedMap[idStr] || 0;
    const talkRatio = leadsData.total > 0
      ? parseFloat(((leadsData.talkCount / leadsData.total) * 100).toFixed(0))
      : 0;

    return {
      id:        idStr,
      executive: exec.name,
      email:     exec.email,
      calls,
      prospects,
      sales,
      talkRatio: `${talkRatio}%`,
      talkRatioNum: talkRatio,
      dump,
      missed,
      status:    exec.isActive ? 'Active' : 'Inactive',
    };
  });

  // Apply search filter
  if (search) {
    rows = rows.filter((r) => r.executive.toLowerCase().includes(search));
  }

  // Sort
  const sortKey = sortBy === 'talkRatio' ? 'talkRatioNum' : sortBy;
  rows.sort((a, b) => (a[sortKey] - b[sortKey]) * sortDir);

  // Assign rank after sort
  rows = rows.map((r, i) => ({ rank: i + 1, ...r }));

  const total = rows.length;
  const skip  = (page - 1) * pageSize;
  const paged = rows.slice(skip, skip + pageSize);

  res.status(200).json(
    new ApiResponse(200, {
      leaderboard: paged,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    }, 'Leaderboard retrieved successfully')
  );
});
