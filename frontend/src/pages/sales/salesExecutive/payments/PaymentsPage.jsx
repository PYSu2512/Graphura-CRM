import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  IndianRupee, TrendingUp, CheckCircle2, XCircle, Clock,
  RefreshCw, Download, Eye, RotateCcw, Filter,
  AlertTriangle, X, Bell, Search,
} from "lucide-react";
import {
  Heading, GAreaChart, GPieChart, GBarChart, EnhancedDashCard, DashGrid, SelectField, Option, DataField, DataTable, Button
} from "../../../../components/shared/Common_Components";
import { paymentService } from "../../../../services/paymentService";
import PaymentDetailsPanel from "./PaymentDetailsPanel";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtDate = (d) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const STATUS_BADGE = {
  Success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Failed: "bg-rose-100 text-rose-700 border border-rose-200",
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
};
const MODE_ICON = { UPI: "🔵", Card: "💳", Cash: "💵", "Bank Transfer": "🏦" };

// ─── Toast ────────────────────────────────────────────────────────────────────
const ToastContainer = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-80">
    {toasts.map(t => (
      <div key={t.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto
          ${t.type === "success" ? "bg-white border-emerald-200" :
            t.type === "error" ? "bg-white border-rose-200" : "bg-white border-amber-200"}`}>
        {t.type === "success" && <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />}
        {t.type === "error" && <XCircle size={15} className="text-rose-500 flex-shrink-0" />}
        {t.type === "warning" && <AlertTriangle size={15} className="text-amber-500 flex-shrink-0" />}
        <p className="text-sm font-medium text-[#1a2e3f] flex-1">{t.message}</p>
        <button onClick={() => onDismiss(t.id)} className="text-slate-400 hover:text-slate-600 flex-shrink-0">
          <X size={13} />
        </button>
      </div>
    ))}
  </div>
);

// ─── Removed KpiCard ──────────────────────────────────────────────────────────

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Sk = ({ className }) => <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />;

// ─── Error Banner ─────────────────────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
    <AlertTriangle size={15} className="flex-shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && <button onClick={onRetry} className="text-xs font-bold underline">Retry</button>}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  // Data
  const [payments, setPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartsError, setChartsError] = useState("");

  // Filters
  const [dateRange, setDateRange] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [search, setSearch] = useState("");

  // UI
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [retrying, setRetrying] = useState(null);   // txn id being retried
  const [reminding, setReminding] = useState(null);   // client id being reminded
  const pollingRef = useRef(null);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4500);
  }, []);
  const dismissToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  // ── Fetch payments ─────────────────────────────────────────────────────────
  const fetchPayments = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await paymentService.getPayments({});
      setPayments(res.data);
    } catch {
      setError("Failed to load payments. Check your connection.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // ── Fetch KPIs + charts ────────────────────────────────────────────────────
  const fetchMeta = useCallback(async (silent = false) => {
    if (!silent) setChartsLoading(true);
    setChartsError("");
    try {
      const [kpiRes, trendRes] = await Promise.all([
        paymentService.getKPIs(),
        paymentService.getRevenueTrend(),
      ]);
      setKpis(kpiRes.data);
      setRevenueTrend(trendRes.data);
    } catch {
      setChartsError("Failed to load summary data.");
    } finally {
      if (!silent) setChartsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  // ── Real-time polling every 10s (Step 7) ──────────────────────────────────
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchPayments(true);
      fetchMeta(true);
    }, 10000);
    return () => clearInterval(pollingRef.current);
  }, [fetchPayments, fetchMeta]);

  // ── Retry handler (Step 3 + 7) ────────────────────────────────────────────
  const handleRetry = async (payment) => {
    setRetrying(payment.id);
    try {
      await paymentService.retryPayment(payment.id);
      // Step 7: auto-update lead status on success
      await paymentService.updateLeadStatus(payment.leadId, "Converted");
      addToast(`Payment ${payment.id} retried successfully! Lead marked Converted.`, "success");
      setSelectedPayment(null);
      await fetchPayments();
      await fetchMeta();
    } catch {
      addToast(`Retry failed for ${payment.id}. Please try again.`, "error");
    } finally {
      setRetrying(null);
    }
  };

  // ── Send reminder (Step 7) ────────────────────────────────────────────────
  const handleReminder = async (payment) => {
    setReminding(payment.id);
    try {
      await paymentService.sendReminder(payment.leadId, payment.clientName);
      addToast(`Reminder sent to ${payment.clientName}.`, "success");
    } catch {
      addToast("Failed to send reminder.", "error");
    } finally {
      setReminding(null);
    }
  };

  // ── Download invoice (Step 7) ─────────────────────────────────────────────
  const handleDownload = (payment) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("INVOICE", 14, 22);
      doc.setFontSize(11);
      doc.text(`Transaction ID: ${payment.id}`, 14, 32);
      doc.text(`Client Name: ${payment.clientName}`, 14, 38);
      doc.text(`Date: ${new Date(payment.date).toLocaleDateString()}`, 14, 44);
      doc.text(`Status: ${payment.status}`, 14, 50);
      doc.text(`Mode: ${payment.mode}`, 14, 56);

      autoTable(doc, {
        startY: 65,
        head: [['Description', 'Amount']],
        body: [
          ['Payment for Services', `Rs. ${payment.amount}`]
        ],
        theme: 'striped',
        headStyles: { fillColor: [42, 70, 90] }
      });

      doc.save(`${payment.id}_Invoice.pdf`);
      addToast(`Invoice downloaded for ${payment.id}.`, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to generate PDF.", "error");
    }
  };

  // ── Filters (Handled via DataTable) ───────────────────────────────────────

  const PIE_COLOR_MAP = { Success: "#10b981", Failed: "#f43f5e", Pending: "#f59e0b" };
  const allStatusData = [
    { name: "Success", value: payments.filter(p => p.status === "Success").length },
    { name: "Failed", value: payments.filter(p => p.status === "Failed").length },
    { name: "Pending", value: payments.filter(p => p.status === "Pending").length },
  ];
  const statusChartData = allStatusData.filter(d => d.value > 0);
  const statusChartColors = statusChartData.map(d => PIE_COLOR_MAP[d.name]);
  const modeChartData = ["UPI", "Card", "Cash", "Bank Transfer"].map(m => ({
    name: m,
    count: payments.filter(p => p.mode === m).length,
    amount: Math.round(payments.filter(p => p.mode === m).reduce((s, p) => s + p.amount, 0) / 1000),
  }));

  const pendingPayments = payments.filter(p => p.status === "Pending");

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Header — full-width banner matching Prospect Management style ── */}
      <Heading primaryText="Payments Management" showAnimations />

      {/* ── Refresh button ── */}
      <div className="flex justify-end">
        <button
          onClick={() => { fetchPayments(); fetchMeta(); addToast("Refreshed.", "success"); }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1a2e3f] bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-slate-300 transition-colors">
          <RotateCcw size={12} /> Refresh
        </button>
      </div>



      {/* ── STEP 2: KPI Cards (EnhancedDashCard) ── */}
      {chartsError && <ErrorBanner message={chartsError} onRetry={fetchMeta} />}
      {chartsLoading ? (
        <DashGrid cols={12} gap={3}>
          {Array(4).fill(0).map((_, i) => (
            <Sk key={i} className="col-span-12 md:col-span-6 lg:col-span-3 h-[120px]" />
          ))}
        </DashGrid>
      ) : kpis && (
        <DashGrid cols={12} gap={3}>
          <EnhancedDashCard title="TODAY'S REVENUE" value={fmt(kpis.todayRevenue)} icon={<TrendingUp size={22} />} accentColor="#10b981" size={3} />
          <EnhancedDashCard title="SUCCESSFUL" value={String(kpis.successCount)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" size={3} />
          <EnhancedDashCard title="FAILED" value={String(kpis.failedCount)} icon={<XCircle size={22} />} accentColor="#f43f5e" size={3} />
          <EnhancedDashCard title="PENDING AMOUNT" value={fmt(kpis.pendingAmount)} icon={<Clock size={22} />} accentColor="#f59e0b" size={3} />
        </DashGrid>
      )}

      {/* ── Charts ── */}
      {!chartsLoading && !chartsError && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <GAreaChart title="Revenue Trend" subtitle="Daily revenue (last 9 days)"
              data={revenueTrend} areas={[{ key: "revenue", label: "Revenue (₹)", color: "#2a465a" }]}
              size={12} height={220} />
          </div>
          <div>
            <GPieChart title="Payment Status" subtitle="Success / Failed / Pending"
              data={statusChartData} colors={statusChartColors}
              size={12} height={220} />
          </div>
          <div className="lg:col-span-3">
            <GBarChart title="Payment Mode Breakdown" subtitle="Transactions & amount (₹K) by mode"
              data={modeChartData}
              bars={[{ key: "count", label: "Transactions", color: "#2a465a" }, { key: "amount", label: "Amount (₹K)", color: "#14b8a6" }]}
              size={12} height={200} />
          </div>
        </div>
      )}





      {/* ── All Transactions — using shared DataTable ── */}
      <div className="mb-6">
        {error && <div className="mb-4"><ErrorBanner message={error} onRetry={fetchPayments} /></div>}

        {loading ? (
          <div className="p-4 space-y-2 bg-white rounded-xl border border-slate-200">
            {Array(6).fill(0).map((_, i) => <Sk key={i} className="h-10" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col items-center justify-center py-10 text-slate-400">
            <IndianRupee size={28} className="mb-2 opacity-30" />
            <p className="text-xs font-medium">No transactions found</p>
          </div>
        ) : (
          // 🔥 ONLY IMPORTANT PART REPLACE (DataTable SECTION)

          <DataTable
            title={`All Transactions (${payments.length} records)`}
            columns={[
              {
                key: "id",
                label: "Txn ID",
                render: (row) => (
                  <span className="font-mono text-[11px] font-bold text-[#1a2e3f] min-w-[80px] block">
                    {row.id}
                  </span>
                ),
              },
              {
                key: "clientName",
                label: "Client",
                render: (row) => (
                  <span className="font-medium text-[#1a2e3f] min-w-[100px] block">
                    {row.clientName}
                  </span>
                ),
              },
              {
                key: "amount",
                label: "Amount",
                render: (row) => (
                  <span className="font-bold text-emerald-700 min-w-[80px] block">
                    ₹{row.amount}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.status === "Success"
                    ? "bg-emerald-100 text-emerald-700"
                    : row.status === "Failed"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                    }`}>
                    {row.status}
                  </span>
                ),
              },
              {
                key: "mode",
                label: "Mode",
                render: (row) => (
                  <span className="text-slate-600 min-w-[100px] block">
                    {row.mode}
                  </span>
                ),
              },
              {
                key: "date",
                label: "Date & Time",
                render: (row) => (
                  <span className="text-slate-500 whitespace-nowrap min-w-[130px] block">
                    {fmtDate(row.date)}
                  </span>
                ),
              },
            ]}

            rows={payments}

            filters={[
              {
                title: "Date Range",
                type: "select",
                options: ["All", "All Time", "Today", "This Week", "This Month", "Custom"],
                fn: (row, val) => {
                  if (!val || val === "All" || val === "All Time") return true;

                  const d = new Date(row.date);
                  const today = new Date();

                  if (val === "Today") return d.toDateString() === today.toDateString();

                  if (val === "This Week") {
                    const firstDay = new Date();
                    firstDay.setDate(today.getDate() - today.getDay());
                    const lastDay = new Date(firstDay);
                    lastDay.setDate(firstDay.getDate() + 6);
                    return d >= firstDay && d <= lastDay;
                  }

                  if (val === "This Month") {
                    return (
                      d.getMonth() === today.getMonth() &&
                      d.getFullYear() === today.getFullYear()
                    );
                  }

                  return true;
                },
              },
              {
                title: "Status",
                type: "select",
                options: ["All", "Success", "Pending", "Failed"],
                fn: (row, val) => (!val || val === "All") ? true : row.status === val,
              },
              {
                title: "Mode",
                type: "select",
                options: ["All", "UPI", "Card", "Cash", "Bank Transfer"],
                fn: (row, val) => (!val || val === "All") ? true : row.mode === val,
              },
            ]}

            pageSize={10}

            actions={[
              {
                icon: <Eye size={14} />,
                tooltip: "View",
                onClick: (row) => setSelectedPayment(row),
                variant: "ghost",
                show: () => true,
              },
              {
                icon: <Download size={14} />,
                tooltip: "Download",
                onClick: (row) => handleDownload(row),
                variant: "ghost",
                show: () => true,
              },
              {
                icon: <RefreshCw size={14} />,
                tooltip: "Retry Payment",
                onClick: (row) => handleRetry(row),
                variant: "ghost",
                show: (row) => row.status === "Failed",
              },
            ]}
          />
        )}
      </div>

      {/* ── STEP 5: Pending Payments — Attractive Cards ── */}
      {pendingPayments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-[#2a465a]" />
            <h3 className="text-sm font-bold text-[#1a2e3f]">Pending Payments</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {pendingPayments.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {pendingPayments.map(p => (
              <div key={p.id}
                className="bg-white rounded-xl border-l-4 border-l-[#2a465a] border border-slate-200 shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="text-sm font-bold text-[#1a2e3f]">{p.clientName}</p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{p.id}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                    Pending
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Due</p>
                    <p className="text-xl font-black text-[#2a465a]">{fmt(p.amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due Date</p>
                    <p className="text-sm font-semibold text-slate-600">
                      {new Date(p.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors">
                    <Eye size={12} /> View
                  </button>
                  <button
                    onClick={() => handleReminder(p)}
                    disabled={reminding === p.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#2a465a] hover:bg-[#1e3241] text-white text-xs font-bold disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                    <Bell size={12} className={reminding === p.id ? "animate-bounce" : ""} />
                    {reminding === p.id ? "Sending…" : "Send Reminder"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Payment Details Panel ── */}
      {selectedPayment && (
        <PaymentDetailsPanel
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onRetry={handleRetry}
          addToast={addToast}
        />
      )}

    </div>
  );
}