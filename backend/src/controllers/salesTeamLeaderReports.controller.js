'use strict';

/**
 * SALES TEAM LEADER REPORTS CONTROLLER
 * ─────────────────────────────────────────────────────────────
 * All queries are tenant-scoped (admin._id) and team-scoped.
 * NO revenue fields anywhere.
 *
 * Endpoints:
 *   GET /api/sales-team-leader/reports/overview
 *   GET /api/sales-team-leader/reports/daily
 *   GET /api/sales-team-leader/reports/weekly
 *   GET /api/sales-team-leader/reports/executive
 *   GET /api/sales-team-leader/reports/self
 */

const catchAsync  = require('../utils/catchAsync');
const AppError    = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const startOfDay = (d = new Date()) => {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
};

const endOfDay = (d = new Date()) => {
  const dt = new Date(d);
  dt.setHours(23, 59, 59, 999);
  return dt;
};

/** Role guard — returns false and calls next(403) if not SALES_TL */
const guardTL = (req, next) => {
  if (req.user?.role !== 'SALES_TL') {
    next(new AppError('Only Sales Team Leaders can access this resource', 403));
    return false;
  }
  return true;
};

/**
 * Resolve the TL's team and member IDs.
 * memberIds excludes the TL themselves.
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

/** Get Monday of the week containing the given date */
const getMondayOf = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon...
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Format date as YYYY-MM-DD */
const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);

