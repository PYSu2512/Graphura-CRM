// reportsStore.js — TL Reports module (team-scoped dummy data)
// Imports the canonical executive list from teamLeaderStore.

import { teamExecutives, currentTL } from "../teamLeaderStore";

// ─── Overview KPIs (team scope) ─────────────────────────────────────────────
export const overviewKPIs = [
  { title: "Total Leads",        value: "1,180", accent: "#3b82f6" },
  { title: "Total Calls",        value: "1,824", accent: "#14b8a6" },
  { title: "Total Prospects",    value: "412",   accent: "#8b5cf6" },
  { title: "Total Sales",        value: "178",   accent: "#22c55e" },
  { title: "Total Revenue",      value: "₹8.4L", accent: "#f59e0b" },
  { title: "Dump Leads",         value: "61",    accent: "#f43f5e" },
  { title: "Missed Follow-ups",  value: "23",    accent: "#ef4444" },
  { title: "Conversion Rate",    value: "15.1%", accent: "#10b981" },
];

// ─── Weekly call trend ──────────────────────────────────────────────────────
export const callsVsSalesData = [
  { name: "Mon", calls: 162, sales: 14 },
  { name: "Tue", calls: 198, sales: 22 },
  { name: "Wed", calls: 145, sales: 11 },
  { name: "Thu", calls: 221, sales: 28 },
  { name: "Fri", calls: 186, sales: 21 },
  { name: "Sat", calls: 98,  sales: 8  },
];

// ─── Leads vs Prospects ─────────────────────────────────────────────────────
export const leadsVsProspectsData = [
  { name: "Mon", leads: 220, prospects: 38 },
  { name: "Tue", leads: 240, prospects: 52 },
  { name: "Wed", leads: 180, prospects: 28 },
  { name: "Thu", leads: 290, prospects: 68 },
  { name: "Fri", leads: 230, prospects: 48 },
  { name: "Sat", leads: 110, prospects: 18 },
];

// ─── Lead status breakdown ──────────────────────────────────────────────────
export const leadStatusData = [
  { name: "Converted",   value: 178 },
  { name: "Prospect",    value: 412 },
  { name: "Follow-up",   value: 248 },
  { name: "In Progress", value: 154 },
  { name: "Dump",        value: 61  },
  { name: "New",         value: 127 },
];
export const leadStatusColors = ["#22c55e", "#8b5cf6", "#3b82f6", "#14b8a6", "#f43f5e", "#f59e0b"];

// ─── Per-executive comparison (column chart) ────────────────────────────────
export const execPerfCompData = teamExecutives.slice(0, 6).map((e, i) => ({
  name: e.name.split(" ")[0],
  calls:     [310, 290, 265, 240, 198, 172][i],
  prospects: [84, 78, 71, 64, 52, 45][i],
  sales:     [42, 38, 31, 27, 22, 18][i],
}));

// ─── Self daily report (TL's own activity for today) ────────────────────────
export const selfDailyReport = {
  date: new Date().toISOString().slice(0, 10),
  totalCalls:      48,
  todayCalls:      12,
  todayProspect:   3,
  todaySell:       1,
  todayDumpData:   2,
  totalUntouched:  18,
};

// ─── Self daily report — week-over-week list ────────────────────────────────
export const selfDailyHistory = [
  { date: "2026-05-06", totalCalls: 48, todayCalls: 12, todayProspect: 3, todaySell: 1, todayDumpData: 2, totalUntouched: 18 },
  { date: "2026-05-05", totalCalls: 52, todayCalls: 14, todayProspect: 4, todaySell: 2, todayDumpData: 1, totalUntouched: 20 },
  { date: "2026-05-04", totalCalls: 46, todayCalls: 11, todayProspect: 2, todaySell: 1, todayDumpData: 3, totalUntouched: 22 },
  { date: "2026-05-03", totalCalls: 41, todayCalls: 9,  todayProspect: 2, todaySell: 0, todayDumpData: 2, totalUntouched: 24 },
  { date: "2026-05-02", totalCalls: 55, todayCalls: 16, todayProspect: 5, todaySell: 3, todayDumpData: 2, totalUntouched: 19 },
];

// ─── Weekly aggregated report ───────────────────────────────────────────────
export const weeklyReport = [
  { weekStart: "2026-04-29", weekEnd: "2026-05-05", totalCalls: 285, prospects: 62, sales: 24, revenue: "₹2,40,000", dump: 11, conversion: "8.4%" },
  { weekStart: "2026-04-22", weekEnd: "2026-04-28", totalCalls: 310, prospects: 71, sales: 28, revenue: "₹2,80,000", dump: 9,  conversion: "9.0%" },
  { weekStart: "2026-04-15", weekEnd: "2026-04-21", totalCalls: 268, prospects: 58, sales: 22, revenue: "₹2,20,000", dump: 13, conversion: "8.2%" },
  { weekStart: "2026-04-08", weekEnd: "2026-04-14", totalCalls: 295, prospects: 65, sales: 26, revenue: "₹2,60,000", dump: 10, conversion: "8.8%" },
];

// ─── Per-executive report rows (team only) ──────────────────────────────────
export const execReportRows = teamExecutives.map((e, i) => ({
  id:              `EX${String(i + 1).padStart(3, "0")}`,
  execName:        e.name,
  teamLeader:      currentTL.name,
  teamName:        currentTL.team,
  assignedLeads:   [210, 195, 220, 195, 200, 180][i],
  completedCalls:  [310, 290, 265, 240, 198, 172][i],
  talk:            [280, 260, 235, 215, 175, 150][i],
  notTalk:         [30, 30, 30, 25, 23, 22][i],
  interested:      [95, 82, 68, 55, 48, 42][i],
  prospects:       [84, 78, 71, 64, 52, 45][i],
  sales:           [42, 38, 31, 27, 22, 18][i],
  dumpLeads:       [9, 11, 13, 14, 16, 18][i],
  missedFollowups: [2, 3, 4, 5, 6, 7][i],
  revenue:         ["₹1,68,000", "₹1,52,000", "₹1,24,000", "₹1,08,000", "₹88,000", "₹72,000"][i],
  conversion:      ["13.5%", "13.1%", "11.7%", "11.2%", "11.1%", "10.4%"][i],
  status:          e.status === "Active" ? "Active" : "Inactive",
}));
