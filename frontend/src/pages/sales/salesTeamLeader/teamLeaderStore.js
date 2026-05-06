// teamLeaderStore.js
// Canonical dummy data for the Sales Team Leader workspace.
// Owned by Packet 1 (Dashboard + Targets). Other packets import from here
// so executive names, IDs and team metrics stay consistent across pages.

// ─── Team Leader profile (the logged-in TL) ──────────────────────────────────
export const currentTL = {
  id: "TL-001",
  name: "Ankit Verma",
  email: "ankit.verma@graphura.in",
  team: "Team Alpha",
  leadCapacity: 1500,
};

// ─── Executives reporting to the TL (canonical list — share across packets) ──
export const teamExecutives = [
  { id: "EX-101", name: "Rahul Sharma",  email: "rahul.s@graphura.in",  phone: "+91 98101 11001", joinDate: "2024-02-10", status: "Active",  region: "Mumbai" },
  { id: "EX-102", name: "Priya Mehta",   email: "priya.m@graphura.in",  phone: "+91 98102 22002", joinDate: "2024-04-22", status: "Active",  region: "Pune" },
  { id: "EX-103", name: "Arjun Kapoor",  email: "arjun.k@graphura.in",  phone: "+91 98103 33003", joinDate: "2024-06-15", status: "Active",  region: "Delhi" },
  { id: "EX-104", name: "Sneha Rajput",  email: "sneha.r@graphura.in",  phone: "+91 98104 44004", joinDate: "2024-08-01", status: "Active",  region: "Bangalore" },
  { id: "EX-105", name: "Vikram Tiwari", email: "vikram.t@graphura.in", phone: "+91 98105 55005", joinDate: "2024-09-12", status: "On Leave", region: "Hyderabad" },
  { id: "EX-106", name: "Kavya Patel",   email: "kavya.p@graphura.in",  phone: "+91 98106 66006", joinDate: "2025-01-05", status: "Active",  region: "Ahmedabad" },
];

export const executiveNames = teamExecutives.map((e) => e.name);

// ─── Dashboard KPIs (matches Section 7 of the brief — 8 metrics) ─────────────
export const dashboardKPIs = [
  { title: "Total Calls",       value: "1,824",  accent: "#3b82f6" },
  { title: "Today Calls",       value: "127",    accent: "#14b8a6" },
  { title: "Total Prospects",   value: "412",    accent: "#8b5cf6" },
  { title: "Today Sales",       value: "9",      accent: "#22c55e" },
  { title: "Talk Ratio",        value: "68%",    accent: "#38bdf8" },
  { title: "Untouched Leads",   value: "84",     accent: "#f59e0b" },
  { title: "Dump Count",        value: "61",     accent: "#f43f5e" },
  { title: "Follow-up Missed",  value: "23",     accent: "#ef4444" },
];

// ─── Calls trend (last 12 months) ────────────────────────────────────────────
export const callsTrend = [
  { name: "Jan", calls: 132, sales: 18 },
  { name: "Feb", calls: 148, sales: 22 },
  { name: "Mar", calls: 161, sales: 19 },
  { name: "Apr", calls: 175, sales: 27 },
  { name: "May", calls: 188, sales: 31 },
  { name: "Jun", calls: 162, sales: 24 },
  { name: "Jul", calls: 194, sales: 33 },
  { name: "Aug", calls: 207, sales: 36 },
  { name: "Sep", calls: 221, sales: 41 },
  { name: "Oct", calls: 198, sales: 35 },
  { name: "Nov", calls: 234, sales: 44 },
  { name: "Dec", calls: 256, sales: 48 },
];

// ─── Lead status funnel ──────────────────────────────────────────────────────
export const leadFunnel = [
  { name: "Untouched",  value: 84 },
  { name: "Talk",       value: 218 },
  { name: "Interested", value: 132 },
  { name: "Converted",  value: 63 },
  { name: "Dump",       value: 61 },
];

// ─── Per-executive performance (charts) ──────────────────────────────────────
export const executivePerformance = teamExecutives.slice(0, 6).map((exec, i) => ({
  name: exec.name.split(" ")[0] + " " + exec.name.split(" ")[1][0] + ".",
  leads: [148, 132, 121, 109, 98, 87][i],
  calls: [310, 290, 265, 240, 198, 172][i],
  sales: [42, 38, 31, 27, 22, 18][i],
}));

// ─── Leaderboard rows (table-friendly summary) ───────────────────────────────
export const leaderboard = [
  { rank: 1, executive: "Rahul Sharma",  calls: 310, prospects: 84, sales: 42, talkRatio: "72%", dump: 9,  missed: 2, status: "Active" },
  { rank: 2, executive: "Priya Mehta",   calls: 290, prospects: 78, sales: 38, talkRatio: "70%", dump: 11, missed: 3, status: "Active" },
  { rank: 3, executive: "Arjun Kapoor",  calls: 265, prospects: 71, sales: 31, talkRatio: "68%", dump: 13, missed: 4, status: "Active" },
  { rank: 4, executive: "Sneha Rajput",  calls: 240, prospects: 64, sales: 27, talkRatio: "66%", dump: 14, missed: 5, status: "Active" },
  { rank: 5, executive: "Vikram Tiwari", calls: 198, prospects: 52, sales: 22, talkRatio: "63%", dump: 16, missed: 6, status: "On Leave" },
  { rank: 6, executive: "Kavya Patel",   calls: 172, prospects: 45, sales: 18, talkRatio: "60%", dump: 18, missed: 7, status: "Active" },
];
