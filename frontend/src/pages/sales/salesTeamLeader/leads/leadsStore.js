// leadsStore.js — Packet 2 (Leads workspace)
// All dummy data for AllLeads, Prospects, and FollowUps lives here.
// Executive list is imported from teamLeaderStore.js so names stay canonical.

import { teamExecutives, currentTL } from "../teamLeaderStore";

export { teamExecutives, currentTL };

export const executiveNames = teamExecutives.map((e) => e.name);

// ─── Lead status options (Brief Section 7) ────────────────────────────────────
export const LEAD_STATUS_OPTIONS = ["Untouched", "Talk", "Not Talk", "Interested", "Converted"];

// ─── Initial leads — scoped to the TL's team (Team Alpha) ────────────────────
// Every assigned lead goes to one of the 6 teamExecutives. "Unassigned" leads
// are leads the TL hasn't distributed yet.
export const INITIAL_LEADS = [
  { id: "L-2001", name: "Aman Khurana",   companyName: "Lumio Ventures",   mobile: "9876500201", email: "aman@lumio.in",      status: "Untouched",  assignedTo: "Unassigned",   createdAt: "2026-04-28", assignedAt: ""           },
  { id: "L-2002", name: "Sara Iyer",      companyName: "Brightline Co",    mobile: "9876500202", email: "sara@brightline.io", status: "Talk",       assignedTo: "Rahul Sharma", createdAt: "2026-04-29", assignedAt: "2026-04-29" },
  { id: "L-2003", name: "Karan Malhotra", companyName: "Northgate Health", mobile: "9876500203", email: "karan@northgate.in", status: "Interested", assignedTo: "Priya Mehta",  createdAt: "2026-04-29", assignedAt: "2026-04-29" },
  { id: "L-2004", name: "Tanya Bhat",     companyName: "Civic Loop",       mobile: "9876500204", email: "tanya@civicloop.io", status: "Not Talk",   assignedTo: "Arjun Kapoor", createdAt: "2026-04-30", assignedAt: "2026-04-30" },
  { id: "L-2005", name: "Devansh Gupta",  companyName: "Pivot AI",         mobile: "9876500205", email: "dev@pivotai.in",     status: "Talk",       assignedTo: "Sneha Rajput", createdAt: "2026-04-30", assignedAt: "2026-04-30" },
  { id: "L-2006", name: "Mira Saxena",    companyName: "Hexa Studios",     mobile: "9876500206", email: "mira@hexa.studio",   status: "Interested", assignedTo: "Rahul Sharma", createdAt: "2026-05-01", assignedAt: "2026-05-01" },
  { id: "L-2007", name: "Ishaan Verma",   companyName: "Quill Logistics",  mobile: "9876500207", email: "ishaan@quill.in",    status: "Untouched",  assignedTo: "Unassigned",   createdAt: "2026-05-02", assignedAt: ""           },
  { id: "L-2008", name: "Lavanya Rao",    companyName: "Drift Motors",     mobile: "9876500208", email: "lav@driftmotors.in", status: "Talk",       assignedTo: "Kavya Patel",  createdAt: "2026-05-02", assignedAt: "2026-05-02" },
  { id: "L-2009", name: "Nikhil Anand",   companyName: "Rune Bio",         mobile: "9876500209", email: "nikhil@runebio.in",  status: "Converted",  assignedTo: "Priya Mehta",  createdAt: "2026-05-03", assignedAt: "2026-05-03" },
  { id: "L-2010", name: "Pooja Chawla",   companyName: "Ember Tech",       mobile: "9876500210", email: "pooja@embertech.io", status: "Not Talk",   assignedTo: "Vikram Tiwari",createdAt: "2026-05-03", assignedAt: "2026-05-03" },
  { id: "L-2011", name: "Rohit Banerjee", companyName: "Crescent Foods",   mobile: "9876500211", email: "rohit@crescent.in",  status: "Interested", assignedTo: "Sneha Rajput", createdAt: "2026-05-04", assignedAt: "2026-05-04" },
  { id: "L-2012", name: "Anvi Joshi",     companyName: "Stellar Realty",   mobile: "9876500212", email: "anvi@stellar.in",    status: "Untouched",  assignedTo: "Unassigned",   createdAt: "2026-05-04", assignedAt: ""           },
  { id: "L-2013", name: "Yash Pandey",    companyName: "Indigo Travels",   mobile: "9876500213", email: "yash@indigotr.in",   status: "Talk",       assignedTo: "Arjun Kapoor", createdAt: "2026-05-05", assignedAt: "2026-05-05" },
  { id: "L-2014", name: "Riya Kulkarni",  companyName: "Bloom Skincare",   mobile: "9876500214", email: "riya@bloom.in",      status: "Converted",  assignedTo: "Rahul Sharma", createdAt: "2026-05-05", assignedAt: "2026-05-05" },
  { id: "L-2015", name: "Aarav Bhatia",   companyName: "Helix Sports",     mobile: "9876500215", email: "aarav@helix.in",     status: "Interested", assignedTo: "Kavya Patel",  createdAt: "2026-05-06", assignedAt: "2026-05-06" },
];

