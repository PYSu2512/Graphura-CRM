import { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "../../../../services/apiClient";
import { TEAM_LEADERS, MAX_LEADS, INITIAL_DUMP } from "./leadsStore";

const LeadsContext = createContext(null);

export function LeadsProvider({ children }) {
  const [leads,           setLeads]           = useState([]);
  const [dumpData,        setDumpData]        = useState(INITIAL_DUMP);
  const [teamLeaders,     setTeamLeaders]     = useState(TEAM_LEADERS);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState(null);

  // ── Bulk upload state ─────────────────────────────────────────────────────
  const [csvRows,     setCsvRows]     = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [uploadId,    setUploadId]    = useState(null);

  // ── Distribution state ────────────────────────────────────────────────────
  const [distLeads,     setDistLeads]     = useState([]);
  const [distTLs,       setDistTLs]       = useState([]);
  const [distTableRows, setDistTableRows] = useState([]);
  const [distWarning,   setDistWarning]   = useState("");

  // ── Auto-distribute result ────────────────────────────────────────────────
  const [autoDistResult, setAutoDistResult] = useState([]);

  // ── Fetch leads from backend ──────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/sales-manager/leads");
      setLeads(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const addLeads = (newLeads) => setLeads((prev) => [...prev, ...newLeads]);

  const assignLead = async (leadId, userId) => {
    try {
      await apiClient.post(`/sales-manager/leads/${leadId}/assign`, { userId });
      await fetchLeads();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateLead = (updated) => {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  };

  const moveToDump = (lead) => {
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setDumpData((prev) => [
      ...prev,
      {
        id:         lead.id,
        name:       lead.name,
        mobile:     lead.mobile,
        email:      lead.email,
        dumpReason: "Moved by Manager",
        dumpedBy:   "Sales Manager",
        dumpDate:   new Date().toISOString().split("T")[0],
      },
    ]);
  };

  const reassignFromDump = (dumpRow, tlName) => {
    setLeads((prev) => [
      ...prev,
      {
        id:          dumpRow.id,
        name:        dumpRow.name,
        mobile:      dumpRow.mobile,
        email:       dumpRow.email,
        status:      "New",
        assignedTo:  tlName,
        createdAt:   new Date().toISOString().split("T")[0],
        assignedAt:  new Date().toISOString().split("T")[0],
      },
    ]);
    setDumpData((prev) => prev.filter((d) => d.id !== dumpRow.id));
    return { error: null };
  };

  const deleteDumpRow = async (id) => {
    try {
      await apiClient.delete(`/sales-manager/leads/${id}`);
      setDumpData((prev) => prev.filter((d) => d.id !== id));
      await fetchLeads(); // Refresh leads count
      return { success: true };
    } catch (err) {
      console.error("Delete failed:", err);
      return { success: false, error: err.message };
    }
  };

  return (
    <LeadsContext.Provider value={{
      leads, setLeads, addLeads, updateLead, assignLead,
      dumpData, moveToDump, reassignFromDump, deleteDumpRow,
      teamLeaders, MAX_LEADS,
      selectedLeadIds, setSelectedLeadIds,
      csvRows, setCsvRows, csvFileName, setCsvFileName,
      uploadId, setUploadId,
      distLeads, distTLs, distTableRows, distWarning, setDistWarning,
      autoDistResult, setAutoDistResult,
      fetchLeads, loading, error,
    }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error("useLeads must be used inside <LeadsProvider>");
  return ctx;
}
