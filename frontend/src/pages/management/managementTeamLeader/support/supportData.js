export const ticketMetrics = [
  { title: "Open Tickets", value: "18", accent: "#2563eb" },
  { title: "In Progress", value: "9", accent: "#0891b2" },
  { title: "Escalated", value: "5", accent: "#dc2626" },
  { title: "Resolved", value: "31", accent: "#16a34a" },
  { title: "High Priority", value: "7", accent: "#f59e0b" },
];

export const tickets = [
  { id: "MTL-TK-1042", title: "Deployment approval blocked", raisedBy: "Dev Arora", department: "Engineering", priority: "Critical", status: "Escalated", createdDate: "2026-05-14", assignedTo: "Management TL", type: "Deadline Risk", project: "Vendor onboarding portal", sla: "01h 20m", description: "Release is waiting for manager approval and vendor credentials.", severity: "Severe" },
  { id: "MTL-TK-1038", title: "QA retest queue overloaded", raisedBy: "Nisha Kapoor", department: "QA", priority: "High", status: "In Progress", createdDate: "2026-05-13", assignedTo: "Ira Shah", type: "Resource Blocker", project: "Employee mobile dashboard", sla: "04h 10m", description: "Regression queue has delayed two mobile fixes.", severity: "High" },
  { id: "MTL-TK-1031", title: "Client document missing", raisedBy: "Kabir Sethi", department: "Operations", priority: "Medium", status: "Waiting", createdDate: "2026-05-12", assignedTo: "Aarav Mehta", type: "Client Issue", project: "Client document migration", sla: "09h 45m", description: "Client has not shared signed authorization document.", severity: "Medium" },
  { id: "MTL-TK-1027", title: "Employee workload imbalance", raisedBy: "Ira Shah", department: "Design", priority: "High", status: "Open", createdDate: "2026-05-12", assignedTo: "Management TL", type: "Employee Issue", project: "Finance approval workflow", sla: "02h 35m", description: "Two employees are blocked while one owner carries overlapping delivery tasks.", severity: "High" },
  { id: "MTL-TK-1019", title: "Staging server timeout", raisedBy: "Aarav Mehta", department: "DevOps", priority: "Low", status: "Resolved", createdDate: "2026-05-11", assignedTo: "Dev Arora", type: "Technical Issue", project: "Payroll audit tracker", sla: "Closed", description: "Timeout fixed after configuration change.", severity: "Low" },
];

export const escalationQueue = [
  { id: "ESC-88", source: "MTL-TK-1042", item: "Deployment approval blocked", owner: "Dev Arora", urgency: "Critical", countdown: "01h 20m", route: "Management Manager" },
  { id: "ESC-87", source: "PRJ-210", item: "Vendor onboarding portal delay", owner: "Dev Arora", urgency: "Critical", countdown: "02h 05m", route: "Management Manager" },
  { id: "ESC-84", source: "MTL-TK-1027", item: "Workload imbalance", owner: "Ira Shah", urgency: "High", countdown: "03h 30m", route: "Management Manager" },
];

export const issueTrends = [
  { name: "Mon", blockers: 6, escalations: 2, resolved: 8 },
  { name: "Tue", blockers: 8, escalations: 3, resolved: 7 },
  { name: "Wed", blockers: 5, escalations: 2, resolved: 10 },
  { name: "Thu", blockers: 9, escalations: 5, resolved: 6 },
  { name: "Fri", blockers: 7, escalations: 4, resolved: 9 },
];

export const blockerHeatmap = [
  { label: "Approvals", count: 7, tone: "danger" },
  { label: "Dependencies", count: 5, tone: "warning" },
  { label: "Resources", count: 4, tone: "warning" },
  { label: "Technical", count: 3, tone: "info" },
  { label: "Employee", count: 2, tone: "info" },
  { label: "Client", count: 2, tone: "success" },
];

export const conversation = [
  { id: 1, author: "Dev Arora", text: "Vendor credentials are still pending from operations.", time: "10:35 AM" },
  { id: 2, author: "Management TL", text: "@Dev attach the blocker proof and latest deployment checklist.", time: "10:42 AM" },
  { id: 3, author: "Management Manager", text: "Escalate if credentials are not received before noon.", time: "10:50 AM" },
];

export const ticketTimeline = [
  "Ticket raised by Dev Arora",
  "Assigned to Management TL",
  "Priority changed to Critical",
  "Escalated to Management Manager",
];
