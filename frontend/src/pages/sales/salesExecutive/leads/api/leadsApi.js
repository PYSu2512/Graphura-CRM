import { INITIAL_CLIENT_LEADS } from "../utils/leadConstants";

export const fetchClientLeads = async () => {
  return Promise.resolve([...INITIAL_CLIENT_LEADS]);
};

export const getClientLeadById = async (id) => {
  const lead = INITIAL_CLIENT_LEADS.find((item) => item.id === id);
  return Promise.resolve(lead ?? null);
};
