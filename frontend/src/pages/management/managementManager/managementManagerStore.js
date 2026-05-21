// managementManagerStore.js
// Canonical dummy data for the Management Manager workspace.
// Owned by Packet 1 (Dashboard + Projects). Other packets import from here
// so client / TL / employee / project IDs stay consistent across pages.

// ─── Logged-in Management Manager ────────────────────────────────────────────
export const currentMM = {
  id: "MM-001",
  name: "Neha Agarwal",
  email: "neha.agarwal@graphura.in",
  department: "Management",
};

// ─── Team Leaders reporting to the MM (canonical list) ───────────────────────
export const teamLeaders = [
  { id: "TL-101", name: "Ravi Khanna",   email: "ravi.k@graphura.in",   phone: "+91 99201 11001", joinDate: "2024-01-12", status: "Active",   region: "Mumbai" },
  { id: "TL-102", name: "Anjali Sinha",  email: "anjali.s@graphura.in", phone: "+91 99202 22002", joinDate: "2024-03-08", status: "Active",   region: "Bangalore" },
  { id: "TL-103", name: "Imran Sheikh",  email: "imran.s@graphura.in",  phone: "+91 99203 33003", joinDate: "2024-05-21", status: "Active",   region: "Delhi" },
  { id: "TL-104", name: "Pooja Reddy",   email: "pooja.r@graphura.in",  phone: "+91 99204 44004", joinDate: "2024-09-02", status: "On Leave", region: "Hyderabad" },
];

// ─── Employees reporting up to a TL (canonical list) ─────────────────────────
// `teamLeaderId` links each employee to their TL.
export const employees = [
  { id: "EM-201", name: "Karan Malhotra", email: "karan.m@graphura.in",   phone: "+91 99205 55001", teamLeaderId: "TL-101", role: "Frontend",   joinDate: "2024-02-10", status: "Active" },
  { id: "EM-202", name: "Divya Iyer",     email: "divya.i@graphura.in",   phone: "+91 99206 66002", teamLeaderId: "TL-101", role: "Backend",    joinDate: "2024-04-15", status: "Active" },
  { id: "EM-203", name: "Manish Joshi",   email: "manish.j@graphura.in",  phone: "+91 99207 77003", teamLeaderId: "TL-101", role: "Designer",   joinDate: "2024-07-01", status: "Active" },
  { id: "EM-204", name: "Sara Khan",      email: "sara.k@graphura.in",    phone: "+91 99208 88004", teamLeaderId: "TL-102", role: "Frontend",   joinDate: "2024-03-22", status: "Active" },
  { id: "EM-205", name: "Rohit Bansal",   email: "rohit.b@graphura.in",   phone: "+91 99209 99005", teamLeaderId: "TL-102", role: "Backend",    joinDate: "2024-06-19", status: "Active" },
  { id: "EM-206", name: "Aisha Verma",    email: "aisha.v@graphura.in",   phone: "+91 99210 11006", teamLeaderId: "TL-102", role: "QA",         joinDate: "2024-08-04", status: "On Leave" },
  { id: "EM-207", name: "Tushar Rao",     email: "tushar.r@graphura.in",  phone: "+91 99211 22007", teamLeaderId: "TL-103", role: "DevOps",     joinDate: "2024-05-29", status: "Active" },
  { id: "EM-208", name: "Meera Pillai",   email: "meera.p@graphura.in",   phone: "+91 99212 33008", teamLeaderId: "TL-103", role: "Backend",    joinDate: "2024-07-18", status: "Active" },
  { id: "EM-209", name: "Yash Chauhan",   email: "yash.c@graphura.in",    phone: "+91 99213 44009", teamLeaderId: "TL-103", role: "Frontend",   joinDate: "2024-10-05", status: "Active" },
  { id: "EM-210", name: "Ritika Singh",   email: "ritika.s@graphura.in",  phone: "+91 99214 55010", teamLeaderId: "TL-104", role: "Designer",   joinDate: "2024-09-12", status: "Active" },
  { id: "EM-211", name: "Aditya Nair",    email: "aditya.n@graphura.in",  phone: "+91 99215 66011", teamLeaderId: "TL-104", role: "Backend",    joinDate: "2024-11-20", status: "Active" },
  { id: "EM-212", name: "Nikita Bhat",    email: "nikita.b@graphura.in",  phone: "+91 99216 77012", teamLeaderId: "TL-104", role: "QA",         joinDate: "2025-01-14", status: "Active" },
];

