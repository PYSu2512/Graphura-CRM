export const dailyReportMetrics = [
  { title: "Total Reports", value: "18", accent: "#2563eb" },
  { title: "Pending Reports", value: "7", accent: "#f59e0b" },
  { title: "Completed Reports", value: "11", accent: "#16a34a" },
  { title: "Submitted Reports", value: "14", accent: "#7c3aed" },
];

export const weeklyReportMetrics = [
  { title: "Total Weekly Reports", value: "5", accent: "#2563eb" },
  { title: "Excellent Updates", value: "1", accent: "#16a34a" },
  { title: "Delayed Updates", value: "1", accent: "#dc2626" },
  { title: "Avg Productivity", value: "81%", accent: "#7c3aed" },
];

export const projectReportRows = [
  { id: "PRJ-210", projectName: "Vendor onboarding portal", employee: "Dev Arora", status: "Delayed", progress: 64, deadline: "2026-05-22", priority: "Critical", notes: "Approval is pending from manager.", submittedDate: "2026-05-14" },
  { id: "PRJ-184", projectName: "Finance approval workflow", employee: "Kabir Sethi", status: "Completed", progress: 100, deadline: "2026-05-20", priority: "High", notes: "Workflow verified and submitted.", submittedDate: "2026-05-14" },
  { id: "PRJ-197", projectName: "Employee mobile dashboard", employee: "Aarav Mehta", status: "Pending", progress: 78, deadline: "2026-05-24", priority: "High", notes: "UI changes are under review.", submittedDate: "2026-05-13" },
  { id: "PRJ-221", projectName: "Client document migration", employee: "Nisha Kapoor", status: "Completed", progress: 100, deadline: "2026-05-21", priority: "Medium", notes: "Migration completed successfully.", submittedDate: "2026-05-13" },
  { id: "PRJ-233", projectName: "Payroll audit tracker", employee: "Ira Shah", status: "Pending", progress: 72, deadline: "2026-05-25", priority: "Medium", notes: "Audit checklist is pending.", submittedDate: "2026-05-12" },
];

export const weeklyPerformanceRows = [
  { id: "WEEK-01", employee: "Aarav Mehta", totalProjects: 8, completed: 6, pending: 2, productivity: "88%", weeklyStatus: "Good" },
  { id: "WEEK-02", employee: "Nisha Kapoor", totalProjects: 7, completed: 5, pending: 2, productivity: "84%", weeklyStatus: "Good" },
  { id: "WEEK-03", employee: "Dev Arora", totalProjects: 9, completed: 4, pending: 5, productivity: "62%", weeklyStatus: "Delayed" },
  { id: "WEEK-04", employee: "Ira Shah", totalProjects: 6, completed: 6, pending: 0, productivity: "96%", weeklyStatus: "Excellent" },
  { id: "WEEK-05", employee: "Kabir Sethi", totalProjects: 8, completed: 5, pending: 3, productivity: "76%", weeklyStatus: "Average" },
];

export const reportStatusData = [
  { name: "Completed", value: 11 },
  { name: "Pending", value: 7 },
  { name: "Delayed", value: 3 },
];

export const weeklyProductivityData = [
  { name: "Aarav", productivity: 88 },
  { name: "Nisha", productivity: 84 },
  { name: "Dev", productivity: 62 },
  { name: "Ira", productivity: 96 },
  { name: "Kabir", productivity: 76 },
];

export const weeklyEmployeePerformanceData = [
  { name: "Aarav", completed: 6, pending: 2 },
  { name: "Nisha", completed: 5, pending: 2 },
  { name: "Dev", completed: 4, pending: 5 },
  { name: "Ira", completed: 6, pending: 0 },
  { name: "Kabir", completed: 5, pending: 3 },
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

export const completedPendingData = [
  { name: "Mon", completed: 8, pending: 7 },
  { name: "Tue", completed: 10, pending: 6 },
  { name: "Wed", completed: 9, pending: 8 },
  { name: "Thu", completed: 12, pending: 7 },
  { name: "Fri", completed: 14, pending: 5 },
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

export const employeePerformanceComparison = [
  { name: "Aarav", completed: 5, pending: 1, delayed: 1, qualityIssues: 1 },
  { name: "Nisha", completed: 4, pending: 2, delayed: 0, qualityIssues: 0 },
  { name: "Dev", completed: 4, pending: 2, delayed: 2, qualityIssues: 3 },
  { name: "Ira", completed: 4, pending: 1, delayed: 0, qualityIssues: 0 },
  { name: "Kabir", completed: 5, pending: 3, delayed: 1, qualityIssues: 2 },
];

export const qualityIssueRows = [
  { id: "QI-41", project: "Vendor onboarding portal", employee: "Dev Arora", issueType: "Review Rework", severity: "High", actionRequired: "Manager review" },
  { id: "QI-38", project: "Finance approval workflow", employee: "Kabir Sethi", issueType: "Missing checklist", severity: "Medium", actionRequired: "Update task notes" },
  { id: "QI-35", project: "Client document migration", employee: "Aarav Mehta", issueType: "Data mismatch", severity: "Low", actionRequired: "Recheck records" },
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
