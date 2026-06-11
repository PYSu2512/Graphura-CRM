import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAdminById,
  getAllAdmins,
} from "../../../services/superAdminService";
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Eye,
} from "lucide-react";

import {
  DashGrid,
  EnhancedDashCard,
  Heading,
  GAreaChart,
  GBarChart,
  DataTable,
  Button,
  Modal,
  openModal,
  ModalProfile,
  ModalGrid,
  ModalData,
  DataField,
  P,
  Grid,
} from "../../../components/shared/Common_Components.jsx";

// ─── Columns (used inside modal) ─────────────────────────────────────────

const salesColumnsFull = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "leadDataLimit", label: "Lead Limit" },
  { key: "status", label: "Status" },
];

const projectColumnsFull = [
  { key: "project", label: "Project Name" },
  { key: "client", label: "Client" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "startDate", label: "Start Date" },
  { key: "createdAt", label: "Created At" },
  { key: "progress", label: "Progress %" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
];

const financeColumnsFull = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
];

// ─── Simplified columns (shown on main page) ──────────────────────────────

const salesColumns = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
];

const projectColumns = [
  { key: "project", label: "Project Name" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "progress", label: "Progress %" },
  { key: "status", label: "Status" },
];

const financeColumns = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "status", label: "Status" },
];

function DepartmentsSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex-1 space-y-3">
          <div className="h-9 w-64 bg-slate-200 rounded-2xl" />
          <div className="h-4 w-96 bg-slate-200 rounded-xl" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-slate-200 rounded-2xl" />
          <div className="h-10 w-24 bg-slate-200 rounded-2xl" />
          <div className="h-10 w-28 bg-slate-200 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Company Overview Skeleton */}
        <div className="col-span-12">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-200" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-200 rounded-xl" />
                <div className="h-4 w-20 bg-slate-200 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-100 rounded-2xl" />
              </div>
              <div className="col-span-6 space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-100 rounded-2xl" />
              </div>
              <div className="col-span-6 space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-100 rounded-2xl" />
              </div>
              <div className="col-span-6 space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-100 rounded-2xl" />
              </div>
              <div className="col-span-8 space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-100 rounded-2xl" />
              </div>
              <div className="col-span-4 space-y-1.5">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-100 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Global KPI Cards Skeletons */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="col-span-12 md:col-span-4 bg-white rounded-2xl border border-slate-100 p-6 flex justify-between items-center h-28">
            <div className="space-y-3">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="h-7 w-16 bg-slate-200 rounded" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-200" />
          </div>
        ))}

        {/* Revenue Chart Skeleton */}
        <div className="col-span-12">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-5 w-40 bg-slate-200 rounded" />
                <div className="h-3.5 w-24 bg-slate-200 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-16 bg-slate-200 rounded-xl" />
                <div className="h-8 w-16 bg-slate-200 rounded-xl" />
                <div className="h-8 w-16 bg-slate-200 rounded-xl" />
              </div>
            </div>
            <div className="h-[300px] w-full bg-slate-50 rounded-2xl flex items-end p-4 gap-4">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-slate-200 rounded-t-lg animate-pulse"
                  style={{ height: `${20 + Math.random() * 60}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Tables Skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="col-span-12">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="space-y-2">
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-50 rounded-xl" />
                <div className="h-10 bg-slate-50 rounded-xl" />
                <div className="h-10 bg-slate-50 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Departments() {
  const location = useLocation();
  const adminData = location.state?.admin;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = searchParams.get("id") || adminData?.id || adminData?._id;

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  // Load companies dropdown list if no companyId is selected
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        const data = await getAllAdmins({ limit: 100 });
        setCompanies(data.admins || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch admin and company details
  useEffect(() => {
    if (!companyId) {
      setDetails(null);
      setLoading(false);
      return;
    }
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getAdminById(companyId);
        setDetails(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load company details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [companyId]);

  // ─── Resolve Data ────────────────────────────────────────────────────────
  const isLoaded = !!details;

  const currentCompany = isLoaded
    ? {
        name: details?.admin?.company?.name || "-",
        logo:
          details?.admin?.company?.logo ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(details?.admin?.company?.name || "Company")}&background=2a465a&color=fff&size=80&bold=true`,
        email: details?.admin?.company?.email || details?.admin?.email || "-",
        phone: details?.admin?.company?.phone || details?.admin?.phone || "-",
        address: details?.admin?.company?.address
          ? typeof details.admin.company.address === "string"
            ? details.admin.company.address
            : `${details.admin.company.address.line1 || ""}, ${details.admin.company.address.line2 || ""}, ${details.admin.company.address.city || ""}, ${details.admin.company.address.state || ""} - ${details.admin.company.address.pincode || ""}`
                .trim()
                .replace(/^,\s*|,\s*$/g, "")
          : "-",
        website: details?.admin?.company?.website || "-",
        createdDate: details?.admin?.createdAt
          ? new Date(details.admin.createdAt).toISOString().split("T")[0]
          : "-",
        plan:
          details?.admin?.plan?.planName ||
          details?.admin?.planStatus ||
          "TRIAL",
        status: details?.admin?.isActive ? "Active" : "Inactive",
      }
    : {
        name: "-",
        logo: `https://ui-avatars.com/api/?name=Company&background=2a465a&color=fff&size=80&bold=true`,
        email: "-",
        phone: "-",
        address: "-",
        website: "-",
        createdDate: "-",
        plan: "TRIAL",
        status: "Inactive",
      };

  const currentAdmin = isLoaded
    ? {
        name: details?.admin?.name || "-",
        email: details?.admin?.email || "-",
        phone: details?.admin?.phone || "-",
        lastLogin: "—",
        status: details?.admin?.isActive ? "Active" : "Inactive",
      }
    : {
        name: "-",
        email: "-",
        phone: "-",
        lastLogin: "—",
        status: "Inactive",
      };

  const salesEmployeesData = isLoaded
    ? (details?.users || [])
        .filter((u) => u.role?.startsWith("SALES_"))
        .map((u) => ({
          id: u._id,
          name: u.name,
          role: u.role?.replace("SALES_", ""),
          email: u.email,
          phone: u.phone || "-",
          leadDataLimit: u.leadDataLimit || "Default",
          status: u.isActive ? "Active" : "Inactive",
        }))
    : [];

  const formatProjectStatus = (status) => {
    const s = String(status).toUpperCase();
    if (
      ["IN_PROGRESS", "WORK_STARTED", "REVIEW", "NOT_STARTED"].includes(s) ||
      s === "IN PROGRESS"
    ) {
      return "In Progress";
    }
    if (["COMPLETED", "DELIVERED", "FINALIZATION", "SUCCESS"].includes(s)) {
      return "Success";
    }
    return "Failed";
  };

  const projectsData = isLoaded
    ? (details?.projects || []).map((p) => ({
        id: p._id,
        project: p.name,
        client: p.client?.name || "-",
        assignedTo: p.assignedTo?.name || "-",
        startDate: p.startDate
          ? new Date(p.startDate).toISOString().split("T")[0]
          : "-",
        createdAt: p.createdAt
          ? new Date(p.createdAt).toISOString().split("T")[0]
          : "-",
        status: formatProjectStatus(p.status),
        progress: `${p.progressPercent}%`,
        priority: p.priority,
      }))
    : [];

  const totalLeadsCount = isLoaded ? (details?.totalLeads ?? 0) : 0;
  const activeLeadsCount = isLoaded ? (details?.activeLeads ?? 0) : 0;
  const dumpLeadsCount = isLoaded ? (details?.dumpLeads ?? 0) : 0;

  const conversionRate = isLoaded
    ? (details?.totalLeads || 0) > 0
      ? (
          ((details?.activeLeads || 0) / (details?.totalLeads || 1)) *
          100
        ).toFixed(1) + "%"
      : "0%"
    : "0%";

  const totalRevenueVal = isLoaded
    ? (details?.payments || [])
        .filter((p) => p.status === "SUCCESS")
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0;

  const pendingRevenueVal = isLoaded
    ? (details?.payments || [])
        .filter((p) => p.status === "PENDING")
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    : 0;

  const totalUsersCount = isLoaded ? (details?.users || []).length : 0;
  const activeProjectsCount = isLoaded
    ? (details?.projects || []).filter((p) =>
        ["IN_PROGRESS", "WORK_STARTED", "REVIEW"].includes(p.status),
      ).length
    : 0;
  const completedProjectsCount = isLoaded
    ? (details?.projects || []).filter((p) =>
        ["COMPLETED", "DELIVERED"].includes(p.status),
      ).length
    : 0;
  const delayedProjectsCount = isLoaded
    ? (details?.projects || []).filter((p) => p.status === "DELAYED").length
    : 0;

  const totalExpenseVal = isLoaded ? Math.round(totalRevenueVal * 0.4) : 0;
  const netProfitVal = totalRevenueVal - totalExpenseVal;

  const formatCurrency = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)}Cr`;
    }
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const formattedRevenue = formatCurrency(totalRevenueVal);
  const formattedPending = formatCurrency(pendingRevenueVal);
  const formattedExpense = formatCurrency(totalExpenseVal);
  const formattedNetProfit = formatCurrency(netProfitVal);

  const [revenueTimeline, setRevenueTimeline] = useState("weekly");

  const totalSalesTL = isLoaded
    ? (details?.users || []).filter((u) => u.role === "SALES_TL").length
    : 0;

  const totalSalesExec = isLoaded
    ? (details?.users || []).filter((u) => u.role === "SALES_EXECUTIVE").length
    : 0;

  const totalManagementTL = isLoaded
    ? (details?.users || []).filter((u) => u.role === "MANAGEMENT_TL").length
    : 0;

  const totalManagementEmployees = isLoaded
    ? (details?.users || []).filter((u) =>
        ["MANAGEMENT_EMPLOYEE", "MANAGEMENT_TL", "MANAGEMENT_MANAGER"].includes(
          u.role,
        ),
      ).length
    : 0;

  const totalFinanceEmployees = isLoaded
    ? (details?.users || []).filter((u) => u.role?.startsWith("FINANCE_"))
        .length
    : 0;

  const company = currentCompany;
  const admin = currentAdmin;

  const salesEmployees = salesEmployeesData;
  const projects = projectsData;

  const financeEmployeesData = isLoaded
    ? (details?.users || [])
        .filter((u) => u.role?.startsWith("FINANCE_"))
        .map((u) => ({
          id: u._id,
          name: u.name,
          role: u.role?.replace("FINANCE_", ""),
          email: u.email,
          phone: u.phone || "-",
          status: u.isActive ? "Active" : "Inactive",
        }))
    : [];

  const financeEmployees = financeEmployeesData;

  const weeklyRevenueChartData = isLoaded
    ? [
        {
          name: "Week 1",
          revenue: Math.round(totalRevenueVal * 0.2),
          expenses: Math.round(totalExpenseVal * 0.2),
        },
        {
          name: "Week 2",
          revenue: Math.round(totalRevenueVal * 0.25),
          expenses: Math.round(totalExpenseVal * 0.25),
        },
        {
          name: "Week 3",
          revenue: Math.round(totalRevenueVal * 0.23),
          expenses: Math.round(totalExpenseVal * 0.22),
        },
        {
          name: "Week 4",
          revenue: Math.round(totalRevenueVal * 0.32),
          expenses: Math.round(totalExpenseVal * 0.33),
        },
      ]
    : [];

  const monthlyRevenueChartData = isLoaded
    ? [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ].map((month, index) => {
        const factor = (index + 1) / 12;
        return {
          name: month,
          revenue: Math.round(totalRevenueVal * factor * 0.25),
          expenses: Math.round(totalExpenseVal * factor * 0.25),
        };
      })
    : [];

  const yearlyRevenueChartData = isLoaded
    ? [
        {
          name: "2022",
          revenue: Math.round(totalRevenueVal * 0.6),
          expenses: Math.round(totalExpenseVal * 0.6),
        },
        {
          name: "2023",
          revenue: Math.round(totalRevenueVal * 0.75),
          expenses: Math.round(totalExpenseVal * 0.72),
        },
        {
          name: "2024",
          revenue: Math.round(totalRevenueVal * 0.9),
          expenses: Math.round(totalExpenseVal * 0.85),
        },
        {
          name: "2025",
          revenue: Math.round(totalRevenueVal * 1.0),
          expenses: Math.round(totalExpenseVal * 1.0),
        },
        {
          name: "2026",
          revenue: Math.round(totalRevenueVal * 1.15),
          expenses: Math.round(totalExpenseVal * 1.1),
        },
      ]
    : [];

  const activeRevenueChartData =
    revenueTimeline === "weekly"
      ? weeklyRevenueChartData
      : revenueTimeline === "yearly"
        ? yearlyRevenueChartData
        : monthlyRevenueChartData;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleView = (row) => {
    if (!row) return;
    setSelectedData(row);
    openModal("department-details-modal");
  };

  const handleDepartmentView = (type) => {
    if (!type) return;
    setSelectedDepartment(type);
    openModal("department-view-modal");
  };

  if (loading) {
    return <DepartmentsSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500 font-bold max-w-[500px] mx-auto bg-rose-50 rounded-2xl border border-rose-100 mt-12 flex flex-col gap-4">
        <span>{error}</span>
        <Button
          text="Back to Admins"
          variant="primary"
          onClick={() => navigate("/super-admin/admins")}
        />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="max-w-[600px] mx-auto mt-12 p-8 bg-white rounded-2xl shadow-sm border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-[#2a465a] mb-4">
          Select a Company
        </h2>
        <p className="text-slate-500 mb-6">
          Choose a company tenant to view their profile overview, departments,
          and metrics.
        </p>

        {loadingCompanies ? (
          <p className="text-slate-400">Loading companies...</p>
        ) : (
          <div className="flex flex-col gap-4">
            <select
              onChange={(e) => setSearchParams({ id: e.target.value })}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-[#2a465a] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 transition duration-200"
              defaultValue=""
            >
              <option value="" disabled>
                Select a tenant company
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} ({c.adminName})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* ─── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex-1">
          <Heading
            primaryText={company.name}
            secondaryText="Overview"
            size={12}
          />
          <P
            text="Full overview of company profile, departments, and performance metrics."
            size="sm"
          />
        </div>
      </div>
      <div className="flex justify-end mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            text="&lt;&nbsp; Back to Admins"
            variant="ghost"
            size={12}
            onClick={() => navigate("/super-admin/admins")}
          />
          <Button
            text="Deactivate"
            variant="danger"
            size={12}
            onClick={() => alert("Deactivate company")}
          />
          <Button
            text="Export PDF"
            variant="primary"
            size={12}
            onClick={() => {
              try {
                const doc = new jsPDF();
                
                // ─── Header Banner ────────────────────────────────────────────────
                doc.setFillColor(42, 70, 90); // Hex #2a465a
                doc.rect(0, 0, 210, 38, "F");
                
                doc.setTextColor(255, 255, 255);
                doc.setFont("helvetica", "bold");
                doc.setFontSize(18);
                doc.text((company.name || "Company Profile").toUpperCase(), 14, 16);
                
                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);
                doc.setTextColor(200, 210, 220);
                doc.text("EXECUTIVE PROFILE & DEPARTMENT METRICS REPORT", 14, 23);
                
                doc.setFontSize(8.5);
                const generatedAtStr = `Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
                doc.text(generatedAtStr, 14, 30);

                // ─── Section 1: Company Profile & Admin ───────────────────────────
                doc.setFontSize(13);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(42, 70, 90);
                doc.text("1. COMPANY PROFILE & ADMIN INFO", 14, 50);
                
                doc.setDrawColor(220, 225, 230);
                doc.setLineWidth(0.5);
                doc.line(14, 53, 196, 53);

                autoTable(doc, {
                  startY: 56,
                  margin: { left: 14, right: 14 },
                  theme: "plain",
                  styles: { fontSize: 9.5, cellPadding: 3.5, valign: "middle" },
                  columnStyles: {
                    0: { fontStyle: "bold", textColor: [80, 90, 100], cellWidth: 32 },
                    1: { textColor: [26, 46, 63], cellWidth: 59 },
                    2: { fontStyle: "bold", textColor: [80, 90, 100], cellWidth: 32 },
                    3: { textColor: [26, 46, 63], cellWidth: 59 }
                  },
                  body: [
                    ["Company Name:", company.name, "Primary Admin:", admin.name],
                    ["Email Address:", company.email, "Admin Email:", admin.email],
                    ["Phone Number:", company.phone, "Admin Phone:", admin.phone],
                    ["Website URL:", company.website, "Account Status:", admin.status],
                    ["Created Date:", company.createdDate, "Active Projects:", String(activeProjectsCount)],
                    ["Billing Plan:", company.plan, "Total Users:", String(totalUsersCount)],
                    ["Office Address:", { content: company.address, colSpan: 3 }]
                  ]
                });

                // ─── Section 2: Key Metrics ───────────────────────────────────────
                const lastY = doc.lastAutoTable.finalY || 110;
                doc.setFontSize(13);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(42, 70, 90);
                doc.text("2. KEY PERFORMANCE INDICATORS", 14, lastY + 12);
                doc.line(14, lastY + 15, 196, lastY + 15);

                autoTable(doc, {
                  startY: lastY + 18,
                  margin: { left: 14, right: 14 },
                  theme: "grid",
                  headStyles: { fillColor: [42, 70, 90], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
                  styles: { fontSize: 10, cellPadding: 4, halign: "center", valign: "middle" },
                  head: [["Total Projects", "Total Leads", "Total Revenue", "Total Expense", "Net Profit"]],
                  body: [[
                    String(projects.length),
                    String(totalLeadsCount),
                    formattedRevenue,
                    formattedExpense,
                    formattedNetProfit
                  ]]
                });

                // ─── Section 3: Sales Employees ──────────────────────────────────
                const lastY2 = doc.lastAutoTable.finalY || 160;
                doc.setFontSize(13);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(42, 70, 90);
                doc.text("3. SALES DEPARTMENT EMPLOYEES", 14, lastY2 + 12);
                doc.line(14, lastY2 + 15, 196, lastY2 + 15);

                autoTable(doc, {
                  startY: lastY2 + 18,
                  margin: { left: 14, right: 14 },
                  theme: "striped",
                  headStyles: { fillColor: [42, 70, 90], textColor: [255, 255, 255], fontStyle: "bold" },
                  styles: { fontSize: 9, cellPadding: 3.5, valign: "middle" },
                  head: [["Employee Name", "Role", "Email Address", "Phone Number", "Status"]],
                  body: salesEmployees.map(e => [e.name, e.role, e.email, e.phone, e.status]),
                  columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 55 },
                    3: { cellWidth: 40 },
                    4: { cellWidth: 22, halign: "center" }
                  }
                });

                // ─── Section 4: Projects ──────────────────────────────────────────
                const lastY3 = doc.lastAutoTable.finalY || 210;
                let startY3 = lastY3 + 18;
                if (startY3 > 240) {
                  doc.addPage();
                  startY3 = 25;
                } else {
                  doc.setFontSize(13);
                  doc.setFont("helvetica", "bold");
                  doc.setTextColor(42, 70, 90);
                  doc.text("4. PROJECTS OVERVIEW", 14, lastY3 + 12);
                  doc.line(14, lastY3 + 15, 196, lastY3 + 15);
                  startY3 = lastY3 + 18;
                }
                
                if (startY3 === 25) {
                  doc.setFontSize(13);
                  doc.setFont("helvetica", "bold");
                  doc.setTextColor(42, 70, 90);
                  doc.text("4. PROJECTS OVERVIEW", 14, 18);
                  doc.line(14, 21, 196, 21);
                }

                autoTable(doc, {
                  startY: startY3,
                  margin: { left: 14, right: 14 },
                  theme: "striped",
                  headStyles: { fillColor: [42, 70, 90], textColor: [255, 255, 255], fontStyle: "bold" },
                  styles: { fontSize: 8.5, cellPadding: 3.5, valign: "middle" },
                  head: [["Project Name", "Client", "Assigned To", "Start Date", "Created At", "Progress", "Status"]],
                  body: projects.map(p => [p.project, p.client, p.assignedTo, p.startDate, p.createdAt, p.progress, p.status]),
                  columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 28 },
                    2: { cellWidth: 32 },
                    3: { cellWidth: 22 },
                    4: { cellWidth: 22 },
                    5: { cellWidth: 18, halign: "center" },
                    6: { cellWidth: 20, halign: "center" }
                  }
                });

                // ─── Section 5: Finance Employees ────────────────────────────────
                const lastY4 = doc.lastAutoTable.finalY || 210;
                let startY4 = lastY4 + 18;
                if (startY4 > 240) {
                  doc.addPage();
                  startY4 = 25;
                } else {
                  doc.setFontSize(13);
                  doc.setFont("helvetica", "bold");
                  doc.setTextColor(42, 70, 90);
                  doc.text("5. FINANCE DEPARTMENT EMPLOYEES", 14, lastY4 + 12);
                  doc.line(14, lastY4 + 15, 196, lastY4 + 15);
                  startY4 = lastY4 + 18;
                }
                
                if (startY4 === 25) {
                  doc.setFontSize(13);
                  doc.setFont("helvetica", "bold");
                  doc.setTextColor(42, 70, 90);
                  doc.text("5. FINANCE DEPARTMENT EMPLOYEES", 14, 18);
                  doc.line(14, 21, 196, 21);
                }

                autoTable(doc, {
                  startY: startY4,
                  margin: { left: 14, right: 14 },
                  theme: "striped",
                  headStyles: { fillColor: [42, 70, 90], textColor: [255, 255, 255], fontStyle: "bold" },
                  styles: { fontSize: 9, cellPadding: 3.5, valign: "middle" },
                  head: [["Employee Name", "Role", "Email Address", "Phone Number", "Status"]],
                  body: financeEmployees.map(e => [e.name, e.role, e.email, e.phone, e.status]),
                  columnStyles: {
                    0: { cellWidth: 40 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 55 },
                    3: { cellWidth: 40 },
                    4: { cellWidth: 22, halign: "center" }
                  }
                });

                // ─── Footer Loop ──────────────────────────────────────────────────
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                  doc.setPage(i);
                  
                  // Thin footer rule
                  doc.setDrawColor(220, 225, 230);
                  doc.setLineWidth(0.3);
                  doc.line(14, 283, 196, 283);
                  
                  // Footer text
                  doc.setFontSize(8);
                  doc.setTextColor(120, 130, 140);
                  doc.setFont("helvetica", "normal");
                  
                  const footerText = "Confidential — Generated by Graphura CRM Super Admin Portal";
                  doc.text(footerText, 14, 288);
                  
                  const pageInfo = `Page ${i} of ${pageCount}`;
                  doc.text(pageInfo, 196 - doc.getTextWidth(pageInfo), 288);
                }

                doc.save(`${(adminData?.company || company.name).replace(/\s+/g, "_")}_Overview.pdf`);
              } catch (pdfErr) {
                console.error("Failed to generate company overview PDF", pdfErr);
                alert("An error occurred while generating the PDF. Please try again.");
              }
            }}
          />
        </div>
      </div>

      <DashGrid cols={12} gap={6}>
        {/* ─── Company Overview ──────────────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminData?.company || company.name)}&background=2a465a&color=fff&size=80&bold=true`}
                alt="Company Logo"
                className="w-16 h-16 rounded-2xl shadow-md"
              />
              <div>
                <h2 className="text-xl font-bold text-[#2a465a]">
                  {adminData?.company || company.name}
                </h2>
                <span
                  className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-bold ${
                    company.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {company.status}
                </span>
              </div>
            </div>
            <Grid cols={12} gap={4}>
              <DataField
                label="Company Name"
                id="co_name"
                size={6}
                value={company.name}
                disabled
              />
              <DataField
                label="Email"
                id="co_email"
                size={6}
                value={company.email}
                disabled
              />
              <DataField
                label="Phone"
                id="co_phone"
                size={6}
                value={company.phone}
                disabled
              />
              <DataField
                label="Website"
                id="co_website"
                size={6}
                value={company.website}
                disabled
              />
              <DataField
                label="Address"
                id="co_address"
                size={8}
                value={company.address}
                disabled
              />
              <DataField
                label="Created Date"
                id="co_created"
                size={4}
                value={company.createdDate}
                disabled
              />
            </Grid>
          </div>
        </div>

        {/* ─── Admin Details ────────────────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <Grid cols={12} gap={4}>
              <DataField
                label="Admin Name"
                id="ad_name"
                size={4}
                value={admin.name}
                disabled
              />
              <DataField
                label="Admin Email"
                id="ad_email"
                size={4}
                value={admin.email}
                disabled
              />
              <DataField
                label="Admin Phone"
                id="ad_phone"
                size={4}
                value={admin.phone}
                disabled
              />
              <DataField
                label="Last Login"
                id="ad_login"
                size={6}
                value={admin.lastLogin}
                disabled
              />
              <DataField
                label="Account Status"
                id="ad_status"
                size={6}
                value={admin.status}
                disabled
              />
            </Grid>
          </div>
        </div>

        {/* ─── Global KPI Cards ─────────────────────────────────────────────── */}
        <EnhancedDashCard
          title="Total Projects"
          value={String(projectsData.length)}
          icon={<Briefcase size={24} />}
          accentColor="#3b82f6"
          trend="+8%"
          size={4}
        />
        <EnhancedDashCard
          title="Total Revenue"
          value={formattedRevenue}
          icon={<DollarSign size={24} />}
          accentColor="#22c55e"
          trend="+21%"
          size={4}
        />
        <EnhancedDashCard
          title="Total Expense"
          value={formattedExpense}
          icon={<TrendingDown size={24} />}
          accentColor="#f43f5e"
          trend="+6%"
          size={4}
        />
        <EnhancedDashCard
          title="Net Profit"
          value={formattedNetProfit}
          icon={<TrendingUp size={24} />}
          accentColor="#8b5cf6"
          trend="+18%"
          size={4}
        />
        <EnhancedDashCard
          title="Active Projects"
          value={String(activeProjectsCount)}
          icon={<Briefcase size={24} />}
          accentColor="#f59e0b"
          trend="+2"
          size={4}
        />
        <EnhancedDashCard
          title="Total Users"
          value={String(totalUsersCount)}
          icon={<Users size={24} />}
          accentColor="#14b8a6"
          trend="+5%"
          size={4}
        />

        {/* ─── Revenue Trend Chart ──────────────────────────────────────────── */}
        <GAreaChart
          title="Revenue & Expense Trend"
          subtitle={`${revenueTimeline.charAt(0).toUpperCase() + revenueTimeline.slice(1)} breakdown`}
          data={activeRevenueChartData}
          areas={[
            { key: "revenue", label: "Revenue", color: "#3b82f6" },
            { key: "expenses", label: "Expenses", color: "#f43f5e" },
          ]}
          size={12}
          height={300}
          filters={[
            { label: "Weekly", onClick: () => setRevenueTimeline("weekly") },
            { label: "Monthly", onClick: () => setRevenueTimeline("monthly") },
            { label: "Yearly", onClick: () => setRevenueTimeline("yearly") },
          ]}
        />

        {/* ─── Sales Summary Cards ──────────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="mb-4">
            <Heading primaryText="Sales" secondaryText="Summary" size={12} />
          </div>
        </div>
        <EnhancedDashCard
          title="Total Leads"
          value={String(totalLeadsCount)}
          icon={<Target size={22} />}
          accentColor="#22c55e"
          size={4}
        />
        <EnhancedDashCard
          title="Total Team Leaders"
          value={String(totalSalesTL)}
          icon={<Users size={22} />}
          accentColor="#3b82f6"
          size={4}
        />
        <EnhancedDashCard
          title="Total Executives"
          value={String(totalSalesExec)}
          icon={<Users size={22} />}
          accentColor="#f59e0b"
          size={4}
        />

        {/* ─── Sales Department Table ───────────────────────────────────────── */}
        <DataTable
          title="Sales Department"
          columns={salesColumns}
          rows={salesEmployees}
          size={12}
          pageSize={5}
          searchable={true}
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

        {/* ─── Management Summary Cards ─────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="mb-4">
            <Heading
              primaryText="Management"
              secondaryText="Summary"
              size={12}
            />
          </div>
        </div>
        <EnhancedDashCard
          title="Total Projects"
          value={String(projectsData.length)}
          icon={<Briefcase size={22} />}
          accentColor="#f59e0b"
          size={3}
        />
        <EnhancedDashCard
          title="In Progress"
          value={String(activeProjectsCount)}
          icon={<Clock size={22} />}
          accentColor="#3b82f6"
          size={3}
        />
        <EnhancedDashCard
          title="Total Team Leaders"
          value={String(totalManagementTL)}
          icon={<Users size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <EnhancedDashCard
          title="Total Employees"
          value={String(totalManagementEmployees)}
          icon={<Users size={22} />}
          accentColor="#8b5cf6"
          size={3}
        />

        {/* ─── Project Management Table ─────────────────────────────────────── */}
        <DataTable
          title="Project Management"
          columns={projectColumns}
          rows={projects}
          size={12}
          pageSize={5}
          searchable={true}
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

        {/* ─── Finance Summary Cards ────────────────────────────────────────── */}
        <div className="col-span-12">
          <div className="mb-4">
            <Heading primaryText="Finance" secondaryText="Summary" size={12} />
          </div>
        </div>
        <EnhancedDashCard
          title="Total Revenue"
          value={formattedRevenue}
          icon={<DollarSign size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <EnhancedDashCard
          title="Total Employees"
          value={String(totalFinanceEmployees)}
          icon={<Users size={22} />}
          accentColor="#f59e0b"
          size={3}
        />
        <EnhancedDashCard
          title="Expenses"
          value={formattedExpense}
          icon={<CreditCard size={22} />}
          accentColor="#f43f5e"
          size={3}
        />
        <EnhancedDashCard
          title="Net Profit"
          value={formattedNetProfit}
          icon={<TrendingUp size={22} />}
          accentColor="#8b5cf6"
          size={3}
        />

        {/* ─── Finance Table ────────────────────────────────────────────────── */}
        <DataTable
          title="Finance Department"
          columns={financeColumns}
          rows={financeEmployees}
          size={12}
          pageSize={5}
          searchable={true}
          date={false}
          filters={[
            {
              title: "Role",
              key: "role",
              type: "toggle",
              options: ["Manager", "Executive"],
            },
            {
              title: "Status",
              key: "status",
              type: "toggle",
              options: ["Active", "Inactive"],
            },
          ]}
        />
      </DashGrid>

      {/* ─── Department View Modal ───────────────────────────────────────────── */}
      <Modal
        id="department-view-modal"
        title={
          selectedDepartment === "sales"
            ? "Sales Department — Full View"
            : selectedDepartment === "management"
              ? "Management Department — Full View"
              : selectedDepartment === "finance"
                ? "Finance Department — Full View"
                : "Department View"
        }
        size="xl"
      >
        {selectedDepartment === "sales" && (
          <DataTable
            title="Sales Department"
            columns={salesColumnsFull}
            rows={salesEmployees}
            size={12}
            pageSize={10}
            searchable={true}
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
        )}
        {selectedDepartment === "management" && (
          <DataTable
            title="Project Management"
            columns={projectColumnsFull}
            rows={projects}
            size={12}
            pageSize={10}
            searchable={true}
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
        )}
        {selectedDepartment === "finance" && (
          <DataTable
            title="Finance Department"
            columns={financeColumnsFull}
            rows={financeEmployees}
            size={12}
            pageSize={10}
            searchable={true}
            date={false}
            filters={[
              {
                title: "Role",
                key: "role",
                type: "toggle",
                options: ["Manager", "Executive"],
              },
              {
                title: "Status",
                key: "status",
                type: "toggle",
                options: ["Active", "Inactive"],
              },
            ]}
          />
        )}
      </Modal>

      {/* ─── Department Details Row Modal ────────────────────────────────────── */}
      <Modal id="department-details-modal" title="Department Details" size="md">
        {selectedData && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={
                selectedData.name ??
                selectedData.assignedTo ??
                selectedData.client ??
                "—"
              }
              subtitle={
                selectedData.role ??
                selectedData.priority ??
                selectedData.type ??
                ""
              }
              meta={selectedData.status ? `Status: ${selectedData.status}` : ""}
            />
            <ModalGrid title="Details" cols={2}>
              {selectedData.name && (
                <ModalData label="Employee Name" value={selectedData.name} />
              )}
              {selectedData.assignedTo && (
                <ModalData
                  label="Assigned To"
                  value={selectedData.assignedTo}
                />
              )}
              {selectedData.client && (
                <ModalData label="Client" value={selectedData.client} />
              )}
              {selectedData.project && (
                <ModalData label="Project" value={selectedData.project} />
              )}
              {selectedData.role && (
                <ModalData label="Role" value={selectedData.role} />
              )}
              {selectedData.totalLeads && (
                <ModalData
                  label="Total Leads"
                  value={selectedData.totalLeads}
                />
              )}
              {selectedData.activeLeads && (
                <ModalData
                  label="Active Leads"
                  value={selectedData.activeLeads}
                />
              )}
              {selectedData.conversion && (
                <ModalData
                  label="Conversion %"
                  value={selectedData.conversion}
                />
              )}
              {selectedData.revenue && (
                <ModalData label="Revenue" value={selectedData.revenue} />
              )}
              {selectedData.progress && (
                <ModalData label="Progress" value={selectedData.progress} />
              )}
              {selectedData.createdAt && (
                <ModalData label="Created At" value={selectedData.createdAt} />
              )}
              {selectedData.total && (
                <ModalData label="Total Amount" value={selectedData.total} />
              )}
              {selectedData.paid && (
                <ModalData label="Paid" value={selectedData.paid} />
              )}
              {selectedData.remaining && (
                <ModalData label="Remaining" value={selectedData.remaining} />
              )}
              {selectedData.status && (
                <ModalData label="Status" value={selectedData.status} />
              )}
            </ModalGrid>
          </div>
        )}
      </Modal>
    </div>
  );
}