// ─────────────────────────────────────────────────────────────
// 1. OVERVIEW — Team KPIs + chart data
// GET /api/sales-team-leader/reports/overview
// ─────────────────────────────────────────────────────────────
exports.getOverview = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead, LeadActivity, ProspectForm, Reminder, User } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const { team, memberIds } = await resolveTeam(adminId, userId);

  const EMPTY = {
    kpis: {
      totalLeads: 0, totalCalls: 0, totalProspects: 0, totalSales: 0,
      dumpLeads: 0, missedFollowUps: 0, conversionRate: 0,
    },
    callsVsSales:       [],
    leadsVsProspects:   [],
    execPerformance:    [],
    leadStatusBreakdown:[],
  };

  if (!team || memberIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, EMPTY, 'Overview retrieved successfully'));
  }

  const now   = new Date();
  const day7  = new Date(now);
  day7.setDate(day7.getDate() - 6);
  day7.setHours(0, 0, 0, 0);

  // ── KPIs ──
  const [totalLeads, totalCalls, totalProspects, totalSales, dumpLeads, missedFollowUps] =
    await Promise.all([
      Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, isDeleted: { $ne: true }, isDumped: { $ne: true } }),
      LeadActivity.countDocuments({ admin: adminId, user: { $in: memberIds } }),
      ProspectForm.countDocuments({ admin: adminId, filledBy: { $in: memberIds } }),
      Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, status: 'CONVERTED', isDeleted: { $ne: true } }),
      Lead.countDocuments({ admin: adminId, assignedTo: { $in: memberIds }, isDumped: true, isDeleted: { $ne: true } }),
      Reminder.countDocuments({ admin: adminId, user: { $in: memberIds }, isMissed: true, isDone: false }),
    ]);

  const conversionRate = totalLeads > 0
    ? parseFloat(((totalSales / totalLeads) * 100).toFixed(1))
    : 0;

  // ── callsVsSales — last 7 days grouped by day-of-week ──
  const [callsDayAgg, salesDayAgg] = await Promise.all([
    LeadActivity.aggregate([
      { $match: { admin: adminId, user: { $in: memberIds }, createdAt: { $gte: day7, $lte: now } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: memberIds }, status: 'CONVERTED', convertedAt: { $gte: day7, $lte: now }, isDeleted: { $ne: true } } },
      { $group: { _id: { $dayOfWeek: '$convertedAt' }, count: { $sum: 1 } } },
    ]),
  ]);

  // Build last 7 days array
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const callsDayMap = Object.fromEntries(callsDayAgg.map((r) => [r._id, r.count]));
  const salesDayMap = Object.fromEntries(salesDayAgg.map((r) => [r._id, r.count]));
  const callsVsSales = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dow = d.getDay() + 1; // $dayOfWeek: 1=Sun..7=Sat
    callsVsSales.push({ name: DAY_NAMES[d.getDay()], calls: callsDayMap[dow] || 0, sales: salesDayMap[dow] || 0 });
  }

  // ── leadsVsProspects — last 7 days ──
  const [leadsDayAgg, prospectsDayAgg] = await Promise.all([
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: memberIds }, createdAt: { $gte: day7, $lte: now }, isDeleted: { $ne: true } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ]),
    ProspectForm.aggregate([
      { $match: { admin: adminId, filledBy: { $in: memberIds }, createdAt: { $gte: day7, $lte: now } } },
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

  // ── execPerformance — per member ──
  const [execUsers, execCallsAgg, execProspectsAgg, execSalesAgg] = await Promise.all([
    User.find({ _id: { $in: memberIds }, admin: adminId, isDeleted: false }).select('name').lean(),
    LeadActivity.aggregate([
      { $match: { admin: adminId, user: { $in: memberIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
    ProspectForm.aggregate([
      { $match: { admin: adminId, filledBy: { $in: memberIds } } },
      { $group: { _id: '$filledBy', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: memberIds }, status: 'CONVERTED', isDeleted: { $ne: true } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]),
  ]);

  const execCallsMap     = Object.fromEntries(execCallsAgg.map((r) => [String(r._id), r.count]));
  const execProspectsMap = Object.fromEntries(execProspectsAgg.map((r) => [String(r._id), r.count]));
  const execSalesMap     = Object.fromEntries(execSalesAgg.map((r) => [String(r._id), r.count]));

  const execPerformance = execUsers.map((u) => {
    const idStr = String(u._id);
    const parts = u.name.trim().split(' ');
    const label = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
    return {
      name:      label,
      calls:     execCallsMap[idStr]     || 0,
      prospects: execProspectsMap[idStr] || 0,
      sales:     execSalesMap[idStr]     || 0,
    };
  }).sort((a, b) => b.calls - a.calls);

  // ── leadStatusBreakdown ──
  const statusAgg = await Lead.aggregate([
    { $match: { admin: adminId, assignedTo: { $in: memberIds }, isDeleted: { $ne: true } } },
    { $group: { _id: '$status', value: { $sum: 1 } } },
  ]);

  const STATUS_LABEL = { UNTOUCHED: 'Untouched', TALK: 'Talk', NOT_TALK: 'Not Talk', INTERESTED: 'Interested', CONVERTED: 'Converted', DUMP: 'Dump' };
  const leadStatusBreakdown = statusAgg.map((r) => ({
    name:  STATUS_LABEL[r._id] || r._id,
    value: r.value,
  })).sort((a, b) => b.value - a.value);

  res.status(200).json(new ApiResponse(200, {
    kpis: { totalLeads, totalCalls, totalProspects, totalSales, dumpLeads, missedFollowUps, conversionRate },
    callsVsSales,
    leadsVsProspects,
    execPerformance,
    leadStatusBreakdown,
  }, 'Overview retrieved successfully'));
});

// ─────────────────────────────────────────────────────────────
// 2. DAILY — TL's own daily report (self only)
// GET /api/sales-team-leader/reports/daily
// ─────────────────────────────────────────────────────────────
exports.getDaily = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead, LeadActivity, ProspectForm } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const page     = Math.max(1, parseInt(req.query.page)     || 1);
  const pageSize = Math.min(30, Math.max(1, parseInt(req.query.pageSize) || 10));

  // Parse requested date (default today)
  const dateParam = req.query.date;
  const targetDate = dateParam ? new Date(dateParam) : new Date();
  const todayStart = startOfDay(targetDate);
  const todayEnd   = endOfDay(targetDate);

  // ── Today card ──
  const [totalCalls, todayCalls, todayProspects, todaySells, todayDump, totalUntouched] =
    await Promise.all([
      LeadActivity.countDocuments({ admin: adminId, user: userId }),
      LeadActivity.countDocuments({ admin: adminId, user: userId, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      ProspectForm.countDocuments({ admin: adminId, filledBy: userId, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ admin: adminId, assignedTo: userId, status: 'CONVERTED', convertedAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ admin: adminId, assignedTo: userId, isDumped: true, dumpedAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ admin: adminId, assignedTo: userId, status: 'UNTOUCHED', isDeleted: { $ne: true }, isDumped: { $ne: true } }),
    ]);

  // ── History — last 30 days ──
  const historyStart = new Date();
  historyStart.setDate(historyStart.getDate() - 29);
  historyStart.setHours(0, 0, 0, 0);

  const [callsHistAgg, prospectsHistAgg, sellsHistAgg, dumpHistAgg] = await Promise.all([
    LeadActivity.aggregate([
      { $match: { admin: adminId, user: userId, createdAt: { $gte: historyStart } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    ProspectForm.aggregate([
      { $match: { admin: adminId, filledBy: userId, createdAt: { $gte: historyStart } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: userId, status: 'CONVERTED', convertedAt: { $gte: historyStart }, isDeleted: { $ne: true } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$convertedAt' } }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: userId, isDumped: true, dumpedAt: { $gte: historyStart } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$dumpedAt' } }, count: { $sum: 1 } } },
    ]),
  ]);

  const callsHistMap     = Object.fromEntries(callsHistAgg.map((r) => [r._id, r.count]));
  const prospectsHistMap = Object.fromEntries(prospectsHistAgg.map((r) => [r._id, r.count]));
  const sellsHistMap     = Object.fromEntries(sellsHistAgg.map((r) => [r._id, r.count]));
  const dumpHistMap      = Object.fromEntries(dumpHistAgg.map((r) => [r._id, r.count]));

  // Build 30-day array (newest first)
  const allHistory = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = fmtDate(d);
    allHistory.push({
      date:           key,
      totalCalls:     callsHistMap[key]     || 0,
      todayCalls:     callsHistMap[key]     || 0,
      todayProspects: prospectsHistMap[key] || 0,
      todaySells:     sellsHistMap[key]     || 0,
      todayDump:      dumpHistMap[key]      || 0,
      totalUntouched: 0, // per-day untouched is a snapshot; use current total for today
    });
  }
  // Set today's untouched on the first row
  if (allHistory.length > 0) allHistory[0].totalUntouched = totalUntouched;

  const total      = allHistory.length;
  const skip       = (page - 1) * pageSize;
  const history    = allHistory.slice(skip, skip + pageSize);

  res.status(200).json(new ApiResponse(200, {
    today: { totalCalls, todayCalls, todayProspects, todaySells, todayDump, totalUntouched },
    history,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  }, 'Daily report retrieved successfully'));
});

// ─────────────────────────────────────────────────────────────
// 3. WEEKLY — Team weekly report
// GET /api/sales-team-leader/reports/weekly
// ─────────────────────────────────────────────────────────────
exports.getWeekly = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead, LeadActivity, ProspectForm } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const weeksBack = Math.min(52, Math.max(1, parseInt(req.query.weeks) || 8));
  const page      = Math.max(1, parseInt(req.query.page)     || 1);
  const pageSize  = Math.min(52, Math.max(1, parseInt(req.query.pageSize) || 10));

  const { memberIds } = await resolveTeam(adminId, userId);

  const EMPTY_WEEK = { calls: 0, prospects: 0, sales: 0, dump: 0, conversionRate: 0 };

  if (memberIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, {
      currentWeek: EMPTY_WEEK,
      trend:       [],
      history:     [],
      pagination:  { total: 0, page, pageSize, totalPages: 0 },
    }, 'Weekly report retrieved successfully'));
  }

  // Build weekly buckets (Monday → Sunday), newest first
  const thisMonday = getMondayOf(new Date());
  const buckets = [];
  for (let i = 0; i < weeksBack; i++) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    buckets.push({ weekStart, weekEnd });
  }

  const rangeStart = buckets[buckets.length - 1].weekStart;
  const rangeEnd   = buckets[0].weekEnd;

  // Aggregate all data in the full range, then bucket manually
  const [callsAgg, prospectsAgg, salesAgg, dumpAgg] = await Promise.all([
    LeadActivity.aggregate([
      { $match: { admin: adminId, user: { $in: memberIds }, createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    ProspectForm.aggregate([
      { $match: { admin: adminId, filledBy: { $in: memberIds }, createdAt: { $gte: rangeStart, $lte: rangeEnd } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: memberIds }, status: 'CONVERTED', convertedAt: { $gte: rangeStart, $lte: rangeEnd }, isDeleted: { $ne: true } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$convertedAt' } }, count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: memberIds }, isDumped: true, dumpedAt: { $gte: rangeStart, $lte: rangeEnd } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$dumpedAt' } }, count: { $sum: 1 } } },
    ]),
  ]);

  // Build day-level maps
  const callsDayMap     = Object.fromEntries(callsAgg.map((r) => [r._id, r.count]));
  const prospectsDayMap = Object.fromEntries(prospectsAgg.map((r) => [r._id, r.count]));
  const salesDayMap     = Object.fromEntries(salesAgg.map((r) => [r._id, r.count]));
  const dumpDayMap      = Object.fromEntries(dumpAgg.map((r) => [r._id, r.count]));

  /** Sum a day-map over a date range [start, end] */
  const sumRange = (map, start, end) => {
    let total = 0;
    const cur = new Date(start);
    while (cur <= end) {
      total += map[fmtDate(cur)] || 0;
      cur.setDate(cur.getDate() + 1);
    }
    return total;
  };

  // Build full history (newest first)
  const fullHistory = buckets.map((b) => {
    const calls     = sumRange(callsDayMap,     b.weekStart, b.weekEnd);
    const prospects = sumRange(prospectsDayMap, b.weekStart, b.weekEnd);
    const sales     = sumRange(salesDayMap,     b.weekStart, b.weekEnd);
    const dump      = sumRange(dumpDayMap,      b.weekStart, b.weekEnd);
    const conversion = calls > 0 ? `${((sales / calls) * 100).toFixed(1)}%` : '0%';
    return {
      weekStart:  fmtDate(b.weekStart),
      weekEnd:    fmtDate(b.weekEnd),
      totalCalls: calls,
      prospects,
      sales,
      dump,
      conversion,
    };
  });

  const currentWeekData = fullHistory[0] || { totalCalls: 0, prospects: 0, sales: 0, dump: 0, conversion: '0%' };
  const conversionRate  = currentWeekData.totalCalls > 0
    ? parseFloat(((currentWeekData.sales / currentWeekData.totalCalls) * 100).toFixed(1))
    : 0;

  const currentWeek = {
    calls:          currentWeekData.totalCalls,
    prospects:      currentWeekData.prospects,
    sales:          currentWeekData.sales,
    dump:           currentWeekData.dump,
    conversionRate,
  };

  // Trend — oldest to newest, name = MM-DD of weekStart
  const trend = [...fullHistory].reverse().map((w) => ({
    name:  w.weekStart.slice(5),
    calls: w.totalCalls,
    sales: w.sales,
  }));

  const total    = fullHistory.length;
  const skip     = (page - 1) * pageSize;
  const history  = fullHistory.slice(skip, skip + pageSize);

  res.status(200).json(new ApiResponse(200, {
    currentWeek,
    trend,
    history,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  }, 'Weekly report retrieved successfully'));
});

// ─────────────────────────────────────────────────────────────
// 4. EXECUTIVE — Per-executive report for TL's team
// GET /api/sales-team-leader/reports/executive
// ─────────────────────────────────────────────────────────────
exports.getExecutive = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead, LeadActivity, ProspectForm, Reminder, User } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const page     = Math.max(1, parseInt(req.query.page)     || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize) || 10));
  const search   = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const sortDir  = req.query.sortDir === 'asc' ? 1 : -1;
  const ALLOWED_SORT = ['completedCalls', 'prospects', 'sales', 'dumpLeads', 'missedFollowups'];
  const sortBy   = ALLOWED_SORT.includes(req.query.sortBy) ? req.query.sortBy : 'completedCalls';

  const { memberIds } = await resolveTeam(adminId, userId);

  if (memberIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, {
      executives: [],
      pagination: { total: 0, page, pageSize, totalPages: 0 },
    }, 'Executive report retrieved successfully'));
  }

  // Fetch user docs
  const execUsers = await User.find({
    _id:       { $in: memberIds },
    admin:     adminId,
    isDeleted: false,
  }).select('name email isActive').lean();

  // Parallel aggregations
  const [callsAgg, leadsAgg, prospectsAgg, dumpAgg, missedAgg] = await Promise.all([
    // Calls per exec
    LeadActivity.aggregate([
      { $match: { admin: adminId, user: { $in: memberIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
    // Lead status breakdown per exec
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: memberIds }, isDeleted: { $ne: true } } },
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
    // Prospects per exec
    ProspectForm.aggregate([
      { $match: { admin: adminId, filledBy: { $in: memberIds } } },
      { $group: { _id: '$filledBy', count: { $sum: 1 } } },
    ]),
    // Dump per exec
    Lead.aggregate([
      { $match: { admin: adminId, assignedTo: { $in: memberIds }, isDumped: true, isDeleted: { $ne: true } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]),
    // Missed follow-ups per exec
    Reminder.aggregate([
      { $match: { admin: adminId, user: { $in: memberIds }, isMissed: true, isDone: false } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
  ]);

  const callsMap     = Object.fromEntries(callsAgg.map((r) => [String(r._id), r.count]));
  const leadsMap     = Object.fromEntries(leadsAgg.map((r) => [String(r._id), r]));
  const prospectsMap = Object.fromEntries(prospectsAgg.map((r) => [String(r._id), r.count]));
  const dumpMap      = Object.fromEntries(dumpAgg.map((r) => [String(r._id), r.count]));
  const missedMap    = Object.fromEntries(missedAgg.map((r) => [String(r._id), r.count]));

  let rows = execUsers.map((u) => {
    const idStr       = String(u._id);
    const leadsData   = leadsMap[idStr] || { assigned: 0, talk: 0, notTalk: 0, interested: 0, converted: 0 };
    const calls       = callsMap[idStr]     || 0;
    const prospects   = prospectsMap[idStr] || 0;
    const sales       = leadsData.converted || 0;
    const dumpLeads   = dumpMap[idStr]      || 0;
    const missed      = missedMap[idStr]    || 0;
    const conversion  = calls > 0 ? `${((sales / calls) * 100).toFixed(1)}%` : '0%';

    return {
      id:              idStr,
      execName:        u.name,
      email:           u.email,
      assignedLeads:   leadsData.assigned  || 0,
      completedCalls:  calls,
      talk:            leadsData.talk      || 0,
      notTalk:         leadsData.notTalk   || 0,
      interested:      leadsData.interested|| 0,
      prospects,
      sales,
      dumpLeads,
      missedFollowups: missed,
      conversion,
      status:          u.isActive ? 'Active' : 'Inactive',
    };
  });

  // Search filter
  if (search) {
    rows = rows.filter((r) => r.execName.toLowerCase().includes(search));
  }

  // Sort
  rows.sort((a, b) => (a[sortBy] - b[sortBy]) * sortDir);

  const total  = rows.length;
  const skip   = (page - 1) * pageSize;
  const paged  = rows.slice(skip, skip + pageSize);

  res.status(200).json(new ApiResponse(200, {
    executives: paged,
    pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
  }, 'Executive report retrieved successfully'));
});

// ─────────────────────────────────────────────────────────────
// 5. SELF — TL's own summary (today card)
// GET /api/sales-team-leader/reports/self
// ─────────────────────────────────────────────────────────────
exports.getSelf = catchAsync(async (req, res, next) => {
  if (!guardTL(req, next)) return;

  const { Lead, LeadActivity, ProspectForm } = require('../models');

  const adminId = req.admin._id;
  const userId  = req.user._id;

  const now        = new Date();
  const todayStart = startOfDay(now);
  const todayEnd   = endOfDay(now);

  const [totalCalls, todayCalls, todayProspects, todaySells, todayDump, totalUntouched] =
    await Promise.all([
      LeadActivity.countDocuments({ admin: adminId, user: userId }),
      LeadActivity.countDocuments({ admin: adminId, user: userId, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      ProspectForm.countDocuments({ admin: adminId, filledBy: userId, createdAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ admin: adminId, assignedTo: userId, status: 'CONVERTED', convertedAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ admin: adminId, assignedTo: userId, isDumped: true, dumpedAt: { $gte: todayStart, $lte: todayEnd } }),
      Lead.countDocuments({ admin: adminId, assignedTo: userId, status: 'UNTOUCHED', isDeleted: { $ne: true }, isDumped: { $ne: true } }),
    ]);

  res.status(200).json(new ApiResponse(200, {
    totalCalls, todayCalls, todayProspects, todaySells, todayDump, totalUntouched,
  }, 'Self report retrieved successfully'));
});
