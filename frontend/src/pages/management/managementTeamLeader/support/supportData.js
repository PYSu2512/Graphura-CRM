export const ticketMetrics = [
  { title: "Open Issues", value: "18", accent: "#2563eb" },
  { title: "Pending Issues", value: "9", accent: "#f59e0b" },
  { title: "Escalated Issues", value: "5", accent: "#dc2626" },
  { title: "Resolved Issues", value: "31", accent: "#16a34a" },
];

export const ticketTypeOptions = ["Project", "Technical", "Employee", "Client", "Resource"];

export const issueTypesByTicketType = {
  Project: ["Project Delay", "Deadline Risk", "Approval Blocker"],
  Technical: ["Staging Issue", "Deployment Issue", "System Error"],
  Employee: ["Workload Issue", "Attendance Issue", "Performance Concern"],
  Client: ["Document Missing", "Client Dependency", "Approval Pending"],
  Resource: ["Resource Blocker", "QA Capacity", "Access Required"],
};

export const assignedToByIssueType = {
  "Project Delay": "Management Manager",
  "Deadline Risk": "Management Manager",
  "Approval Blocker": "Management Manager",
  "Staging Issue": "Technical Support",
  "Deployment Issue": "Technical Support",
  "System Error": "Technical Support",
  "Workload Issue": "Management TL",
  "Attendance Issue": "HR Team",
  "Performance Concern": "Management Manager",
  "Document Missing": "Operations Team",
  "Client Dependency": "Management Manager",
  "Approval Pending": "Management Manager",
  "Resource Blocker": "Management TL",
  "QA Capacity": "QA Lead",
  "Access Required": "Admin Team",
};

export const tickets = [
  {
    id: "MTL-TK-1042",
    title: "Deployment approval blocked",
    raisedBy: "Dev Arora",
    role: "Developer",
    priority: "Critical",
    status: "Escalated",
    createdDate: "2026-05-14",
    ticketType: "Project",
    issueType: "Deadline Risk",
    assignedTo: "Management Manager",
    project: "Vendor onboarding portal",
    description: "Release is waiting for manager approval and vendor credentials.",
    conversation: [
      { id: 1, sender: "Dev Arora", time: "2026-05-14 10:35", text: "Vendor credentials are still pending from operations." },
      { id: 2, sender: "Management TL", time: "2026-05-14 10:42", text: "Attach the blocker proof and latest deployment checklist." },
      { id: 3, sender: "Management Manager", time: "2026-05-14 10:50", text: "Escalate if credentials are not received before noon." },
    ],
  },
  {
    id: "MTL-TK-1038",
    title: "QA retest queue overloaded",
    raisedBy: "Nisha Kapoor",
    role: "QA Engineer",
    priority: "High",
    status: "Pending",
    createdDate: "2026-05-13",
    ticketType: "Resource",
    issueType: "QA Capacity",
    assignedTo: "QA Lead",
    project: "Employee mobile dashboard",
    description: "Regression queue has delayed two mobile fixes.",
    conversation: [
      { id: 1, sender: "Nisha Kapoor", time: "2026-05-13 12:15", text: "Two retest builds are pending because QA bandwidth is low." },
      { id: 2, sender: "Management TL", time: "2026-05-13 12:45", text: "I am checking reassignment options with the QA lead." },
    ],
  },
  {
    id: "MTL-TK-1031",
    title: "Client document missing",
    raisedBy: "Kabir Sethi",
    role: "Project Coordinator",
    priority: "Medium",
    status: "Open",
    createdDate: "2026-05-12",
    ticketType: "Client",
    issueType: "Document Missing",
    assignedTo: "Operations Team",
    project: "Client document migration",
    description: "Client has not shared signed authorization document.",
    conversation: [
      { id: 1, sender: "Kabir Sethi", time: "2026-05-12 09:30", text: "The authorization document is still missing from the client side." },
    ],
  },
  {
    id: "MTL-TK-1027",
    title: "Employee workload imbalance",
    raisedBy: "Ira Shah",
    role: "Frontend Developer",
    priority: "High",
    status: "Open",
    createdDate: "2026-05-12",
    ticketType: "Employee",
    issueType: "Workload Issue",
    assignedTo: "Management TL",
    project: "Finance approval workflow",
    description: "Two employees are blocked while one owner carries overlapping delivery tasks.",
    conversation: [
      { id: 1, sender: "Ira Shah", time: "2026-05-12 16:05", text: "The current split is blocking UI and API integration together." },
    ],
  },
  {
    id: "MTL-TK-1019",
    title: "Staging server timeout",
    raisedBy: "Aarav Mehta",
    role: "Backend Developer",
    priority: "Low",
    status: "Resolved",
    createdDate: "2026-05-11",
    ticketType: "Technical",
    issueType: "Staging Issue",
    assignedTo: "Technical Support",
    project: "Payroll audit tracker",
    description: "Timeout fixed after configuration change.",
    conversation: [
      { id: 1, sender: "Aarav Mehta", time: "2026-05-11 11:20", text: "Staging timeout was blocking UAT." },
      { id: 2, sender: "Technical Support", time: "2026-05-11 12:10", text: "Configuration updated and endpoint response is stable now." },
    ],
  },
];

export const myRaisedTickets = [
  {
    id: "MTL-MY-210",
    title: "Need approval for urgent project reassignment",
    priority: "High",
    status: "In Progress",
    createdDate: "2026-05-15",
    lastReply: "2026-05-15",
    ticketType: "Project",
    issueType: "Approval Blocker",
    assignedTo: "Management Manager",
    project: "Vendor onboarding portal",
    description: "One project needs immediate reassignment due to deadline risk.",
    conversation: [
      { id: 1, sender: "Management TL", time: "2026-05-15 09:10", text: "Requesting approval to reassign the blocked module owner." },
      { id: 2, sender: "Management Manager", time: "2026-05-15 09:45", text: "Share the employee capacity details before reassignment." },
    ],
  },
  {
    id: "MTL-MY-207",
    title: "Access required for project tracking dashboard",
    priority: "Medium",
    status: "Open",
    createdDate: "2026-05-14",
    lastReply: "—",
    ticketType: "Resource",
    issueType: "Access Required",
    assignedTo: "Admin Team",
    project: "Project tracking dashboard",
    description: "Team needs access to update daily project progress in the system.",
    conversation: [
      { id: 1, sender: "Management TL", time: "2026-05-14 15:30", text: "Please enable access for progress update permissions." },
    ],
  },
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
