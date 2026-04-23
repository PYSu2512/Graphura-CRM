/**
 * AUTH API SERVICE — Frontend API functions for authentication
 * Handles all auth-related API calls (registration, OTP, login, etc.)
 */
import apiClient from './apiClient';

/**
 * Step 1: Send OTP to email
 * @param {string} email - User email
 * @param {string} adminName - Admin name for personalization
 * @returns {Promise<Object>} Response from server
 */
export const sendOTP = async (email, adminName) => {
  try {
    const response = await apiClient.post('/auth/send-otp', {
      email,
      adminName,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Step 2: Verify OTP
 * @param {string} email - User email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise<Object>} Response from server
 */
export const verifyOTP = async (email, otp) => {
  try {
    const response = await apiClient.post('/auth/verify-otp', {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Step 3: Complete registration and create admin account
 * @param {Object} registrationData - Registration form data
 * @returns {Promise<Object>} Response with tokens and admin data
 */
export const registerAdmin = async (registrationData) => {
  try {
    const response = await apiClient.post('/auth/register', registrationData);
    
    // Store tokens in localStorage
    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Resend OTP to email
 * @param {string} email - User email
 * @param {string} adminName - Admin name
 * @returns {Promise<Object>} Response from server
 */
export const resendOTP = async (email, adminName) => {
  try {
    const response = await apiClient.post('/auth/resend-otp', {
      email,
      adminName,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Admin login
 * @param {Object} payload - { email, password, latitude, longitude, rememberMe? }
 * @returns {Promise<Object>} Response with tokens and admin profile
 */
export const loginAdmin = async (payload) => {
  try {
    const response = await apiClient.post('/auth/login', payload, {
      skipAuthRedirect: true,
    });

    if (response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('admin', JSON.stringify(response.data.data.admin));
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout — Clear tokens
 */
export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('admin');
};