// ─── Clients (mobile = primary key per Brief Section 12 / 22) ────────────────
// Note: `clients` page lifts this into local state so MM can Add / Edit / Update drive link.
export const clientList = [
  { id: "CL-001", name: "Acme Corp",        mobile: "+91 99001 10001", email: "ops@acme.in",        driveLink: "https://drive.google.com/folder/acme" },
  { id: "CL-002", name: "Bluewave Studios", mobile: "+91 99001 10002", email: "hello@bluewave.io",  driveLink: "https://drive.google.com/folder/bluewave" },
  { id: "CL-003", name: "Crisp Edu",        mobile: "+91 99001 10003", email: "team@crispedu.com",  driveLink: "https://drive.google.com/folder/crispedu" },
  { id: "CL-004", name: "Delta Logistics",  mobile: "+91 99001 10004", email: "it@deltalog.in",     driveLink: "https://drive.google.com/folder/delta" },
  { id: "CL-005", name: "Evermore Realty",  mobile: "+91 99001 10005", email: "contact@evermore.in", driveLink: "https://drive.google.com/folder/evermore" },
  { id: "CL-006", name: "Fjord Coffee",     mobile: "+91 99001 10006", email: "brew@fjord.coffee",  driveLink: "https://drive.google.com/folder/fjord" },
  { id: "CL-007", name: "GreenLeaf NGO",    mobile: "+91 99001 10007", email: "info@greenleaf.org", driveLink: "https://drive.google.com/folder/greenleaf" },
  { id: "CL-008", name: "Hexane Labs",      mobile: "+91 99001 10008", email: "dev@hexane.dev",     driveLink: "https://drive.google.com/folder/hexane" },
];

