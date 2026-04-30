// performanceStore.js — dummy data & initial state for Performance pages

export const kpiOverview = [
  { title: "Total Leads", value: "4,280", accent: "#3b82f6" },
  { title: "Total Calls", value: "11,340", accent: "#14b8a6" },
  { title: "Conversion Rate", value: "18.4%", accent: "#22c55e" },
  { title: "Revenue", value: "₹68.2L", accent: "#8b5cf6" },
  { title: "Dump %", value: "9.7%", accent: "#f43f5e" },
  { title: "Missed Follow-ups", value: "312", accent: "#f59e0b" },
];

export const teamPerformanceData = [
  { name: "Team Alpha", leads: 820, calls: 2100, sales: 148, revenue: 14800 },
  { name: "Team Beta",  leads: 740, calls: 1980, sales: 132, revenue: 13200 },
  { name: "Team Gamma", leads: 680, calls: 1750, sales: 118, revenue: 11800 },
  { name: "Team Delta", leads: 610, calls: 1560, sales: 97,  revenue: 9700  },
  { name: "Team Epsilon",leads:530, calls: 1320, sales: 78,  revenue: 7800  },
];

export const empSalesData = [
  { name: "Rahul S.",  sales: 48, calls: 310 },
  { name: "Priya M.",  sales: 44, calls: 290 },
  { name: "Arjun K.",  sales: 39, calls: 265 },
  { name: "Sneha R.",  sales: 37, calls: 240 },
  { name: "Vikram T.", sales: 33, calls: 220 },
  { name: "Kavya P.",  sales: 29, calls: 198 },
];

export const callsVsSalesData = [
  { name: "Jan", calls: 980,  sales: 142 },
  { name: "Feb", calls: 1120, sales: 165 },
  { name: "Mar", calls: 1340, sales: 198 },
  { name: "Apr", calls: 1180, sales: 174 },
  { name: "May", calls: 1560, sales: 231 },
  { name: "Jun", calls: 1420, sales: 210 },
];

export const leaderboardRows = [
  { rank: 1,  name: "Rahul Sharma",    teamLeader: "Ankit Verma",   calls: 310, sales: 48, revenue: "₹4.8L", conversion: "15.5%", status: "Active" },
  { rank: 2,  name: "Priya Mehta",     teamLeader: "Sonal Gupta",   calls: 290, sales: 44, revenue: "₹4.4L", conversion: "15.2%", status: "Active" },
  { rank: 3,  name: "Arjun Kapoor",    teamLeader: "Ankit Verma",   calls: 265, sales: 39, revenue: "₹3.9L", conversion: "14.7%", status: "Active" },
  { rank: 4,  name: "Sneha Rajput",    teamLeader: "Nisha Patel",   calls: 240, sales: 37, revenue: "₹3.7L", conversion: "15.4%", status: "Active" },
  { rank: 5,  name: "Vikram Tiwari",   teamLeader: "Sonal Gupta",   calls: 220, sales: 33, revenue: "₹3.3L", conversion: "15.0%", status: "Active" },
  { rank: 6,  name: "Kavya Patel",     teamLeader: "Nisha Patel",   calls: 198, sales: 29, revenue: "₹2.9L", conversion: "14.6%", status: "Pending" },
  { rank: 7,  name: "Mohit Joshi",     teamLeader: "Ankit Verma",   calls: 183, sales: 24, revenue: "₹2.4L", conversion: "13.1%", status: "Active" },
  { rank: 8,  name: "Divya Nair",      teamLeader: "Nisha Patel",   calls: 172, sales: 19, revenue: "₹1.9L", conversion: "11.0%", status: "Pending" },
];

// ── Targets ──────────────────────────────────────────────────────────────────
export const kpiTargets = [
  { title: "Total Targets",    value: "28",  accent: "#3b82f6" },
  { title: "Achieved Targets", value: "16",  accent: "#22c55e" },
  { title: "Pending Targets",  value: "9",   accent: "#f59e0b" },
  { title: "Underperformers",  value: "3",   accent: "#f43f5e" },
];

