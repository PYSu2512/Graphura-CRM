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
  {
    id: "TKT-EX03", title: "Unable to upload CSV dump",
    raisedBy: "Sales Executive", role: "Sales Executive",
    priority: "High", status: "Failed",
    createdDate: "2026-05-05", lastReply: "2026-05-06",
    description: "Getting 'Format Error' even when using the provided template.",
    conversation: [
      { sender: "Admin", time: "2026-05-06 14:00", text: "Please check if there are any special characters in the names." },
    ],
  },
  {
    id: "TKT-EX04", title: "Notification sound not working",
    raisedBy: "Sales Executive", role: "Sales Executive",
    priority: "Low", status: "Replied",
    createdDate: "2026-05-07", lastReply: "2026-05-08",
    description: "Browser notifications are coming but sound is absent.",
    conversation: [
      { sender: "Support", time: "2026-05-08 09:15", text: "Please verify browser site settings for sound permissions." },
    ],
  },
  {
    id: "TKT-EX05", title: "Incorrect commission calculation",
    raisedBy: "Sales Executive", role: "Sales Executive",
    priority: "High", status: "Escalated",
    createdDate: "2026-05-08", lastReply: "2026-05-09",
    description: "Payout for lead #LEAD-552 seems 2% lower than expected.",
    conversation: [
      { sender: "Finance", time: "2026-05-09 11:00", text: "Escalated to management for policy verification." },
    ],
  },
  {
    id: "TKT-EX06", title: "Mobile app login loop",
    raisedBy: "Sales Executive", role: "Sales Executive",
    priority: "High", status: "In Progress",
    createdDate: "2026-05-09", lastReply: "2026-05-09",
    description: "App keeps asking for login after successful authentication.",
    conversation: [
      { sender: "IT Support", time: "2026-05-09 16:45", text: "Clearing app cache might help. We are investigating." },
    ],
  },
  {
    id: "TKT-EX07", title: "Lead assignment delay",
    raisedBy: "Sales Executive", role: "Sales Executive",
    priority: "Medium", status: "Open",
    createdDate: "2026-05-10", lastReply: "2026-05-10",
    description: "Leads from the 'Dump' are taking 4+ hours to show up in my list.",
    conversation: [],
  },
  {
    id: "TKT-EX08", title: "Broken link in email template",
    raisedBy: "Sales Executive", role: "Sales Executive",
    priority: "Low", status: "Resolved",
    createdDate: "2026-05-04", lastReply: "2026-05-05",
    description: "The 'Schedule Demo' link in the intro template leads to a 404.",
    conversation: [
      { sender: "Marketing", time: "2026-05-05 10:20", text: "Link updated to the new calendar page. Thanks for reporting!" },
    ],
  },
];

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
