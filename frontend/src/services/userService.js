import apiClient from './apiClient';

export const userService = {
  getMe: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },
  getRoleDepartmentMap: async () => {
    const response = await apiClient.get('/users/meta/role-department-map');
    return response.data;
  },
  getUsers: async (params = {}) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  getDepartments: async () => {
    const response = await apiClient.get('/users/departments');
    return response.data;
  },
  createDepartment: async (deptData) => {
    const response = await apiClient.post('/users/departments', deptData);
    return response.data;
  },
  updateDepartment: async (id, deptData) => {
    const response = await apiClient.put(`/users/departments/${id}`, deptData);
    return response.data;
  },
  deleteDepartment: async (id) => {
    const response = await apiClient.delete(`/users/departments/${id}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  uploadBulkUsers: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('skipDuplicates', String(options.skipDuplicates ?? true));
    formData.append('strictMode', String(options.strictMode ?? false));

    const response = await apiClient.post('/users/bulk/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
    return response.data;
  },
  commitBulkUsers: async (uploadId, importMode = 'VALID_ONLY') => {
    const response = await apiClient.post(
      `/users/bulk/${uploadId}/commit`,
      { confirm: true, importMode },
      { timeout: 60000 },
    );
    return response.data;
  },
  getUserStats: async (params = {}) => {
    const response = await apiClient.get('/users/stats', { params });
    return response.data;
  },
  setupAccount: async (data) => {
    const response = await apiClient.patch('/users/setup-account', data);
    return response.data;
  },
  saveBankDetails: async (data) => {
    const response = await apiClient.patch('/users/bank-details', data);
  setupAccount: async (setupData) => {
    const response = await apiClient.patch('/users/setup-account', setupData);
    return response.data;
  },
  updateBankDetails: async (bankData) => {
    const response = await apiClient.patch('/users/update-bank-details', bankData);
    return response.data;
  },
};
