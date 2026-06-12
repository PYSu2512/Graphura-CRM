/**
 * SUPER ADMIN SERVICE — API layer for Super Admin operations
 */
import apiClient from "./apiClient";

const BASE = "/superadmin";

export const getAllAdmins = async (params = {}) => {
  const { data } = await apiClient.get(`${BASE}/admins`, { params });
  return data.data;
};

export const createAdmin = async (adminData) => {
  const { data } = await apiClient.post(`${BASE}/admins`, adminData);
  return data.data;
};

export const getAdminById = async (id) => {
  const { data } = await apiClient.get(`${BASE}/admins/${id}`);
  return data.data;
};

export const toggleAdminStatus = async (id, isActive) => {
  const { data } = await apiClient.patch(`${BASE}/admins/${id}/status`, {
    isActive,
  });
  return data.data;
};

// ─── Support Tickets ────────────────────────────────────────────────────────
export const getSupportTickets = async (params = {}) => {
  const { data } = await apiClient.get(`${BASE}/support-tickets`, { params });
  return data.data;
};

export const updateTicketStatus = async (
  id,
  status,
  resolutionMessage = "",
) => {
  const { data } = await apiClient.patch(
    `${BASE}/support-tickets/${id}/status`,
    {
      status,
      resolutionMessage,
    },
  );
  return data.data;
};

export const getAdminLoginLogs = async () => {
  const { data } = await apiClient.get(`${BASE}/admin-login-logs`);
  return data.data;
};

export const fetchSuperAdminAnnouncementMeta = async () => {
  const { data } = await apiClient.get(`${BASE}/announcements/meta`);
  return data.data;
};

export const fetchSuperAdminAnnouncementTargets = async (audience = "Admin") => {
  const { data } = await apiClient.get(`${BASE}/announcements/targets`, {
    params: { audience },
  });
  return data.data;
};

export const createSuperAdminAnnouncement = async (payload) => {
  const { data } = await apiClient.post(`${BASE}/announcements`, payload);
  return data.data.announcement;
};

export const fetchSuperAdminAnnouncements = async () => {
  const { data } = await apiClient.get(`${BASE}/announcements`);
  return data.data;
};

// ─── Profile ────────────────────────────────────────────────────────────────
export const getSuperAdminProfile = async () => {
  const { data } = await apiClient.get(`${BASE}/me`);
  return data.data;
};

export const updateSuperAdminProfile = async (profileData) => {
  console.log("Updating super admin:", profileData);

  const { data } = await apiClient.patch(`${BASE}/me`, profileData);

  console.log("Response:", data);

  return data.data;
};
