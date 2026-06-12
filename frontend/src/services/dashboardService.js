import apiClient from './apiClient';

export const dashboardService = {
  // Real admin dashboard stats endpoint
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
  // Legacy alias kept for backwards compatibility
  getStats: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
};
