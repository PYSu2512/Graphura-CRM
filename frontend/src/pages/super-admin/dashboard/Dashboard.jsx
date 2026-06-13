import { useState, useEffect } from "react";
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
  DataTable,
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
import { getDashboardMetrics } from "../../../services/superAdminService";

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-6 max-w-[1600px] mx-auto">
      {/* Heading Skeleton */}
      <div className="h-9 w-64 bg-slate-200 rounded-2xl mb-8" />

      {/* 8 KPI Cards Skeletons */}
      <div className="grid grid-cols-12 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 md:col-span-3 bg-white rounded-2xl border border-slate-100 p-6 flex justify-between items-center h-28">
            <div className="space-y-3">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-7 w-16 bg-slate-200 rounded" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Row of 2 charts */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 h-[300px]">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-3.5 w-24 bg-slate-200 rounded" />
          <div className="h-44 bg-slate-50 rounded-xl" />
        </div>
        <div className="col-span-12 md:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 h-[300px]">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-3.5 w-24 bg-slate-200 rounded" />
          <div className="h-44 bg-slate-50 rounded-xl" />
        </div>
      </div>

      {/* Row of 2 more charts */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 h-[300px]">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-3.5 w-24 bg-slate-200 rounded" />
          <div className="h-44 bg-slate-50 rounded-xl" />
        </div>
        <div className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 h-[300px]">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-3.5 w-24 bg-slate-200 rounded" />
          <div className="h-44 bg-slate-50 rounded-xl" />
        </div>
      </div>

      {/* Table Skeletons */}
      <div className="space-y-4 w-full">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-12 bg-slate-100 flex items-center px-6 gap-4 border-b border-slate-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-200 rounded flex-1" />
            ))}
          </div>
          <div className="divide-y divide-slate-100">
            {[...Array(3)].map((_, rowIndex) => (
              <div key={rowIndex} className="h-16 flex items-center px-6 gap-4">
                {[...Array(6)].map((_, colIndex) => (
                  <div key={colIndex} className="h-3 bg-slate-200/70 rounded flex-1" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  // ── Period filter states (only for charts that show the filter bar) ──────────
  const [growthPeriod,  setGrowthPeriod]  = useState("This Year");

  // Shared period labels
  const PERIODS = ["This Week", "This Month", "This Quarter", "This Year", "Overall"];

  // Helper — builds a filters array for a given setter function
  const makePeriodFilters = (setter) =>
    PERIODS.map((label) => ({ label, onClick: () => setter(label) }));

  // ── Selected row state for each table's modals ───────────────────────────────
  const [selectedCompany,  setSelectedCompany]  = useState(null);
  const [selectedTicket,   setSelectedTicket]   = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // ── Edit form state (mirrors selectedCompany fields) ─────────────────────────
  const [editForm, setEditForm] = useState({
    company: "", admin: "", plan: "", users: "", renewal: "", status: "",
  });

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    kpi: {
      totalCompanies: 0,
      activeCompanies: 0,
      inactiveCompanies: 0,
      totalPlatformUsers: 0,
      totalLeads: 0,
      openSupportTickets: 0
    },
    companyRows: [],
    ticketRows: [],
    activityRows: [],
    companyStatusData: [],
    ticketsData: []
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getDashboardMetrics();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const openEditModal = (row) => {
    setSelectedCompany(row);
    setEditForm({
      company: row.company,
      admin:   row.admin,
      plan:    row.plan,
      users:   row.users,
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
  // Static data for charts without period filters
  const churnData         = churnAll["This Year"];
  const companyStatusData = (dashboardData.companyStatusData && dashboardData.companyStatusData.length > 0)
    ? dashboardData.companyStatusData
    : companyStatusAll["This Year"];
  const storageData       = storageAll["This Year"];
  const ticketsData       = (dashboardData.ticketsData && dashboardData.ticketsData.length > 0)
    ? dashboardData.ticketsData
    : ticketsAll["This Year"];
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
    { key: "renewal", label: "Renewal Date" },
    { key: "status",  label: "Status" },
  ];

  const companyRows = dashboardData.companyRows || [];

  // ── Support Tickets Table ────────────────────────────────────────────────────
  const ticketCols = [
    { key: "company",  label: "Company" },
    { key: "subject",  label: "Subject" },
    { key: "priority", label: "Priority" },
    { key: "status",   label: "Status" },
    { key: "date",     label: "Date" },
  ];

  const ticketRows = dashboardData.ticketRows || [];

  // ── Recent Activities Table ──────────────────────────────────────────────────
  const activityCols = [
    { key: "activity",    label: "Activity" },
    { key: "module",      label: "Module" },
    { key: "performedBy", label: "Performed By" },
    { key: "date",        label: "Date" },
    { key: "status",      label: "Status" },
  ];

  const activityRows = dashboardData.activityRows || [];

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
        <EnhancedDashCard title="Total Companies"        value={String(dashboardData.kpi?.totalCompanies ?? 0)}       icon={<Building2 size={22} />}       accentColor="#3b82f6" size={4} />
        <EnhancedDashCard title="Active Companies"       value={String(dashboardData.kpi?.activeCompanies ?? 0)}        icon={<CheckCircle2 size={22} />}    accentColor="#22c55e" size={4} />
        <EnhancedDashCard title="Inactive / Suspended"   value={String(dashboardData.kpi?.inactiveCompanies ?? 0)}        icon={<XCircle size={22} />}         accentColor="#f43f5e" size={4} />
        <EnhancedDashCard title="Total Platform Users"   value={String(dashboardData.kpi?.totalPlatformUsers ?? 0)}     icon={<Users size={22} />}           accentColor="#8b5cf6" size={4} />
        <EnhancedDashCard title="Total Leads (All Cos.)" value={String(dashboardData.kpi?.totalLeads ?? 0)}  icon={<TrendingUp size={22} />}      accentColor="#f59e0b" size={4} />
        <EnhancedDashCard title="Open Support Tickets"   value={String(dashboardData.kpi?.openSupportTickets ?? 0)}        icon={<HeadphonesIcon size={22} />} accentColor="#64748b" size={4} />
      </DashGrid>

      {/* ── 3 & 4. Growth + Retention Charts ── */}
      <Grid cols={12} gap={4}>
        <GLineChart
          title="Company Growth"
          subtitle="New companies onboarded per period"
          data={companyGrowthData}
          lines={[{ key: "companies", label: "New Companies", color: "#3b82f6" }]}
          size={8}
          height={300}
          filters={makePeriodFilters(setGrowthPeriod)}
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

      {/* ── Doughnut & Pie Charts ── */}
      <Grid cols={12} gap={4}>
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
          size={4}
          height={300}
        />
      </Grid>

      {/* ── Ticket & API Health Charts ── */}
      <Grid cols={12} gap={4}>
        <GRadarChart
          title="Ticket Resolution Rate"
          subtitle="Resolved vs pending % by category"
          data={ticketResolutionData}
          radars={[
            { key: "resolved", label: "Resolved (%)", color: "#22c55e" },
            { key: "pending",  label: "Pending (%)",  color: "#f43f5e" },
          ]}
          size={6}
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
        <DataTable
          title="Top Companies"
          columns={companyCols}
          rows={companyRows}
          defaultSortKey="users"
          defaultSortDir="desc"
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
        <DataTable
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



      {/* ── Recent Platform Activities ── */}
      <Grid cols={12} gap={4}>
        <DataTable
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