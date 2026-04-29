import apiClient from './apiClient';

export const userService = {
  getRoleDepartmentMap: async () => {
    const response = await apiClient.get('/users/meta/role-department-map');
    return response.data;
  },
  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  getDepartments: async () => {
    const response = await apiClient.get('/users/departments');
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
};
