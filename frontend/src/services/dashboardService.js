import apiClient from './apiClient';

export const dashboardService = {
  getStats: async () => {
    // For now, we reuse the users endpoint to get total users
    // In a real app, you'd have a dedicated /dashboard/stats endpoint
    const response = await apiClient.get('/users');
    return response.data;
  }
};
