import axios from "axios";

// Mock Data Fallback
const MOCK_PROSPECTS = [
  { id: "1", name: "Ravi Sharma", phone: "9876543210", email: "ravi.sharma@example.com", company: "Tech Corp India", city: "Mumbai", source: "Website", status: "Interested", dealValue: "50000", followUpDate: "2026-05-02" },
  { id: "2", name: "Priya Singh", phone: "9123456789", email: "priya.s@example.com", company: "Global Trade LLC", city: "Delhi", source: "Referral", status: "New", dealValue: "120000", followUpDate: "2026-05-05" },
  { id: "3", name: "Amit Patel", phone: "9812345670", email: "amit.p@example.com", company: "Retail Chain Pvt", city: "Ahmedabad", source: "Facebook", status: "Proposal", dealValue: "30000", followUpDate: "2026-05-03" },
  { id: "4", name: "Neha Gupta", phone: "9988776655", email: "neha.g@example.com", company: "Service Hub", city: "Bangalore", source: "LinkedIn", status: "Completed", dealValue: "85000", followUpDate: "2026-05-10" },
];

export const getProspects = async () => {
  try {
    const response = await axios.get("/api/prospects");
    return response.data;
  } catch (error) {
    console.warn("API Error (GET /prospects), using mock data", error);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return MOCK_PROSPECTS;
  }
};

export const getProspectById = async (id) => {
  try {
    const response = await axios.get(`/api/prospects/${id}`);
    return response.data;
  } catch (error) {
    console.warn(`API Error (GET /prospects/${id}), using mock data`, error);
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_PROSPECTS.find(p => p.id === id) || MOCK_PROSPECTS[0];
  }
};

export const createProspect = async (data) => {
  try {
    const response = await axios.post("/api/prospects", data);
    return response.data;
  } catch (error) {
    console.warn("API Error (POST /prospects), simulating success", error);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { ...data, id: Date.now().toString() };
  }
};

export const updateProspect = async (id, data) => {
  try {
    const response = await axios.put(`/api/prospects/${id}`, data);
    return response.data;
  } catch (error) {
    console.warn(`API Error (PUT /prospects/${id}), simulating success`, error);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { id, ...data };
  }
};
