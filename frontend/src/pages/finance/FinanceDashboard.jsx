import {
  DashGrid,
  DashCard,
  Heading,
  HeadingForDataTable,
  DataTable,
  GLineChart,
  GColumnChart,
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
} from "lucide-react";
import {
  financeKpiData,
  revenueExpenseData,
  paymentStatusData,
  expenseCategoryData,
  monthlyRevenueTargetData,
  recentPaymentsData,
  recentInvoicesData,
  pendingActionsData,
  recentActivitiesData,
  quickInsightsData,
} from "./FinanceDashboardData";

// ── KPI icon + color config (by index) ───────────────────────────────────────
const kpiConfig = [
  { icon: <DollarSign  size={22} />, accentColor: "#22c55e" },
  { icon: <TrendingUp  size={22} />, accentColor: "#3b82f6" },
  { icon: <AlertCircle size={22} />, accentColor: "#f59e0b" },
  { icon: <TrendingDown size={22} />,accentColor: "#f43f5e" },
  { icon: <Receipt     size={22} />, accentColor: "#8b5cf6" },
  { icon: <TrendingUp  size={22} />, accentColor: "#14b8a6" },
  { icon: <FileText    size={22} />, accentColor: "#38bdf8" },
  { icon: <CheckCircle size={22} />, accentColor: "#22c55e" },
  { icon: <CheckSquare size={22} />, accentColor: "#10b981" },
  { icon: <Clock       size={22} />, accentColor: "#f59e0b" },
  { icon: <CreditCard  size={22} />, accentColor: "#a78bfa" },
  { icon: <IndianRupee size={22} />, accentColor: "#ef4444" },
];

// ── Table column definitions ──────────────────────────────────────────────────
const paymentColumns = [
  { key: "id",          label: "Payment ID"   },
  { key: "client",      label: "Client Name"  },
  { key: "invoiceId",   label: "Invoice ID"   },
  { key: "amount",      label: "Amount"       },
  { key: "paymentType", label: "Payment Type" },
  { key: "method",      label: "Method"       },
  { key: "status",      label: "Status"       },
  { key: "date",        label: "Date"         },
];

const invoiceColumns = [
  { key: "id",          label: "Invoice ID"   },
  { key: "client",      label: "Client Name"  },
  { key: "amount",      label: "Amount"       },
  { key: "gst",         label: "GST"          },
  { key: "total",       label: "Total"        },
  { key: "paymentType", label: "Payment Type" },
  { key: "status",      label: "Status"       },
  { key: "dueDate",     label: "Due Date"     },
  { key: "date",        label: "Date"         },
];

const activityColumns = [
  { key: "id",       label: "Activity ID" },
  { key: "activity", label: "Activity"    },
  { key: "type",     label: "Type"        },
  { key: "user",     label: "User"        },
  { key: "date",     label: "Date"        },
  { key: "status",   label: "Status"      },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function FinanceDashboard() {
  return (
    <div className="flex flex-col gap-6">

      {/* ── Heading ── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Finance" secondaryText="Dashboard" size={12} />
      </DashGrid>

      {/* ── 12 KPI Cards — 3 per row ── */}
      <DashGrid cols={12} gap={4}>
        {financeKpiData.map((kpi, i) => (
          <DashCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpiConfig[i].icon}
            accentColor={kpiConfig[i].accentColor}
            size={3}
          />
        ))}
      </DashGrid>

      {/* ── Charts Row 1: Revenue/Expense/Profit line + Payment Status doughnut ── */}
      <DashGrid cols={12} gap={4}>
        <GLineChart
          title="Revenue vs Expense vs Profit"
          subtitle="Monthly comparison (₹ Lakhs)"
          data={revenueExpenseData}
          lines={[
            { key: "revenue", color: "#22c55e", label: "Revenue (L)" },
            { key: "expense", color: "#f43f5e", label: "Expense (L)" },
            { key: "profit",  color: "#3b82f6", label: "Profit (L)"  },
          ]}
          size={8}
        />
        <GDoughnutChart
          title="Payment Status"
          subtitle="Successful · Pending · Failed · Partial"
          data={paymentStatusData}
          size={4}
        />
      </DashGrid>

      {/* ── Charts Row 2: Revenue vs Target column + Expense by Category pie ── */}
      <DashGrid cols={12} gap={4}>
        <GColumnChart
          title="Monthly Revenue vs Target"
          subtitle="Actual revenue against expected target (₹ Lakhs)"
          data={monthlyRevenueTargetData}
          bars={[
            { key: "revenue", color: "#3b82f6", label: "Revenue (L)" },
            { key: "target",  color: "#f59e0b", label: "Target (L)"  },
          ]}
          size={7}
        />
        <GPieChart
          title="Expense by Category"
          subtitle="Category-wise expense distribution"
          data={expenseCategoryData}
          size={5}
        />
      </DashGrid>

      {/* ── Pending Actions + Quick Insights ── */}
      <DashGrid cols={12} gap={4}>
        {/* Pending Actions */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-full">
            <h3 className="text-sm font-bold text-[#2a465a] mb-4 uppercase tracking-wider">
              ⚡ Pending Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {pendingActionsData.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 border"
                  style={{
                    borderColor: item.color + "40",
                    backgroundColor: item.color + "10",
                  }}
                >
                  <p className="text-2xl font-black" style={{ color: item.color }}>
                    {item.count}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="col-span-12 lg:col-span-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-full">
            <h3 className="text-sm font-bold text-[#2a465a] mb-4 uppercase tracking-wider">
              💡 Quick Insights
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickInsightsData.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl p-4 bg-slate-50 border border-slate-100"
                >
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm font-black text-[#2a465a]">{item.value}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.sub}</p>
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
          rows={recentPaymentsData}
          searchable
          pageSize={5}
          size={12}
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
          rows={recentInvoicesData}
          searchable
          pageSize={5}
          size={12}
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
          rows={recentActivitiesData}
          searchable
          pageSize={5}
          size={12}
        />
      </DashGrid>

    </div>
  );
}
