'use strict';

/**
 * SALES TEAM LEADER DASHBOARD ROUTES
 * Base path: /api/sales-team-leader/dashboard
 *
 * All routes require:
 *  - Valid JWT (requireUser middleware)
 *  - Role: SALES_TL (enforced inside each controller)
 */

const express         = require('express');
const router          = express.Router();
const { requireUser } = require('../middleware/auth');
const ctrl            = require('../controllers/salesTeamLeaderDashboard.controller');

// Apply auth middleware to all dashboard routes
router.use(requireUser);

/**
 * GET /api/sales-team-leader/dashboard/summary
 * 8 KPI cards: totalCalls, todayCalls, totalProspects, todaySales,
 *              talkRatio, untouchedLeads, dumpCount, followUpMissed
 */
router.get('/summary', ctrl.getSummary);

/**
 * GET /api/sales-team-leader/dashboard/calls-sales-trend
 * Area chart: monthly calls & sales for current year
 */
router.get('/calls-sales-trend', ctrl.getCallsSalesTrend);

/**
 * GET /api/sales-team-leader/dashboard/lead-funnel
 * Pie chart: lead status distribution for team
 */
router.get('/lead-funnel', ctrl.getLeadFunnel);

/**
 * GET /api/sales-team-leader/dashboard/executive-performance
 * Grouped bar chart: calls, leads, sales per executive
 */
router.get('/executive-performance', ctrl.getExecutivePerformance);

/**
 * GET /api/sales-team-leader/dashboard/sales-trend
 * Line chart: monthly sales count this year
 */
router.get('/sales-trend', ctrl.getSalesTrend);

/**
 * GET /api/sales-team-leader/dashboard/leaderboard
 * Paginated data table with executive rankings
 * Query: page, pageSize, search, sortBy, sortDir
 */
router.get('/leaderboard', ctrl.getLeaderboard);

module.exports = router;
