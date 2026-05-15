import apiClient from './apiClient';

const BASE = '/sales-manager/dashboard';

export const salesManagerDashboardService = {
  getSummary: () => apiClient.get(`${BASE}/summary`).then((r) => r.data.data),
};
