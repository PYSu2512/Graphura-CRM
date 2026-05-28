import apiClient from './apiClient';

export const getProfile = async () => {
  const response = await apiClient.get('/admin/profile');
  return response.data;
};
