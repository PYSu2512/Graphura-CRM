/**
 * API CLIENT — Centralized Axios configuration for frontend
 * Handles base URL, token management, error handling, interceptors
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// ────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR — Add auth token
// ────────────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Look for accessToken only in sessionStorage
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR — Handle errors globally
// ────────────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, message } = error;
    const skipAuthRedirect = Boolean(error?.config?.skipAuthRedirect);

    if (response?.status === 401 && !skipAuthRedirect) {
      // Unauthorized — clear storage and redirect to login
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('admin');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject({
      statusCode: response?.status || 500,
      message: response?.data?.message || message || 'An error occurred',
      data: response?.data,
      error,
    });
  }
);

export default apiClient;
