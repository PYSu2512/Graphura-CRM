// TicketStore.js — dummy data for Support page (Executive version)

export const kpiTickets = [
  { title: "Total Tickets", value: "12", accent: "#3b82f6" },
  { title: "In Progress",   value: "3",  accent: "#f59e0b" },
  { title: "Replied",       value: "2",  accent: "#8b5cf6" },
  { title: "Resolved",      value: "7",  accent: "#22c55e" },
];

export const initialTickets = [
  {
    id: "TKT-EX01", title: "Lead sync issue in my dashboard",
    raisedBy: "Sales Executive", role: "Sales Executive",
    priority: "High", status: "In Progress",
    createdDate: "2026-05-01", lastReply: "2026-05-02",
    description: "My lead count is not updating in real-time.",
    conversation: [
      { sender: "Admin", time: "2026-05-02 10:00", text: "We are checking the sync service." },
    ],
  },
  {
    id: "TKT-EX02", title: "Client data missing for ID #9021",
    raisedBy: "Sales Executive", role: "Sales Executive",
    priority: "Medium", status: "Resolved",
    createdDate: "2026-04-28", lastReply: "2026-04-29",
    description: "Fields for secondary contact are empty for this lead.",
    conversation: [
      { sender: "Sales Manager", time: "2026-04-29 11:30", text: "Updated the client record. Please check now." },
    ],
  },
];
