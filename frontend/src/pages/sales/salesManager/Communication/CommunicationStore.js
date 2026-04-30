// communicationStore.js — dummy data for Communication pages

export const initialMessages = [
  {
    id: "MSG-001", title: "Q2 Sales Target Announcement",
    type: "Announcement", sentTo: "Sales Department",
    sentDate: "2025-05-28", status: "Delivered",
    body: "Team, Q2 targets have been revised. Please review the updated targets in the Performance tab.",
  },
  {
    id: "MSG-002", title: "Warning: Low Call Count — Team Beta",
    type: "Warning", sentTo: "Team-wise",
    sentDate: "2025-05-30", status: "Delivered",
    body: "Team Beta has shown below-average call counts this week. Improvement expected by end of week.",
  },
  {
    id: "MSG-003", title: "Appreciation: Top Performers June",
    type: "Appreciation", sentTo: "Specific Employee",
    sentDate: "2025-06-01", status: "Delivered",
    body: "Congratulations to Rahul Sharma and Priya Mehta for achieving 100%+ of their monthly targets!",
  },
  {
    id: "MSG-004", title: "System Maintenance Notice",
    type: "Announcement", sentTo: "Sales Department",
    sentDate: "2025-06-02", status: "Delivered",
    body: "CRM system will be down for maintenance on June 5, 2025 from 11 PM to 2 AM.",
  },
];