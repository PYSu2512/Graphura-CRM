import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  UserCheck,
  Target,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle,
  CreditCard,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Calendar,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard,
  DataTable,
  Heading,
  P,
  PanelModal as Modal,
  openModal,
  closeModal,
  DataField,
  Grid,
  GAreaChart,
  GBarChart,
  Button,
} from "../../components/shared/Common_Components";
import { userService } from "../../services/userService";

// ─── Mock Data (role-based) ─────────────────────────────────────────────────

// ─── TIMELINE DATA ─────────────────────────────────────────────────────────
const revenueChartDataMonthly = [
  { name: "Jan", revenue: 820000, expenses: 420000 },
  { name: "Feb", revenue: 940000, expenses: 460000 },
  { name: "Mar", revenue: 1100000, expenses: 510000 },
  { name: "Apr", revenue: 1350000, expenses: 590000 },
  { name: "May", revenue: 1200000, expenses: 550000 },
  { name: "Jun", revenue: 1480000, expenses: 620000 },
];

const revenueChartDataYearly = [
  { name: "2022", revenue: 4500000, expenses: 2100000 },
  { name: "2023", revenue: 6200000, expenses: 2800000 },
  { name: "2024", revenue: 8900000, expenses: 3500000 },
  { name: "2025", revenue: 11500000, expenses: 4200000 },
  { name: "2026", revenue: 12400000, expenses: 4800000 },
];

const revenueChartDataWeekly = [
  { name: "Week 1", revenue: 280000, expenses: 140000 },
  { name: "Week 2", revenue: 320000, expenses: 155000 },
  { name: "Week 3", revenue: 340000, expenses: 165000 },
  { name: "Week 4", revenue: 410000, expenses: 200000 },
];

// Lead Conversion Data
const leadConversionMonthly = [
  { name: "Jan", leads: 280, converted: 112, conversionRate: 40 },
  { name: "Feb", leads: 320, converted: 140, conversionRate: 44 },
  { name: "Mar", leads: 350, converted: 155, conversionRate: 44 },
  { name: "Apr", leads: 420, converted: 174, conversionRate: 41 },
  { name: "May", leads: 380, converted: 152, conversionRate: 40 },
  { name: "Jun", leads: 450, converted: 189, conversionRate: 42 },
];

const leadConversionYearly = [
  { name: "2022", leads: 2800, converted: 1120, conversionRate: 40 },
  { name: "2023", leads: 3600, converted: 1584, conversionRate: 44 },
  { name: "2024", leads: 4200, converted: 1848, conversionRate: 44 },
  { name: "2025", leads: 5100, converted: 2091, conversionRate: 41 },
  { name: "2026", leads: 5600, converted: 2352, conversionRate: 42 },
];

const leadConversionWeekly = [
  { name: "Week 1", leads: 95, converted: 38, conversionRate: 40 },
  { name: "Week 2", leads: 110, converted: 48, conversionRate: 44 },
  { name: "Week 3", leads: 115, converted: 51, conversionRate: 44 },
  { name: "Week 4", leads: 135, converted: 55, conversionRate: 41 },
];

// Project Completion Data
const projectCompletionMonthly = [
  { name: "Jan", total: 12, completed: 4, inProgress: 6, delayed: 2 },
  { name: "Feb", total: 14, completed: 6, inProgress: 6, delayed: 2 },
  { name: "Mar", total: 16, completed: 8, inProgress: 6, delayed: 2 },
  { name: "Apr", total: 18, completed: 10, inProgress: 6, delayed: 2 },
  { name: "May", total: 16, completed: 9, inProgress: 5, delayed: 2 },
  { name: "Jun", total: 20, completed: 12, inProgress: 6, delayed: 2 },
];

