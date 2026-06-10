/**
 * managementManagerStore.js
 *
 * ── MIGRATION STATUS ─────────────────────────────────────────────────────────
 * All live data (projects, clients, team leaders, employees) is now fetched
 * from the backend API. Mock arrays have been removed.
 *
 * What remains here:
 *   • Static UI constants (status lists, priority lists)
 *   • Helpers that do NOT depend on mock data
 *
 * Files that previously imported mock `projects` from here
 * (TeamLeaders.jsx, Employees.jsx) now receive live data as props.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Status / Priority enums (used across components) ────────────────────────
export const ACTIVE_STATUSES    = ["In Progress", "Work Started", "Review Stage", "Finalization"];
export const PROJECT_STATUSES   = [
  "Not Started", "Work Started", "In Progress",
  "Review Stage", "Finalization", "Completed", "Delivered", "Delayed",
];
export const PROJECT_PRIORITIES = ["High", "Medium", "Low", "Urgent"];

// ─── Empty/safe fallbacks — kept so that stale imports don't crash at runtime.
//     Remove these once all downstream files are migrated to API data. ────────

/** @deprecated Use auth context instead */
export const currentMM = {
  id: "",
  name: "Management Manager",
  email: "",
  department: "Management",
};

/** @deprecated Use live API data instead */
export const projects    = [];
/** @deprecated Use live API data instead */
export const teamLeaders = [];
/** @deprecated Use live API data instead */
export const employees   = [];
/** @deprecated Use live API data instead */
export const clientList  = [];

// ─── Dashboard chart helpers (no mock data needed) ───────────────────────────
// These are computed server-side; the frontend just renders what the API returns.
// Kept here as empty defaults so destructuring in legacy components doesn't crash.
export const dashboardKPIs       = [];
export const projectStatusFunnel = [];
export const monthlyDelivery     = [];
export const tlLoad              = [];
export const recentProjects      = [];

// ─── Pure helpers ─────────────────────────────────────────────────────────────
export const employeesForTL = (tlId, empList = []) =>
  empList.filter((e) => e.teamLeaderId === tlId);

export const employeeName = (id, empList = []) =>
  empList.find((e) => (e.id || String(e._id)) === id)?.name ?? id;
