// ─── Shared constants & dummy data for the Leads section ─────────────────────
// All sub-pages import from here so data stays in one place.

export const TEAM_LEADERS = [
  { id: "TL001", name: "Rahul Mehta",  currentLeads: 1200, email: "rahul@crm.com" },
  { id: "TL002", name: "Sneha Patel",  currentLeads: 980,  email: "sneha@crm.com" },
  { id: "TL003", name: "Arjun Verma",  currentLeads: 450,  email: "arjun@crm.com" },
  { id: "TL004", name: "Priya Sharma", currentLeads: 1490, email: "priya@crm.com" },
  { id: "TL005", name: "Kabir Singh",  currentLeads: 300,  email: "kabir@crm.com" },
];

export const MAX_LEADS = 1500;

export const INITIAL_LEADS = [
  { id: "L001", name: "Amit Joshi",    mobile: "9876543210", email: "amit@gmail.com",    status: "New",       assignedTo: "Rahul Mehta", createdAt: "2025-04-01", assignedAt: "2025-04-01" },
  { id: "L002", name: "Nisha Agarwal", mobile: "9123456780", email: "nisha@yahoo.com",   status: "Follow-up", assignedTo: "Sneha Patel", createdAt: "2025-04-02", assignedAt: "2025-04-02" },
  { id: "L003", name: "Rohit Kumar",   mobile: "8765432109", email: "rohit@gmail.com",   status: "Prospect",  assignedTo: "Arjun Verma", createdAt: "2025-04-03", assignedAt: "2025-04-03" },
  { id: "L004", name: "Deepa Singh",   mobile: "7654321098", email: "deepa@outlook.com", status: "New",       assignedTo: "Unassigned",  createdAt: "2025-04-04", assignedAt: "" },
  { id: "L005", name: "Vikram Shah",   mobile: "6543210987", email: "vikram@gmail.com",  status: "Prospect",  assignedTo: "Kabir Singh", createdAt: "2025-04-05", assignedAt: "2025-04-05" },
  { id: "L006", name: "Meera Nair",    mobile: "9988776655", email: "meera@gmail.com",   status: "New",       assignedTo: "Unassigned",  createdAt: "2025-04-06", assignedAt: "" },
  { id: "L007", name: "Suresh Babu",   mobile: "8877665544", email: "suresh@gmail.com",  status: "Follow-up", assignedTo: "Rahul Mehta", createdAt: "2025-04-07", assignedAt: "2025-04-07" },
  { id: "L008", name: "Kavya Reddy",   mobile: "7766554433", email: "kavya@gmail.com",   status: "Converted", assignedTo: "Sneha Patel", createdAt: "2025-04-08", assignedAt: "2025-04-08" },
];

export const DUMMY_PROSPECTS = [
  { id: "P001", name: "Amit Joshi",   mobile: "9876543210", email: "amit@gmail.com",   service: "CRM Software",  budget: "₹50,000",   assignedTL: "Rahul Mehta", status: "Hot"  },
  { id: "P002", name: "Rohit Kumar",  mobile: "8765432109", email: "rohit@gmail.com",  service: "HR Module",     budget: "₹30,000",   assignedTL: "Arjun Verma", status: "Warm" },
  { id: "P003", name: "Vikram Shah",  mobile: "6543210987", email: "vikram@gmail.com", service: "Payroll Suite", budget: "₹80,000",   assignedTL: "Kabir Singh", status: "Cold" },
  { id: "P004", name: "Pooja Tiwari", mobile: "9871234560", email: "pooja@gmail.com",  service: "ERP System",    budget: "₹1,50,000", assignedTL: "Rahul Mehta", status: "Hot"  },
];

