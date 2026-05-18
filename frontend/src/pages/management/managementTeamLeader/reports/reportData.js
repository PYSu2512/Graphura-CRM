export const reportMetrics = [
  { title: "Total Projects", value: "42", accent: "#2563eb" },
  { title: "Active Projects", value: "18", accent: "#0891b2" },
  { title: "Completed Projects", value: "16", accent: "#16a34a" },
  { title: "Pending Projects", value: "8", accent: "#f59e0b" },
  { title: "Delayed Projects", value: "5", accent: "#dc2626" },
  { title: "Team Members Active Today", value: "23", accent: "#7c3aed" },
  { title: "Team Productivity %", value: "86%", accent: "#0f766e" },
  { title: "Overdue Tasks", value: "11", accent: "#ea580c" },
];

export const teamPerformanceRows = [
  { id: "EMP-104", name: "Aarav Mehta", assigned: 7, completed: 5, pending: 1, delayed: 1, productivity: "91%", lastActivity: "Updated API handoff", quality: "94%" },
  { id: "EMP-118", name: "Nisha Kapoor", assigned: 6, completed: 4, pending: 2, delayed: 0, productivity: "88%", lastActivity: "Submitted QA notes", quality: "90%" },
  { id: "EMP-126", name: "Dev Arora", assigned: 8, completed: 4, pending: 2, delayed: 2, productivity: "72%", lastActivity: "Flagged blocker", quality: "81%" },
  { id: "EMP-139", name: "Ira Shah", assigned: 5, completed: 4, pending: 1, delayed: 0, productivity: "93%", lastActivity: "Closed UI task", quality: "96%" },
  { id: "EMP-145", name: "Kabir Sethi", assigned: 9, completed: 5, pending: 3, delayed: 1, productivity: "79%", lastActivity: "Awaiting approval", quality: "84%" },
];

export const delayedProjectsRows = [
  { id: "PRJ-210", project: "Vendor onboarding portal", employee: "Dev Arora", deadline: "2026-05-13", delayDays: 3, priority: "Critical", status: "Escalation Needed" },
  { id: "PRJ-184", project: "Finance approval workflow", employee: "Kabir Sethi", deadline: "2026-05-12", delayDays: 2, priority: "High", status: "Blocked" },
  { id: "PRJ-197", project: "Employee mobile dashboard", employee: "Aarav Mehta", deadline: "2026-05-11", delayDays: 4, priority: "High", status: "Manager Review" },
  { id: "PRJ-221", project: "Client document migration", employee: "Nisha Kapoor", deadline: "2026-05-14", delayDays: 1, priority: "Medium", status: "At Risk" },
];

export const dailyReports = [
  { id: "DR-501", date: "2026-05-14", worked: 18, completed: 11, pending: 7, delayed: 3, issues: "API dependency delay", managerNotes: "Escalate vendor handoff" },
  { id: "DR-500", date: "2026-05-13", worked: 17, completed: 10, pending: 7, delayed: 4, issues: "QA retest spillover", managerNotes: "Add QA capacity tomorrow" },
  { id: "DR-499", date: "2026-05-12", worked: 19, completed: 12, pending: 7, delayed: 2, issues: "Approval pending", managerNotes: "Follow up with manager" },
  { id: "DR-498", date: "2026-05-11", worked: 15, completed: 9, pending: 6, delayed: 2, issues: "No major blocker", managerNotes: "Keep timeline stable" },
];

export const activityTimeline = [
  { id: 1, time: "10:45 AM", employee: "Dev Arora", action: "raised escalation", project: "Vendor onboarding portal", tone: "danger" },
  { id: 2, time: "10:10 AM", employee: "Ira Shah", action: "completed QA fixes", project: "Employee mobile dashboard", tone: "success" },
  { id: 3, time: "09:50 AM", employee: "Kabir Sethi", action: "requested manager approval", project: "Finance approval workflow", tone: "warning" },
  { id: 4, time: "09:15 AM", employee: "Aarav Mehta", action: "updated project progress", project: "Client document migration", tone: "info" },
  { id: 5, time: "Yesterday", employee: "Nisha Kapoor", action: "added blocker comment", project: "Payroll audit tracker", tone: "warning" },
];

export const productivityTrend = [
  { name: "Mon", productivity: 78, completed: 8, delayed: 3 },
  { name: "Tue", productivity: 82, completed: 10, delayed: 2 },
  { name: "Wed", productivity: 80, completed: 9, delayed: 4 },
  { name: "Thu", productivity: 86, completed: 12, delayed: 3 },
  { name: "Fri", productivity: 89, completed: 14, delayed: 2 },
];

export const projectStatusData = [
  { name: "Completed", value: 16 },
  { name: "Pending", value: 8 },
  { name: "Delayed", value: 5 },
  { name: "Active", value: 18 },
];

export const projectProgressWidgets = [
  { project: "Vendor onboarding portal", progress: 64, status: "Delayed", tone: "danger" },
  { project: "Finance approval workflow", progress: 72, status: "At Risk", tone: "warning" },
  { project: "Employee mobile dashboard", progress: 88, status: "On Track", tone: "success" },
  { project: "Client document migration", progress: 54, status: "Pending Approval", tone: "info" },
];

export const workloadData = [
  { name: "Aarav", assigned: 7, completed: 5 },
  { name: "Nisha", assigned: 6, completed: 4 },
  { name: "Dev", assigned: 8, completed: 4 },
  { name: "Ira", assigned: 5, completed: 4 },
  { name: "Kabir", assigned: 9, completed: 5 },
];

export const weeklySummary = [
  { label: "Completed", value: "56", delta: "+12%", tone: "success" },
  { label: "Pending", value: "31", delta: "-4%", tone: "info" },
  { label: "Deadline Misses", value: "7", delta: "+2", tone: "warning" },
  { label: "Escalated Issues", value: "4", delta: "2 critical", tone: "danger" },
];

export const coordinationNotes = [
  { id: 1, author: "Management TL", text: "@Dev attach blocker proof before manager review.", time: "Today, 11:00 AM" },
  { id: 2, author: "Management TL", text: "@Ira prioritize QA signoff for mobile dashboard.", time: "Today, 09:30 AM" },
  { id: 3, author: "Management Manager", text: "Send weekly risk summary before 5 PM.", time: "Yesterday, 04:15 PM" },
];
