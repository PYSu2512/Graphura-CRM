import { useState, useEffect } from "react";
import {
  DashGrid,
  EnhancedDashCard,
  Heading,
  HeadingForDataTable,
  DataTable,
  GLineChart,
  GDoughnutChart,
  GPieChart,
} from "../../components/shared/Common_Components";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Receipt,
  FileText,
  CheckCircle,
  CreditCard,
  IndianRupee,
  Clock,
  Eye,
  Download,
  CheckSquare,
  Loader2,
} from "lucide-react";
import {
  revenueExpenseData,
  paymentStatusData,
  expenseCategoryData,
  quickInsightsData,
} from "./FinanceDashboardData";
import {
  getDashboardData,
  getQuickInsights,
} from "../../services/financeService";

// ── KPI icon + color config (by index) ───────────────────────────────────────
const kpiConfig = [
  { icon: <DollarSign size={22} />, accentColor: "#22c55e" },
  { icon: <Clock size={22} />, accentColor: "#f59e0b" },
  { icon: <AlertCircle size={22} />, accentColor: "#f43f5e" },
  { icon: <TrendingDown size={22} />, accentColor: "#ef4444" },
  { icon: <TrendingUp size={22} />, accentColor: "#3b82f6" },
  { icon: <FileText size={22} />, accentColor: "#38bdf8" },
  { icon: <CheckCircle size={22} />, accentColor: "#22c55e" },
  { icon: <Receipt size={22} />, accentColor: "#8b5cf6" },
];

// ── Table column definitions ──────────────────────────────────────────────────
const paymentColumns = [
  { key: "client", label: "Client Name" },
  { key: "invoiceId", label: "Invoice ID" },
  { key: "amount", label: "Amount" },
  { key: "paymentType", label: "Payment Type" },
  { key: "method", label: "Method" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
];

const invoiceColumns = [
  { key: "id", label: "Invoice ID" },
  { key: "client", label: "Client Name" },
  { key: "amount", label: "Amount" },
  { key: "gst", label: "GST" },
  { key: "total", label: "Total" },
  { key: "paymentType", label: "Payment Type" },
  { key: "status", label: "Status" },
  { key: "dueDate", label: "Due Date" },
  { key: "date", label: "Date" },
];

const activityColumns = [
  { key: "id", label: "Activity ID" },
  { key: "activity", label: "Activity" },
  { key: "type", label: "Type" },
  { key: "user", label: "User" },
  { key: "date", label: "Date" },
  { key: "status", label: "Status" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [quickInsights, setQuickInsights] = useState([]);
  const [data, setData] = useState({
    recentPayments: [],
    recentInvoices: [],
    recentActivities: [],
    kpiData: [],
    expenseByCat: [],
    paymentStatusData: [],
    revenueExpenseData: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, insightsRes] = await Promise.all([
          getDashboardData(),
          getQuickInsights(),
        ]);

        if (dashRes.data && dashRes.data.data) {
          setData(dashRes.data.data);
        }

        if (
          insightsRes.data &&
          insightsRes.data.data &&
          insightsRes.data.data.quickInsights
        ) {
          setQuickInsights(insightsRes.data.data.quickInsights);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // No target data derivation needed

  return (
    <div className="flex flex-col gap-6">
      {/* ── Heading ── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Finance" secondaryText="Dashboard" size={12} />
      </DashGrid>

      {/* ── KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        {(data.kpiData && data.kpiData.length > 0 ? data.kpiData : []).map(
          (kpi, i) => (
            <EnhancedDashCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              icon={kpiConfig[i % kpiConfig.length].icon}
              accentColor={kpiConfig[i % kpiConfig.length].accentColor}
              size={3}
            />
          ),
        )}
      </DashGrid>

      {/* ── Charts Row 1: Revenue/Expense/Profit line + Payment Status doughnut ── */}
      <DashGrid cols={12} gap={4}>
        <GLineChart
          title="Revenue vs Expense vs Profit"
          subtitle="Monthly comparison (₹ Lakhs)"
          data={
            data.revenueExpenseData?.length > 0
              ? data.revenueExpenseData
              : revenueExpenseData
          }
          lines={[
            { key: "revenue", color: "#22c55e", label: "Revenue (L)" },
            { key: "expense", color: "#f43f5e", label: "Expense (L)" },
            { key: "profit", color: "#3b82f6", label: "Profit (L)" },
          ]}
          size={8}
        />
        <GDoughnutChart
          title="Payment Status"
          subtitle="Successful · Pending · Failed · Partial"
          data={
            data.paymentStatusData?.length > 0
              ? data.paymentStatusData
              : paymentStatusData
          }
          size={4}
        />
      </DashGrid>

      {/* ── Charts Row 2: Expense by Category pie & Quick Insights side-by-side ── */}
      <DashGrid cols={12} gap={4}>
        <GPieChart
          title="Expense by Category"
          subtitle="Category-wise expense distribution"
          data={
            data.expenseByCat?.length > 0
              ? data.expenseByCat
              : expenseCategoryData
          }
          size={6}
        />
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-full">
            <h3 className="text-sm font-bold text-[#2a465a] mb-4 uppercase tracking-wider">
              💡 Quick Insights
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(quickInsights.length > 0
                ? quickInsights
                : quickInsightsData
              ).map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 bg-slate-50 border border-slate-100"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-black text-[#2a465a]">
                    {item.value}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashGrid>

      {/* ── Recent Payments Table ── */}
      <DashGrid cols={12} gap={4}>
        <DataTable
          title={"Recent Payments"}
          columns={paymentColumns}
          rows={data.recentPayments}
          searchable
          pageSize={5}
          size={12}
          defaultSortKey="date"
          defaultSortDir="desc"
          actions={[
            {
              icon: <Eye size={15} />,
              tooltip: "View payment",
              variant: "ghost",
              onClick: (row) => console.log("View payment", row.id),
            },
            {
              icon: <CheckSquare size={15} />,
              tooltip: "Verify payment",
              variant: "ghost",
              show: (row) => row.status !== "Successful",
              onClick: (row) => console.log("Verify payment", row.id),
            },
          ]}
        />
      </DashGrid>

      {/* ── Recent Invoices Table ── */}
      <DashGrid cols={12} gap={4}>
        <DataTable
          title={"Recent Invoices"}
          columns={invoiceColumns}
          rows={data.recentInvoices}
          searchable
          pageSize={5}
          size={12}
          defaultSortKey="date"
          defaultSortDir="desc"
          actions={[
            {
              icon: <Eye size={15} />,
              tooltip: "View invoice",
              variant: "ghost",
              onClick: (row) => console.log("View invoice", row.id),
            },
            {
              icon: <Download size={15} />,
              tooltip: "Download invoice",
              variant: "ghost",
              onClick: (row) => console.log("Download invoice", row.id),
            },
          ]}
        />
      </DashGrid>

      {/* ── Recent Activities Table ── */}
      <DashGrid cols={12} gap={4}>
        <DataTable
          title={"Recent Activities"}
          columns={activityColumns}
          rows={data.recentActivities}
          searchable
          pageSize={5}
          size={12}
          defaultSortKey="date"
          defaultSortDir="desc"
        />
      </DashGrid>
    </div>
  );
}