export const DUMMY_FOLLOWUPS = [
  // ── May 3 (today) ──
  { id: "FU001", leadName: "Deepak Rao",      mobile: "9876501001", email: "deepak.rao@gmail.com",      date: "2026-05-03", time: "10:00 AM", type: "Call",    status: "expired", notes: "Was supposed to call back yesterday — urgent follow-up needed",   assignedExec: "Raj Patel",   priority: "High"   },
  { id: "FU002", leadName: "Ananya Nair",     mobile: "9876501002", email: "ananya.nair@yahoo.com",     date: "2026-05-03", time: "11:00 AM", type: "Meeting", status: "expired", notes: "Demo rescheduled but not confirmed — check availability",         assignedExec: "Priti Shah",  priority: "High"   },
  { id: "FU003", leadName: "Vikash Sharma",   mobile: "9876501003", email: "vikash.sharma@gmail.com",   date: "2026-05-03", time: "12:30 PM", type: "Call",    status: "pending", notes: "Discuss pricing for the premium plan",                            assignedExec: "Sunita Roy",  priority: "Medium" },
  { id: "FU004", leadName: "Ritu Desai",      mobile: "9876501004", email: "ritu.desai@outlook.com",    date: "2026-05-03", time: "02:00 PM", type: "Email",   status: "pending", notes: "Send revised proposal with updated terms",                        assignedExec: "Raj Patel",   priority: "Low"    },

  // ── May 5 ──
  { id: "FU005", leadName: "Rohan Gupta",     mobile: "9876501005", email: "rohan.gupta@gmail.com",     date: "2026-05-05", time: "10:30 AM", type: "Meeting", status: "pending", notes: "Product demo at their Pune office",                               assignedExec: "Priti Shah",  priority: "High"   },
  { id: "FU006", leadName: "Sanya Patel",     mobile: "9876501006", email: "sanya.patel@gmail.com",     date: "2026-05-05", time: "03:00 PM", type: "Call",    status: "pending", notes: "Follow up on the sent quotation — awaiting decision",             assignedExec: "Sunita Roy",  priority: "Medium" },

  // ── May 7 ──
  { id: "FU007", leadName: "Arjun Malhotra",  mobile: "9876501007", email: "arjun.malhotra@gmail.com",  date: "2026-05-07", time: "09:00 AM", type: "Email",   status: "pending", notes: "Contract terms discussion — send final draft",                    assignedExec: "Raj Patel",   priority: "High"   },
  { id: "FU008", leadName: "Meera Nair",      mobile: "9876501008", email: "meera.nair@gmail.com",      date: "2026-05-07", time: "11:30 AM", type: "Call",    status: "pending", notes: "Check interest in the new HR module add-on",                     assignedExec: "Priti Shah",  priority: "Low"    },

  // ── May 8 ──
  { id: "FU009", leadName: "Amit Joshi",      mobile: "9876543210", email: "amit@gmail.com",            date: "2026-05-08", time: "10:00 AM", type: "Call",    status: "pending", notes: "Discuss CRM software requirements in detail",                     assignedExec: "Sunita Roy",  priority: "High"   },
  { id: "FU010", leadName: "Nisha Agarwal",   mobile: "9123456780", email: "nisha@yahoo.com",           date: "2026-05-08", time: "01:00 PM", type: "Meeting", status: "pending", notes: "Onboarding walkthrough for the new platform",                     assignedExec: "Raj Patel",   priority: "Medium" },
  { id: "FU011", leadName: "Pooja Tiwari",    mobile: "9871234560", email: "pooja@gmail.com",           date: "2026-05-08", time: "04:00 PM", type: "Email",   status: "done",    notes: "ERP system proposal sent and acknowledged",                       assignedExec: "Priti Shah",  priority: "Medium" },

  // ── May 9 ──
  { id: "FU029", leadName: "Karan Mehta",     mobile: "9876501029", email: "karan.mehta@gmail.com",     date: "2026-05-09", time: "10:00 AM", type: "Call",    status: "pending", notes: "Initial discussion about enterprise CRM package",                 assignedExec: "Raj Patel",   priority: "High"   },
  { id: "FU030", leadName: "Divya Kapoor",    mobile: "9876501030", email: "divya.kapoor@outlook.com",  date: "2026-05-09", time: "02:30 PM", type: "Meeting", status: "pending", notes: "Product walkthrough scheduled — confirm attendees",               assignedExec: "Sunita Roy",  priority: "Medium" },

  // ── May 12 ──
  { id: "FU012", leadName: "Rohit Kumar",     mobile: "8765432109", email: "rohit@gmail.com",           date: "2026-05-12", time: "11:00 AM", type: "Call",    status: "pending", notes: "HR module budget approval — follow up with finance team",         assignedExec: "Sunita Roy",  priority: "High"   },
  { id: "FU013", leadName: "Vikram Shah",     mobile: "6543210987", email: "vikram@gmail.com",          date: "2026-05-12", time: "02:30 PM", type: "Meeting", status: "pending", notes: "Payroll suite live demo — confirm attendees",                     assignedExec: "Raj Patel",   priority: "Medium" },

  // ── May 15 ──
  { id: "FU014", leadName: "Deepa Singh",     mobile: "7654321098", email: "deepa@outlook.com",         date: "2026-05-15", time: "09:30 AM", type: "Call",    status: "pending", notes: "Re-engage cold lead — new product launch pitch",                  assignedExec: "Priti Shah",  priority: "Low"    },
  { id: "FU015", leadName: "Suresh Babu",     mobile: "8877665544", email: "suresh@gmail.com",          date: "2026-05-15", time: "12:00 PM", type: "Email",   status: "pending", notes: "Send updated case study and ROI report",                          assignedExec: "Sunita Roy",  priority: "Medium" },
  { id: "FU016", leadName: "Kavya Reddy",     mobile: "7766554433", email: "kavya@gmail.com",           date: "2026-05-15", time: "03:30 PM", type: "Meeting", status: "done",    notes: "Renewal discussion completed — contract signed",                  assignedExec: "Raj Patel",   priority: "High"   },

  // ── May 18 ──
  { id: "FU017", leadName: "Kabir Singh",     mobile: "9876501017", email: "kabir.singh@gmail.com",     date: "2026-05-18", time: "10:00 AM", type: "Call",    status: "pending", notes: "Quarterly review call — check satisfaction score",                assignedExec: "Priti Shah",  priority: "Medium" },
  { id: "FU018", leadName: "Priya Sharma",    mobile: "9876501018", email: "priya.sharma@gmail.com",    date: "2026-05-18", time: "02:00 PM", type: "Meeting", status: "pending", notes: "Upsell opportunity — present enterprise tier",                    assignedExec: "Sunita Roy",  priority: "High"   },
  { id: "FU019", leadName: "Rahul Mehta",     mobile: "9876501019", email: "rahul@crm.com",             date: "2026-05-18", time: "04:30 PM", type: "Email",   status: "pending", notes: "Send team performance report for Q1",                             assignedExec: "Raj Patel",   priority: "Low"    },

  // ── May 21 ──
  { id: "FU020", leadName: "Sneha Patel",     mobile: "9876501020", email: "sneha@crm.com",             date: "2026-05-21", time: "11:00 AM", type: "Call",    status: "pending", notes: "Discuss integration requirements with tech team",                 assignedExec: "Priti Shah",  priority: "High"   },

  // ── May 22 ──
  { id: "FU021", leadName: "Arjun Verma",     mobile: "9876501021", email: "arjun@crm.com",             date: "2026-05-22", time: "09:00 AM", type: "Meeting", status: "pending", notes: "Kick-off meeting for new project implementation",                 assignedExec: "Sunita Roy",  priority: "High"   },
  { id: "FU022", leadName: "Deepak Rao",      mobile: "9876501001", email: "deepak.rao@gmail.com",      date: "2026-05-22", time: "01:00 PM", type: "Call",    status: "pending", notes: "Second follow-up — check if proposal was reviewed",              assignedExec: "Raj Patel",   priority: "Medium" },
  { id: "FU023", leadName: "Ritu Desai",      mobile: "9876501004", email: "ritu.desai@outlook.com",    date: "2026-05-22", time: "03:00 PM", type: "Email",   status: "pending", notes: "Share updated pricing sheet for Q2",                             assignedExec: "Priti Shah",  priority: "Low"    },

  // ── May 25 ──
  { id: "FU024", leadName: "Vikash Sharma",   mobile: "9876501003", email: "vikash.sharma@gmail.com",   date: "2026-05-25", time: "10:30 AM", type: "Call",    status: "pending", notes: "Closing call — final decision expected today",                   assignedExec: "Sunita Roy",  priority: "High"   },
  { id: "FU025", leadName: "Meera Nair",      mobile: "9876501008", email: "meera.nair@gmail.com",      date: "2026-05-25", time: "02:00 PM", type: "Meeting", status: "pending", notes: "Technical evaluation meeting with their IT head",                assignedExec: "Raj Patel",   priority: "Medium" },

  // ── May 28 ──
  { id: "FU026", leadName: "Amit Joshi",      mobile: "9876543210", email: "amit@gmail.com",            date: "2026-05-28", time: "11:00 AM", type: "Email",   status: "pending", notes: "Send final contract for signature",                               assignedExec: "Priti Shah",  priority: "High"   },
  { id: "FU027", leadName: "Pooja Tiwari",    mobile: "9871234560", email: "pooja@gmail.com",           date: "2026-05-28", time: "03:00 PM", type: "Call",    status: "pending", notes: "Post-demo follow-up — address objections",                       assignedExec: "Sunita Roy",  priority: "Medium" },
  { id: "FU028", leadName: "Rohit Kumar",     mobile: "8765432109", email: "rohit@gmail.com",           date: "2026-05-28", time: "05:00 PM", type: "Meeting", status: "done",    notes: "Final review meeting completed successfully",                     assignedExec: "Raj Patel",   priority: "Low"    },
];

