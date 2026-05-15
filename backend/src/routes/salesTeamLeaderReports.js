'use strict';

/**
 * SALES TEAM LEADER REPORTS ROUTES
 * Base path: /api/sales-team-leader/reports
 *
 * All routes require:
 *  - Valid JWT (requireUser middleware)
 *  - Role: SALES_TL (enforced inside each controller)
 */

const express         = require('express');
const router          = express.Router();
const { requireUser } = require('../middleware/auth');
const ctrl            = require('../controllers/salesTeamLeaderReports.controller');

// Apply auth middleware to all report routes
router.use(requireUser);

/**
 * GET /api/sales-team-leader/reports/overview
 * Team KPIs + chart data (callsVsSales, leadsVsProspects, execPerformance, leadStatusBreakdown)
 */
router.get('/overview', ctrl.getOverview);

/**
 * GET /api/sales-team-leader/reports/daily
 * TL's own daily report (self only)
 * Query: date (YYYY-MM-DD), page, pageSize
 */
router.get('/daily', ctrl.getDaily);

/**
 * GET /api/sales-team-leader/reports/weekly
 * Team weekly aggregated report
 * Query: weeks, page, pageSize
 */
router.get('/weekly', ctrl.getWeekly);

/**
 * GET /api/sales-team-leader/reports/executive
 * Per-executive report for TL's team
 * Query: page, pageSize, search, sortBy, sortDir
 */
router.get('/executive', ctrl.getExecutive);

/**
 * GET /api/sales-team-leader/reports/self
 * TL's own today summary (used by daily report today card)
 */
router.get('/self', ctrl.getSelf);

module.exports = router;