const projectCompletionYearly = [
  { name: "2022", total: 45, completed: 35, inProgress: 8, delayed: 2 },
  { name: "2023", total: 68, completed: 58, inProgress: 8, delayed: 2 },
  { name: "2024", total: 92, completed: 78, inProgress: 12, delayed: 2 },
  { name: "2025", total: 110, completed: 95, inProgress: 12, delayed: 3 },
  { name: "2026", total: 98, completed: 83, inProgress: 13, delayed: 2 },
];

const projectCompletionWeekly = [
  { name: "Week 1", total: 5, completed: 1, inProgress: 3, delayed: 1 },
  { name: "Week 2", total: 5, completed: 2, inProgress: 2, delayed: 1 },
  { name: "Week 3", total: 5, completed: 3, inProgress: 1, delayed: 1 },
  { name: "Week 4", total: 5, completed: 4, inProgress: 1, delayed: 0 },
];

// Payment Collection Data
const paymentCollectionMonthly = [
  { name: "Jan", total: 2400000, collected: 2160000, pending: 240000 },
  { name: "Feb", total: 2800000, collected: 2380000, pending: 420000 },
  { name: "Mar", total: 3200000, collected: 2880000, pending: 320000 },
  { name: "Apr", total: 3800000, collected: 3230000, pending: 570000 },
  { name: "May", total: 3400000, collected: 2890000, pending: 510000 },
  { name: "Jun", total: 4200000, collected: 3570000, pending: 630000 },
];

const paymentCollectionYearly = [
  { name: "2022", total: 18000000, collected: 15300000, pending: 2700000 },
  { name: "2023", total: 24500000, collected: 21840000, pending: 2660000 },
  { name: "2024", total: 32100000, collected: 29070000, pending: 3030000 },
  { name: "2025", total: 41800000, collected: 37620000, pending: 4180000 },
  { name: "2026", total: 44200000, collected: 37570000, pending: 6630000 },
];

const paymentCollectionWeekly = [
  { name: "Week 1", total: 1000000, collected: 850000, pending: 150000 },
  { name: "Week 2", total: 1100000, collected: 935000, pending: 165000 },
  { name: "Week 3", total: 1150000, collected: 977500, pending: 172500 },
  { name: "Week 4", total: 1350000, collected: 1147500, pending: 202500 },
];

const deptPerformanceData = [
  { name: "Sales", target: 90, achieved: 87 },
  { name: "Management", target: 85, achieved: 80 },
  { name: "Finance", target: 95, achieved: 92 },
];

const deptRevenueMonthly = [
  { name: "Sales", value: 340000, color: "#3b82f6" },
  { name: "Management", value: 280000, color: "#8b5cf6" },
  { name: "Finance", value: 430000, color: "#22c55e" },
];

const deptRevenueYearly = [
  { name: "Sales", value: 3800000, color: "#3b82f6" },
  { name: "Management", value: 3200000, color: "#8b5cf6" },
  { name: "Finance", value: 4700000, color: "#22c55e" },
];

const deptRevenueWeekly = [
  { name: "Sales", value: 85000, color: "#3b82f6" },
  { name: "Management", value: 72000, color: "#8b5cf6" },
  { name: "Finance", value: 105000, color: "#22c55e" },
];