// ─── Projects — canonical row shape ─────────────────────────────────────────
// status enum aligns with Brief Section 14 tracking page: "Completed" (not "Delivered").
// driveLink is MANDATORY at create-time.
// handoverLink is MANDATORY before status="Completed".
// updates[] is the append-only milestone log fed to the tracking page.
// totalCost/paidAmount/paymentType/woGenerated/woSigned/woSignedDate are Finance-owned
// placeholders — MM displays them read-only; Finance dept owns the write path.
export const projects = [
  {
    id: "PRJ-001", name: "Acme Website Redesign", clientId: "CL-001", clientName: "Acme Corp", clientMobile: "+91 99001 10001",
    driveLink: "https://drive.google.com/folder/acme/website",
    startDate: "2026-03-10", deadline: "2026-05-20", priority: "High",
    assignedTL: "TL-101", assignedTLName: "Ravi Khanna", assignedEmployees: ["EM-201","EM-202"],
    status: "In Progress", progress: 45, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-08",
    totalCost: 350000, paidAmount: 175000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-03-09",
    updates: [
      { date: "2026-03-10", status: "Work Started",  note: "Kickoff meeting; access shared on drive." },
      { date: "2026-04-15", status: "In Progress",   note: "Homepage + 3 inner pages done, awaiting client feedback." },
      { date: "2026-05-08", status: "In Progress",   note: "Client requested colour palette tweak; incorporated." },
    ],
  },
  {
    id: "PRJ-002", name: "Bluewave Mobile App", clientId: "CL-002", clientName: "Bluewave Studios", clientMobile: "+91 99001 10002",
    driveLink: "https://drive.google.com/folder/bluewave/app",
    startDate: "2026-02-18", deadline: "2026-05-30", priority: "High",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha", assignedEmployees: ["EM-204","EM-205","EM-206"],
    status: "Review Stage", progress: 78, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-09",
    totalCost: 600000, paidAmount: 300000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-02-17",
    updates: [
      { date: "2026-02-18", status: "Work Started",  note: "Design system locked; backend scaffolded." },
      { date: "2026-04-22", status: "In Progress",   note: "Auth + push notifications integrated." },
      { date: "2026-05-09", status: "Review Stage",  note: "Client QA round 1 in progress." },
    ],
  },
  {
    id: "PRJ-003", name: "CrispEdu LMS Phase 2", clientId: "CL-003", clientName: "Crisp Edu", clientMobile: "+91 99001 10003",
    driveLink: "https://drive.google.com/folder/crispedu/phase2",
    startDate: "2026-01-05", deadline: "2026-04-30", priority: "Medium",
    assignedTL: "TL-101", assignedTLName: "Ravi Khanna", assignedEmployees: ["EM-203"],
    status: "Completed", progress: 100,
    handoverLink: "https://drive.google.com/folder/crispedu/phase2/handover",
    deliveredDate: "2026-04-28", lastUpdated: "2026-04-28",
    totalCost: 200000, paidAmount: 200000, paymentType: "Full",
    woGenerated: true, woSigned: true, woSignedDate: "2026-01-04",
    updates: [
      { date: "2026-01-05", status: "Work Started", note: "Phase 2 spec confirmed." },
      { date: "2026-03-12", status: "Review Stage", note: "Final UAT round started." },
      { date: "2026-04-28", status: "Completed",    note: "Handover link shared; project delivered." },
    ],
  },
  {
    id: "PRJ-004", name: "Delta Fleet Dashboard", clientId: "CL-004", clientName: "Delta Logistics", clientMobile: "+91 99001 10004",
    driveLink: "https://drive.google.com/folder/delta/fleet",
    startDate: "2026-02-22", deadline: "2026-04-15", priority: "High",
    assignedTL: "TL-103", assignedTLName: "Imran Sheikh", assignedEmployees: ["EM-207","EM-208"],
    status: "Delayed", progress: 62, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-04",
    totalCost: 450000, paidAmount: 225000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-02-21",
    updates: [
      { date: "2026-02-22", status: "Work Started", note: "Project kickoff." },
      { date: "2026-04-10", status: "Delayed",     note: "Client side data integration delays — push deadline." },
    ],
  },
  {
    id: "PRJ-005", name: "Evermore Property Portal", clientId: "CL-005", clientName: "Evermore Realty", clientMobile: "+91 99001 10005",
    driveLink: "https://drive.google.com/folder/evermore/portal",
    startDate: "2026-04-01", deadline: "2026-06-15", priority: "Medium",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha", assignedEmployees: ["EM-204","EM-205"],
    status: "Work Started", progress: 25, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-07",
    totalCost: 380000, paidAmount: 100000, paymentType: "Partial",
    woGenerated: true, woSigned: false, woSignedDate: null,
    updates: [
      { date: "2026-04-01", status: "Work Started", note: "Project kickoff." },
    ],
  },
  {
    id: "PRJ-006", name: "Fjord Coffee Order App", clientId: "CL-006", clientName: "Fjord Coffee", clientMobile: "+91 99001 10006",
    driveLink: "https://drive.google.com/folder/fjord/order-app",
    startDate: "2026-03-25", deadline: "2026-05-10", priority: "Low",
    assignedTL: "TL-104", assignedTLName: "Pooja Reddy", assignedEmployees: ["EM-211","EM-212"],
    status: "Finalization", progress: 92, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-09",
    totalCost: 180000, paidAmount: 180000, paymentType: "Full",
    woGenerated: true, woSigned: true, woSignedDate: "2026-03-24",
    updates: [],
  },
  {
    id: "PRJ-007", name: "GreenLeaf Donation Site", clientId: "CL-007", clientName: "GreenLeaf NGO", clientMobile: "+91 99001 10007",
    driveLink: "https://drive.google.com/folder/greenleaf/site",
    startDate: "2026-04-10", deadline: "2026-06-30", priority: "Low",
    assignedTL: "TL-103", assignedTLName: "Imran Sheikh", assignedEmployees: ["EM-209"],
    status: "Not Started", progress: 0, handoverLink: null, deliveredDate: null, lastUpdated: "2026-04-10",
    totalCost: 120000, paidAmount: 0, paymentType: "Partial",
    woGenerated: false, woSigned: false, woSignedDate: null,
    updates: [],
  },
  {
    id: "PRJ-008", name: "Hexane Labs API Gateway", clientId: "CL-008", clientName: "Hexane Labs", clientMobile: "+91 99001 10008",
    driveLink: "https://drive.google.com/folder/hexane/gateway",
    startDate: "2026-02-01", deadline: "2026-04-20", priority: "High",
    assignedTL: "TL-101", assignedTLName: "Ravi Khanna", assignedEmployees: ["EM-202","EM-203"],
    status: "Completed", progress: 100,
    handoverLink: "https://drive.google.com/folder/hexane/gateway/handover",
    deliveredDate: "2026-04-19", lastUpdated: "2026-04-19",
    totalCost: 520000, paidAmount: 520000, paymentType: "Full",
    woGenerated: true, woSigned: true, woSignedDate: "2026-01-31",
    updates: [],
  },
  {
    id: "PRJ-009", name: "Acme Marketing Microsite", clientId: "CL-001", clientName: "Acme Corp", clientMobile: "+91 99001 10001",
    driveLink: "https://drive.google.com/folder/acme/microsite",
    startDate: "2026-04-15", deadline: "2026-05-25", priority: "Medium",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha", assignedEmployees: ["EM-204"],
    status: "In Progress", progress: 38, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-09",
    totalCost: 150000, paidAmount: 50000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-04-14",
    updates: [],
  },
  {
    id: "PRJ-010", name: "Bluewave Brand Refresh", clientId: "CL-002", clientName: "Bluewave Studios", clientMobile: "+91 99001 10002",
    driveLink: "https://drive.google.com/folder/bluewave/brand",
    startDate: "2026-03-05", deadline: "2026-04-25", priority: "Medium",
    assignedTL: "TL-104", assignedTLName: "Pooja Reddy", assignedEmployees: ["EM-210"],
    status: "Completed", progress: 100,
    handoverLink: null /* missing — flags MM action */,
    deliveredDate: "2026-04-23", lastUpdated: "2026-04-23",
    totalCost: 220000, paidAmount: 220000, paymentType: "Full",
    woGenerated: true, woSigned: true, woSignedDate: "2026-03-04",
    updates: [],
  },
  {
    id: "PRJ-011", name: "CrispEdu Mobile Quizzes", clientId: "CL-003", clientName: "Crisp Edu", clientMobile: "+91 99001 10003",
    driveLink: "https://drive.google.com/folder/crispedu/quizzes",
    startDate: "2026-04-20", deadline: "2026-07-10", priority: "Medium",
    assignedTL: "TL-103", assignedTLName: "Imran Sheikh", assignedEmployees: ["EM-208","EM-209"],
    status: "In Progress", progress: 30, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-06",
    totalCost: 280000, paidAmount: 100000, paymentType: "Partial",
    woGenerated: true, woSigned: false, woSignedDate: null,
    updates: [],
  },
  {
    id: "PRJ-012", name: "Delta Driver App", clientId: "CL-004", clientName: "Delta Logistics", clientMobile: "+91 99001 10004",
    driveLink: "https://drive.google.com/folder/delta/driver",
    startDate: "2026-04-25", deadline: "2026-06-20", priority: "High",
    assignedTL: "TL-101", assignedTLName: "Ravi Khanna", assignedEmployees: ["EM-201"],
    status: "Work Started", progress: 15, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-08",
    totalCost: 410000, paidAmount: 0, paymentType: "Partial",
    woGenerated: false, woSigned: false, woSignedDate: null,
    updates: [],
  },
  {
    id: "PRJ-013", name: "Evermore CRM Integration", clientId: "CL-005", clientName: "Evermore Realty", clientMobile: "+91 99001 10005",
    driveLink: "https://drive.google.com/folder/evermore/crm",
    startDate: "2026-03-12", deadline: "2026-04-30", priority: "High",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha", assignedEmployees: ["EM-205","EM-206"],
    status: "Delayed", progress: 70, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-05",
    totalCost: 330000, paidAmount: 165000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-03-11",
    updates: [],
  },
  {
    id: "PRJ-014", name: "Fjord Coffee POS Sync", clientId: "CL-006", clientName: "Fjord Coffee", clientMobile: "+91 99001 10006",
    driveLink: "https://drive.google.com/folder/fjord/pos-sync",
    startDate: "2026-04-08", deadline: "2026-05-18", priority: "Medium",
    assignedTL: "TL-104", assignedTLName: "Pooja Reddy", assignedEmployees: ["EM-211"],
    status: "Review Stage", progress: 80, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-09",
    totalCost: 165000, paidAmount: 100000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-04-07",
    updates: [],
  },
  {
    id: "PRJ-015", name: "GreenLeaf Volunteer Portal", clientId: "CL-007", clientName: "GreenLeaf NGO", clientMobile: "+91 99001 10007",
    driveLink: "https://drive.google.com/folder/greenleaf/volunteer",
    startDate: "2026-02-05", deadline: "2026-04-10", priority: "Low",
    assignedTL: "TL-103", assignedTLName: "Imran Sheikh", assignedEmployees: ["EM-207"],
    status: "Completed", progress: 100,
    handoverLink: "https://drive.google.com/folder/greenleaf/volunteer/handover",
    deliveredDate: "2026-04-09", lastUpdated: "2026-04-09",
    totalCost: 140000, paidAmount: 140000, paymentType: "Full",
    woGenerated: true, woSigned: true, woSignedDate: "2026-02-04",
    updates: [],
  },
  {
    id: "PRJ-016", name: "Hexane Labs Docs Portal", clientId: "CL-008", clientName: "Hexane Labs", clientMobile: "+91 99001 10008",
    driveLink: "https://drive.google.com/folder/hexane/docs",
    startDate: "2026-04-22", deadline: "2026-06-05", priority: "Low",
    assignedTL: "TL-101", assignedTLName: "Ravi Khanna", assignedEmployees: ["EM-203"],
    status: "Not Started", progress: 0, handoverLink: null, deliveredDate: null, lastUpdated: "2026-04-22",
    totalCost: 110000, paidAmount: 0, paymentType: "Partial",
    woGenerated: false, woSigned: false, woSignedDate: null,
    updates: [],
  },
  {
    id: "PRJ-017", name: "Acme Internal Tooling", clientId: "CL-001", clientName: "Acme Corp", clientMobile: "+91 99001 10001",
    driveLink: "https://drive.google.com/folder/acme/internal",
    startDate: "2026-01-20", deadline: "2026-03-25", priority: "Medium",
    assignedTL: "TL-104", assignedTLName: "Pooja Reddy", assignedEmployees: ["EM-210","EM-212"],
    status: "Completed", progress: 100,
    handoverLink: "https://drive.google.com/folder/acme/internal/handover",
    deliveredDate: "2026-03-24", lastUpdated: "2026-03-24",
    totalCost: 290000, paidAmount: 290000, paymentType: "Full",
    woGenerated: true, woSigned: true, woSignedDate: "2026-01-19",
    updates: [],
  },
  {
    id: "PRJ-018", name: "Bluewave Analytics V1", clientId: "CL-002", clientName: "Bluewave Studios", clientMobile: "+91 99001 10002",
    driveLink: "https://drive.google.com/folder/bluewave/analytics",
    startDate: "2026-04-30", deadline: "2026-06-25", priority: "High",
    assignedTL: "TL-103", assignedTLName: "Imran Sheikh", assignedEmployees: ["EM-208"],
    status: "Work Started", progress: 18, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-07",
    totalCost: 480000, paidAmount: 100000, paymentType: "Partial",
    woGenerated: true, woSigned: false, woSignedDate: null,
    updates: [],
  },
  {
    id: "PRJ-019", name: "CrispEdu Parent Portal", clientId: "CL-003", clientName: "Crisp Edu", clientMobile: "+91 99001 10003",
    driveLink: "https://drive.google.com/folder/crispedu/parent",
    startDate: "2026-02-28", deadline: "2026-04-05", priority: "Medium",
    assignedTL: "TL-102", assignedTLName: "Anjali Sinha", assignedEmployees: ["EM-204","EM-206"],
    status: "Delayed", progress: 55, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-02",
    totalCost: 210000, paidAmount: 100000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-02-27",
    updates: [],
  },
  {
    id: "PRJ-020", name: "Delta Warehouse Tracker", clientId: "CL-004", clientName: "Delta Logistics", clientMobile: "+91 99001 10004",
    driveLink: "https://drive.google.com/folder/delta/warehouse",
    startDate: "2026-03-30", deadline: "2026-05-22", priority: "Medium",
    assignedTL: "TL-104", assignedTLName: "Pooja Reddy", assignedEmployees: ["EM-211","EM-212"],
    status: "In Progress", progress: 50, handoverLink: null, deliveredDate: null, lastUpdated: "2026-05-09",
    totalCost: 260000, paidAmount: 100000, paymentType: "Partial",
    woGenerated: true, woSigned: true, woSignedDate: "2026-03-29",
    updates: [],
  },
];

