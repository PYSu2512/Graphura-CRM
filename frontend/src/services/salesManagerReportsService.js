/**
 * Sales Manager Reports Service
 * All API calls for the SM reports section — fully dynamic, DB-backed.
 * NO revenue fields.
 */
import apiClient from './apiClient';

const BASE = '/sales-manager/reports';

export const salesManagerReportsService = {
  getOverview:    ()           => apiClient.get(`${BASE}/overview`).then((r) => r.data.data),
  getTeams:       (params = {}) => apiClient.get(`${BASE}/teams`,        { params }).then((r) => r.data.data),
  getTeamLeaders: (params = {}) => apiClient.get(`${BASE}/team-leaders`, { params }).then((r) => r.data.data),
  getExecutives:  (params = {}) => apiClient.get(`${BASE}/executives`,   { params }).then((r) => r.data.data),
};