export const INITIAL_DUMP = [
  { id: "D001", name: "Old Lead 1", mobile: "9000000001", email: "old1@gmail.com", dumpReason: "Invalid Number", dumpedBy: "Rahul Mehta", dumpDate: "2025-03-15" },
  { id: "D002", name: "Old Lead 2", mobile: "9000000002", email: "old2@gmail.com", dumpReason: "Not Interested", dumpedBy: "Sneha Patel", dumpDate: "2025-03-18" },
  { id: "D003", name: "Old Lead 3", mobile: "9000000003", email: "old3@gmail.com", dumpReason: "Duplicate",      dumpedBy: "Arjun Verma", dumpDate: "2025-03-20" },
];

// ─── CSV row validator ────────────────────────────────────────────────────────
export function validateCSVRows(rows, existingLeads) {
  const seenMobiles  = new Set(existingLeads.map((l) => l.mobile));
  const seenEmails   = new Set(existingLeads.map((l) => l.email));
  const localMobiles = new Set();
  const localEmails  = new Set();

  return rows
    .filter((row) => row.name?.trim() || row.mobile?.trim() || row.email?.trim())
    .map((row, idx) => {
      const errors = [];
      if (!row.name?.trim()) errors.push("Name required");
      if (!/^\d{10}$/.test((row.mobile || "").trim())) errors.push("Mobile must be 10 digits");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((row.email || "").trim())) errors.push("Invalid email");
      if (seenMobiles.has(row.mobile?.trim()) || localMobiles.has(row.mobile?.trim())) errors.push("Duplicate mobile");
      if (seenEmails.has(row.email?.trim())   || localEmails.has(row.email?.trim()))   errors.push("Duplicate email");
      localMobiles.add(row.mobile?.trim());
      localEmails.add(row.email?.trim());
      return {
        _idx: idx,
        name:             row.name?.trim()   || "",
        mobile:           row.mobile?.trim() || "",
        email:            row.email?.trim()  || "",
        validationStatus: errors.length === 0 ? "Valid" : "Invalid",
        errorReason:      errors.join("; "),
        selected:         errors.length === 0,
      };
    });
}
