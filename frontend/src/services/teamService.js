import apiClient from './apiClient';

const base = '/teams/user-teams';
const leadBase = '/sales-manager/leads';

export const teamService = {
  getAvailableLeaders: async (departmentId) => {
    const response = await apiClient.get(`${base}/available-leaders/${departmentId}`);
    return response.data;
  },
  getAvailableMembers: async (teamId) => {
    const response = await apiClient.get(`${base}/${teamId}/available-members`);
    return response.data;
  },
  getLeaderEmployees: async (leaderId) => {
    const response = await apiClient.get(`${base}/leader/${leaderId}/employees`);
    return response.data;
  },
  createTeam: async (payload) => {
    const response = await apiClient.post(`${base}`, payload);
    return response.data;
  },
  getUserTeams: async () => {
    const response = await apiClient.get(`${base}`);
    return response.data;
  },
  getTeamById: async (teamId) => {
    const response = await apiClient.get(`${base}/${teamId}`);
    return response.data;
  },
  updateTeam: async (teamId, payload) => {
    const response = await apiClient.put(`${base}/${teamId}`, payload);
    return response.data;
  },
  deleteTeam: async (teamId) => {
    const response = await apiClient.delete(`${base}/${teamId}`);
    return response.data;
  },
  addTeamMember: async (teamId, userId) => {
    const response = await apiClient.post(`${base}/${teamId}/members`, { userId });
    return response.data;
  },
  removeTeamMember: async (teamId, userId) => {
    const response = await apiClient.delete(`${base}/${teamId}/members/${userId}`);
    return response.data;
  },
  getLeadAssignmentTargets: async (role = 'SALES_TL') => {
    const response = await apiClient.get(`${leadBase}/assignment-targets`, {
      params: { role },
    });
    return response.data;
  },
  assignBulkLeads: async (payload) => {
    const response = await apiClient.post(`${leadBase}/bulk/distribute`, payload);
    return response.data;
  },
  assignLeadsToUser: async (payload) => {
    const response = await apiClient.post(`${leadBase}/bulk/transfer`, payload);
    return response.data;
  },
  assignBatchLeads: async (uploadId, payload) => {
    const response = await apiClient.post(`${leadBase}/bulk/${uploadId}/assign-batch`, payload);
    return response.data;
  },
};
