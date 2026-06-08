import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Target,
  FolderKanban,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CalendarCheck,
  AlertTriangle,
  Briefcase,
  Receipt,
  UserCheck,
  UserX,
  LogIn,
  AlertCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import {
  Grid,
  DashGrid,
  EnhancedDashCard,
  Heading,
  GAreaChart,
  GColumnChart,
  GPieChart,
  GDoughnutChart,
  GBarChart,
  DataTable,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  Button,
  openModal,
  closeModal,
} from "../../components/shared/Common_Components";
import { dashboardService } from "../../services/dashboardService";

import { getMyTickets, mapStatus } from "../../services/ticketService";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs font-medium underline"
        >
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATIC DATA (will be replaced with API calls later)
// ─────────────────────────────────────────────────────────────

// ── Finance chart data per period ──
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const financeDataMap = {
  week: { data: [{ name: "Mon", profit: 120 }, { name: "Tue", profit: 145 }, { name: "Wed", profit: 98 }, { name: "Thu", profit: 170 }, { name: "Fri", profit: 190 }], total: "$723K", trend: "+8.2%" },
  month: { data: [{ name: "W1", profit: 620 }, { name: "W2", profit: 740 }, { name: "W3", profit: 810 }, { name: "W4", profit: 858 }], total: "$858K", trend: "+12.5%" },
  quarter: { data: [{ name: "Jan", profit: 2100 }, { name: "Feb", profit: 2450 }, { name: "Mar", profit: 2800 }], total: "$2.8M", trend: "+18.3%" },
  year: { data: [{ name: "Q1", profit: 7200 }, { name: "Q2", profit: 8100 }, { name: "Q3", profit: 9400 }, { name: "Q4", profit: 10200 }], total: "$10.2M", trend: "+22.1%" },
};

const financeMonthData = {
  Jan: { data: [{ name: "W1", profit: 380 }, { name: "W2", profit: 420 }, { name: "W3", profit: 460 }, { name: "W4", profit: 490 }], total: "$490K", trend: "+6.1%" },
  Feb: { data: [{ name: "W1", profit: 410 }, { name: "W2", profit: 450 }, { name: "W3", profit: 510 }, { name: "W4", profit: 530 }], total: "$530K", trend: "+8.2%" },
  Mar: { data: [{ name: "W1", profit: 520 }, { name: "W2", profit: 580 }, { name: "W3", profit: 620 }, { name: "W4", profit: 670 }], total: "$670K", trend: "+11.4%" },
  Apr: { data: [{ name: "W1", profit: 600 }, { name: "W2", profit: 650 }, { name: "W3", profit: 710 }, { name: "W4", profit: 750 }], total: "$750K", trend: "+12.0%" },
  May: { data: [{ name: "W1", profit: 580 }, { name: "W2", profit: 640 }, { name: "W3", profit: 690 }, { name: "W4", profit: 720 }], total: "$720K", trend: "+9.8%" },
  Jun: { data: [{ name: "W1", profit: 640 }, { name: "W2", profit: 700 }, { name: "W3", profit: 780 }, { name: "W4", profit: 820 }], total: "$820K", trend: "+14.3%" },
  Jul: { data: [{ name: "W1", profit: 550 }, { name: "W2", profit: 610 }, { name: "W3", profit: 660 }, { name: "W4", profit: 700 }], total: "$700K", trend: "+7.5%" },
  Aug: { data: [{ name: "W1", profit: 590 }, { name: "W2", profit: 650 }, { name: "W3", profit: 720 }, { name: "W4", profit: 760 }], total: "$760K", trend: "+10.1%" },
  Sep: { data: [{ name: "W1", profit: 620 }, { name: "W2", profit: 690 }, { name: "W3", profit: 740 }, { name: "W4", profit: 800 }], total: "$800K", trend: "+11.9%" },
  Oct: { data: [{ name: "W1", profit: 650 }, { name: "W2", profit: 720 }, { name: "W3", profit: 790 }, { name: "W4", profit: 840 }], total: "$840K", trend: "+13.2%" },
  Nov: { data: [{ name: "W1", profit: 600 }, { name: "W2", profit: 680 }, { name: "W3", profit: 750 }, { name: "W4", profit: 810 }], total: "$810K", trend: "+12.0%" },
  Dec: { data: [{ name: "W1", profit: 620 }, { name: "W2", profit: 740 }, { name: "W3", profit: 810 }, { name: "W4", profit: 858 }], total: "$858K", trend: "+12.5%" },
};

