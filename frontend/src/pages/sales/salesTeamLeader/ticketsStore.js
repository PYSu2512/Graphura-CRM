// ticketsStore.js — Packet 6 (Tickets refactor)
// Mirror of `salesManager/Support/TicketStore.js`, scoped to the TL's workflow:
//   • initialTickets — tickets executives raised TO the TL (Team Tickets table)
//   • MY_TICKETS_SEED — tickets the TL raised to the Sales Manager (My Tickets table)
// Roles map: TL receives from "Sales Executive", raises to "Sales Manager".

import { currentTL } from "./teamLeaderStore";

export { currentTL };

// ─── Role constants ─────────────────────────────────────────────────────────
export const ROLE_TL      = "Sales Team Leader";
export const ROLE_EXEC    = "Sales Executive";
export const ROLE_MANAGER = "Sales Manager";

// ─── KPI cards (totals are computed live in AllTickets — these are static seeds) ──
export const kpiTickets = [
  { title: "Total Tickets", value: "0", accent: "#3b82f6" },
  { title: "In Progress",   value: "0", accent: "#f59e0b" },
  { title: "Replied",       value: "0", accent: "#8b5cf6" },
  { title: "Resolved",      value: "0", accent: "#22c55e" },
];

// ─── Team Tickets — executives raised to the TL ─────────────────────────────
export const initialTickets = [
  {
    id:          "TKT-2001",
    title:       "Cannot see assigned leads on my dashboard",
    raisedBy:    "Rahul Sharma",
    role:        ROLE_EXEC,
    priority:    "High",
    status:      "In Progress",
    createdDate: "2026-05-02",
    lastReply:   "2026-05-03",
    description: "After today's leads assignment my dashboard still shows zero. Refresh and re-login don't fix it.",
    conversation: [
      { sender: "Rahul Sharma", time: "2026-05-02 09:15", text: "Lead count showing 0 after assignment, please check." },
      { sender: ROLE_TL,        time: "2026-05-03 10:00", text: "Looking into it — try clearing local storage in the meantime." },
    ],
  },
  {
    id:          "TKT-2002",
    title:       "Follow-up reminder not triggering on mobile",
    raisedBy:    "Priya Mehta",
    role:        ROLE_EXEC,
    priority:    "Medium",
    status:      "Replied",
    createdDate: "2026-05-01",
    lastReply:   "2026-05-02",
    description: "Set a follow-up for 11:00 AM, never got a notification on the mobile app.",
    conversation: [
      { sender: "Priya Mehta", time: "2026-05-01 14:00", text: "No notification at the scheduled time." },
      { sender: ROLE_TL,       time: "2026-05-02 09:30", text: "Confirmed — there's a known issue with iOS push. Escalating to admin." },
    ],
  },
  {
    id:          "TKT-2003",
    title:       "Lead distribution feels uneven this week",
    raisedBy:    "Arjun Kapoor",
    role:        ROLE_EXEC,
    priority:    "Low",
    status:      "In Progress",
    createdDate: "2026-05-04",
    lastReply:   "2026-05-04",
    description: "I got only 12 leads while others got 25+. Can you re-balance please?",
    conversation: [
      { sender: "Arjun Kapoor", time: "2026-05-04 11:30", text: "Distribution looks uneven this week, can we re-check?" },
    ],
  },
  {
    id:          "TKT-2004",
    title:       "Prospect form save button greyed out",
    raisedBy:    "Sneha Rajput",
    role:        ROLE_EXEC,
    priority:    "Medium",
    status:      "Resolved",
    createdDate: "2026-04-28",
    lastReply:   "2026-04-29",
    description: "Tried to save a new prospect — Save button is disabled even when all fields are filled.",
    conversation: [
      { sender: "Sneha Rajput", time: "2026-04-28 15:00", text: "Save disabled in prospect form." },
      { sender: ROLE_TL,        time: "2026-04-29 09:30", text: "Fixed in today's deploy. Please retry." },
      { sender: "Sneha Rajput", time: "2026-04-29 10:15", text: "Confirmed working now, thanks." },
    ],
  },
  {
    id:          "TKT-2005",
    title:       "Login fails after password reset",
    raisedBy:    "Kavya Patel",
    role:        ROLE_EXEC,
    priority:    "High",
    status:      "Escalated",
    createdDate: "2026-05-03",
    lastReply:   "2026-05-04",
    description: "Reset my password yesterday, now I can't login at all — getting 'Invalid credentials' on every attempt.",
    conversation: [
      { sender: "Kavya Patel", time: "2026-05-03 18:00", text: "Login broken after password reset." },
      { sender: ROLE_TL,       time: "2026-05-04 09:00", text: "Escalated to Sales Manager — needs admin password reset." },
    ],
  },
];

// ─── My Tickets — tickets the TL raised to the Sales Manager ────────────────
export const MY_TICKETS_SEED = [
  {
    id:          "TKT-TL01",
    title:       "Need bulk re-assignment for off-balance team",
    raisedBy:    ROLE_TL,
    role:        ROLE_TL,
    priority:    "High",
    status:      "In Progress",
    createdDate: "2026-05-04",
    lastReply:   "2026-05-05",
    description: "Some executives have 200+ leads, others have under 50. Need a bulk re-distribution mechanism.",
    conversation: [
      { sender: ROLE_TL,      time: "2026-05-04 10:00", text: "Lead distribution off-balance again — requesting bulk re-assign tool." },
      { sender: ROLE_MANAGER, time: "2026-05-05 11:00", text: "Will add to next sprint. In the meantime, use the assign action per-lead." },
    ],
  },
  {
    id:          "TKT-TL02",
    title:       "Executive performance dashboard missing data",
    raisedBy:    ROLE_TL,
    role:        ROLE_TL,
    priority:    "Medium",
    status:      "In Progress",
    createdDate: "2026-05-02",
    lastReply:   "2026-05-03",
    description: "Daily/Weekly numbers in the executive report are flatlining at zero for two of my execs.",
    conversation: [
      { sender: ROLE_TL, time: "2026-05-02 14:30", text: "ExecutiveReport showing zeros for Vikram & Kavya." },
    ],
  },
  {
    id:          "TKT-TL03",
    title:       "Permission to access dump leads",
    raisedBy:    ROLE_TL,
    role:        ROLE_TL,
    priority:    "Low",
    status:      "Resolved",
    createdDate: "2026-04-22",
    lastReply:   "2026-04-24",
    description: "Requesting read-only access to dump leads to verify what's been moved out by my team.",
    conversation: [
      { sender: ROLE_TL,      time: "2026-04-22 11:00", text: "Read-only dump access for spot-checks?" },
      { sender: ROLE_MANAGER, time: "2026-04-23 10:00", text: "Per spec, dump restore is Manager-only — adding read-only listing to your view." },
      { sender: ROLE_MANAGER, time: "2026-04-24 09:30", text: "Read-only listing live now." },
    ],
  },
];
