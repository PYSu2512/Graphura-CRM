// targetsStore.js
// Dummy targets data for the TL Targets page.
// Targets are scoped to the TL's own team — no other teams visible.

export const kpiTargets = [
  { title: "Total Targets",    value: "12", accent: "#3b82f6" },
  { title: "Achieved Targets", value: "5",  accent: "#22c55e" },
  { title: "Pending Targets",  value: "5",  accent: "#f59e0b" },
  { title: "Underperformers",  value: "2",  accent: "#f43f5e" },
];

// Targets the Sales Manager has set for this TL's team / executives.
// TL can monitor and update progress, but cannot create new targets for
// people outside the team.
export const initialTargets = [
  // Team-level target (assigned to the TL)
  { id: "TGT-001", assignedTo: "Ankit Verma",   role: "Team Leader", type: "Monthly", leads: 1500, target: 80, achieved: 48, remaining: 32, deadline: "2026-05-31", status: "In Progress" },

  // Executive targets (within the TL's team)
  { id: "TGT-002", assignedTo: "Rahul Sharma",  role: "Executive",   type: "Monthly", leads: 250, target: 40, achieved: 42, remaining: 0,  deadline: "2026-05-31", status: "Completed" },
  { id: "TGT-003", assignedTo: "Priya Mehta",   role: "Executive",   type: "Monthly", leads: 250, target: 36, achieved: 38, remaining: 0,  deadline: "2026-05-31", status: "Completed" },
  { id: "TGT-004", assignedTo: "Arjun Kapoor",  role: "Executive",   type: "Weekly",  leads: 60,  target: 12, achieved: 9,  remaining: 3,  deadline: "2026-05-12", status: "In Progress" },
  { id: "TGT-005", assignedTo: "Sneha Rajput",  role: "Executive",   type: "Weekly",  leads: 60,  target: 12, achieved: 5,  remaining: 7,  deadline: "2026-05-12", status: "Pending" },
  { id: "TGT-006", assignedTo: "Vikram Tiwari", role: "Executive",   type: "Daily",   leads: 20,  target: 4,  achieved: 1,  remaining: 3,  deadline: "2026-05-06", status: "In Progress" },
  { id: "TGT-007", assignedTo: "Kavya Patel",   role: "Executive",   type: "Daily",   leads: 20,  target: 4,  achieved: 0,  remaining: 4,  deadline: "2026-05-06", status: "Pending" },
];