const salesEmployees = [
  {
    name: "Priya Mehta",
    role: "Manager",
    totalLeads: 210,
    activeLeads: 85,
    dumpLeads: 30,
    calls: 340,
    conversion: "40%",
    revenue: "₹18,50,000",
    missedFollowups: 4,
    status: "Active",
    date: "2026-04-10",
  },
  {
    name: "Arjun Kapoor",
    role: "TL",
    totalLeads: 160,
    activeLeads: 70,
    dumpLeads: 20,
    calls: 280,
    conversion: "43%",
    revenue: "₹14,20,000",
    missedFollowups: 2,
    status: "Active",
    date: "2026-04-11",
  },
  {
    name: "Sneha Joshi",
    role: "Executive",
    totalLeads: 95,
    activeLeads: 40,
    dumpLeads: 15,
    calls: 180,
    conversion: "42%",
    revenue: "₹8,80,000",
    missedFollowups: 6,
    status: "Active",
    date: "2026-04-12",
  },
  {
    name: "Vikram Nair",
    role: "Executive",
    totalLeads: 88,
    activeLeads: 32,
    dumpLeads: 22,
    calls: 150,
    conversion: "36%",
    revenue: "₹7,40,000",
    missedFollowups: 8,
    status: "Inactive",
    date: "2026-04-08",
  },
  {
    name: "Neha Gupta",
    role: "TL",
    totalLeads: 145,
    activeLeads: 60,
    dumpLeads: 18,
    calls: 260,
    conversion: "41%",
    revenue: "₹12,60,000",
    missedFollowups: 3,
    status: "Active",
    date: "2026-04-14",
  },
  {
    name: "Rohit Verma",
    role: "Executive",
    totalLeads: 102,
    activeLeads: 45,
    dumpLeads: 12,
    calls: 195,
    conversion: "44%",
    revenue: "₹9,20,000",
    missedFollowups: 1,
    status: "Active",
    date: "2026-04-13",
  },
  {
    name: "Ananya Singh",
    role: "Executive",
    totalLeads: 78,
    activeLeads: 28,
    dumpLeads: 20,
    calls: 140,
    conversion: "35%",
    revenue: "₹6,10,000",
    missedFollowups: 9,
    status: "Inactive",
    date: "2026-04-07",
  },
  {
    name: "Karan Bhatia",
    role: "Manager",
    totalLeads: 195,
    activeLeads: 80,
    dumpLeads: 25,
    calls: 310,
    conversion: "41%",
    revenue: "₹16,90,000",
    missedFollowups: 3,
    status: "Active",
    date: "2026-04-15",
  },
];

const projects = [
  {
    project: "CRM Portal Revamp",
    client: "Acme Corp",
    assignedTo: "Arjun Kapoor",
    startDate: "01 Feb 2026",
    deadline: "30 Apr 2026",
    status: "In Progress",
    progress: "72%",
    priority: "High",
    date: "2026-02-01",
  },
  {
    project: "ERP Integration",
    client: "Global Tech",
    assignedTo: "Neha Gupta",
    startDate: "15 Jan 2026",
    deadline: "15 May 2026",
    status: "In Progress",
    progress: "55%",
    priority: "Critical",
    date: "2026-01-15",
  },
  {
    project: "Mobile App v2",
    client: "Nexus Labs",
    assignedTo: "Rohit Verma",
    startDate: "10 Mar 2026",
    deadline: "10 Jun 2026",
    status: "In Progress",
    progress: "38%",
    priority: "Medium",
    date: "2026-03-10",
  },
  {
    project: "Data Migration",
    client: "Sunrise Retail",
    assignedTo: "Karan Bhatia",
    startDate: "05 Dec 2025",
    deadline: "05 Mar 2026",
    status: "Delayed",
    progress: "80%",
    priority: "High",
    date: "2025-12-05",
  },
  {
    project: "Analytics Dashboard",
    client: "FinTech Ltd.",
    assignedTo: "Priya Mehta",
    startDate: "20 Jan 2026",
    deadline: "20 Apr 2026",
    status: "Completed",
    progress: "100%",
    priority: "Low",
    date: "2026-01-20",
  },
  {
    project: "API Gateway Setup",
    client: "CloudBase Inc.",
    assignedTo: "Vikram Nair",
    startDate: "01 Mar 2026",
    deadline: "01 May 2026",
    status: "In Progress",
    progress: "45%",
    priority: "Medium",
    date: "2026-03-01",
  },
];