// ─── Prospects — team prospect forms ─────────────────────────────────────────
// Stage from "Talk" / "Interested" leads who have moved into deal-discussion.
export const INITIAL_PROSPECTS = [
  { id: "P-3001", name: "Karan Malhotra", companyName: "Northgate Health", mobile: "9876500203", email: "karan@northgate.in", service: "CRM Suite",       budget: "₹1,20,000", assignedExec: "Priya Mehta",  expectedClose: "2026-05-25", status: "Hot"  },
  { id: "P-3002", name: "Mira Saxena",    companyName: "Hexa Studios",     mobile: "9876500206", email: "mira@hexa.studio",   service: "HR Module",       budget: "₹65,000",   assignedExec: "Rahul Sharma", expectedClose: "2026-06-04", status: "Warm" },
  { id: "P-3003", name: "Rohit Banerjee", companyName: "Crescent Foods",   mobile: "9876500211", email: "rohit@crescent.in",  service: "Payroll Suite",   budget: "₹95,000",   assignedExec: "Sneha Rajput", expectedClose: "2026-06-02", status: "Hot"  },
  { id: "P-3004", name: "Aarav Bhatia",   companyName: "Helix Sports",     mobile: "9876500215", email: "aarav@helix.in",     service: "ERP System",      budget: "₹2,40,000", assignedExec: "Kavya Patel",  expectedClose: "2026-06-15", status: "Warm" },
  { id: "P-3005", name: "Nikhil Anand",   companyName: "Rune Bio",         mobile: "9876500209", email: "nikhil@runebio.in",  service: "CRM + Analytics", budget: "₹1,80,000", assignedExec: "Priya Mehta",  expectedClose: "2026-05-22", status: "Hot"  },
  { id: "P-3006", name: "Lavanya Rao",    companyName: "Drift Motors",     mobile: "9876500208", email: "lav@driftmotors.in", service: "Inventory Pro",   budget: "₹50,000",   assignedExec: "Kavya Patel",  expectedClose: "2026-06-20", status: "Cold" },
];

