export const MY_TICKETS_SEED = [
  {
    id: "TKT-501",
    title: "Unable to access staging server",
    category: "Access Issue",
    priority: "High",
    status: "Open",
    createdDate: "2026-05-21",
    lastReply: "2026-05-21",
    raisedTo: "Management Team Leader",
    description: "I cannot login to the staging server since yesterday afternoon.",
    conversation: [
      { id: "C-501-1", sender: "Management Employee", time: "2026-05-21 10:15", text: "Raised access issue with staging." },
    ],
  },
  {
    id: "TKT-502",
    title: "Clarification on design review feedback",
    category: "Clarification",
    priority: "Medium",
    status: "In Progress",
    createdDate: "2026-05-14",
    lastReply: "2026-05-18",
    raisedTo: "Management Team Leader",
    description: "Need clarity on the header animation requested in the feedback.",
    conversation: [
      { id: "C-502-1", sender: "Management Employee", time: "2026-05-14 11:05", text: "Shared the design review notes." },
      { id: "C-502-2", sender: "Management Team Leader", time: "2026-05-16 09:00", text: "Please make the animation faster and keep it subtle." },
    ],
  },
];

export const ticketCategories = [
  { value: "Access Issue", label: "Access Issue" },
  { value: "Clarification", label: "Clarification" },
  { value: "Bug", label: "Bug" },
  { value: "Other", label: "Other" },
];

export const kpiTickets = (tickets) => ({
  total: tickets.length,
  inProgress: tickets.filter((t) => t.status === "In Progress").length,
  open: tickets.filter((t) => t.status === "Open").length,
  resolved: tickets.filter((t) => t.status === "Resolved").length,
});

export const TICKET_ROLES = {
  currentUser: "Management Employee",
  defaultSendTo: "Management Team Leader",
  escalateTo: "Management Manager",
};
