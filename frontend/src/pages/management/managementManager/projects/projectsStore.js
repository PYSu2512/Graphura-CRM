// projectsStore.js
// Helpers and shared constants for the Projects page.
// Canonical project rows live in `../managementManagerStore.js` — do NOT redefine.

import {
  projects,
  ACTIVE_STATUSES,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
} from "../managementManagerStore";

export {
  projects,
  ACTIVE_STATUSES,
  PROJECT_STATUSES,
  PROJECT_PRIORITIES,
};

// Columns reused by the All Projects DataTable.
export const PROJECT_COLS = [
  { key: "id",             label: "ID" },
  { key: "name",           label: "Project" },
  { key: "clientName",     label: "Client" },
  { key: "assignedTLName", label: "Team Leader" },
  { key: "deadline",       label: "Deadline" },
  { key: "progress",       label: "Progress" },
  { key: "priority",       label: "Priority" },
  { key: "status",         label: "Status" },
];

// "Mark Completed" gate — see TEAM_GUIDE.md Appendix B.
// Returns the list of missing mandatory fields. Empty array = OK to complete.
export function deliveryBlockedReasons(project) {
  const missing = [];
  if (!project.driveLink)    missing.push("Project details drive link");
  if (!project.handoverLink) missing.push("Final handover link");
  return missing;
}

// Returns the table-friendly version of a project row (progress as "%").
export function asTableRow(p) {
  return {
    ...p,
    progress: `${p.progress}%`,
  };
}
