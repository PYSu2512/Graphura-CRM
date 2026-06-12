import apiClient from "../../../../../services/apiClient";
import { INITIAL_CLIENT_LEADS } from "../utils/leadConstants";

/**
 * Production-level API client for Sales Executive leads
 * Fetches leads assigned to the current user from the backend
 * 
 * @returns {Promise<Array>} Transformed leads with stats from backend
 * @throws {Error} If the API call fails
 */
export const fetchClientLeads = async (useReal = true) => {
  try {
    // Production: Fetch from backend
    if (useReal) {
      const response = await apiClient.get("/sales-executive/leads");

      if (response.data && response.data.data) {
        const { leads = [] } = response.data.data;
        return leads;
      }

      throw new Error("Invalid server response for leads");
    }
    
    // Fallback: Return mock data
    return Promise.resolve([...INITIAL_CLIENT_LEADS]);
  } catch (error) {
    console.error("Error fetching client leads:", error);
    
    // Log detailed error for debugging
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    } else if (error.request) {
      console.error("Request made but no response:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    
    throw error;
  }
};

/**
 * Update lead status
 * POST /api/sales-executive/leads/:leadId/status
 * 
 * @param {string} leadId - Lead ID to update
 * @param {string} status - New status (TALK, INTERESTED, NOT_TALK, DUMPED)
 * @param {string} [comment] - Optional comment for this status change
 * @param {number} [duration] - Optional call duration in minutes
 * @returns {Promise<Object>} Updated lead data
 * @throws {Error} If the API call fails
 */
export const updateLeadStatus = async (leadId, status, comment = null, duration = 0) => {
  try {
    const payload = { status };
    if (comment) payload.comment = comment;
    if (duration > 0) payload.duration = duration;

    const response = await apiClient.post(`/sales-executive/leads/${leadId}/status`, payload);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error("Invalid server response for status update");
  } catch (error) {
    console.error(`Error updating lead ${leadId} status:`, error);
    throw error;
  }
};

/**
 * Save prospect form for an interested lead
 * POST /api/sales-executive/leads/:leadId/prospect
 */
export const createLeadProspect = async (leadId, prospectForm) => {
  try {
    const response = await apiClient.post(`/sales-executive/leads/${leadId}/prospect`, prospectForm);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error("Invalid server response for prospect form save");
  } catch (error) {
    console.error(`Error saving prospect form for lead ${leadId}:`, error);
    throw error;
  }
};

/**
 * Add comment to lead with optional follow-up date
 * POST /api/sales-executive/leads/:leadId/comment
 * 
 * @param {string} leadId - Lead ID to add comment to
 * @param {string} comment - Comment text (max 1000 chars)
 * @param {string} [nextFollowUpDate] - Optional ISO date string for follow-up
 * @returns {Promise<Object>} Created activity data
 * @throws {Error} If the API call fails
 */
export const addLeadComment = async (leadId, comment, nextFollowUpDate = null) => {
  try {
    const payload = { comment };
    if (nextFollowUpDate) payload.nextFollowUpDate = nextFollowUpDate;

    const response = await apiClient.post(`/sales-executive/leads/${leadId}/comment`, payload);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error("Invalid server response for comment creation");
  } catch (error) {
    console.error(`Error adding comment to lead ${leadId}:`, error);
    throw error;
  }
};

/**
 * Set reminder/follow-up date for lead
 * POST /api/sales-executive/leads/:leadId/reminder
 * 
 * @param {string} leadId - Lead ID to set reminder for
 * @param {string} reminderDate - ISO date/time string for reminder
 * @param {string} [description] - Optional reminder description (max 500 chars)
 * @returns {Promise<Object>} Created reminder data
 * @throws {Error} If the API call fails
 */
export const setLeadReminder = async (leadId, reminderDate, description = null) => {
  try {
    const payload = { reminderDate };
    if (description) payload.description = description;

    const response = await apiClient.post(`/sales-executive/leads/${leadId}/reminder`, payload);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error("Invalid server response for reminder creation");
  } catch (error) {
    console.error(`Error setting reminder for lead ${leadId}:`, error);
    throw error;
  }
};

export const getClientLeadById = async (id) => {
  const lead = INITIAL_CLIENT_LEADS.find((item) => item.id === id);
  return Promise.resolve(lead ?? null);
};

/**
 * Mark lead as Won (CONVERTED)
 * Calls the status update endpoint with CONVERTED status.
 * POST /api/sales-executive/leads/:leadId/status  { status: 'CONVERTED' }
 *
 * @param {string} leadId - Lead ID to mark as won
 * @param {string} [comment] - Optional note
 * @returns {Promise<Object>} Updated lead data
 * @throws {Error} If the API call fails
 */
export const markLeadAsWon = async (leadId, comment = null) => {
  try {
    const payload = { status: 'CONVERTED' };
    if (comment) payload.comment = comment;

    const response = await apiClient.post(`/sales-executive/leads/${leadId}/status`, payload);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error('Invalid server response for mark as won');
  } catch (error) {
    console.error(`Error marking lead ${leadId} as won:`, error);
    throw error;
  }
};