// ─── Dashboard KPIs (6 metrics — see TEAM_GUIDE.md Section 8 / Packet 1) ─────
export const dashboardKPIs = [
  { title: "Total Projects",         value: String(projects.length),                                                                                          accent: "#3b82f6" },
  { title: "Active Projects",        value: String(projects.filter(p => ["In Progress","Work Started","Review Stage","Finalization"].includes(p.status)).length), accent: "#14b8a6" },
  { title: "Completed (This Month)", value: String(projects.filter(p => p.status === "Completed" && p.deliveredDate?.startsWith("2026-04")).length),         accent: "#22c55e" },
  { title: "Delayed",                value: String(projects.filter(p => p.status === "Delayed").length),                                                      accent: "#f43f5e" },
  { title: "On-time Delivery %",     value: "83%",                                                                                                            accent: "#8b5cf6" },
  { title: "Pending Handover Links", value: String(projects.filter(p => p.status === "Completed" && !p.handoverLink).length),                                accent: "#f59e0b" },
];

// ─── Project status funnel (pie / doughnut chart) ────────────────────────────
export const projectStatusFunnel = [
  { name: "Not Started",   value: projects.filter(p => p.status === "Not Started").length },
  { name: "Work Started",  value: projects.filter(p => p.status === "Work Started").length },
  { name: "In Progress",   value: projects.filter(p => p.status === "In Progress").length },
  { name: "Review Stage",  value: projects.filter(p => p.status === "Review Stage").length },
  { name: "Finalization",  value: projects.filter(p => p.status === "Finalization").length },
  { name: "Completed",     value: projects.filter(p => p.status === "Completed").length },
  { name: "Delayed",       value: projects.filter(p => p.status === "Delayed").length },
];

