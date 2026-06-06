/**
 * TICKET SERVICE — Frontend API layer for Support Ticket Management
 * All calls go to /api/support-tickets
 * Uses the shared apiClient (Bearer token auto-attached via interceptor)
 */
import apiClient from './apiClient';

const BASE = '/support-tickets';

// ─── Create a new ticket (auto-routes to next level in hierarchy) ────────────
export const createTicket = async ({ subject, message, priority, category, targetHierarchy }) => {
  const { data } = await apiClient.post(BASE, {
    subject,
    message,
    // Map frontend priority labels to backend enum values
    priority: mapPriorityToBackend(priority),
    refType: category || null,
    targetHierarchy: targetHierarchy || 'ALL',
  });
  return data.data.ticket;
};

// ─── Fetch tickets raised BY the current user ────────────────────────────────
export const getMyRaisedTickets = async ({ page = 1, limit = 50 } = {}) => {
  const { data } = await apiClient.get(BASE, {
    params: { page, limit, view: 'raised' },
  });
  return data.data; // { tickets, pagination }
};

// ─── Fetch tickets ASSIGNED TO the current user (Team Tickets) ───────────────
export const getAssignedTickets = async ({ page = 1, limit = 50 } = {}) => {
  const { data } = await apiClient.get(BASE, {
    params: { page, limit, view: 'assigned' },
  });
  return data.data;
};

// ─── Fetch ALL tickets for current user (both raised + assigned) ─────────────
export const getMyTickets = async ({ page = 1, limit = 50, view } = {}) => {
  const params = { page, limit };
  if (view) params.view = view;
  const { data } = await apiClient.get(BASE, { params });
  return data.data;
};

// ─── Fetch ticket stats (KPI cards) ─────────────────────────────────────────
export const getTicketStats = async () => {
  const { data } = await apiClient.get(`${BASE}/stats`);
  return data.data.stats;
};

// ─── Fetch single ticket by ID ───────────────────────────────────────────────
export const getTicketById = async (ticketId) => {
  const { data } = await apiClient.get(`${BASE}/${ticketId}`);
  return data.data.ticket;
};

// ─── Add a reply to a ticket (only assignee can reply to team tickets) ───────
export const addReply = async (ticketId, message) => {
  const { data } = await apiClient.post(`${BASE}/${ticketId}/reply`, { message });
  return data.data.ticket;
};

// ─── Escalate ticket to next level ──────────────────────────────────────────
export const escalateTicket = async (ticketId, escalationReason = '') => {
  const { data } = await apiClient.post(`${BASE}/${ticketId}/escalate`, { escalationReason });
  return data.data.ticket;
};

// ─── Resolve ticket ──────────────────────────────────────────────────────────
export const resolveTicket = async (ticketId, resolutionMessage = '') => {
  const { data } = await apiClient.post(`${BASE}/${ticketId}/resolve`, { resolutionMessage });
  return data.data.ticket;
};

// ─── Close ticket ────────────────────────────────────────────────────────────
export const closeTicket = async (ticketId, closureNotes = '') => {
  const { data } = await apiClient.post(`${BASE}/${ticketId}/close`, { closureNotes });
  return data.data.ticket;
};

// ─── Update ticket status ───────────────────────────────────────────────────
export const updateTicketStatus = async (ticketId, status, additionalData = {}) => {
  const statusMap = {
    "Open": "OPEN",
    "In Progress": "IN_PROGRESS",
    "Resolved": "RESOLVED",
    "Closed": "CLOSED",
    "Escalated": "ESCALATED",
  };
  const backendStatus = statusMap[status] || status.toUpperCase();
  const { data } = await apiClient.patch(`${BASE}/${ticketId}/status`, {
    status: backendStatus,
    ...additionalData
  });
  return data.data.ticket;
};

// ─── Map frontend priority label → backend enum ──────────────────────────────
export const mapPriorityToBackend = (p) => {
  if (!p) return 'NORMAL';
  const map = {
    low:    'LOW',
    normal: 'NORMAL',
    medium: 'MEDIUM',
    high:   'HIGH',
    urgent: 'URGENT',
  };
  return map[p.toLowerCase()] || p.toUpperCase();
};

// ─── Helper: map backend ticket → frontend display shape ────────────────────
export const mapTicket = (t) => ({
  id:          String(t._id),
  _id:         String(t._id),
  title:       t.subject || '',
  raisedBy:    t.raisedBy?.name  || 'Unknown',
  role:        t.raisedBy?.role  || '',
  priority:    capitalise(t.priority),
  status:      mapStatus(t.status),
  createdDate: t.createdAt ? new Date(t.createdAt).toISOString().slice(0, 10) : '',
  lastReply:   t.updatedAt ? new Date(t.updatedAt).toISOString().slice(0, 10) : '',
  description: t.message || '',
  conversation: (t.replies || []).map((r) => ({
    sender: r.user?.name || 'Unknown',
    time:   r.createdAt
      ? new Date(r.createdAt).toISOString().slice(0, 16).replace('T', ' ')
      : '',
    text:   r.message || '',
  })),
  assignedTo:   t.assignedTo?.name || '',
  assignedToId: t.assignedTo?._id ? String(t.assignedTo._id) : null,
  targetHierarchy: t.targetHierarchy || 'ALL',
});

// ─── Status label mapping (backend → display) ───────────────────────────────
const STATUS_MAP = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Resolved',
  CLOSED:      'Closed',
  ESCALATED:   'Escalated',
};
export const mapStatus = (s) => STATUS_MAP[s] || s;

// ─── Priority capitalise ─────────────────────────────────────────────────────
const capitalise = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
