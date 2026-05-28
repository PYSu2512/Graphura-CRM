import apiClient from './apiClient';

const apiConfigService = {
  getRazorpayConfig: async () => {
    // baseURL already includes /api
    const response = await apiClient.get('/api-config/razorpay');
    return response.data;
  },

  updateRazorpayConfig: async (configData) => {
    // baseURL already includes /api
    const response = await apiClient.post('/api-config/razorpay', configData);
    return response.data;
  }
};

export default apiConfigService;
