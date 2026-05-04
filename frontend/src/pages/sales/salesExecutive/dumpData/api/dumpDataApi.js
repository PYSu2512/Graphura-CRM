import { INITIAL_LEADS } from "../utils/dumpDataConstants";

export const fetchDumpDataLeads = async () => {
  return Promise.resolve([...INITIAL_LEADS]);
};
