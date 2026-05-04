export const DUMPED_LEAD_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email Id" },
  { key: "reason", label: "Reason" },
  { key: "dumpDate", label: "Dump Date" },
];

export const INITIAL_LEADS = [
  {
    id: "CL-001",
    name: "Ayesha Kapoor",
    phone: "+91 98123 45678",
    email: "ayesha.kapoor@freshworks.com",
    company: "FreshWorks",
    status: "Talk",
    dump: null,
  },
  {
    id: "CL-002",
    name: "Pranav Singh",
    phone: "+91 98765 43210",
    email: "pranav.singh@techminds.io",
    company: "TechMinds",
    status: "Dumped",
    dump: {
      reason: "No Response",
      notes: "Did not pick calls",
      dumpedAt: "2026-04-25",
      dumpedBy: "Rohan Sharma",
      lastStatus: "Interested",
    },
  },
];
