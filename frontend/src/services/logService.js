import apiClient from './apiClient';

const logService = {
  // GET /api/logs/login
  async getLoginLogs() {
    const response = await apiClient.get('/logs/login', { params: { _t: Date.now() } });
    return response.data;
  },

  // GET /api/superadmin/admin-login-logs
  async getAdminLoginLogs() {
    const response = await apiClient.get('/superadmin/admin-login-logs', { params: { _t: Date.now() } });
    return response.data;
  }
};

export default logService;