const periodLabels = { week: "This Week", month: "This Month", quarter: "This Quarter", year: "This Year" };

// ── Sales performance data per period ──
const circumference = 2 * Math.PI * 14; // ~87.96
const salesDataMap = {
  week: { pct: 58, target: "$500K", current: "$290K" },
  month: { pct: 72, target: "$2.5M", current: "$1.8M" },
  quarter: { pct: 81, target: "$7.5M", current: "$6.1M" },
  year: { pct: 89, target: "$30M", current: "$26.7M" },
};
const salesMonthData = {
  Jan: { pct: 45, target: "$2.0M", current: "$900K" },
  Feb: { pct: 52, target: "$2.0M", current: "$1.04M" },
  Mar: { pct: 60, target: "$2.2M", current: "$1.32M" },
  Apr: { pct: 65, target: "$2.5M", current: "$1.63M" },
  May: { pct: 58, target: "$2.5M", current: "$1.45M" },
  Jun: { pct: 72, target: "$2.5M", current: "$1.8M" },
  Jul: { pct: 55, target: "$2.3M", current: "$1.27M" },
  Aug: { pct: 68, target: "$2.5M", current: "$1.7M" },
  Sep: { pct: 74, target: "$2.5M", current: "$1.85M" },
  Oct: { pct: 78, target: "$2.8M", current: "$2.18M" },
  Nov: { pct: 70, target: "$2.8M", current: "$1.96M" },
  Dec: { pct: 82, target: "$3.0M", current: "$2.46M" },
};

// ── Project progress ──
const projects = [
  { name: "Website Redesign", progress: 85 },
  { name: "Mobile App Dev", progress: 42 },
  { name: "Marketing Campaign", progress: 68 },
];
const projectColors = ["#3b82f6", "#8b5cf6", "#14b8a6"];

// ── Recent projects ──
const recentProjectCols = [
  { key: "name",     label: "Project Name" },
  { key: "status",   label: "Status" },
  { key: "team",     label: "Team Size" },
  { key: "deadline", label: "Deadline" },
];

const recentProjectRows = [
  { name: "Graphura Rebrand",   status: "In Progress", team: "4 members", deadline: "Oct 24, 2023" },
  { name: "Nexus Integration",  status: "Review",      team: "3 members", deadline: "Nov 02, 2023" },
  { name: "Alpha Portal Dev",   status: "Planning",    team: "2 members", deadline: "Dec 15, 2023" },
  { name: "System Upgrade",     status: "On Hold",     team: "1 member",  deadline: "TBD" },
];

// ── Support tickets ──
const ticketCols = [
  { key: "severity", label: "Severity" },
  { key: "title",    label: "Title" },
  { key: "desc",     label: "Description" },
  { key: "time",     label: "Time" },
];

const ticketRows = [
  { severity: "HIGH",   title: "Database connection failing in prod",    desc: "Multiple users reporting inability t...", time: "10m ago" },
  { severity: "MEDIUM", title: "Payment gateway timeout",                desc: "Stripe integration taking longer...",     time: "1h ago" },
  { severity: "LOW",    title: "Update user profile avatar bug",         desc: "Images larger than 5MB are not...",       time: "3h ago" },
];

