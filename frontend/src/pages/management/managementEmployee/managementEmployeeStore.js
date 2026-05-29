// managementEmployeeStore.js
// Canonical dummy data for the Management Employee workspace.
// Owned by Packet 1 (Store + Dashboard + My Projects). Other packets import
// from here so currentEmployee, project IDs, and helper constants stay consistent.
//
// PROJECT ROW SHAPE — see TEAM_GUIDE.md Section 9 (byte-identical to the
// Management Manager store's canonical shape, with two ME-side additions:
//   - comments[]              ME-authored short comments (Packet 2 lifts these into activityStore)
//   - updates[i].isClientVisible  toggle on work-note rows (default true; feeds Client Tracking Page)
//
// HARD RULES (also enforced in projects/projectsStore.js + Appendix B of the guide):
//   - The ME can flip status ONLY between "Not Started" and "In Progress".
//   - All other statuses (Review Stage / Finalization / Completed / Delayed / Work Started)
//     are owned by Team Leader / Manager — locked in the ME UI.
//   - Drive link, handover link, deadline, priority, totalCost, paidAmount, WO fields are
//     READ-ONLY for the ME. Never put them in <DataField>.
//
// The 4 dummy projects below are copy-paste from the Management Manager store
// where `assignedEmployees` includes "EM-204". The 3 PRJ-021 / PRJ-022 / PRJ-023
// rows are ME-side seed only — they let the Completed and Pending-Status-Update
// tabs render meaningfully in the standalone workspace.

// ─── Logged-in Management Employee ───────────────────────────────────────────
export const currentEmployee = {
  id: "EM-204",
  name: "Sara Khan",
  email: "sara.k@graphura.in",
  phone: "+91 99208 88004",
  role: "Frontend",
  joinDate: "2024-03-22",
  status: "Active",
  teamLeaderId: "TL-102",
  teamLeaderName: "Anjali Sinha",
  managerName: "Neha Agarwal",
};

// ─── My TL (read-only label only — no editable team membership on ME side) ──
export const myTL = {
  id: "TL-102",
  name: "Anjali Sinha",
  email: "anjali.s@graphura.in",
  region: "Bangalore",
};

// ─── Status & priority enums ─────────────────────────────────────────────────
// Full canonical enum (for filters / read-only displays).
export const PROJECT_STATUSES = [
  "Not Started",
  "Work Started",
  "In Progress",
  "Review Stage",
  "Finalization",
  "Completed",
  "Delayed",
];

// ME-controllable subset — used by the status-update dropdown.
// DO NOT extend this list. See TEAM_GUIDE.md Section 1 / Section 10 rule 8.
export const ME_ALLOWED_STATUSES = ["Not Started", "In Progress"];

export const PROJECT_PRIORITIES = ["High", "Medium", "Low"];

// "Active" on the ME side is strictly In Progress (what the ME is actively working on).
// Work Started / Review Stage / Finalization are TL/MM-owned transitions — they're
// active in the org-wide sense but not in the ME's hands.
export const ACTIVE_STATUSES = ["In Progress"];

// Status-gate helper — used by AllAssigned.jsx to enable/disable the
// Update Status row action. See TEAM_GUIDE.md Appendix B.
export const canUpdateStatus = (project) =>
  ME_ALLOWED_STATUSES.includes(project.status);

