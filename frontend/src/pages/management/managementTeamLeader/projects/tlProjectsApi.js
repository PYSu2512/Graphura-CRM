/**
 * tlProjectsApi.js
 * Centralized API calls for Management TL → Projects & Tasks.
 */
import apiClient from "../../../../services/apiClient";

const BASE = "/management-tl";

// ── Projects ──────────────────────────────────────────────────────────────────
export const fetchMyProjects   = ()       => apiClient.get(`${BASE}/projects`);
export const fetchProject      = (id)     => apiClient.get(`${BASE}/projects/${id}`);
export const fetchProjectTasks = (id)     => apiClient.get(`${BASE}/projects/${id}/tasks`);
export const fetchFormData     = ()       => apiClient.get(`${BASE}/projects/form-data`);

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const fetchAllTasks  = ()          => apiClient.get(`${BASE}/tasks`);
export const createTask     = (projectId, body) => apiClient.post(`${BASE}/projects/${projectId}/tasks`, body);
export const updateTask     = (taskId, body)    => apiClient.put(`${BASE}/tasks/${taskId}`, body);
export const deleteTask     = (taskId)          => apiClient.delete(`${BASE}/tasks/${taskId}`);