// ── Lead Pipeline Funnel ──
const pipelineData = [
  { name: "Untouched",  value: 1240 },
  { name: "Talk",       value: 860 },
  { name: "Interested", value: 520 },
  { name: "Prospect",   value: 280 },
  { name: "Converted",  value: 145 },
];
const pipelineColors = ["#64748b", "#3b82f6", "#8b5cf6", "#14b8a6", "#22c55e"];

// ── Department Overview ──
const departments = [
  { name: "Sales",      icon: <Target size={20} />,    active: 18, metric: "320 leads today",     color: "#3b82f6" },
  { name: "Management", icon: <Briefcase size={20} />, active: 12, metric: "24 active projects",  color: "#8b5cf6" },
  { name: "Finance",    icon: <Receipt size={20} />,   active: 3,  metric: "8 pending invoices",  color: "#14b8a6" },
];

// ── HRM Snapshot ──
const hrmData = { present: 28, absent: 5, late: 3, pendingLeaves: 4, totalEmployees: 33 };

// ── Recent Logins ──
const loginCols = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
  { key: "ip",   label: "IP Address" },
  { key: "time", label: "Time" },
];
const loginRows = [
  { name: "Rahul Sharma", role: "Sales Exec",  ip: "192.168.1.45", time: "2m ago" },
  { name: "Priya Patel",  role: "Mgmt TL",     ip: "10.0.0.12",    time: "8m ago" },
  { name: "Amit Verma",   role: "Finance Mgr", ip: "172.16.0.8",   time: "15m ago" },
  { name: "Neha Singh",   role: "Sales TL",    ip: "192.168.1.67", time: "22m ago" },
  { name: "Vikram Das",   role: "Mgmt Emp",    ip: "10.0.0.34",    time: "35m ago" },
];

// ── Sales Target vs Achieved ──
const salesTargetData = [
  { name: "Team Alpha", target: 120, achieved: 98 },
  { name: "Team Beta",  target: 100, achieved: 85 },
  { name: "Team Gamma", target: 90,  achieved: 92 },
  { name: "Team Delta", target: 110, achieved: 72 },
];

// ── Revenue vs Expense ──
const revExpData = [
  { name: "Jan", revenue: 480, expense: 320 },
  { name: "Feb", revenue: 530, expense: 290 },
  { name: "Mar", revenue: 670, expense: 380 },
  { name: "Apr", revenue: 750, expense: 410 },
  { name: "May", revenue: 720, expense: 350 },
  { name: "Jun", revenue: 820, expense: 420 },
];

