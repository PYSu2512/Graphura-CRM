/**
 * employeeTasksApi.js
 * Centralized API calls for Management Employee.
 */
import apiClient from "../../../../services/apiClient";

const BASE = "/management-employee";

export const fetchStats   = ()              => apiClient.get(`${BASE}/stats`);
export const fetchTasks   = (filter = '')   => apiClient.get(`${BASE}/tasks${filter ? `?filter=${filter}` : ''}`);
export const fetchTask    = (taskId)        => apiClient.get(`${BASE}/tasks/${taskId}`);
export const updateMyTask = (taskId, body)  => apiClient.patch(`${BASE}/tasks/${taskId}`, body);
