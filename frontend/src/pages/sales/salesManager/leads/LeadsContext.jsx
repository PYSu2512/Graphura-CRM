import { createContext, useContext, useState, useEffect, useCallback } from "react";
import apiClient from "../../../../services/apiClient";
import { TEAM_LEADERS, MAX_LEADS, INITIAL_DUMP } from "./leadsStore";
import { teamService } from "../../../../services/teamService";

const LeadsContext = createContext(null);

export function LeadsProvider({ children }) {
  const [leads,           setLeads]           = useState([]);
  const [assignedLeads,   setAssignedLeads]    = useState([]);
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

  const mapAssignmentTarget = (target) => ({
    _id: target.id,
    id: target.id,
    name: target.name,
    email: target.email,
    role: target.role,
    currentLeads: target.currentAssigned,
    effectiveLimit: target.effectiveLimit,
    capacity: target.remaining,
  });

  // ── Fetch leads from backend ──────────────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/sales-manager/leads");
      const rows = response.data.data || [];
      setLeads(rows);
      setError(null);
      return rows;
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignedLeads = useCallback(async () => {
    try {
      const response = await apiClient.get("/sales-manager/leads/assigned");
      const rows = response.data.data || [];
      setAssignedLeads(rows);
      return rows;
    } catch (err) {
      console.error("Failed to fetch assigned leads:", err);
      setError(err.message);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchAssignedLeads();
  }, [fetchLeads, fetchAssignedLeads]);

  const fetchAssignmentTargets = useCallback(async (role = "SALES_TL") => {
    try {
      const response = await teamService.getLeadAssignmentTargets(role);
      const targets = response?.data?.targets || response?.targets || [];
      const mapped = targets.map(mapAssignmentTarget);
      setTeamLeaders(mapped);
      return { success: true, targets: mapped };
    } catch (err) {
      console.error("Failed to fetch assignment targets:", err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const addLeads = (newLeads) => setLeads((prev) => [...prev, ...newLeads]);

  const assignLead = async (leadId, userId, reason = null) => {
    try {
      await apiClient.post(`/sales-manager/leads/${leadId}/assign`, { userId, reason });
      await fetchLeads();
      await fetchAssignedLeads();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const assignBulkLeads = async (leadIds, userId, reason = null) => {
    try {
      const response = await teamService.assignLeadsToUser({ leadIds, userId, reason });
      await fetchLeads();
      await fetchAssignedLeads();
      await fetchAssignmentTargets();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message, data: err.data || null };
    }
  };

  const distributeLeads = async (assignments) => {
    try {
      const response = await teamService.assignBulkLeads({ assignments });
      await fetchLeads();
      await fetchAssignedLeads();
      await fetchAssignmentTargets();
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message, data: err.data || null };
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
      leads, setLeads, assignedLeads, setAssignedLeads, addLeads, updateLead, assignLead,
      dumpData, moveToDump, reassignFromDump, deleteDumpRow,
      teamLeaders, MAX_LEADS,
      selectedLeadIds, setSelectedLeadIds,
      csvRows, setCsvRows, csvFileName, setCsvFileName,
      uploadId, setUploadId,
      distLeads, distTLs, distTableRows, distWarning, setDistWarning,
      autoDistResult, setAutoDistResult,
      fetchLeads, fetchAssignedLeads, fetchAssignmentTargets, assignBulkLeads, distributeLeads, loading, error,
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