// ── Underperformers ──
const underperformerCols = [
  { key: "name",     label: "Employee" },
  { key: "role",     label: "Role" },
  { key: "target",   label: "Target" },
  { key: "achieved", label: "Achieved" },
  { key: "pct",      label: "%" },
];
const underperformerRows = [
  { name: "Ravi Kumar",  role: "Sales Exec", target: "50", achieved: "18", pct: "36%" },
  { name: "Sneha Joshi", role: "Sales Exec", target: "50", achieved: "22", pct: "44%" },
  { name: "Arun Mehta",  role: "Sales TL",   target: "150", achieved: "78", pct: "52%" },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCount, setUserCount] = useState("0");
  const [financePeriod, setFinancePeriod] = useState("month");
  const [financeMonth, setFinanceMonth] = useState("");
  const [salesPeriod, setSalesPeriod] = useState("month");
  const [salesMonth, setSalesMonth] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getStats();
      setUserCount(String(data.data.users.length));
    } catch (err) {
      setError(err?.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeFinance = financeMonth
    ? financeMonthData[financeMonth]
    : (financeDataMap[financePeriod] || financeDataMap.month);

  const activeSales = salesMonth
    ? salesMonthData[salesMonth]
    : (salesDataMap[salesPeriod] || salesDataMap.month);
  const salesOffset = circumference * (1 - activeSales.pct / 100);

  // Finance chart filter buttons
  const financeFilters = [
    ...Object.entries(periodLabels).map(([key, label]) => ({
      label,
      onClick: () => { setFinancePeriod(key); setFinanceMonth(""); },
    })),
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">

      {/* ── 1. Header ── */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Admin "
          secondaryText="Dashboard"
          size={12}
        />
      </Grid>

      {/* ── Error Banner ── */}
      {error && (
        <Grid cols={12} gap={4}>
          <div className="col-span-12">
            <ErrorBanner message={error} onRetry={fetchData} />
          </div>
        </Grid>
      )}

      {/* ── 2. KPI Cards ── */}
      <Grid cols={12} gap={4}>
        {loading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="col-span-3">
                <Skeleton className="h-28 w-full" />
              </div>
            ))}
          </>
        ) : (
          <>
            <EnhancedDashCard
              title="Total Users"
              value={userCount}
              icon={<Users size={20} />}
              accentColor="#3b82f6"
              size={3}
            />
            <EnhancedDashCard
              title="Leads"
              value="0"
              icon={<Target size={20} />}
              accentColor="#8b5cf6"
              size={3}
            />
            <EnhancedDashCard
              title="Projects"
              value="0"
              icon={<FolderKanban size={20} />}
              accentColor="#22c55e"
              size={3}
            />
            <EnhancedDashCard
              title="Revenue"
              value="₹0"
              icon={<IndianRupee size={20} />}
              accentColor="#f59e0b"
              size={3}
            />
          </>
        )}
      </Grid>

      {/* ── 3. Finance Summary + Sales Performance ── */}
      <Grid cols={12} gap={4}>
        <GAreaChart
          title="Finance Summary"
          subtitle={`Net Profit: ${activeFinance.total} (${activeFinance.trend})`}
          data={activeFinance.data}
          areas={[{ key: "profit", label: "Profit", color: "#3b82f6" }]}
          size={8}
          height={300}
          filters={financeFilters}
        />

        {/* Sales Performance - Donut style card */}
        <GDoughnutChart
          title="Sales Performance"
          subtitle={`Target: ${activeSales.target} | Current: ${activeSales.current}`}
          data={[
            { name: "Target Reached", value: activeSales.pct },
            { name: "Remaining", value: 100 - activeSales.pct }
          ]}
          colors={["#2a465a", "#cbd5e1"]}
          size={4}
          height={300}
          filters={[
            { label: "This Week", onClick: () => { setSalesPeriod("week"); setSalesMonth(""); } },
            { label: "This Month", onClick: () => { setSalesPeriod("month"); setSalesMonth(""); } },
            { label: "This Quarter", onClick: () => { setSalesPeriod("quarter"); setSalesMonth(""); } },
          ]}
        />
      </Grid>

      {/* ── 4. Lead Pipeline Funnel ── */}
      <Grid cols={12} gap={4}>
        <GPieChart
          title="Lead Pipeline"
          subtitle={`Conversion Rate: ${((145 / 1240) * 100).toFixed(1)}%`}
          data={pipelineData}
          colors={pipelineColors}
          size={4}
          height={300}
        />
        <GColumnChart
          title="Sales Target vs Achieved"
          subtitle="This month's team performance"
          data={salesTargetData}
          bars={[
            { key: "target",   label: "Target",   color: "#64748b" },
            { key: "achieved", label: "Achieved",  color: "#22c55e" },
          ]}
          size={8}
          height={300}
        />
      </Grid>

      {/* ── 5. Department Overview KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        {departments.map((d) => (
          <EnhancedDashCard
            key={d.name}
            title={`${d.name} Dept`}
            value={`${d.active} active`}
            icon={d.icon}
            accentColor={d.color}
            size={4}
          />
        ))}
      </DashGrid>

      {/* ── 6. HRM Snapshot Cards ── */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Present"   value={String(hrmData.present)}      icon={<UserCheck size={20} />}     accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Absent"    value={String(hrmData.absent)}       icon={<UserX size={20} />}         accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Late"      value={String(hrmData.late)}         icon={<Clock size={20} />}         accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Leave Req" value={String(hrmData.pendingLeaves)} icon={<CalendarCheck size={20} />} accentColor="#38bdf8" size={3} />
      </DashGrid>

      {/* ── 7. Revenue vs Expense Chart ── */}
      <Grid cols={12} gap={4}>
        <GAreaChart
          title="Revenue vs Expense"
          subtitle="Monthly comparison"
          data={revExpData}
          areas={[
            { key: "revenue", label: "Revenue", color: "#22c55e" },
            { key: "expense", label: "Expense", color: "#f43f5e" },
          ]}
          size={12}
          height={280}
        />
      </Grid>

      {/* ── 8. Project Progress ── */}
      <Grid cols={12} gap={4}>
        <GBarChart
          title="Project Progress"
          subtitle="Current project completion %"
          data={projects.map(p => ({ name: p.name, progress: p.progress }))}
          bars={[{ key: "progress", label: "Progress %", color: "#8b5cf6" }]}
          size={12}
          height={220}
        />
      </Grid>

      {/* ── 9. Recent Projects Table ── */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Recent Projects"
          columns={recentProjectCols}
          rows={recentProjectRows}
          actions={[
            {
              icon:    <Eye size={15} />,
              tooltip: "View",
              variant: "ghost",
              onClick: (row) => {
                setSelectedProject(row);
                openModal("admin-project-view");
              },
            },
          ]}
          size={12}
          pageSize={5}
          date={false}
          filters={[
            {
              title:   "Status",
              type:    "toggle",
              key:     "status",
              options: ["In Progress", "Review", "Planning", "On Hold"],
            },
          ]}
        />
      </Grid>

      {/* ── 10. Recent Login Activity Table ── */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Recent Login Activity"
          columns={loginCols}
          rows={loginRows}
          size={12}
          pageSize={5}
          date={false}
          searchable
        />
      </Grid>

      {/* ── 11. Support Tickets Table ── */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Support Tickets"
          columns={ticketCols}
          rows={ticketRows}
          actions={[
            {
              icon:    <Eye size={15} />,
              tooltip: "View",
              variant: "ghost",
              onClick: (row) => {
                setSelectedTicket(row);
                openModal("admin-ticket-view");
              },
            },
          ]}
          size={12}
          pageSize={5}
          date={false}
          filters={[
            {
              title:   "Severity",
              type:    "toggle",
              key:     "severity",
              options: ["HIGH", "MEDIUM", "LOW"],
            },
          ]}
        />
      </Grid>

      {/* ── 12. Underperformer Alerts Table ── */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Underperformer Alerts"
          columns={underperformerCols}
          rows={underperformerRows}
          size={12}
          pageSize={5}
          date={false}
        />
      </Grid>

      {/* ══════════════════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Project: View */}
      <Modal id="admin-project-view" title="Project Details" size="md">
        {selectedProject && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Project Info" cols={2}>
              <ModalData label="Project Name" value={selectedProject.name} />
              <ModalData label="Status"       value={selectedProject.status} />
              <ModalData label="Team Size"    value={selectedProject.team} />
              <ModalData label="Deadline"     value={selectedProject.deadline} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button
                text="Close"
                variant="ghost"
                size={3}
                onClick={() => closeModal("admin-project-view")}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Ticket: View */}
      <Modal id="admin-ticket-view" title="Ticket Details" size="md">
        {selectedTicket && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Ticket Info" cols={2}>
              <ModalData label="Severity"    value={selectedTicket.severity} />
              <ModalData label="Title"       value={selectedTicket.title} />
              <ModalData label="Description" value={selectedTicket.desc} />
              <ModalData label="Time"        value={selectedTicket.time} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button
                text="Close"
                variant="ghost"
                size={3}
                onClick={() => closeModal("admin-ticket-view")}
              />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}

export default Dashboard;