// ─── My projects (only rows where assignedEmployees includes currentEmployee.id) ──
// PRJ-002 / PRJ-005 / PRJ-009 / PRJ-019 are copy-pasted from the MM canonical store.
// PRJ-021 / PRJ-022 / PRJ-023 are ME-side seed (historical + upcoming).
export const myProjects = [
  // ── from MM store ───────────────────────────────────────────────────────────
  {
    id: "PRJ-002", name: "Bluewave Mobile App",
    clientId: "CL-002", clientName: "Bluewave Studios", clientMobile: "+91 99001 10002",
    driveLink: "https://drive.google.com/folder/bluewave/app",
    startDate: "2026-02-18", deadline: "2026-05-30", priority: "High",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha",
    assignedEmployees: ["EM-204", "EM-205", "EM-206"],
    status: "Review Stage", progress: 78,
    handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-09",
    totalCost: 600000, paidAmount: 300000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-02-17",
    updates: [
      { date: "2026-02-18", status: "Work Started", note: "Design system locked; backend scaffolded.", isClientVisible: true },
      { date: "2026-04-22", status: "In Progress",  note: "Auth + push notifications integrated.",     isClientVisible: true },
      { date: "2026-05-09", status: "Review Stage", note: "Client QA round 1 in progress.",            isClientVisible: true },
    ],
    comments: [
      { date: "2026-05-10", author: "Sara Khan", body: "Pushed the latest QA build to TestFlight." },
    ],
  },
  {
    id: "PRJ-005", name: "Evermore Property Portal",
    clientId: "CL-005", clientName: "Evermore Realty", clientMobile: "+91 99001 10005",
    driveLink: "https://drive.google.com/folder/evermore/portal",
    startDate: "2026-04-01", deadline: "2026-06-15", priority: "Medium",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha",
    assignedEmployees: ["EM-204", "EM-205"],
    status: "Work Started", progress: 25,
    handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-07",
    totalCost: 380000, paidAmount: 100000, paymentType: "Partial",
    woGenerated: true, woSigned: false, woSignedDate: null,
    updates: [
      { date: "2026-04-01", status: "Work Started", note: "Project kickoff.", isClientVisible: true },
    ],
    comments: [],
  },
  {
    id: "PRJ-009", name: "Acme Marketing Microsite",
    clientId: "CL-001", clientName: "Acme Corp", clientMobile: "+91 99001 10001",
    driveLink: "https://drive.google.com/folder/acme/microsite",
    startDate: "2026-04-15", deadline: "2026-05-25", priority: "Medium",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha",
    assignedEmployees: ["EM-204"],
    status: "In Progress", progress: 38,
    handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-22",
    totalCost: 150000, paidAmount: 50000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-04-14",
    updates: [
      { date: "2026-04-15", status: "Work Started", note: "Brief approved; wireframes done.",    isClientVisible: true },
      { date: "2026-05-04", status: "In Progress",  note: "Homepage + product grid built.",      isClientVisible: true },
      { date: "2026-05-22", status: "In Progress",  note: "Internal: pending icon set from MM.", isClientVisible: false },
    ],
    comments: [
      { date: "2026-05-20", author: "Sara Khan", body: "Need the final logo variants from the client." },
      { date: "2026-05-22", author: "Sara Khan", body: "Logo received — incorporating now." },
    ],
  },
  {
    id: "PRJ-019", name: "CrispEdu Parent Portal",
    clientId: "CL-003", clientName: "Crisp Edu", clientMobile: "+91 99001 10003",
    driveLink: "https://drive.google.com/folder/crispedu/parent",
    startDate: "2026-02-28", deadline: "2026-04-05", priority: "Medium",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha",
    assignedEmployees: ["EM-204", "EM-206"],
    status: "Delayed", progress: 55,
    handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-02",
    totalCost: 210000, paidAmount: 100000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-02-27",
    updates: [
      { date: "2026-02-28", status: "Work Started", note: "Kickoff.",                              isClientVisible: true },
      { date: "2026-04-05", status: "Delayed",      note: "Client API integration blocked — TL escalating.", isClientVisible: true },
    ],
    comments: [
      { date: "2026-05-02", author: "Sara Khan", body: "Still blocked on parent-auth API from client side." },
    ],
  },

  // ── ME-side seed (historical / upcoming) ───────────────────────────────────
  {
    id: "PRJ-021", name: "Acme Email Campaign Builder",
    clientId: "CL-001", clientName: "Acme Corp", clientMobile: "+91 99001 10001",
    driveLink: "https://drive.google.com/folder/acme/email",
    startDate: "2026-01-15", deadline: "2026-03-10", priority: "Medium",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha",
    assignedEmployees: ["EM-204"],
    status: "Completed", progress: 100,
    handoverLink: "https://drive.google.com/folder/acme/email/handover",
    deliveredDate: "2026-03-08", lastUpdated: "2026-03-08",
    totalCost: 130000, paidAmount: 130000, paymentType: "Full",
    woGenerated: true, woSigned: true, woSignedDate: "2026-01-14",
    updates: [
      { date: "2026-01-15", status: "Work Started", note: "Project kickoff.",                          isClientVisible: true },
      { date: "2026-02-20", status: "In Progress",  note: "Email template builder done.",              isClientVisible: true },
      { date: "2026-03-05", status: "Review Stage", note: "Client UAT round complete.",                isClientVisible: true },
      { date: "2026-03-08", status: "Completed",    note: "Final handover; client signed off.",        isClientVisible: true },
    ],
    comments: [],
  },
  {
    id: "PRJ-022", name: "Bluewave Investor Deck Page",
    clientId: "CL-002", clientName: "Bluewave Studios", clientMobile: "+91 99001 10002",
    driveLink: "https://drive.google.com/folder/bluewave/investor",
    startDate: "2026-05-01", deadline: "2026-06-30", priority: "Low",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha",
    assignedEmployees: ["EM-204"],
    status: "Not Started", progress: 0,
    handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-01",
    totalCost: 90000, paidAmount: 0, paymentType: "Partial",
    woGenerated: false, woSigned: false, woSignedDate: null,
    updates: [],
    comments: [],
  },
  {
    id: "PRJ-023", name: "Hexane Labs Onboarding Microsite",
    clientId: "CL-008", clientName: "Hexane Labs", clientMobile: "+91 99001 10008",
    driveLink: "https://drive.google.com/folder/hexane/onboarding",
    startDate: "2025-12-05", deadline: "2026-02-15", priority: "Medium",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha",
    assignedEmployees: ["EM-204"],
    status: "Completed", progress: 100,
    handoverLink: "https://drive.google.com/folder/hexane/onboarding/handover",
    deliveredDate: "2026-02-12", lastUpdated: "2026-02-12",
    totalCost: 180000, paidAmount: 180000, paymentType: "Full",
    woGenerated: true, woSigned: true, woSignedDate: "2025-12-04",
    updates: [
      { date: "2025-12-05", status: "Work Started", note: "Kickoff with Hexane team.",          isClientVisible: true },
      { date: "2026-01-20", status: "In Progress",  note: "Onboarding flow live in staging.",   isClientVisible: true },
      { date: "2026-02-12", status: "Completed",    note: "Handover shared; live on prod.",     isClientVisible: true },
    ],
    comments: [],
  },
];

