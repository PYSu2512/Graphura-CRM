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
  }
};
