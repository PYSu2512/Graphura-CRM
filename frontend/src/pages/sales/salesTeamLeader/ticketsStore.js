// ticketsStore.js — Packet 1 reference (Tickets page)
// Dummy ticket data + role/priority/status constants. Imports `currentTL`
// from the canonical store so the TL identity stays consistent.

import { currentTL } from "./teamLeaderStore";

export { currentTL };

// ─── Role labels (used as raisedBy / raisedTo) ──────────────────────────────
export const ROLE_TL       = "Sales Team Leader";
export const ROLE_EXEC     = "Sales Executive";
export const ROLE_MANAGER  = "Sales Manager";

// ─── Priority + status options ──────────────────────────────────────────────
export const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
export const STATUS_OPTIONS   = ["Open", "In Progress", "Escalated", "Resolved"];
export const RAISE_TO_OPTIONS = [ROLE_MANAGER];

// ─── Initial tickets ────────────────────────────────────────────────────────
// Mix of:
//   • tickets the TL raised to the Manager (My Tickets)
//   • tickets executives raised to the TL (Team Tickets)
export const INITIAL_TICKETS = [
  {
    id:          "TKT-001",
    subject:     "Lead data issue — duplicate entries",
    raisedBy:    ROLE_TL,
    raisedTo:    ROLE_MANAGER,
    priority:    "High",
    status:      "Open",
    date:        "2026-04-28",
    description: "There are multiple duplicate lead entries in the system. Need urgent resolution.",
    replies: [
      { from: ROLE_MANAGER, text: "Looking into this issue. Will resolve by EOD.", date: "2026-04-28" },
    ],
  },
  {
    id:          "TKT-002",
    subject:     "Executive not able to login",
    raisedBy:    ROLE_TL,
    raisedTo:    ROLE_MANAGER,
    priority:    "Medium",
    status:      "In Progress",
    date:        "2026-04-27",
    description: "Team executive Rahul is unable to login since yesterday. Please fix ASAP.",
    replies: [],
  },
  {
    id:          "TKT-003",
    subject:     "Client data missing after bulk upload",
    raisedBy:    ROLE_EXEC,
    raisedTo:    ROLE_TL,
    priority:    "High",
    status:      "Open",
    date:        "2026-04-26",
    description: "After bulk CSV upload, 15 client records are missing from the system.",
    replies: [],
  },
  {
    id:          "TKT-004",
    subject:     "Follow-up reminder not working",
    raisedBy:    ROLE_EXEC,
    raisedTo:    ROLE_TL,
    priority:    "Low",
    status:      "Resolved",
    date:        "2026-04-25",
    description: "Follow-up reminders are not triggering notifications on mobile app.",
    replies: [
      { from: ROLE_TL, text: "This has been escalated to the manager. Fix deployed.", date: "2026-04-26" },
    ],
  },
];
