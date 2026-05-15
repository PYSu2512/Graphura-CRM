/**
 * Sales Team Leader Reports Service
 * All API calls for the TL reports section — fully dynamic, DB-backed.
 * NO revenue fields.
 */
import apiClient from './apiClient';

const BASE = '/sales-team-leader/reports';

export const salesTLReportsService = {
  /**
   * Team overview KPIs + chart data
   * Returns: { kpis, callsVsSales, leadsVsProspects, execPerformance, leadStatusBreakdown }
   */
  getOverview: () =>
    apiClient.get(`${BASE}/overview`).then((r) => r.data.data),

  /**
   * TL's own daily report (self only)
   * @param {object} params - { date, page, pageSize }
   * Returns: { today, history, pagination }
   */
  getDaily: (params = {}) =>
    apiClient.get(`${BASE}/daily`, { params }).then((r) => r.data.data),

  /**
   * Team weekly aggregated report
   * @param {object} params - { weeks, page, pageSize }
   * Returns: { currentWeek, trend, history, pagination }
   */
  getWeekly: (params = {}) =>
    apiClient.get(`${BASE}/weekly`, { params }).then((r) => r.data.data),

  /**
   * Per-executive report for TL's team
   * @param {object} params - { page, pageSize, search, sortBy, sortDir }
   * Returns: { executives, pagination }
   */
  getExecutive: (params = {}) =>
    apiClient.get(`${BASE}/executive`, { params }).then((r) => r.data.data),

  /**
   * TL's own today summary
   * Returns: { totalCalls, todayCalls, todayProspects, todaySells, todayDump, totalUntouched }
   */
  getSelf: () =>
    apiClient.get(`${BASE}/self`).then((r) => r.data.data),
};