const financeRecords = [
  {
    client: "Acme Corp",
    project: "CRM Portal Revamp",
    invoiceId: "INV-1001",
    total: "₹12,00,000",
    paid: "₹8,40,000",
    remaining: "₹3,60,000",
    type: "Milestone",
    status: "Partial",
    date: "2026-04-01",
  },
  {
    client: "Global Tech",
    project: "ERP Integration",
    invoiceId: "INV-1002",
    total: "₹22,50,000",
    paid: "₹22,50,000",
    remaining: "₹0",
    type: "Full Payment",
    status: "Paid",
    date: "2026-03-20",
  },
  {
    client: "Nexus Labs",
    project: "Mobile App v2",
    invoiceId: "INV-1003",
    total: "₹9,80,000",
    paid: "₹4,90,000",
    remaining: "₹4,90,000",
    type: "Milestone",
    status: "Partial",
    date: "2026-04-10",
  },
  {
    client: "Sunrise Retail",
    project: "Data Migration",
    invoiceId: "INV-1004",
    total: "₹6,40,000",
    paid: "₹0",
    remaining: "₹6,40,000",
    type: "Post-Delivery",
    status: "Pending",
    date: "2026-03-05",
  },
  {
    client: "FinTech Ltd.",
    project: "Analytics Dashboard",
    invoiceId: "INV-1005",
    total: "₹15,00,000",
    paid: "₹15,00,000",
    remaining: "₹0",
    type: "Full Payment",
    status: "Paid",
    date: "2026-04-18",
  },
  {
    client: "CloudBase Inc.",
    project: "API Gateway Setup",
    invoiceId: "INV-1006",
    total: "₹7,20,000",
    paid: "₹3,60,000",
    remaining: "₹3,60,000",
    type: "Milestone",
    status: "Partial",
    date: "2026-04-05",
  },
];

// ─── Column Definitions ─────────────────────────────────────────────────────

const salesColumns = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "totalLeads", label: "Total Leads" },
  { key: "activeLeads", label: "Active Leads" },
  { key: "calls", label: "Calls" },
  { key: "missedFollowups", label: "Missed Followups" },
  { key: "conversion", label: "Conversion %" },
  { key: "revenue", label: "Revenue" },
  { key: "status", label: "Status" },
  { key: "date", label: "Joined" },
];

const projectColumns = [
  { key: "project", label: "Project Name" },
  { key: "client", label: "Client" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "startDate", label: "Start Date" },
  { key: "deadline", label: "Deadline" },
  { key: "status", label: "Status" },
  { key: "progress", label: "Progress %" },
  { key: "priority", label: "Priority" },
];

