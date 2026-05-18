// ticketsStore.js — MM tickets workflow
//   • initialTickets — tickets TLs/Employees raised TO the MM (Team Tickets table)
//   • MY_TICKETS_SEED — tickets the MM raised TO Admin (My Tickets table)
// Roles map: MM receives from "Management Team Leader" / "Management Employee",
//            escalates / raises to "Admin".

import { currentMM } from "./managementManagerStore";

export { currentMM };

// ─── Role constants ─────────────────────────────────────────────────────────
export const ROLE_MM       = "Management Manager";
export const ROLE_MTL      = "Management Team Leader";
export const ROLE_EMPLOYEE = "Management Employee";
export const ROLE_ADMIN    = "Admin";

// ─── KPI cards (totals are computed live in AllTickets — these are seeds) ───
export const kpiTickets = [
  { title: "Total Tickets", value: "0", accent: "#3b82f6" },
  { title: "In Progress",   value: "0", accent: "#f59e0b" },
  { title: "Replied",       value: "0", accent: "#8b5cf6" },
  { title: "Resolved",      value: "0", accent: "#22c55e" },
];

// ─── Team Tickets — TLs + Employees raised to the MM ────────────────────────
export const initialTickets = [
  {
    id:          "TKT-3001",
    title:       "Need clarification on PRJ-002 handover scope",
    raisedBy:    "Anjali Sinha",
    role:        ROLE_MTL,
    priority:    "High",
    status:      "In Progress",
    createdDate: "2026-05-07",
    lastReply:   "2026-05-08",
    description: "Client is asking for additional integrations on Bluewave Mobile App. Need approval to extend scope or push back.",
    conversation: [
      { sender: "Anjali Sinha", time: "2026-05-07 11:00", text: "Client wants payment-gateway integration added before delivery." },
      { sender: ROLE_MM,        time: "2026-05-08 09:30", text: "Push back — extra scope = new project. I'll loop in Finance for a separate WO." },
    ],
  },
  {
    id:          "TKT-3002",
    title:       "Drive folder access denied on PRJ-004",
    raisedBy:    "Tushar Rao",
    role:        ROLE_EMPLOYEE,
    priority:    "Medium",
    status:      "Replied",
    createdDate: "2026-05-06",
    lastReply:   "2026-05-07",
    description: "Cannot open the Delta Fleet Dashboard drive folder. Permission error from Google Drive.",
    conversation: [
      { sender: "Tushar Rao", time: "2026-05-06 14:30", text: "Drive folder shows 'You need access'." },
      { sender: ROLE_MM,      time: "2026-05-07 09:45", text: "Access granted. Try again now." },
    ],
  },
  {
    id:          "TKT-3003",
    title:       "Designer overloaded — 3 active projects",
    raisedBy:    "Ravi Khanna",
    role:        ROLE_MTL,
    priority:    "Medium",
    status:      "In Progress",
    createdDate: "2026-05-05",
    lastReply:   "2026-05-05",
    description: "Manish Joshi is on PRJ-003 (delivered), PRJ-008 (delivered), PRJ-016 (not started). Can we redistribute or hire another designer?",
    conversation: [
      { sender: "Ravi Khanna", time: "2026-05-05 10:00", text: "Need a second designer or a redistribution plan." },
    ],
  },
  {
    id:          "TKT-3004",
    title:       "Cannot mark project as Delivered — handover link rejected",
    raisedBy:    "Karan Malhotra",
    role:        ROLE_EMPLOYEE,
    priority:    "Low",
    status:      "Resolved",
    createdDate: "2026-04-29",
    lastReply:   "2026-04-30",
    description: "Trying to deliver PRJ-001. System keeps blocking with 'Handover link missing'.",
    conversation: [
      { sender: "Karan Malhotra", time: "2026-04-29 16:00", text: "Mark Delivered keeps failing." },
      { sender: ROLE_MM,          time: "2026-04-30 09:15", text: "Per spec the handover-link field is mandatory before delivery. Add the link in Edit Project → save → then Mark Delivered." },
      { sender: "Karan Malhotra", time: "2026-04-30 10:30", text: "Worked, thanks." },
    ],
  },
  {
    id:          "TKT-3005",
    title:       "Project deadline slip notification — PRJ-013",
    raisedBy:    "Anjali Sinha",
    role:        ROLE_MTL,
    priority:    "High",
    status:      "Escalated",
    createdDate: "2026-05-04",
    lastReply:   "2026-05-05",
    description: "Evermore CRM Integration is at 70% but deadline was 2026-04-30. Client is escalating to Admin. Need MM intervention.",
    conversation: [
      { sender: "Anjali Sinha", time: "2026-05-04 17:00", text: "Client wants daily updates from here on. Flagged it." },
      { sender: ROLE_MM,        time: "2026-05-05 09:00", text: "Escalated to Admin. Will request 5-day extension and daily standups." },
    ],
  },
];

// ─── My Tickets — tickets the MM raised to Admin ────────────────────────────
export const MY_TICKETS_SEED = [
  {
    id:          "TKT-MM01",
    title:       "Need a fifth Team Leader for next quarter",
    raisedBy:    ROLE_MM,
    role:        ROLE_MM,
    priority:    "High",
    status:      "In Progress",
    createdDate: "2026-05-06",
    lastReply:   "2026-05-07",
    description: "We have 20 active projects across 4 TLs (5 per TL average). Bringing on 6 more projects next month — need a 5th TL or projects will slip.",
    conversation: [
      { sender: ROLE_MM,    time: "2026-05-06 14:00", text: "Projecting 25 active projects in June; 4 TLs cannot absorb that." },
      { sender: ROLE_ADMIN, time: "2026-05-07 10:30", text: "Approved in principle. Send job spec by EOW." },
    ],
  },
  {
    id:          "TKT-MM02",
    title:       "Storage quota nearly hit — drive folders",
    raisedBy:    ROLE_MM,
    role:        ROLE_MM,
    priority:    "Medium",
    status:      "In Progress",
    createdDate: "2026-05-03",
    lastReply:   "2026-05-04",
    description: "Several project drive folders are full. Need quota increase or archive policy for delivered projects.",
    conversation: [
      { sender: ROLE_MM, time: "2026-05-03 11:00", text: "Drive quota at 92%. Recommendation: archive everything delivered > 90 days." },
    ],
  },
  {
    id:          "TKT-MM03",
    title:       "Request: tracking-page redesign per Section 14",
    raisedBy:    ROLE_MM,
    role:        ROLE_MM,
    priority:    "Low",
    status:      "Resolved",
    createdDate: "2026-04-20",
    lastReply:   "2026-04-25",
    description: "Several clients reporting the tracking page is hard to read on mobile. Requesting visual refresh.",
    conversation: [
      { sender: ROLE_MM,    time: "2026-04-20 10:00", text: "Mobile feedback from 3 clients this week." },
      { sender: ROLE_ADMIN, time: "2026-04-22 14:00", text: "Routing to FE team — separate scope." },
      { sender: ROLE_ADMIN, time: "2026-04-25 09:00", text: "Redesign queued for next sprint. Marking resolved here." },
    ],
  },
];
