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

export const getClientLeadById = async (id) => {
  const lead = INITIAL_CLIENT_LEADS.find((item) => item.id === id);
  return Promise.resolve(lead ?? null);
};
