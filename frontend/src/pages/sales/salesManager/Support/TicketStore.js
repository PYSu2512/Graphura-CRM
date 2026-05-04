// ticketsStore.js — dummy data for Support pages

export const kpiTickets = [
  { title: "Total Tickets", value: "84", accent: "#3b82f6" },
  { title: "In Progress",   value: "22", accent: "#f59e0b" },
  { title: "Replied",       value: "18", accent: "#8b5cf6" },
  { title: "Resolved",      value: "38", accent: "#22c55e" },
];

export const initialTickets = [
  {
    id: "TKT-001", title: "Lead data not updating",
    raisedBy: "Ankit Verma",    role: "Team Leader",
    priority: "High",  status: "In Progress",
    createdDate: "2025-06-01",  lastReply: "2025-06-02",
    description: "The lead status is not syncing after executive updates the call status.",
    conversation: [
      { sender: "Admin",      time: "2025-06-01 10:12", text: "Don't worry this is not a big problem we'll handle it" },
    ],
  },
  {
    id: "TKT-002", title: "Payment receipt missing",
    raisedBy: "Priya Mehta",    role: "Executive",
    priority: "Medium", status: "In Progress",
    createdDate: "2025-06-02",  lastReply: "2025-06-03",
    description: "Customer claims payment was made but no receipt generated in system.",
    conversation: [
      { sender: "Priya Mehta",   time: "2025-06-02 09:00", text: "Customer has paid but receipt not generated." },
    ],
  },
  {
    id: "TKT-003", title: "Login issue for executive",
    raisedBy: "Sonal Gupta",    role: "Team Leader",
    priority: "High", status: "Escalated",
    createdDate: "2025-05-30",  lastReply: "2025-06-01",
    description: "One executive is unable to login since password reset.",
    conversation: [
      { sender: "Sonal Gupta",   time: "2025-05-30 14:00", text: "Executive Kavya cannot login post password reset." },
      { sender: "Sales Manager", time: "2025-05-31 09:00", text: "Escalated to admin." },
    ],
  },
  {
    id: "TKT-004", title: "Duplicate leads assigned",
    raisedBy: "Rahul Sharma",   role: "Executive",
    priority: "Low",  status: "Resolved",
    createdDate: "2025-05-28",  lastReply: "2025-05-29",
    description: "Same lead appears twice in my assigned list.",
    conversation: [
      { sender: "Rahul Sharma",  time: "2025-05-28 11:00", text: "Duplicate lead found: Lead ID #2041 duplicated." },
      { sender: "Sales Manager", time: "2025-05-29 08:30", text: "Resolved. Duplicate removed from system." },
    ],
  },
];