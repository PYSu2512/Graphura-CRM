/**
 * ANNOUNCEMENT SERVICE
 * All API calls for announcements (sender side) and notification bell (receiver side).
 */
import apiClient from './apiClient';

// ─────────────────────────────────────────────────────────────
// SENDER SIDE (Sales Manager / Sales TL / Admin)
// ─────────────────────────────────────────────────────────────

/** Fetch message types and audience options for the current user's role */
export const fetchAnnouncementMeta = async () => {
  const { data } = await apiClient.get('/announcements/meta');
  return data.data; // { messageTypes, audienceOptions }
};

/** Fetch selectable targets for a given audience */
export const fetchAnnouncementTargets = async (audience) => {
  const { data } = await apiClient.get('/announcements/targets', {
    params: { audience },
  });
  return data.data; // { audience, targets }
};

/** Create / send a new announcement */
export const createAnnouncement = async (payload) => {
  const { data } = await apiClient.post('/announcements', payload);
  return data.data.announcement;
};

/** Fetch announcement history (paginated) */
export const fetchAnnouncements = async ({ page = 1, limit = 20 } = {}) => {
  const { data } = await apiClient.get('/announcements', {
    params: { page, limit },
  });
  return data.data; // { announcements, total, page, pages }
};

// ─────────────────────────────────────────────────────────────
// RECEIVER SIDE (Sales TL / Sales Executive — notification bell)
// ─────────────────────────────────────────────────────────────

/** Fetch announcements visible to the logged-in user (for bell dropdown) */
export const fetchMyAnnouncements = async ({ page = 1, limit = 20 } = {}) => {
  const { data } = await apiClient.get('/notifications/announcements', {
    params: { page, limit },
  });
  return data.data; // { announcements, unreadCount, total, page, pages }
};

/** Get unread count only (lightweight — for badge) */
export const fetchUnreadCount = async () => {
  const { data } = await apiClient.get('/notifications/unread-count');
  return data.data.unreadCount ?? 0;
};

/** Mark a single announcement as read */
export const markAnnouncementRead = async (announcementId) => {
  const { data } = await apiClient.patch(
    `/notifications/announcements/${announcementId}/read`
  );
  return data.data;
};

/** Mark all announcements as read */
export const markAllRead = async () => {
  const { data } = await apiClient.patch('/notifications/announcements/read-all');
  return data.data;
};
