/**
 * Sales Team Leader Dashboard Service
 * All API calls for the TL dashboard — fully dynamic, DB-backed.
 */
import apiClient from './apiClient';

const BASE = '/sales-team-leader/dashboard';

export const salesTLDashboardService = {
  /**
   * 8 KPI summary cards
   * Returns: totalCalls, todayCalls, totalProspects, todaySales,
   *          talkRatio, untouchedLeads, dumpCount, followUpMissed,
   *          teamName, executiveCount
   */
  getSummary: () =>
    apiClient.get(`${BASE}/summary`).then((r) => r.data.data),

  /**
   * Area chart — monthly calls & sales for current year
   * Returns: { months: [{ name, calls, sales }] }
   */
  getCallsSalesTrend: () =>
    apiClient.get(`${BASE}/calls-sales-trend`).then((r) => r.data.data),

  /**
   * Pie chart — lead status distribution
   * Returns: { funnel: [{ name, value, percentage }], total }
   */
  getLeadFunnel: () =>
    apiClient.get(`${BASE}/lead-funnel`).then((r) => r.data.data),

  /**
   * Grouped bar chart — per-executive calls, leads, sales
   * Returns: { executives: [{ name, calls, leads, sales }] }
   */
  getExecutivePerformance: () =>
    apiClient.get(`${BASE}/executive-performance`).then((r) => r.data.data),

  /**
   * Line chart — monthly sales count this year
   * Returns: { months: [{ name, sales }] }
   */
  getSalesTrend: () =>
    apiClient.get(`${BASE}/sales-trend`).then((r) => r.data.data),

  /**
   * Paginated leaderboard table
   * @param {object} params - { page, pageSize, search, sortBy, sortDir }
   * Returns: { leaderboard: [...], pagination: { total, page, pageSize, totalPages } }
   */
  getLeaderboard: (params = {}) =>
    apiClient
      .get(`${BASE}/leaderboard`, { params })
      .then((r) => r.data.data),
};
