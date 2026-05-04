import apiClient from './apiClient';

const base = '/teams/user-teams';

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
  addTeamMember: async (teamId, userId) => {
    const response = await apiClient.post(`${base}/${teamId}/members`, { userId });
    return response.data;
  },
};