export const initialTargets = [
  { id: "TGT-001", assignedTo: "Rahul Sharma",  role: "Executive", teamLeader: "Ankit Verma", type: "Monthly", leads: 200, target: 40, achieved: 48, remaining: 0,  deadline: "2025-06-30", status: "Completed" },
  { id: "TGT-002", assignedTo: "Priya Mehta",   role: "Executive", teamLeader: "Sonal Gupta", type: "Monthly", leads: 180, target: 36, achieved: 44, remaining: 0,  deadline: "2025-06-30", status: "Completed" },
  { id: "TGT-003", assignedTo: "Arjun Kapoor",  role: "Executive", teamLeader: "Ankit Verma", type: "Weekly",  leads: 60,  target: 12, achieved: 9,  remaining: 3,  deadline: "2025-06-07", status: "In Progress" },
  { id: "TGT-004", assignedTo: "Sneha Rajput",  role: "Executive", teamLeader: "Nisha Patel", type: "Weekly",  leads: 60,  target: 12, achieved: 5,  remaining: 7,  deadline: "2025-06-07", status: "Pending" },
  { id: "TGT-005", assignedTo: "Vikram Tiwari", role: "Executive", teamLeader: "Sonal Gupta", type: "Daily",   leads: 20,  target: 4,  achieved: 2,  remaining: 2,  deadline: "2025-06-01", status: "In Progress" },
  { id: "TGT-006", assignedTo: "Ankit Verma",   role: "Team Leader", teamLeader: "Self",      type: "Monthly", leads: 400, target: 80, achieved: 48, remaining: 32, deadline: "2025-06-30", status: "In Progress" },
];

// ── Reports ───────────────────────────────────────────────────────────────────
export const kpiReports = [
  { title: "Total Calls",       value: "11,340", accent: "#3b82f6" },
  { title: "Total Leads",       value: "4,280",  accent: "#14b8a6" },
  { title: "Total Prospects",   value: "1,840",  accent: "#8b5cf6" },
  { title: "Total Sales",       value: "787",    accent: "#22c55e" },
  { title: "Revenue",           value: "₹68.2L", accent: "#f59e0b" },
  { title: "Dump Leads",        value: "415",    accent: "#f43f5e" },
  { title: "Untouched Leads",   value: "312",    accent: "#64748b" },
];

export const reportRows = [
  { name: "Rahul Sharma",  teamLeader: "Ankit Verma", calls: 310, leads: 200, prospects: 62, sales: 48, revenue: "₹4.8L", dump: 18, untouched: 12, date: "2025-06-01" },
  { name: "Priya Mehta",   teamLeader: "Sonal Gupta", calls: 290, leads: 180, prospects: 57, sales: 44, revenue: "₹4.4L", dump: 14, untouched: 8,  date: "2025-06-01" },
  { name: "Arjun Kapoor",  teamLeader: "Ankit Verma", calls: 265, leads: 170, prospects: 49, sales: 39, revenue: "₹3.9L", dump: 19, untouched: 15, date: "2025-06-01" },
  { name: "Sneha Rajput",  teamLeader: "Nisha Patel", calls: 240, leads: 160, prospects: 46, sales: 37, revenue: "₹3.7L", dump: 12, untouched: 11, date: "2025-06-01" },
  { name: "Vikram Tiwari", teamLeader: "Sonal Gupta", calls: 220, leads: 145, prospects: 40, sales: 33, revenue: "₹3.3L", dump: 16, untouched: 9,  date: "2025-06-01" },
  { name: "Kavya Patel",   teamLeader: "Nisha Patel", calls: 198, leads: 130, prospects: 35, sales: 29, revenue: "₹2.9L", dump: 11, untouched: 7,  date: "2025-06-01" },
];