// ─── Today (locked to system date for predictable demo behaviour) ───────────
// In production this would be `new Date().toISOString().slice(0, 10)`.
// For consistent dummy-data behaviour during demo / screenshot runs, we lock
// to the brief's current date so the "Pending Status Update" KPI and the
// Deadlines page render deterministically.
const TODAY = "2026-05-25";

// ─── Dashboard KPIs (4 metrics — see TEAM_GUIDE.md Section 8 / Packet 1) ─────
export const dashboardKPIs = [
  {
    title: "My Projects",
    value: String(myProjects.length),
    accent: "#3b82f6",
  },
  {
    title: "Active",
    value: String(myProjects.filter((p) => p.status === "In Progress").length),
    accent: "#14b8a6",
  },
  {
    title: "Completed",
    value: String(myProjects.filter((p) => p.status === "Completed").length),
    accent: "#22c55e",
  },
  {
    title: "Pending Status Update",
    value: String(
      myProjects.filter((p) => p.status === "Not Started" && p.startDate <= TODAY).length
    ),
    accent: "#f59e0b",
  },
];

// ─── Status mix (doughnut chart) ────────────────────────────────────────────
export const statusFunnel = PROJECT_STATUSES.map((s) => ({
  name: s,
  value: myProjects.filter((p) => p.status === s).length,
}));

// ─── Weekly notes-added activity (column chart) ─────────────────────────────
// Counts every entry the ME contributed to a project's updates[] in each ISO week.
// For Packet 1 we seed this directly; Packet 3's Performance page can re-derive
// from the live activityStore later.
export const weeklyNotesAdded = [
  { name: "W-15", count: 2 },
  { name: "W-16", count: 4 },
  { name: "W-17", count: 3 },
  { name: "W-18", count: 5 },
  { name: "W-19", count: 6 },
  { name: "W-20", count: 4 },
  { name: "W-21", count: 3 },
];

// ─── Upcoming deadlines (table for dashboard bottom) ────────────────────────
// Bucket label is what the dashboard renders as a status badge:
//   Overdue → orange, This Week → amber, This Month → slate, Future → slate
// (See STATUS_MAP in Common_Components — these labels auto-color.)
function deadlineBucket(deadline) {
  const d = new Date(deadline);
  const t = new Date(TODAY);
  const diff = Math.ceil((d - t) / 86400000);
  if (diff < 0)   return "Overdue";
  if (diff <= 7)  return "This Week";
  if (diff <= 30) return "This Month";
  return "Future";
}

export const upcomingDeadlines = myProjects
  .filter((p) => p.status !== "Completed")
  .map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    deadline: p.deadline,
    progress: `${p.progress}%`,
    projectStatus: p.status,
    status: deadlineBucket(p.deadline),
  }))
  .sort((a, b) => (a.deadline < b.deadline ? -1 : 1));

// ─── Recent comments feed (last 5 across all projects) ──────────────────────
export const recentComments = myProjects
  .flatMap((p) =>
    (p.comments ?? []).map((c) => ({
      projectId: p.id,
      projectName: p.name,
      ...c,
    }))
  )
  .sort((a, b) => (a.date < b.date ? 1 : -1))
  .slice(0, 5);