// ─── Follow-ups — reminders + missed detection ───────────────────────────────
// "today" anchor is 2026-05-07 (per environment context). Anything before that
// with status "pending" is auto-flagged as overdue at render time.
export const INITIAL_FOLLOWUPS = [
  // ── Overdue (before today) ──
  { id: "FU-4001", leadName: "Tanya Bhat",     date: "2026-05-04", time: "10:00 AM", type: "Call",    status: "Overdue", notes: "Re-engagement call after silence",                  assignedExec: "Arjun Kapoor", priority: "High"   },
  { id: "FU-4002", leadName: "Pooja Chawla",   date: "2026-05-05", time: "03:30 PM", type: "Email",   status: "Overdue", notes: "Send revised proposal — pending since last week",  assignedExec: "Vikram Tiwari",priority: "Medium" },
  { id: "FU-4003", leadName: "Aman Khurana",   date: "2026-05-06", time: "11:00 AM", type: "Call",    status: "Overdue", notes: "Initial pitch — lead untouched for 8 days",        assignedExec: "Rahul Sharma", priority: "High"   },

  // ── Today (2026-05-07) ──
  { id: "FU-4004", leadName: "Karan Malhotra", date: "2026-05-07", time: "10:30 AM", type: "Meeting", status: "Pending", notes: "On-site demo of CRM Suite at Northgate office",    assignedExec: "Priya Mehta",  priority: "High"   },
  { id: "FU-4005", leadName: "Sara Iyer",      date: "2026-05-07", time: "12:00 PM", type: "Call",    status: "Pending", notes: "Discuss pricing tiers and discount window",        assignedExec: "Rahul Sharma", priority: "Medium" },
  { id: "FU-4006", leadName: "Lavanya Rao",    date: "2026-05-07", time: "02:00 PM", type: "Email",   status: "Pending", notes: "Share inventory module spec sheet",                assignedExec: "Kavya Patel",  priority: "Low"    },
  { id: "FU-4007", leadName: "Devansh Gupta",  date: "2026-05-07", time: "04:00 PM", type: "Call",    status: "Done",    notes: "Quick check-in — confirmed positive interest",     assignedExec: "Sneha Rajput", priority: "Medium" },

  // ── Upcoming ──
  { id: "FU-4008", leadName: "Mira Saxena",    date: "2026-05-09", time: "11:00 AM", type: "Meeting", status: "Pending", notes: "HR module demo with their ops lead",                assignedExec: "Rahul Sharma", priority: "High"   },
  { id: "FU-4009", leadName: "Ishaan Verma",   date: "2026-05-10", time: "10:00 AM", type: "Call",    status: "Pending", notes: "First contact — Quill Logistics inbound",          assignedExec: "Rahul Sharma", priority: "Medium" },
  { id: "FU-4010", leadName: "Rohit Banerjee", date: "2026-05-12", time: "03:00 PM", type: "Meeting", status: "Pending", notes: "Payroll Suite walkthrough at Crescent",            assignedExec: "Sneha Rajput", priority: "High"   },
  { id: "FU-4011", leadName: "Yash Pandey",    date: "2026-05-13", time: "11:30 AM", type: "Email",   status: "Pending", notes: "Send case study from similar travel client",       assignedExec: "Arjun Kapoor", priority: "Low"    },
  { id: "FU-4012", leadName: "Anvi Joshi",     date: "2026-05-15", time: "10:00 AM", type: "Call",    status: "Pending", notes: "Cold-start outreach — Stellar Realty",             assignedExec: "Priya Mehta",  priority: "Medium" },
  { id: "FU-4013", leadName: "Aarav Bhatia",   date: "2026-05-16", time: "02:30 PM", type: "Meeting", status: "Pending", notes: "ERP scoping session at Helix HQ",                  assignedExec: "Kavya Patel",  priority: "High"   },
  { id: "FU-4014", leadName: "Nikhil Anand",   date: "2026-05-19", time: "04:00 PM", type: "Call",    status: "Pending", notes: "Closing call — Rune Bio renewal",                  assignedExec: "Priya Mehta",  priority: "High"   },

  // ── Past, completed ──
  { id: "FU-4015", leadName: "Riya Kulkarni",  date: "2026-05-02", time: "02:00 PM", type: "Meeting", status: "Done",    notes: "Bloom Skincare — contract signed",                  assignedExec: "Rahul Sharma", priority: "High"   },
];

// ─── Lead form / KPI helpers ─────────────────────────────────────────────────
// Used as filter options in <DataTable filters={...} />.
export const FOLLOWUP_TYPES = ["Call", "Email", "Meeting"];
export const FOLLOWUP_PRIORITIES = ["High", "Medium", "Low"];
