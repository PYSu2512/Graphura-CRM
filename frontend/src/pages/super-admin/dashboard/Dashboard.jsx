import { useState } from "react";
import {
  Grid,
  Heading,
  EnhancedDashCard,
  GAreaChart,
  GLineChart,
  GColumnChart,
  GBarChart,
  GDoughnutChart,
  GPieChart,
  GRadarChart,
  EnhancedDataTable,
  Modal,
  ModalData,
  Button,
  DataField,
  SelectField,
  Option,
  openModal,
  closeModal,
  DashGrid,
} from "../../../components/shared/Common_Components";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Users,
  TrendingUp,
  DollarSign,
  Wallet,
  HeadphonesIcon,
  Eye,
  Pencil,
  MessageSquareReply,
  FileText,
  RefreshCw,
  Bell,
} from "lucide-react";

export default function Dashboard() {
  // ── Period filter states (only for charts that show the filter bar) ──────────
  const [growthPeriod,  setGrowthPeriod]  = useState("This Year");
  const [revenuePeriod, setRevenuePeriod] = useState("This Year");

  // Shared period labels
  const PERIODS = ["This Week", "This Month", "This Quarter", "This Year", "Overall"];

  // Helper — builds a filters array for a given setter function
  const makePeriodFilters = (setter) =>
    PERIODS.map((label) => ({ label, onClick: () => setter(label) }));

  // ── Selected row state for each table's modals ───────────────────────────────
  const [selectedCompany,  setSelectedCompany]  = useState(null);
  const [selectedTicket,   setSelectedTicket]   = useState(null);
  const [selectedRenewal,  setSelectedRenewal]  = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // ── Edit form state (mirrors selectedCompany fields) ─────────────────────────
  const [editForm, setEditForm] = useState({
    company: "", admin: "", plan: "", users: "", revenue: "", renewal: "", status: "",
  });

  const openEditModal = (row) => {
    setSelectedCompany(row);
    setEditForm({
      company: row.company,
      admin:   row.admin,
      plan:    row.plan,
      users:   row.users,
      revenue: row.revenue,
      renewal: row.renewal,
      status:  row.status,
    });
    openModal("company-edit");
  };

  const handleEditField = (field) => (e) =>
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Company Growth ───────────────────────────────────────────────────────────
  const companyGrowthAll = {
    "This Week":    [
      { name: "Mon", companies: 1 }, { name: "Tue", companies: 2 },
      { name: "Wed", companies: 1 }, { name: "Thu", companies: 3 },
      { name: "Fri", companies: 2 }, { name: "Sat", companies: 1 },
      { name: "Sun", companies: 0 },
    ],
    "This Month":   [
      { name: "W1", companies: 4 }, { name: "W2", companies: 6 },
      { name: "W3", companies: 5 }, { name: "W4", companies: 8 },
    ],
    "This Quarter": [
      { name: "Feb", companies: 16 }, { name: "Mar", companies: 19 },
      { name: "Apr", companies: 23 },
    ],
    "This Year":    [
      { name: "Jan", companies: 4  }, { name: "Feb", companies: 7  },
      { name: "Mar", companies: 5  }, { name: "Apr", companies: 9  },
      { name: "May", companies: 12 }, { name: "Jun", companies: 8  },
      { name: "Jul", companies: 15 }, { name: "Aug", companies: 11 },
      { name: "Sep", companies: 18 }, { name: "Oct", companies: 14 },
      { name: "Nov", companies: 20 }, { name: "Dec", companies: 23 },
    ],
    "Overall":      [
      { name: "2021", companies: 28 }, { name: "2022", companies: 47 },
      { name: "2023", companies: 63 }, { name: "2024", companies: 85 },
      { name: "2025", companies: 100 },
    ],
  };

  // ── Revenue / Expense / Profit ───────────────────────────────────────────────
  const revenueAll = {
    "This Week":    [
      { name: "Mon", revenue: 9200,  expense: 3800, profit: 5400  },
      { name: "Tue", revenue: 11400, expense: 4200, profit: 7200  },
      { name: "Wed", revenue: 8700,  expense: 3500, profit: 5200  },
      { name: "Thu", revenue: 13100, expense: 5100, profit: 8000  },
      { name: "Fri", revenue: 15600, expense: 6200, profit: 9400  },
      { name: "Sat", revenue: 7200,  expense: 2900, profit: 4300  },
      { name: "Sun", revenue: 4800,  expense: 1900, profit: 2900  },
    ],
    "This Month":   [
      { name: "W1", revenue: 48000, expense: 19000, profit: 29000 },
      { name: "W2", revenue: 54000, expense: 22000, profit: 32000 },
      { name: "W3", revenue: 61000, expense: 25000, profit: 36000 },
      { name: "W4", revenue: 71000, expense: 28000, profit: 43000 },
    ],
    "This Quarter": [
      { name: "Feb", revenue: 198000, expense: 81000, profit: 117000 },
      { name: "Mar", revenue: 224000, expense: 91000, profit: 133000 },
      { name: "Apr", revenue: 251000, expense: 99000, profit: 152000 },
    ],
    "This Year":    [
      { name: "Jan", revenue: 42000,  expense: 18000, profit: 24000  },
      { name: "Feb", revenue: 51000,  expense: 21000, profit: 30000  },
      { name: "Mar", revenue: 47000,  expense: 19500, profit: 27500  },
      { name: "Apr", revenue: 58000,  expense: 24000, profit: 34000  },
      { name: "May", revenue: 63000,  expense: 26000, profit: 37000  },
      { name: "Jun", revenue: 72000,  expense: 29000, profit: 43000  },
      { name: "Jul", revenue: 68000,  expense: 27500, profit: 40500  },
      { name: "Aug", revenue: 79000,  expense: 32000, profit: 47000  },
      { name: "Sep", revenue: 85000,  expense: 34000, profit: 51000  },
      { name: "Oct", revenue: 91000,  expense: 36500, profit: 54500  },
      { name: "Nov", revenue: 98000,  expense: 39000, profit: 59000  },
      { name: "Dec", revenue: 112000, expense: 43000, profit: 69000  },
    ],
    "Overall":      [
      { name: "2021", revenue: 380000, expense: 160000, profit: 220000 },
      { name: "2022", revenue: 520000, expense: 210000, profit: 310000 },
      { name: "2023", revenue: 690000, expense: 270000, profit: 420000 },
      { name: "2024", revenue: 820000, expense: 320000, profit: 500000 },
      { name: "2025", revenue: 866000, expense: 352000, profit: 514000 },
    ],
  };

  // ── MRR vs ARR ───────────────────────────────────────────────────────────────
  const mrrAll = {
    "This Week":    [
      { name: "Mon", mrr: 44800, arr: 537600 }, { name: "Tue", mrr: 45100, arr: 541200 },
      { name: "Wed", mrr: 45100, arr: 541200 }, { name: "Thu", mrr: 45300, arr: 543600 },
      { name: "Fri", mrr: 45600, arr: 547200 }, { name: "Sat", mrr: 45600, arr: 547200 },
      { name: "Sun", mrr: 45600, arr: 547200 },
    ],
    "This Month":   [
      { name: "W1", mrr: 43200, arr: 518400 }, { name: "W2", mrr: 44100, arr: 529200 },
      { name: "W3", mrr: 44900, arr: 538800 }, { name: "W4", mrr: 45600, arr: 547200 },
    ],
    "This Quarter": [
      { name: "Feb", mrr: 41200, arr: 494400 },
      { name: "Mar", mrr: 43400, arr: 520800 },
      { name: "Apr", mrr: 45600, arr: 547200 },
    ],
    "This Year":    [
      { name: "Jan", mrr: 14200, arr: 170400  }, { name: "Feb", mrr: 16800, arr: 201600  },
      { name: "Mar", mrr: 18500, arr: 222000  }, { name: "Apr", mrr: 21000, arr: 252000  },
      { name: "May", mrr: 23400, arr: 280800  }, { name: "Jun", mrr: 26100, arr: 313200  },
      { name: "Jul", mrr: 28700, arr: 344400  }, { name: "Aug", mrr: 31200, arr: 374400  },
      { name: "Sep", mrr: 34500, arr: 414000  }, { name: "Oct", mrr: 37800, arr: 453600  },
      { name: "Nov", mrr: 41200, arr: 494400  }, { name: "Dec", mrr: 45600, arr: 547200  },
    ],
    "Overall":      [
      { name: "2021", mrr: 8400,  arr: 100800  }, { name: "2022", mrr: 16200, arr: 194400  },
      { name: "2023", mrr: 28700, arr: 344400  }, { name: "2024", mrr: 38900, arr: 466800  },
      { name: "2025", mrr: 45600, arr: 547200  },
    ],
  };

  // ── Churn vs Retention ───────────────────────────────────────────────────────
  const churnAll = {
    "This Week":    [
      { name: "Mon", retained: 68, churned: 0 }, { name: "Tue", retained: 68, churned: 0 },
      { name: "Wed", retained: 69, churned: 0 }, { name: "Thu", retained: 69, churned: 0 },
      { name: "Fri", retained: 69, churned: 1 }, { name: "Sat", retained: 69, churned: 0 },
      { name: "Sun", retained: 69, churned: 0 },
    ],
    "This Month":   [
      { name: "W1", retained: 66, churned: 1 }, { name: "W2", retained: 67, churned: 1 },
      { name: "W3", retained: 68, churned: 0 }, { name: "W4", retained: 69, churned: 1 },
    ],
    "This Quarter": [
      { name: "Feb", retained: 63, churned: 3 },
      { name: "Mar", retained: 66, churned: 2 },
      { name: "Apr", retained: 69, churned: 1 },
    ],
    "This Year":    [
      { name: "Q1", retained: 48, churned: 4 }, { name: "Q2", retained: 56, churned: 5 },
      { name: "Q3", retained: 61, churned: 3 }, { name: "Q4", retained: 68, churned: 6 },
    ],
    "Overall":      [
      { name: "2021", retained: 22, churned: 6 }, { name: "2022", retained: 38, churned: 9 },
      { name: "2023", retained: 54, churned: 9 }, { name: "2024", retained: 64, churned: 8 },
      { name: "2025", retained: 68, churned: 6 },
    ],
  };

  // ── Plan Status (Doughnut) ───────────────────────────────────────────────────
  const planStatusAll = {
    "This Week":    [
      { name: "Active Plan", value: 60 }, { name: "Trial", value: 16 },
      { name: "Renewal Due", value: 11 }, { name: "Expired", value: 8 },
    ],
    "This Month":   [
      { name: "Active Plan", value: 59 }, { name: "Trial", value: 17 },
      { name: "Renewal Due", value: 12 }, { name: "Expired", value: 8 },
    ],
    "This Quarter": [
      { name: "Active Plan", value: 57 }, { name: "Trial", value: 18 },
      { name: "Renewal Due", value: 14 }, { name: "Expired", value: 9 },
    ],
    "This Year":    [
      { name: "Active Plan", value: 58 }, { name: "Trial", value: 17 },
      { name: "Renewal Due", value: 12 }, { name: "Expired", value: 8 },
    ],
    "Overall":      [
      { name: "Active Plan", value: 55 }, { name: "Trial", value: 20 },
      { name: "Renewal Due", value: 15 }, { name: "Expired", value: 10 },
    ],
  };

  // ── Company Status (Doughnut) ────────────────────────────────────────────────
  const companyStatusAll = {
    "This Week":    [
      { name: "Active", value: 69 }, { name: "Trial", value: 16 },
      { name: "Inactive", value: 9 }, { name: "Suspended", value: 6 },
    ],
    "This Month":   [
      { name: "Active", value: 68 }, { name: "Trial", value: 17 },
      { name: "Inactive", value: 9 }, { name: "Suspended", value: 6 },
    ],
    "This Quarter": [
      { name: "Active", value: 65 }, { name: "Trial", value: 19 },
      { name: "Inactive", value: 10 }, { name: "Suspended", value: 6 },
    ],
    "This Year":    [
      { name: "Active", value: 68 }, { name: "Trial", value: 17 },
      { name: "Inactive", value: 9 }, { name: "Suspended", value: 6 },
    ],
    "Overall":      [
      { name: "Active", value: 60 }, { name: "Trial", value: 22 },
      { name: "Inactive", value: 12 }, { name: "Suspended", value: 6 },
    ],
  };

  // ── Storage Usage (Doughnut) ─────────────────────────────────────────────────
  const storageAll = {
    "This Week":    [{ name: "Used", value: 682 }, { name: "Free", value: 318 }],
    "This Month":   [{ name: "Used", value: 680 }, { name: "Free", value: 320 }],
    "This Quarter": [{ name: "Used", value: 650 }, { name: "Free", value: 350 }],
    "This Year":    [{ name: "Used", value: 680 }, { name: "Free", value: 320 }],
    "Overall":      [{ name: "Used", value: 820 }, { name: "Free", value: 180 }],
  };

  // ── Tickets by Priority (Pie) ────────────────────────────────────────────────
  const ticketsAll = {
    "This Week":    [
      { name: "Critical", value: 3  }, { name: "High", value: 7  },
      { name: "Medium", value: 11   }, { name: "Low", value: 6   },
    ],
    "This Month":   [
      { name: "Critical", value: 11 }, { name: "High", value: 28 },
      { name: "Medium", value: 38   }, { name: "Low", value: 19  },
    ],
    "This Quarter": [
      { name: "Critical", value: 24 }, { name: "High", value: 61 },
      { name: "Medium", value: 98   }, { name: "Low", value: 47  },
    ],
    "This Year":    [
      { name: "Critical", value: 8  }, { name: "High", value: 23 },
      { name: "Medium", value: 41   }, { name: "Low", value: 28  },
    ],
    "Overall":      [
      { name: "Critical", value: 42 }, { name: "High", value: 118 },
      { name: "Medium", value: 203  }, { name: "Low", value: 97   },
    ],
  };

  // ── API Health (Bar) ─────────────────────────────────────────────────────────
  const apiHealthAll = {
    "This Week":    [
      { name: "Razorpay", uptime: 100,  latency: 112 }, { name: "Brevo",    uptime: 95.8, latency: 310 },
      { name: "Firebase", uptime: 99.9, latency: 90  }, { name: "Twilio",   uptime: 98.9, latency: 198 },
      { name: "AWS S3",   uptime: 100,  latency: 82  }, { name: "Webhook",  uptime: 78.4, latency: 820 },
    ],
    "This Month":   [
      { name: "Razorpay", uptime: 99.9, latency: 118 }, { name: "Brevo",    uptime: 94.6, latency: 328 },
      { name: "Firebase", uptime: 99.8, latency: 93  }, { name: "Twilio",   uptime: 98.6, latency: 205 },
      { name: "AWS S3",   uptime: 99.9, latency: 85  }, { name: "Webhook",  uptime: 74.2, latency: 860 },
    ],
    "This Quarter": [
      { name: "Razorpay", uptime: 99.8, latency: 122 }, { name: "Brevo",    uptime: 93.1, latency: 352 },
      { name: "Firebase", uptime: 99.6, latency: 98  }, { name: "Twilio",   uptime: 98.2, latency: 218 },
      { name: "AWS S3",   uptime: 99.7, latency: 91  }, { name: "Webhook",  uptime: 70.5, latency: 910 },
    ],
    "This Year":    [
      { name: "Razorpay", uptime: 99.9, latency: 120 }, { name: "Brevo",    uptime: 94.2, latency: 340 },
      { name: "Firebase", uptime: 99.7, latency: 95  }, { name: "Twilio",   uptime: 98.5, latency: 210 },
      { name: "AWS S3",   uptime: 99.8, latency: 88  }, { name: "Webhook",  uptime: 72.1, latency: 890 },
    ],
    "Overall":      [
      { name: "Razorpay", uptime: 99.6, latency: 130 }, { name: "Brevo",    uptime: 91.8, latency: 390 },
      { name: "Firebase", uptime: 99.4, latency: 105 }, { name: "Twilio",   uptime: 97.9, latency: 240 },
      { name: "AWS S3",   uptime: 99.5, latency: 98  }, { name: "Webhook",  uptime: 65.3, latency: 980 },
    ],
  };

  // ── Derived (period-selected) data ───────────────────────────────────────────
  const companyGrowthData = companyGrowthAll[growthPeriod];
  const revenueData        = revenueAll[revenuePeriod];
  // Static data for charts without period filters
  const mrrData           = mrrAll["This Year"];
  const churnData         = churnAll["This Year"];
  const planStatusData    = planStatusAll["This Year"];
  const companyStatusData = companyStatusAll["This Year"];
  const storageData       = storageAll["This Year"];
  const ticketsData       = ticketsAll["This Year"];
  const apiHealthData     = apiHealthAll["This Year"];

  // ── Ticket Resolution Status (radar chart in the ticket/API row) ─────────────
  const ticketResolutionData = [
    { subject: "Critical", resolved: 72, pending: 28 },
    { subject: "High",     resolved: 81, pending: 19 },
    { subject: "Medium",   resolved: 91, pending: 9  },
    { subject: "Low",      resolved: 96, pending: 4  },
    { subject: "Billing",  resolved: 85, pending: 15 },
    { subject: "Tech",     resolved: 78, pending: 22 },
  ];

  // ── Top Companies Table ──────────────────────────────────────────────────────
  const companyCols = [
    { key: "company", label: "Company" },
    { key: "admin",   label: "Admin" },
    { key: "plan",    label: "Plan" },
    { key: "users",   label: "Users" },
    { key: "revenue", label: "Revenue" },
    { key: "renewal", label: "Renewal Date" },
    { key: "status",  label: "Status" },
  ];

  const companyRows = [
    { company: "Nexus Corp",         admin: "Arjun Mehta",   plan: "Enterprise", users: "142", revenue: "₹1,28,000", renewal: "2026-08-15", status: "Completed",   date: "2026-08-15" },
    { company: "Skyline Solutions",  admin: "Priya Sharma",  plan: "Pro",        users: "87",  revenue: "₹64,500",   renewal: "2026-06-30", status: "Completed",   date: "2026-06-30" },
    { company: "BlueWave Tech",      admin: "Rohan Gupta",   plan: "Pro",        users: "63",  revenue: "₹48,200",   renewal: "2026-05-10", status: "In Progress", date: "2026-05-10" },
    { company: "Orion Retail",       admin: "Sneha Patil",   plan: "Starter",    users: "29",  revenue: "₹18,900",   renewal: "2026-07-22", status: "Completed",   date: "2026-07-22" },
    { company: "Apex Ventures",      admin: "Kiran Joshi",   plan: "Enterprise", users: "211", revenue: "₹2,14,000", renewal: "2026-09-01", status: "Completed",   date: "2026-09-01" },
    { company: "Nova Finance",       admin: "Divya Rao",     plan: "Pro",        users: "55",  revenue: "₹41,600",   renewal: "2026-05-28", status: "In Progress", date: "2026-05-28" },
    { company: "Vortex Logistics",   admin: "Amit Verma",    plan: "Starter",    users: "18",  revenue: "₹12,400",   renewal: "2026-06-14", status: "Failed",      date: "2026-06-14" },
    { company: "Pulse Media",        admin: "Neha Kulkarni", plan: "Pro",        users: "74",  revenue: "₹56,800",   renewal: "2026-10-05", status: "Completed",   date: "2026-10-05" },
  ];

  // ── Support Tickets Table ────────────────────────────────────────────────────
  const ticketCols = [
    { key: "ticketId", label: "Ticket ID" },
    { key: "company",  label: "Company" },
    { key: "subject",  label: "Subject" },
    { key: "priority", label: "Priority" },
    { key: "status",   label: "Status" },
    { key: "date",     label: "Date" },
  ];

  const ticketRows = [
    { ticketId: "#TKT-1042", company: "Nexus Corp",       subject: "Cannot export reports",        priority: "High",     status: "In Progress", date: "2026-04-21" },
    { ticketId: "#TKT-1041", company: "BlueWave Tech",    subject: "Email integration failing",    priority: "Critical", status: "Pending",     date: "2026-04-21" },
    { ticketId: "#TKT-1040", company: "Orion Retail",     subject: "User role permissions issue",  priority: "Medium",   status: "Completed",   date: "2026-04-20" },
    { ticketId: "#TKT-1039", company: "Nova Finance",     subject: "Dashboard not loading",        priority: "High",     status: "In Progress", date: "2026-04-20" },
    { ticketId: "#TKT-1038", company: "Pulse Media",      subject: "Bulk import crashing",         priority: "Critical", status: "Pending",     date: "2026-04-19" },
    { ticketId: "#TKT-1037", company: "Apex Ventures",    subject: "API rate limit exceeded",      priority: "Medium",   status: "Completed",   date: "2026-04-19" },
    { ticketId: "#TKT-1036", company: "Skyline Solutions", subject: "Invoice not generated",       priority: "Low",      status: "Completed",   date: "2026-04-18" },
  ];

  // ── Renewal Alerts Table ─────────────────────────────────────────────────────
  const renewalCols = [
    { key: "company", label: "Company" },
    { key: "plan",    label: "Plan" },
    { key: "expiry",  label: "Expiry Date" },
    { key: "amount",  label: "Amount" },
    { key: "status",  label: "Status" },
  ];

  const renewalRows = [
    { company: "BlueWave Tech",    plan: "Pro",        expiry: "2026-05-10", amount: "₹48,200",   status: "In Progress", date: "2026-05-10" },
    { company: "Nova Finance",     plan: "Pro",        expiry: "2026-05-28", amount: "₹41,600",   status: "In Progress", date: "2026-05-28" },
    { company: "Vortex Logistics", plan: "Starter",    expiry: "2026-06-14", amount: "₹12,400",   status: "Failed",      date: "2026-06-14" },
    { company: "Skyline Solutions", plan: "Pro",       expiry: "2026-06-30", amount: "₹64,500",   status: "In Progress", date: "2026-06-30" },
    { company: "Orion Retail",     plan: "Starter",    expiry: "2026-07-22", amount: "₹18,900",   status: "Completed",   date: "2026-07-22" },
    { company: "Nexus Corp",       plan: "Enterprise", expiry: "2026-08-15", amount: "₹1,28,000", status: "Completed",   date: "2026-08-15" },
    { company: "Apex Ventures",    plan: "Enterprise", expiry: "2026-09-01", amount: "₹2,14,000", status: "Completed",   date: "2026-09-01" },
  ];

  // ── Recent Activities Table ──────────────────────────────────────────────────
  const activityCols = [
    { key: "activity",    label: "Activity" },
    { key: "module",      label: "Module" },
    { key: "performedBy", label: "Performed By" },
    { key: "date",        label: "Date" },
    { key: "status",      label: "Status" },
  ];

  const activityRows = [
    { activity: "New company onboarded — Nexus Corp",      module: "Companies",   performedBy: "Super Admin", date: "2026-04-22", status: "Completed" },
    { activity: "Plan upgraded: Starter → Pro",            module: "Billing",     performedBy: "Super Admin", date: "2026-04-21", status: "Completed" },
    { activity: "Company suspended — Vortex Logistics",    module: "Companies",   performedBy: "Super Admin", date: "2026-04-21", status: "Failed"    },
    { activity: "Storage limit increased to 1TB",          module: "Storage",     performedBy: "Super Admin", date: "2026-04-20", status: "Completed" },
    { activity: "Razorpay webhook reconfigured",           module: "Integrations",performedBy: "Super Admin", date: "2026-04-20", status: "Completed" },
    { activity: "Admin account created for Nova Finance",  module: "Users",       performedBy: "Super Admin", date: "2026-04-19", status: "Completed" },
    { activity: "API keys rotated — Firebase",             module: "Settings",    performedBy: "Super Admin", date: "2026-04-18", status: "Completed" },
    { activity: "Failed login — unknown IP",               module: "Security",    performedBy: "Unknown",     date: "2026-04-17", status: "Failed"    },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">

      {/* ── 1. Page Header ── */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Super Admin"
          secondaryText="Dashboard"
          size={12}
          fontSize="3xl"
          showAnimations={true}
        />
        </Grid>
        {/* ── 2. Top KPI Cards ── */}
        <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Companies"        value="100"       icon={<Building2 size={22} />}       accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Active Companies"       value="68"        icon={<CheckCircle2 size={22} />}    accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Inactive / Suspended"   value="15"        icon={<XCircle size={22} />}         accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Total Platform Users"   value="4,820"     icon={<Users size={22} />}           accentColor="#8b5cf6" size={3} />
        <EnhancedDashCard title="Total Leads (All Cos.)" value="1,28,400"  icon={<TrendingUp size={22} />}      accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Platform Revenue"       value="₹8,65,000" icon={<DollarSign size={22} />}     accentColor="#14b8a6" size={3} />
        <EnhancedDashCard title="Net Profit"             value="₹5,14,000" icon={<Wallet size={22} />}         accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="Open Support Tickets"   value="32"        icon={<HeadphonesIcon size={22} />} accentColor="#64748b" size={3} />
      </DashGrid>

      {/* ── 3 & 4. Growth + Revenue Charts ── */}
      <Grid cols={12} gap={4}>
        <GLineChart
          title="Company Growth"
          subtitle="New companies onboarded per period"
          data={companyGrowthData}
          lines={[{ key: "companies", label: "New Companies", color: "#3b82f6" }]}
          size={5}
          height={300}
          filters={makePeriodFilters(setGrowthPeriod)}
        />
        <GAreaChart
          title="Revenue / Expense / Profit"
          subtitle="Platform financial breakdown"
          data={revenueData}
          areas={[
            { key: "revenue", label: "Revenue", color: "#22c55e" },
            { key: "expense", label: "Expense", color: "#f43f5e" },
            { key: "profit",  label: "Profit",  color: "#38bdf8" },
          ]}
          size={7}
          height={300}
          filters={makePeriodFilters(setRevenuePeriod)}
        />
      </Grid>

      {/* ── MRR / ARR + Churn vs Retention ── */}
      <Grid cols={12} gap={4}>
        <GAreaChart
          title="MRR vs ARR"
          subtitle="Monthly & Annual Recurring Revenue trend"
          data={mrrData}
          areas={[
            { key: "mrr", label: "MRR (₹)", color: "#8b5cf6" },
            { key: "arr", label: "ARR (₹)", color: "#f59e0b" },
          ]}
          size={8}
          height={300}
        />
        <GColumnChart
          title="Churn vs Retention"
          subtitle="Company retention performance"
          data={churnData}
          bars={[
            { key: "retained", label: "Retained", color: "#22c55e" },
            { key: "churned",  label: "Churned",  color: "#f43f5e" },
          ]}
          size={4}
          height={300}
        />
      </Grid>

      {/* ── Doughnut Charts ── */}
      <Grid cols={12} gap={4}>
        <GDoughnutChart
          title="Subscription / Plan Status"
          subtitle="Distribution of companies by plan state"
          data={planStatusData}
          colors={["#22c55e", "#38bdf8", "#f59e0b", "#f43f5e"]}
          size={4}
          height={300}
        />
        <GDoughnutChart
          title="Company Status"
          subtitle="Active, trial, inactive & suspended"
          data={companyStatusData}
          colors={["#3b82f6", "#8b5cf6", "#64748b", "#f43f5e"]}
          size={4}
          height={300}
        />
        <GDoughnutChart
          title="Storage Usage"
          subtitle="Used vs Free (GB)"
          data={storageData}
          colors={["#f43f5e", "#22c55e"]}
          size={4}
          height={300}
        />
        <GPieChart
          title="Tickets by Priority"
          subtitle="Open support tickets breakdown"
          data={ticketsData}
          colors={["#f43f5e", "#f59e0b", "#38bdf8", "#22c55e"]}
          size={3}
          height={300}
        />
        <GRadarChart
          title="Ticket Resolution Rate"
          subtitle="Resolved vs pending % by category"
          data={ticketResolutionData}
          radars={[
            { key: "resolved", label: "Resolved (%)", color: "#22c55e" },
            { key: "pending",  label: "Pending (%)",  color: "#f43f5e" },
          ]}
          size={3}
          height={300}
        />
        <GBarChart
          title="API & Integration Health"
          subtitle="Uptime % and avg latency (ms) per integration"
          data={apiHealthData}
          bars={[
            { key: "uptime",  label: "Uptime (%)",   color: "#22c55e" },
            { key: "latency", label: "Latency (ms)", color: "#f59e0b" },
          ]}
          size={6}
          height={300}
        />
      </Grid>

      {/* ── Top Companies Table ── */}
      <Grid cols={12} gap={4}>
        <EnhancedDataTable
          title="Top Companies"
          columns={companyCols}
          rows={companyRows}
          actions={[
            { icon: <Eye size={15} />,    tooltip: "View",  variant: "ghost",   onClick: (row) => { setSelectedCompany(row);  openModal("company-view"); } },
            { icon: <Pencil size={15} />, tooltip: "Edit",  variant: "primary", onClick: (row) => openEditModal(row) },
          ]}
          size={12}
          pageSize={5}
          date={true}
          filterSize="xl"
          // onDateFilter={true}
          filters={[
            {
              title: "Plan",
              type: "toggle",
              key: "plan",
              options: ["Enterprise", "Pro", "Starter"],
            },
            {
              title: "Status",
              type: "toggle",
              key: "status",
              options: ["Completed", "In Progress", "Failed"],
            },
          ]}
        />
      </Grid>

      {/* ── Support Tickets Table ── */}
      <Grid cols={12} gap={4}>
        <EnhancedDataTable
          title="Recent Support Tickets"
          columns={ticketCols}
          rows={ticketRows}
          actions={[
            { icon: <Eye size={15} />,                tooltip: "View",  variant: "ghost",   onClick: (row) => { setSelectedTicket(row); openModal("ticket-view");  } },
            { icon: <MessageSquareReply size={15} />, tooltip: "Reply", variant: "primary", onClick: (row) => { setSelectedTicket(row); openModal("ticket-reply"); } },
          ]}
          size={12}
          pageSize={5}
          date={true}
          filters={[
            {
              title: "Priority",
              type: "toggle",
              key: "priority",
              options: ["Critical", "High", "Medium", "Low"],
            },
            {
              title: "Status",
              type: "toggle",
              key: "status",
              options: ["Completed", "In Progress", "Pending", "Failed"],
            },
          ]}
        />
      </Grid>

      {/* ── Renewal Alerts Table ── */}
      <Grid cols={12} gap={4}>
        <EnhancedDataTable
          title="Renewal Alerts"
          columns={renewalCols}
          rows={renewalRows}
          actions={[
            { icon: <FileText size={15} />,  tooltip: "Invoice", variant: "ghost",   onClick: (row) => { setSelectedRenewal(row); openModal("renewal-invoice"); } },
            { icon: <RefreshCw size={15} />, tooltip: "Renew",   variant: "primary", onClick: (row) => { setSelectedRenewal(row); openModal("renewal-renew");   } },
            { icon: <Bell size={15} />,      tooltip: "Remind",  variant: "ghost",   onClick: (row) => { setSelectedRenewal(row); openModal("renewal-remind");  } },
          ]}
          size={12}
          pageSize={5}
          date={true}
          filters={[
            {
              title: "Plan",
              type: "toggle",
              key: "plan",
              options: ["Enterprise", "Pro", "Starter"],
            },
            {
              title: "Status",
              type: "toggle",
              key: "status",
              options: ["Completed", "In Progress", "Failed"],
            },
          ]}
        />
      </Grid>

      {/* ── Recent Platform Activities ── */}
      <Grid cols={12} gap={4}>
        <EnhancedDataTable
          title="Recent Platform Activities"
          columns={activityCols}
          rows={activityRows}
          actions={[
            { icon: <Eye size={15} />, tooltip: "View", variant: "primary", onClick: (row) => { setSelectedActivity(row); openModal("activity-view"); } },
          ]}
          size={12}
          pageSize={5}
          date={true}
          filters={[
            {
              title: "Module",
              type: "toggle",
              key: "module",
              options: ["Companies", "Billing", "Storage", "Integrations", "Users", "Settings", "Security"],
            },
            {
              title: "Status",
              type: "toggle",
              key: "status",
              options: ["Completed", "Failed"],
            },
          ]}
        />
      </Grid>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {/* Company: View */}
      <Modal id="company-view" title="Company Details">
        {selectedCompany && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Company"      value={selectedCompany.company} />
              <ModalData label="Admin"        value={selectedCompany.admin} />
              <ModalData label="Plan"         value={selectedCompany.plan} />
              <ModalData label="Total Users"  value={selectedCompany.users} />
              <ModalData label="Revenue"      value={selectedCompany.revenue} />
              <ModalData label="Renewal Date" value={selectedCompany.renewal} />
              <ModalData label="Status"       value={selectedCompany.status} />
            </div>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("company-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Company: Edit */}
      <Modal id="company-edit" title="Edit Company" size="lg">
        {selectedCompany && (
          <div className="flex flex-col gap-5">
            <Grid cols={12} gap={3}>
              {/* Company Name */}
              <DataField
                label="Company Name"
                id="edit-company"
                size={6}
                value={editForm.company}
                onChange={handleEditField("company")}
                placeholder="e.g. Nexus Corp"
              />
              {/* Admin Name */}
              <DataField
                label="Admin Name"
                id="edit-admin"
                size={6}
                value={editForm.admin}
                onChange={handleEditField("admin")}
                placeholder="e.g. Arjun Mehta"
              />
              {/* Plan */}
              <SelectField
                label="Plan"
                id="edit-plan"
                size={4}
                value={editForm.plan}
                onChange={handleEditField("plan")}
              >
                <Option value="Starter"    label="Starter" />
                <Option value="Pro"        label="Pro" />
                <Option value="Enterprise" label="Enterprise" />
              </SelectField>
              {/* Total Users */}
              <DataField
                label="Total Users"
                id="edit-users"
                type="number"
                size={4}
                value={editForm.users}
                onChange={handleEditField("users")}
                placeholder="e.g. 142"
              />
              {/* Revenue */}
              <DataField
                label="Revenue"
                id="edit-revenue"
                size={4}
                value={editForm.revenue}
                onChange={handleEditField("revenue")}
                placeholder="e.g. ₹1,28,000"
              />
              {/* Renewal Date */}
              <DataField
                label="Renewal Date"
                id="edit-renewal"
                type="date"
                size={6}
                value={editForm.renewal}
                onChange={handleEditField("renewal")}
              />
              {/* Status */}
              <SelectField
                label="Status"
                id="edit-status"
                size={6}
                value={editForm.status}
                onChange={handleEditField("status")}
              >
                <Option value="Completed"   label="Completed" />
                <Option value="In Progress" label="In Progress" />
                <Option value="Failed"      label="Failed" />
              </SelectField>
            </Grid>

            <div className="flex justify-end gap-2 pt-1">
              <Button text="Cancel" variant="ghost"   size={2} onClick={() => closeModal("company-edit")} />
              <Button text="Save Changes" variant="primary" size={3} onClick={() => {
                // In a real app: dispatch update action / API call with editForm
                console.log("Saving:", editForm);
                closeModal("company-edit");
              }} />
            </div>
          </div>
        )}
      </Modal>

      {/* Ticket: View */}
      <Modal id="ticket-view" title="Ticket Details" size="md">
        {selectedTicket && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Ticket ID" value={selectedTicket.ticketId} />
              <ModalData label="Company"   value={selectedTicket.company} />
              <ModalData label="Subject"   value={selectedTicket.subject} />
              <ModalData label="Priority"  value={selectedTicket.priority} />
              <ModalData label="Status"    value={selectedTicket.status} />
              <ModalData label="Date"      value={selectedTicket.date} />
            </div>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("ticket-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Ticket: Reply */}
      <Modal id="ticket-reply" title="Reply to Ticket" size="md">
        {selectedTicket && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Ticket ID" value={selectedTicket.ticketId} />
              <ModalData label="Company"   value={selectedTicket.company} />
              <ModalData label="Subject"   value={selectedTicket.subject} />
              <ModalData label="Priority"  value={selectedTicket.priority} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Reply</label>
              <textarea
                rows={4}
                placeholder="Type your reply here…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 resize-none transition"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button text="Cancel"     variant="ghost"   size={3} onClick={() => closeModal("ticket-reply")} />
              <Button text="Send Reply" variant="primary" size={4} onClick={() => closeModal("ticket-reply")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Renewal: Invoice */}
      <Modal id="renewal-invoice" title="Invoice Preview" size="md">
        {selectedRenewal && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Company"     value={selectedRenewal.company} />
              <ModalData label="Plan"        value={selectedRenewal.plan} />
              <ModalData label="Expiry Date" value={selectedRenewal.expiry} />
              <ModalData label="Amount"      value={selectedRenewal.amount} />
              <ModalData label="Status"      value={selectedRenewal.status} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button text="Close"    variant="ghost"   size={3} onClick={() => closeModal("renewal-invoice")} />
              <Button text="Download" variant="primary" size={4} onClick={() => closeModal("renewal-invoice")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Renewal: Confirm Renew */}
      <Modal id="renewal-renew" title="Confirm Renewal" size="sm">
        {selectedRenewal && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Renew subscription for <span className="font-bold text-[#2a465a]">{selectedRenewal.company}</span>?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Plan"   value={selectedRenewal.plan} />
              <ModalData label="Amount" value={selectedRenewal.amount} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button text="Cancel"        variant="ghost"   size={4} onClick={() => closeModal("renewal-renew")} />
              <Button text="Confirm Renew" variant="primary" size={4} onClick={() => closeModal("renewal-renew")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Renewal: Send Reminder */}
      <Modal id="renewal-remind" title="Send Reminder" size="sm">
        {selectedRenewal && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Send renewal reminder to admin of <span className="font-bold text-[#2a465a]">{selectedRenewal.company}</span>?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Plan"        value={selectedRenewal.plan} />
              <ModalData label="Expiry Date" value={selectedRenewal.expiry} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button text="Cancel"        variant="ghost"   size={4} onClick={() => closeModal("renewal-remind")} />
              <Button text="Send Reminder" variant="primary" size={4} onClick={() => closeModal("renewal-remind")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Activity: View */}
      <Modal id="activity-view" title="Activity Details" size="md">
        {selectedActivity && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Activity"     value={selectedActivity.activity} />
              <ModalData label="Module"       value={selectedActivity.module} />
              <ModalData label="Performed By" value={selectedActivity.performedBy} />
              <ModalData label="Date"         value={selectedActivity.date} />
              <ModalData label="Status"       value={selectedActivity.status} />
            </div>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("activity-view")} />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}