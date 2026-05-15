'use strict';

/**
 * SALES MANAGER DASHBOARD CONTROLLER
 * ─────────────────────────────────────────────────────────────
 * Single consolidated endpoint — all dashboard data in one call.
 * Tenant-scoped (admin._id). Scoped to ALL SALES_EXECUTIVE users
 * under this admin (not just one team).
 * Role guard: 403 if not SALES_MANAGER.
 * NO revenue fields anywhere.
 *
 * GET /api/sales-manager/dashboard/summary
 */

const catchAsync  = require('../utils/catchAsync');
const AppError    = require('../utils/appError');
const ApiResponse = require('../utils/apiResponse');

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/** Shorten "First Last" → "First L." for chart labels */
const shortName = (fullName = '') => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
};

// ─────────────────────────────────────────────────────────────
// GET /summary — All dashboard data in one call
// ─────────────────────────────────────────────────────────────
exports.getSummary = catchAsync(async (req, res, next) => {
  // ── Role guard ──
  if (req.user?.role !== 'SALES_MANAGER') {
    return next(new AppError('Only Sales Managers can access this resource', 403));
  }

  const {
    Lead, LeadActivity, ProspectForm, Reminder, SalesTarget, User,
  } = require('../models');

  const adminId = req.admin._id;
  const now     = new Date();

  // ── 1. Get all SALES_EXECUTIVE users under this admin ──
  const executives = await User.find({
    admin:     adminId,
    role:      'SALES_EXECUTIVE',
    isDeleted: false,
  }).select('name email phone isActive').lean();

  const execIds = executives.map((e) => e._id);

  // Graceful empty response when no executives exist
  if (execIds.length === 0) {
    const emptyMonths = MONTH_NAMES.map((name) => ({ name, leads: 0 }));
    const emptyConversions = MONTH_NAMES.map((name) => ({ name, conversions: 0 }));
    return res.status(200).json(
      new ApiResponse(200, {
        kpis: {
          totalLeads:       0,
          convertedLeads:   0,
          conversionRate:   0,
          targetAchievedPct: 0,
          pendingFollowUps: 0,
          missedFollowUps:  0,
          activeExecutives: 0,
        },
        leadsTrend:         emptyMonths,
        conversionFunnel:   [],
        teamPerformance:    [],
        targetVsAchieved:   [],
        followUpStatus:     [
          { name: 'Completed', value: 0 },
          { name: 'Pending',   value: 0 },
          { name: 'Missed',    value: 0 },
        ],
        topExecutivesRadar: [],
        exec1Label:         null,
        exec2Label:         null,
        monthlyConversions: emptyConversions,
        topPerformers:      [],
        recentLeads:        [],
        missedFollowUps:    [],
      }, 'Dashboard summary retrieved successfully')
    );
  }

  const yearStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  const yearEnd   = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  // ── 2. KPIs — all in parallel ──
  const [
    totalLeads,
    convertedLeads,
    pendingFollowUps,
    missedFollowUpsCount,
    deptTarget,
  ] = await Promise.all([
    Lead.countDocuments({
      admin:      adminId,
      assignedTo: { $in: execIds },
      isDeleted:  { $ne: true },
      isDumped:   { $ne: true },
    }),
    Lead.countDocuments({
      admin:      adminId,
      assignedTo: { $in: execIds },
      status:     'CONVERTED',
      isDeleted:  { $ne: true },
    }),
    Reminder.countDocuments({
      admin:    adminId,
      user:     { $in: execIds },
      isDone:   false,
      isMissed: false,
      remindAt: { $gt: now },
    }),
    Reminder.countDocuments({
      admin:    adminId,
      user:     { $in: execIds },
      isMissed: true,
      isDone:   false,
    }),
    SalesTarget.findOne({
      admin:     adminId,
      targetFor: 'DEPARTMENT',
      period:    'MONTHLY',
      fromDate:  { $lte: now },
      toDate:    { $gte: now },
    }).lean(),
  ]);

  const conversionRate = totalLeads > 0
    ? parseFloat(((convertedLeads / totalLeads) * 100).toFixed(1))
    : 0;

  const targetAchievedPct = deptTarget && deptTarget.targetSales > 0
    ? parseFloat(((deptTarget.achievedSales / deptTarget.targetSales) * 100).toFixed(1))
    : 0;

  const activeExecutives = executives.filter((e) => e.isActive).length;

  // ── 3. Leads Trend — monthly leads created this year ──
  const leadsTrendAgg = await Lead.aggregate([
    {
      $match: {
        admin:      adminId,
        assignedTo: { $in: execIds },
        isDeleted:  { $ne: true },
        isDumped:   { $ne: true },
        createdAt:  { $gte: yearStart, $lte: yearEnd },
      },
    },
    {
      $group: {
        _id:   { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
  ]);

  const leadsTrendMap = Object.fromEntries(leadsTrendAgg.map((r) => [r._id, r.count]));
  const leadsTrend = MONTH_NAMES.map((name, i) => ({
    name,
    leads: leadsTrendMap[i + 1] || 0,
  }));

  // ── 4. Conversion Funnel — lead status distribution ──
  const funnelAgg = await Lead.aggregate([
    {
      $match: {
        admin:      adminId,
        assignedTo: { $in: execIds },
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

  const STATUS_LABEL = {
    TALK:       'Contacted',
    INTERESTED: 'Interested',
    CONVERTED:  'Converted',
    DUMP:       'Dump',
    NOT_TALK:   'Not Talk',
    UNTOUCHED:  'Untouched',
  };

  const conversionFunnel = funnelAgg
    .map((r) => ({
      name:  STATUS_LABEL[r._id] || r._id,
      value: r.count,
    }))
    .sort((a, b) => b.value - a.value);

  // ── 5. Team Performance — per executive (NO revenue) ──
  const [perfLeadsAgg, perfConversionsAgg, perfCallsAgg] = await Promise.all([
    Lead.aggregate([
      {
        $match: {
          admin:      adminId,
          assignedTo: { $in: execIds },
          isDeleted:  { $ne: true },
          isDumped:   { $ne: true },
        },
      },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]),
    Lead.aggregate([
      {
        $match: {
          admin:      adminId,
          assignedTo: { $in: execIds },
          status:     'CONVERTED',
          isDeleted:  { $ne: true },
        },
      },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    ]),
    LeadActivity.aggregate([
      {
        $match: {
          admin: adminId,
          user:  { $in: execIds },
        },
      },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
  ]);

  const perfLeadsMap       = Object.fromEntries(perfLeadsAgg.map((r) => [String(r._id), r.count]));
  const perfConversionsMap = Object.fromEntries(perfConversionsAgg.map((r) => [String(r._id), r.count]));
  const perfCallsMap       = Object.fromEntries(perfCallsAgg.map((r) => [String(r._id), r.count]));

  const teamPerformance = executives
    .map((e) => ({
      id:          String(e._id),
      name:        shortName(e.name),
      leads:       perfLeadsMap[String(e._id)]       || 0,
      conversions: perfConversionsMap[String(e._id)] || 0,
      calls:       perfCallsMap[String(e._id)]       || 0,
    }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 8);

  // ── 6. Target vs Achieved — per executive (calls) ──
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const currentMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const userTargets = await SalesTarget.find({
    admin:     adminId,
    targetFor: 'USER',
    period:    'MONTHLY',
    user:      { $in: execIds },
    fromDate:  { $lte: currentMonthEnd },
    toDate:    { $gte: currentMonthStart },
  }).lean();

  const targetMap = Object.fromEntries(
    userTargets.map((t) => [String(t.user), t])
  );

  const targetVsAchieved = executives.map((e) => {
    const t = targetMap[String(e._id)];
    return {
      name:     shortName(e.name),
      target:   t ? (t.targetCalls   || 0) : 0,
      achieved: t ? (t.achievedCalls || 0) : 0,
    };
  });

  // ── 7. Follow-up Status ──
  const [followupCompleted, followupPending, followupMissed] = await Promise.all([
    Reminder.countDocuments({ admin: adminId, user: { $in: execIds }, isDone: true }),
    Reminder.countDocuments({ admin: adminId, user: { $in: execIds }, isDone: false, isMissed: false }),
    Reminder.countDocuments({ admin: adminId, user: { $in: execIds }, isMissed: true, isDone: false }),
  ]);

  const followUpStatus = [
    { name: 'Completed', value: followupCompleted },
    { name: 'Pending',   value: followupPending   },
    { name: 'Missed',    value: followupMissed    },
  ];

  // ── 8. Top Executives Radar — top 2 by conversions ──
  const execConversionsSorted = executives
    .map((e) => ({
      exec:        e,
      conversions: perfConversionsMap[String(e._id)] || 0,
    }))
    .sort((a, b) => b.conversions - a.conversions);

  let topExecutivesRadar = [];
  let exec1Label = null;
  let exec2Label = null;

  if (execConversionsSorted.length >= 1) {
    const top2 = execConversionsSorted.slice(0, 2);
    const e1   = top2[0].exec;
    const e2   = top2[1]?.exec || null;

    exec1Label = e1.name;
    exec2Label = e2 ? e2.name : null;

    const e1Id = String(e1._id);
    const e2Id = e2 ? String(e2._id) : null;

    // Gather metrics for top 2
    const [e1Prospects, e2Prospects, e1FollowupsDone, e2FollowupsDone] = await Promise.all([
      ProspectForm.countDocuments({ admin: adminId, filledBy: e1._id }),
      e2 ? ProspectForm.countDocuments({ admin: adminId, filledBy: e2._id }) : Promise.resolve(0),
      Reminder.countDocuments({ admin: adminId, user: e1._id, isDone: true }),
      e2 ? Reminder.countDocuments({ admin: adminId, user: e2._id, isDone: true }) : Promise.resolve(0),
    ]);

    const e1Leads       = perfLeadsMap[e1Id]       || 0;
    const e2Leads       = e2Id ? (perfLeadsMap[e2Id]       || 0) : 0;
    const e1Conversions = perfConversionsMap[e1Id] || 0;
    const e2Conversions = e2Id ? (perfConversionsMap[e2Id] || 0) : 0;
    const e1Calls       = perfCallsMap[e1Id]       || 0;
    const e2Calls       = e2Id ? (perfCallsMap[e2Id]       || 0) : 0;

    // Normalize to 0-100 relative to each other
    const normalize = (v1, v2) => {
      const max = Math.max(v1, v2, 1);
      return [Math.round((v1 / max) * 100), Math.round((v2 / max) * 100)];
    };

    const [nLeads1, nLeads2]           = normalize(e1Leads, e2Leads);
    const [nConv1, nConv2]             = normalize(e1Conversions, e2Conversions);
    const [nFollowup1, nFollowup2]     = normalize(e1FollowupsDone, e2FollowupsDone);
    const [nProspects1, nProspects2]   = normalize(e1Prospects, e2Prospects);
    const [nResponse1, nResponse2]     = normalize(e1Calls, e2Calls);

    topExecutivesRadar = [
      { subject: 'Leads',       exec1: nLeads1,     exec2: nLeads2     },
      { subject: 'Conversions', exec1: nConv1,       exec2: nConv2      },
      { subject: 'Follow-ups',  exec1: nFollowup1,   exec2: nFollowup2  },
      { subject: 'Prospects',   exec1: nProspects1,  exec2: nProspects2 },
      { subject: 'Response',    exec1: nResponse1,   exec2: nResponse2  },
    ];
  }

  // ── 9. Monthly Conversions — monthly conversions this year ──
  const monthlyConvAgg = await Lead.aggregate([
    {
      $match: {
        admin:       adminId,
        assignedTo:  { $in: execIds },
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

  const monthlyConvMap = Object.fromEntries(monthlyConvAgg.map((r) => [r._id, r.count]));
  const monthlyConversions = MONTH_NAMES.map((name, i) => ({
    name,
    conversions: monthlyConvMap[i + 1] || 0,
  }));

  // ── 10. Top Performers — per executive summary (NO revenue) ──
  const [followupsDoneAgg, followupsMissedAgg] = await Promise.all([
    Reminder.aggregate([
      { $match: { admin: adminId, user: { $in: execIds }, isDone: true } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
    Reminder.aggregate([
      { $match: { admin: adminId, user: { $in: execIds }, isMissed: true, isDone: false } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]),
  ]);

  const followupsDoneMap   = Object.fromEntries(followupsDoneAgg.map((r) => [String(r._id), r.count]));
  const followupsMissedMap = Object.fromEntries(followupsMissedAgg.map((r) => [String(r._id), r.count]));

  const topPerformers = executives
    .map((e) => {
      const idStr      = String(e._id);
      const leads      = perfLeadsMap[idStr]       || 0;
      const conversions = perfConversionsMap[idStr] || 0;
      const convRate   = leads > 0
        ? `${((conversions / leads) * 100).toFixed(1)}%`
        : '0%';
      return {
        id:              idStr,
        name:            e.name,
        email:           e.email,
        phone:           e.phone || '',
        leads,
        conversions,
        convRate,
        followupsDone:   followupsDoneMap[idStr]   || 0,
        followupsMissed: followupsMissedMap[idStr] || 0,
        status:          e.isActive ? 'Active' : 'Inactive',
      };
    })
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 10);

  // ── 11. Recent Leads — last 20 leads assigned to any exec ──
  const recentLeadsRaw = await Lead.find({
    admin:      adminId,
    assignedTo: { $in: execIds },
    isDeleted:  { $ne: true },
  })
    .populate('client', 'name mobile')
    .populate('assignedTo', 'name')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  const LEAD_STATUS_LABEL = {
    UNTOUCHED:  'Pending',
    TALK:       'In Progress',
    INTERESTED: 'In Progress',
    CONVERTED:  'Completed',
    DUMP:       'Failed',
    NOT_TALK:   'Pending',
  };

  const recentLeads = recentLeadsRaw.map((l) => ({
    id:         String(l._id),
    lead:       l.client?.name   || 'Unknown',
    contact:    l.client?.mobile || '',
    assignedTo: l.assignedTo?.name || 'Unassigned',
    status:     LEAD_STATUS_LABEL[l.status] || l.status,
    date:       l.createdAt ? l.createdAt.toISOString().slice(0, 10) : '',
  }));

  // ── 12. Missed Follow-ups — missed reminders with lead+client ──
  const missedRemindersRaw = await Reminder.find({
    admin:    adminId,
    user:     { $in: execIds },
    isMissed: true,
    isDone:   false,
  })
    .populate({ path: 'lead', populate: { path: 'client', select: 'name' } })
    .populate('user', 'name')
    .sort({ remindAt: -1 })
    .limit(20)
    .lean();

  const missedFollowUps = missedRemindersRaw.map((r) => ({
    id:           String(r._id),
    lead:         r.lead?.client?.name || r.title || 'Unknown',
    assignedTo:   r.user?.name || 'Unknown',
    followupDate: r.remindAt ? r.remindAt.toISOString().slice(0, 10) : '',
    status:       'Missed',
  }));

  // ── Final response ──
  return res.status(200).json(
    new ApiResponse(200, {
      kpis: {
        totalLeads,
        convertedLeads,
        conversionRate,
        targetAchievedPct,
        pendingFollowUps,
        missedFollowUps: missedFollowUpsCount,
        activeExecutives,
      },
      leadsTrend,
      conversionFunnel,
      teamPerformance,
      targetVsAchieved,
      followUpStatus,
      topExecutivesRadar,
      exec1Label,
      exec2Label,
      monthlyConversions,
      topPerformers,
      recentLeads,
      missedFollowUps,
    }, 'Dashboard summary retrieved successfully')
  );
});
