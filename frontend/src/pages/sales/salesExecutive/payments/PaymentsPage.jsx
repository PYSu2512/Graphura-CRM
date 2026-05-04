import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  IndianRupee, TrendingUp, CheckCircle2, XCircle, Clock,
  RefreshCw, Download, Eye, RotateCcw, Filter,
  AlertTriangle, X, Bell, Search,
} from "lucide-react";
import {
  Heading, GAreaChart, GPieChart, GBarChart, EnhancedDashCard,
} from "../../../../components/shared/Common_Components";
import { paymentService } from "../../../../services/paymentService";
import PaymentDetailsPanel from "./PaymentDetailsPanel";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const fmtDate = (d) => new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const STATUS_BADGE = {
  Success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Failed:  "bg-rose-100 text-rose-700 border border-rose-200",
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
            t.type === "error"   ? "bg-white border-rose-200"    : "bg-white border-amber-200"}`}>
        {t.type === "success" && <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />}
        {t.type === "error"   && <XCircle      size={15} className="text-rose-500 flex-shrink-0" />}
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
  const [payments, setPayments]         = useState([]);
  const [kpis, setKpis]                 = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);

  // Loading / error
  const [loading, setLoading]           = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [error, setError]               = useState("");
  const [chartsError, setChartsError]   = useState("");

  // Filters
  const [dateRange, setDateRange]       = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter]     = useState("");
  const [search, setSearch]             = useState("");

  // UI
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [toasts, setToasts]             = useState([]);
  const [retrying, setRetrying]         = useState(null);   // txn id being retried
  const [reminding, setReminding]       = useState(null);   // client id being reminded
  const pollingRef                      = useRef(null);

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
      const res = await paymentService.getPayments({
        status: statusFilter, mode: modeFilter, search,
      });
      setPayments(res.data);
    } catch {
      setError("Failed to load payments. Check your connection.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusFilter, modeFilter, search]);

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

  // ── Filters ───────────────────────────────────────────────────────────────
  const applyFilters = () => fetchPayments();

  const resetFilters = async () => {
    setStatusFilter("");
    setModeFilter("");
    setSearch("");
    setDateRange("all");
    // Fetch directly with empty params — bypasses stale closure in fetchPayments
    setLoading(true);
    setError("");
    try {
      const res = await paymentService.getPayments({});
      setPayments(res.data);
    } catch {
      setError("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  // ── Chart data ────────────────────────────────────────────────────────────
  const PIE_COLOR_MAP = { Success: "#10b981", Failed: "#f43f5e", Pending: "#f59e0b" };
  const allStatusData = [
    { name: "Success", value: payments.filter(p => p.status === "Success").length },
    { name: "Failed",  value: payments.filter(p => p.status === "Failed").length  },
    { name: "Pending", value: payments.filter(p => p.status === "Pending").length },
  ];
  const statusChartData  = allStatusData.filter(d => d.value > 0);
  const statusChartColors = statusChartData.map(d => PIE_COLOR_MAP[d.name]);
  const modeChartData = ["UPI", "Card", "Cash", "Bank Transfer"].map(m => ({
    name: m,
    count:  payments.filter(p => p.mode === m).length,
    amount: Math.round(payments.filter(p => p.mode === m).reduce((s, p) => s + p.amount, 0) / 1000),
  }));

  const pendingPayments = payments.filter(p => p.status === "Pending");

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-10">

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Heading primaryText="Payments Management" />
        <button
          onClick={() => { fetchPayments(); fetchMeta(); addToast("Refreshed.", "success"); }}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1a2e3f] bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-slate-300 transition-colors">
          <RotateCcw size={12} /> Refresh
        </button>
      </div>

      {/* ── STEP 1: Filters ── */}
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <Filter size={13} className="text-[#1a2e3f]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#1a2e3f]">Filters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Date Range</label>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400 transition">
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400 transition">
              <option value="">All</option>
              <option value="Success">✅ Success</option>
              <option value="Failed">❌ Failed</option>
              <option value="Pending">⏳ Pending</option>
            </select>
          </div>
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Mode</label>
            <select value={modeFilter} onChange={e => setModeFilter(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400 transition">
              <option value="">All</option>
              <option value="UPI">🔵 UPI</option>
              <option value="Card">💳 Card</option>
              <option value="Cash">💵 Cash</option>
              <option value="Bank Transfer">🏦 Bank Transfer</option>
            </select>
          </div>
          <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50/50">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Search</label>
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Client / TXN ID…" value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && applyFilters()}
                className="w-full pl-6 pr-2 py-1.5 text-sm rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-300/50 focus:border-sky-400 transition" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <button onClick={applyFilters}
            className="px-4 py-2 rounded-lg bg-[#1a2e3f] text-white text-xs font-bold hover:bg-[#2a465a] transition-colors">
            Apply Filters
          </button>
          <button onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors">
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>

      {/* ── STEP 2: KPI Cards (EnhancedDashCard) ── */}
      {chartsError && <ErrorBanner message={chartsError} onRetry={fetchMeta} />}
      {chartsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array(5).fill(0).map((_, i) => <Sk key={i} className="h-[120px]" />)}
        </div>
      ) : kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="w-full">
            <EnhancedDashCard title="TOTAL REVENUE" value={fmt(kpis.totalRevenue)} icon={<IndianRupee size={22} />} accentColor="#38bdf8" size={12} />
          </div>
          <div className="w-full">
            <EnhancedDashCard title="TODAY'S REVENUE" value={fmt(kpis.todayRevenue)} icon={<TrendingUp size={22} />} accentColor="#10b981" size={12} />
          </div>
          <div className="w-full">
            <EnhancedDashCard title="SUCCESSFUL" value={String(kpis.successCount)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" size={12} />
          </div>
          <div className="w-full">
            <EnhancedDashCard title="FAILED" value={String(kpis.failedCount)} icon={<XCircle size={22} />} accentColor="#f43f5e" size={12} />
          </div>
          <div className="w-full">
            <EnhancedDashCard title="PENDING AMOUNT" value={fmt(kpis.pendingAmount)} icon={<Clock size={22} />} accentColor="#f59e0b" size={12} />
          </div>
        </div>
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

      {/* ── All Transactions — simple table, no scrollbar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 min-w-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-[#1a2e3f]">All Transactions</h3>
          <span className="text-xs text-slate-400">{payments.length} records</span>
        </div>

        {error && <div className="p-4"><ErrorBanner message={error} onRetry={fetchPayments} /></div>}

        {loading ? (
          <div className="p-4 space-y-2">
            {Array(6).fill(0).map((_, i) => <Sk key={i} className="h-9" />)}
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <IndianRupee size={28} className="mb-2 opacity-30" />
            <p className="text-xs font-medium">No transactions found</p>
          </div>
        ) : (
          <table className="w-full table-fixed text-xs border-collapse">
            <colgroup>
              <col style={{ width: "15%" }} />  {/* Txn ID */}
              <col style={{ width: "17%" }} />  {/* Client */}
              <col style={{ width: "13%" }} />  {/* Amount */}
              <col style={{ width: "11%" }} />  {/* Status */}
              <col style={{ width: "15%" }} />  {/* Mode */}
              <col style={{ width: "19%" }} />  {/* Date */}
              <col style={{ width: "10%" }} />  {/* Actions */}
            </colgroup>
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Txn ID</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Client</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Mode</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Date & Time</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id}
                  className={`border-b border-slate-100 last:border-0 transition-colors
                    ${p.status === "Failed" ? "bg-rose-50/40" : i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}
                    hover:bg-sky-50/30`}>
                  <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-[#1a2e3f] truncate">{p.id}</td>
                  <td className="px-3 py-2.5 font-medium text-[#1a2e3f] truncate">{p.clientName}</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-700 truncate">{fmt(p.amount)}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold leading-tight ${STATUS_BADGE[p.status] || "bg-slate-100 text-slate-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 truncate">{MODE_ICON[p.mode] || ""} {p.mode}</td>
                  <td className="px-3 py-2.5 text-slate-500 truncate">{fmtDate(p.date)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setSelectedPayment(p)} title="View Details"
                        className="p-1.5 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-600 transition-colors">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => handleDownload(p)} title="Download Invoice"
                        className="p-1.5 rounded-md bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-600 transition-colors">
                        <Download size={13} />
                      </button>
                      <button
                        onClick={() => p.status === "Failed" && handleRetry(p)}
                        disabled={p.status !== "Failed" || retrying === p.id}
                        title={p.status === "Failed" ? "Retry Payment" : "Retry (only for failed)"}
                        className={`p-1.5 rounded-md transition-colors
                          ${p.status === "Failed"
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700"
                            : "bg-slate-50 text-slate-300 cursor-not-allowed"
                          } disabled:opacity-50`}>
                        <RefreshCw size={13} className={retrying === p.id ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
