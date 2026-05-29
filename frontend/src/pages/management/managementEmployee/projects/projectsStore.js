// projectsStore.js
// Helpers and shared constants for the My Projects page.
// Canonical project rows live in `../managementEmployeeStore.js` — do NOT redefine.

import {
  myProjects,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  ME_ALLOWED_STATUSES,
  ACTIVE_STATUSES,
  canUpdateStatus,
} from "../managementEmployeeStore";

export {
  myProjects,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
  ME_ALLOWED_STATUSES,
  ACTIVE_STATUSES,
  canUpdateStatus,
};

// Columns for the My Projects DataTable.
// "My TL" replaces MM's "Team Leader" — the ME has exactly one TL, shown read-only.
export const PROJECT_COLS = [
  { key: "id",             label: "ID" },
  { key: "name",           label: "Project" },
  { key: "clientName",     label: "Client" },
  { key: "assignedTLName", label: "My TL" },
  { key: "deadline",       label: "Deadline" },
  { key: "progress",       label: "Progress" },
  { key: "priority",       label: "Priority" },
  { key: "status",         label: "Status" },
];

// Table-friendly row (progress rendered as "N%").
export function asTableRow(p) {
  return { ...p, progress: `${p.progress}%` };
}

// "Why can't I update this?" reason — used by the status-blocked modal.
export function statusBlockedReason(project) {
  return `Status is currently "${project.status}". Your Team Leader or Manager owns this transition — you can only switch between ${ME_ALLOWED_STATUSES.join(" and ")}.`;
}