// ─── Monthly delivery trend (last 12 months) ─────────────────────────────────
export const monthlyDelivery = [
  { name: "Jun", started: 4, delivered: 2 },
  { name: "Jul", started: 5, delivered: 3 },
  { name: "Aug", started: 3, delivered: 4 },
  { name: "Sep", started: 6, delivered: 3 },
  { name: "Oct", started: 5, delivered: 5 },
  { name: "Nov", started: 7, delivered: 4 },
  { name: "Dec", started: 4, delivered: 6 },
  { name: "Jan", started: 6, delivered: 5 },
  { name: "Feb", started: 8, delivered: 4 },
  { name: "Mar", started: 5, delivered: 6 },
  { name: "Apr", started: 7, delivered: 8 },
  { name: "May", started: 4, delivered: 1 },
];

// ─── Per-TL load (column chart) ──────────────────────────────────────────────
export const tlLoad = teamLeaders.map(tl => {
  const tlProjects = projects.filter(p => p.assignedTL === tl.id);
  return {
    name: tl.name.split(" ")[0],
    active:    tlProjects.filter(p => ["In Progress","Work Started","Review Stage","Finalization"].includes(p.status)).length,
    completed: tlProjects.filter(p => p.status === "Completed").length,
    delayed:   tlProjects.filter(p => p.status === "Delayed").length,
  };
});

// ─── Recent / leaderboard rows for the dashboard ─────────────────────────────
export const recentProjects = [...projects]
  .sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1))
  .slice(0, 8)
  .map(p => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    assignedTLName: p.assignedTLName,
    deadline: p.deadline,
    progress: `${p.progress}%`,
    status: p.status,
    priority: p.priority,
  }));

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const ACTIVE_STATUSES   = ["In Progress", "Work Started", "Review Stage", "Finalization"];
export const PROJECT_STATUSES  = ["Not Started", "Work Started", "In Progress", "Review Stage", "Finalization", "Completed", "Delayed"];
export const PROJECT_PRIORITIES = ["High", "Medium", "Low"];

export const employeesForTL = (tlId) => employees.filter(e => e.teamLeaderId === tlId);
export const employeeName   = (id)   => employees.find(e => e.id === id)?.name ?? id;