const financeColumns = [
  { key: "client", label: "Client" },
  { key: "project", label: "Project" },
  { key: "invoiceId", label: "Invoice #" },
  { key: "total", label: "Total Amount" },
  { key: "paid", label: "Paid" },
  { key: "remaining", label: "Remaining" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
];

// ─── Component ──────────────────────────────────────────────────────────────

const initialDepts = [
  {
    id: "dept-1",
    name: "sales",
    displayName: "Sales Department",
    totalUsers: 8,
    activeUsers: 6,
    roles: "Manager, TL, Executive",
    createdAt: "10 Apr 2026",
  },
  {
    id: "dept-2",
    name: "management",
    displayName: "Management",
    totalUsers: 6,
    activeUsers: 5,
    roles: "Admin, Project Manager",
    createdAt: "15 Jan 2026",
  },
  {
    id: "dept-3",
    name: "finance",
    displayName: "Finance",
    totalUsers: 4,
    activeUsers: 4,
    roles: "Analyst, Accountant",
    createdAt: "05 Dec 2025",
  },
];

export default function Report() {
  const [timeline, setTimeline] = useState("monthly"); // "yearly", "monthly", "weekly"
  const [departments, setDepartments] = useState(initialDepts);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFinance, setSelectedFinance] = useState(null);

  // ─── Get chart data based on timeline ────────────────────────────────────
  const getRevenueData = () => {
    switch (timeline) {
      case "yearly":
        return revenueChartDataYearly;
      case "weekly":
        return revenueChartDataWeekly;
      default:
        return revenueChartDataMonthly;
    }
  };

  const getLeadConversionData = () => {
    switch (timeline) {
      case "yearly":
        return leadConversionYearly;
      case "weekly":
        return leadConversionWeekly;
      default:
        return leadConversionMonthly;
    }
  };

  const getProjectCompletionData = () => {
    switch (timeline) {
      case "yearly":
        return projectCompletionYearly;
      case "weekly":
        return projectCompletionWeekly;
      default:
        return projectCompletionMonthly;
    }
  };

  const getPaymentCollectionData = () => {
    switch (timeline) {
      case "yearly":
        return paymentCollectionYearly;
      case "weekly":
        return paymentCollectionWeekly;
      default:
        return paymentCollectionMonthly;
    }
  };

  const getDeptRevenueData = () => {
    switch (timeline) {
      case "yearly":
        return deptRevenueYearly;
      case "weekly":
        return deptRevenueWeekly;
      default:
        return deptRevenueMonthly;
    }
  };

  const fetchDepartments = () => {
    // Replaced by mock state
  };

  const totalDepts = departments.length;
  const totalUsers = departments.reduce((sum, d) => sum + d.totalUsers, 0);
  const totalActive = departments.reduce((sum, d) => sum + d.activeUsers, 0);

  return (
    <div className="space-y-6">
      {/* ── Header with Timeline Filter ── */}
      <div className="flex flex-col gap-5 mb-4">
        <div className="w-full flex items-center justify-between">
          <div>
            <Heading
              primaryText="Reports&nbsp; &"
              secondaryText="Management"
              size={12}
            />
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar size={18} className="text-slate-500" />
            <div className="flex gap-2">
              {[
                { label: "Weekly", value: "weekly" },
                { label: "Monthly", value: "monthly" },
                { label: "Yearly", value: "yearly" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setTimeline(value)}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                    timeline === value
                      ? "bg-[#2a465a] text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Global KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard
          title="Total Departments"
          value={String(totalDepts)}
          icon={<Building2 size={22} />}
          accentColor="#38bdf8"
          size={3}
        />
        <EnhancedDashCard
          title="Total Users"
          value={String(totalUsers)}
          icon={<Users size={22} />}
          accentColor="#3b82f6"
          size={3}
        />
        <EnhancedDashCard
          title="Active Users"
          value={String(totalActive)}
          icon={<UserCheck size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <EnhancedDashCard
          title="Total Revenue"
          value="₹1.84Cr"
          icon={<DollarSign size={22} />}
          accentColor="#8b5cf6"
          size={3}
        />
      </DashGrid>

      {/* ── Charts Row 1 ── */}
      <DashGrid cols={12} gap={4}>
        <GAreaChart
          title="Revenue & Expense Trend"
          subtitle={`${timeline.charAt(0).toUpperCase() + timeline.slice(1)} breakdown`}
          data={getRevenueData()}
          areas={[
            { key: "revenue", label: "Revenue", color: "#3b82f6" },
            { key: "expenses", label: "Expenses", color: "#f43f5e" },
          ]}
          size={6}
          height={300}
        />
        <GBarChart
          title="Department Performance"
          subtitle="Target vs Achieved"
          data={deptPerformanceData}
          bars={[
            { key: "target", label: "Target", color: "#94a3b8" },
            { key: "achieved", label: "Achieved", color: "#2a465a" },
          ]}
          size={6}
          height={300}
        />
          <GBarChart
            title="Project Completion Status"
            subtitle={`${timeline.charAt(0).toUpperCase() + timeline.slice(1)} breakdown`}
            data={getProjectCompletionData()}
            bars={[
              { key: "completed", label: "Completed", color: "#22c55e" },
              { key: "inProgress", label: "In Progress", color: "#3b82f6" },
              { key: "delayed", label: "Delayed", color: "#f43f5e" },
            ]}
            size={6}
            height={300}
          />
        <GAreaChart
          title="Lead Generation & Conversion"
          subtitle={`${timeline.charAt(0).toUpperCase() + timeline.slice(1)} breakdown`}
          data={getLeadConversionData()}
          areas={[
            { key: "leads", label: "Leads Generated", color: "#22c55e" },
            { key: "converted", label: "Converted", color: "#3b82f6" },
          ]}
          size={6}
          height={300}
        />
        <GAreaChart
          title="Payment Collection Analysis"
          subtitle={`${timeline.charAt(0).toUpperCase() + timeline.slice(1)} breakdown`}
          data={getPaymentCollectionData()}
          areas={[
            { key: "collected", label: "Collected", color: "#22c55e" },
            { key: "pending", label: "Pending", color: "#f59e0b" },
          ]}
          size={6}
          height={300}
        />
        <GBarChart
          title="Department Revenue Distribution"
          subtitle={`${timeline.charAt(0).toUpperCase() + timeline.slice(1)} breakdown`}
          data={getDeptRevenueData()}
          bars={[
            { key: "value", label: "Revenue", color: "#3b82f6" },
          ]}
          size={6}
          height={300}
        />
        
      </DashGrid>

      {/* ══ SALES DEPARTMENT ══════════════════════════════════════════════════ */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12">
          <Heading primaryText="Sales" secondaryText="Department" size={12} />
        </div>
        <EnhancedDashCard
          title="Total Leads"
          value="1,073"
          icon={<Target size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <EnhancedDashCard
          title="Active Leads"
          value="440"
          icon={<Activity size={22} />}
          accentColor="#3b82f6"
          size={3}
        />
        <EnhancedDashCard
          title="Dump Leads"
          value="162"
          icon={<AlertCircle size={22} />}
          accentColor="#f43f5e"
          size={3}
        />
        <EnhancedDashCard
          title="Avg Conversion"
          value="40.3%"
          icon={<TrendingUp size={22} />}
          accentColor="#8b5cf6"
          size={3}
        />
      </DashGrid>
      <DataTable
        exportable
        exportFileName={"sales_employees"}
        title="Sales Employees"
        columns={salesColumns}
        rows={salesEmployees}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
            onClick: (row) => {
              setSelectedSale(row);
              openModal("sales-view-modal");
            },
          },
        ]}
        size={12}
        pageSize={5}
        searchable
        date={false}
        filters={[
          {
            title: "Role",
            key: "role",
            type: "toggle",
            options: ["Manager", "TL", "Executive"],
          },
          {
            title: "Status",
            key: "status",
            type: "toggle",
            options: ["Active", "Inactive"],
          },
        ]}
      />

      {/* ══ MANAGEMENT DEPARTMENT ═════════════════════════════════════════════ */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12">
          <Heading
            primaryText="Management"
            secondaryText="Department"
            size={12}
          />
        </div>
        <EnhancedDashCard
          title="Total Projects"
          value="6"
          icon={<Briefcase size={22} />}
          accentColor="#f59e0b"
          size={3}
        />
        <EnhancedDashCard
          title="In Progress"
          value="4"
          icon={<Clock size={22} />}
          accentColor="#3b82f6"
          size={3}
        />
        <EnhancedDashCard
          title="Completed"
          value="1"
          icon={<CheckCircle size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <EnhancedDashCard
          title="Delayed"
          value="1"
          icon={<AlertCircle size={22} />}
          accentColor="#f43f5e"
          size={3}
        />
      </DashGrid>
      <DataTable
        exportable
        exportFileName={"project_management"}
        title="Project Management"
        columns={projectColumns}
        rows={projects}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
            onClick: (row) => {
              setSelectedProject(row);
              openModal("project-view-modal");
            },
          },
        ]}
        size={12}
        pageSize={5}
        searchable
        date={true}
        filters={[
          {
            title: "Status",
            key: "status",
            type: "toggle",
            options: ["In Progress", "Completed", "Delayed"],
          },
          {
            title: "Priority",
            key: "priority",
            type: "toggle",
            options: ["Low", "Medium", "High", "Critical"],
          },
        ]}
      />

      {/* ══ FINANCE DEPARTMENT ════════════════════════════════════════════════ */}
      <DashGrid cols={12} gap={4}>
        <div className="col-span-12">
          <Heading primaryText="Finance" secondaryText="Department" size={12} />
        </div>
        <EnhancedDashCard
          title="Total Revenue"
          value="₹72,90,000"
          icon={<DollarSign size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <EnhancedDashCard
          title="Pending"
          value="₹18,70,000"
          icon={<Clock size={22} />}
          accentColor="#f59e0b"
          size={3}
        />
        <EnhancedDashCard
          title="Expenses"
          value="₹31,50,000"
          icon={<CreditCard size={22} />}
          accentColor="#f43f5e"
          size={3}
        />
        <EnhancedDashCard
          title="Net Profit"
          value="₹41,40,000"
          icon={<TrendingUp size={22} />}
          accentColor="#8b5cf6"
          size={3}
        />
      </DashGrid>
      <DataTable
        exportable
        exportFileName={"finance_payments"}
        title="Finance & Payments"
        columns={financeColumns}
        rows={financeRecords}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
            onClick: (row) => {
              setSelectedFinance(row);
              openModal("finance-view-modal");
            },
          },
        ]}
        size={12}
        pageSize={5}
        searchable
        date={true}
        filters={[
          {
            title: "Status",
            key: "status",
            type: "toggle",
            options: ["Paid", "Partial", "Pending"],
          },
          {
            title: "Type",
            key: "type",
            type: "toggle",
            options: ["Milestone", "Full Payment", "Post-Delivery"],
          },
        ]}
      />

      {/* ══ VIEW MODALS FOR TABLE ROWS ═════════════════════════════════════════ */}
      <Modal id="sales-view-modal" title="Sales Employee Details">
        {selectedSale && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white shadow-lg">
                <Users size={24} />
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">{selectedSale.name}</p>
                <p className="text-sm font-bold text-slate-500">{selectedSale.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Leads", val: selectedSale.totalLeads },
                { label: "Active Leads", val: selectedSale.activeLeads },
                { label: "Calls", val: selectedSale.calls },
                { label: "Missed Followups", val: selectedSale.missedFollowups },
                { label: "Conversion", val: selectedSale.conversion },
                { label: "Revenue", val: selectedSale.revenue },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2.5 rounded-xl block border border-slate-100 text-sm">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("sales-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="project-view-modal" title="Project Details">
        {selectedProject && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white shadow-lg">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">{selectedProject.project}</p>
                <p className="text-sm font-bold text-slate-500">{selectedProject.client}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Assigned To", val: selectedProject.assignedTo },
                { label: "Start Date", val: selectedProject.startDate },
                { label: "Deadline", val: selectedProject.deadline },
                { label: "Status", val: selectedProject.status },
                { label: "Progress", val: selectedProject.progress },
                { label: "Priority", val: selectedProject.priority },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2.5 rounded-xl block border border-slate-100 text-sm">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("project-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="finance-view-modal" title="Payment Details">
        {selectedFinance && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white shadow-lg">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">{selectedFinance.invoiceId} • {selectedFinance.client}</p>
                <p className="text-sm font-bold text-slate-500">{selectedFinance.project}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total", val: selectedFinance.total },
                { label: "Paid", val: selectedFinance.paid },
                { label: "Remaining", val: selectedFinance.remaining },
                { label: "Type", val: selectedFinance.type },
                { label: "Status", val: selectedFinance.status },
                { label: "Date", val: selectedFinance.date },
              ].map(({ label, val }) => (
                <div key={label}>
                  <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{label}</span>
                  <span className="text-[#2a465a] font-bold bg-white px-3 py-2.5 rounded-xl block border border-slate-100 text-sm">{val}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("finance-view-modal")} />
            </div>
          </div>
        )}
      </Modal>


    </div>
  );
}
