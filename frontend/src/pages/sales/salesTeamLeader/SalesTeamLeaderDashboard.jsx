import { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Heading,
  DashCard,
  GAreaChart,
  GColumnChart,
  GPieChart,
  GLineChart,
  DataTable,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  Button,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components.jsx";
import {
  PhoneCall,
  Phone,
  ClipboardList,
  TrendingUp,
  MessageSquare,
  EyeOff,
  Trash2,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react";
import { salesTLDashboardService } from "../../../services/salesTeamLeaderDashboardService";

// ─── KPI icon map (same order as API response fields) ────────────────────────
const KPI_ICONS = [
  <PhoneCall size={20} />,
  <Phone size={20} />,
  <ClipboardList size={20} />,
  <TrendingUp size={20} />,
  <MessageSquare size={20} />,
  <EyeOff size={20} />,
  <Trash2 size={20} />,
  <AlertCircle size={20} />,
];

const KPI_ACCENTS = [
  "#3b82f6",
  "#14b8a6",
  "#8b5cf6",
  "#22c55e",
  "#38bdf8",
  "#f59e0b",
  "#f43f5e",
  "#ef4444",
];

// ─── Leaderboard table columns ────────────────────────────────────────────────
const LEADERBOARD_COLS = [
  { key: "rank",       label: "Rank" },
  { key: "executive",  label: "Executive" },
  { key: "calls",      label: "Calls" },
  { key: "prospects",  label: "Prospects" },
  { key: "sales",      label: "Sales" },
  { key: "talkRatio",  label: "Talk Ratio" },
  { key: "dump",       label: "Dump" },
  { key: "missed",     label: "Missed" },
  { key: "status",     label: "Status" },
];

// ─── Pie chart colors ─────────────────────────────────────────────────────────
const FUNNEL_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6", "#22c55e", "#f43f5e", "#94a3b8"];

// ─── Skeleton loader ──────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

// ─── Error banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs font-medium underline hover:no-underline"
        >
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SalesTeamLeaderDashboard() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [summary,       setSummary]       = useState(null);
  const [callsTrend,    setCallsTrend]    = useState([]);
  const [leadFunnel,    setLeadFunnel]    = useState([]);
  const [execPerf,      setExecPerf]      = useState([]);
  const [salesTrend,    setSalesTrend]    = useState([]);
  const [leaderboard,   setLeaderboard]   = useState([]);
  const [pagination,    setPagination]    = useState({ total: 0, page: 1, pageSize: 10, totalPages: 1 });
  const [selectedExec,  setSelectedExec]  = useState(null);

  // Loading states per section
  const [loading, setLoading] = useState({
    summary:   true,
    charts:    true,
    leaderboard: true,
  });

  // Error states per section
  const [errors, setErrors] = useState({
    summary:   null,
    charts:    null,
    leaderboard: null,
  });

  // Leaderboard query state
  const [lbQuery, setLbQuery] = useState({
    page:     1,
    pageSize: 10,
    search:   "",
    sortBy:   "calls",
    sortDir:  "desc",
  });

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchSummary = useCallback(async () => {
    setLoading((p) => ({ ...p, summary: true }));
    setErrors((p) => ({ ...p, summary: null }));
    try {
      const data = await salesTLDashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      setErrors((p) => ({ ...p, summary: err.message || "Failed to load summary" }));
    } finally {
      setLoading((p) => ({ ...p, summary: false }));
    }
  }, []);

  const fetchCharts = useCallback(async () => {
    setLoading((p) => ({ ...p, charts: true }));
    setErrors((p) => ({ ...p, charts: null }));
    try {
      const [trend, funnel, perf, sales] = await Promise.all([
        salesTLDashboardService.getCallsSalesTrend(),
        salesTLDashboardService.getLeadFunnel(),
        salesTLDashboardService.getExecutivePerformance(),
        salesTLDashboardService.getSalesTrend(),
      ]);
      setCallsTrend(trend.months || []);
      setLeadFunnel(funnel.funnel || []);
      setExecPerf(perf.executives || []);
      setSalesTrend(sales.months || []);
    } catch (err) {
      setErrors((p) => ({ ...p, charts: err.message || "Failed to load charts" }));
    } finally {
      setLoading((p) => ({ ...p, charts: false }));
    }
  }, []);

  const fetchLeaderboard = useCallback(async (query) => {
    setLoading((p) => ({ ...p, leaderboard: true }));
    setErrors((p) => ({ ...p, leaderboard: null }));
    try {
      const data = await salesTLDashboardService.getLeaderboard(query);
      setLeaderboard(data.leaderboard || []);
      setPagination(data.pagination || { total: 0, page: 1, pageSize: 10, totalPages: 1 });
    } catch (err) {
      setErrors((p) => ({ ...p, leaderboard: err.message || "Failed to load leaderboard" }));
    } finally {
      setLoading((p) => ({ ...p, leaderboard: false }));
    }
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSummary();
    fetchCharts();
  }, [fetchSummary, fetchCharts]);

  useEffect(() => {
    fetchLeaderboard(lbQuery);
  }, [lbQuery, fetchLeaderboard]);

  // ── Derived KPI cards from summary ────────────────────────────────────────
  const kpiCards = summary
    ? [
        { title: "Total Calls",      value: summary.totalCalls.toLocaleString() },
        { title: "Today Calls",      value: summary.todayCalls.toLocaleString() },
        { title: "Total Prospects",  value: summary.totalProspects.toLocaleString() },
        { title: "Today Sales",      value: summary.todaySales.toLocaleString() },
        { title: "Talk Ratio",       value: `${summary.talkRatio}%` },
        { title: "Untouched Leads",  value: summary.untouchedLeads.toLocaleString() },
        { title: "Dump Count",       value: summary.dumpCount.toLocaleString() },
        { title: "Follow-up Missed", value: summary.followUpMissed.toLocaleString() },
      ]
    : Array(8).fill(null);

  // ── Leaderboard row click ──────────────────────────────────────────────────
  const openExecDetails = (row) => {
    setSelectedExec(row);
    openModal("tl-exec-view");
  };

  // ── Leaderboard query handlers ─────────────────────────────────────────────
  const handleLbPageChange = (page) =>
    setLbQuery((q) => ({ ...q, page }));

  const handleLbPageSizeChange = (pageSize) =>
    setLbQuery((q) => ({ ...q, page: 1, pageSize }));

  const handleLbSearch = (search) =>
    setLbQuery((q) => ({ ...q, page: 1, search }));

  const handleLbSort = (sortBy, sortDir) =>
    setLbQuery((q) => ({ ...q, sortBy, sortDir }));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">

      {/* ── 1. Header ──────────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText="Team Leader Dashboard"
          secondaryText={
            summary
              ? `${summary.teamName} · ${summary.executiveCount} executives`
              : loading.summary
              ? "Loading..."
              : "No Team Assigned"
          }
          fontSize="2xl"
          size={12}
        />
      </Grid>

      {/* ── Summary error ──────────────────────────────────────────────────── */}
      {errors.summary && (
        <Grid cols={12} gap={4}>
          <div className="col-span-12">
            <ErrorBanner message={errors.summary} onRetry={fetchSummary} />
          </div>
        </Grid>
      )}

      {/* ── 2. KPI Cards ───────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        {kpiCards.map((k, i) =>
          loading.summary || !k ? (
            <div key={i} className="col-span-3">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <DashCard
              key={k.title}
              title={k.title}
              value={k.value}
              icon={KPI_ICONS[i]}
              accentColor={KPI_ACCENTS[i]}
              size={3}
            />
          )
        )}
      </Grid>

      {/* ── Charts error ───────────────────────────────────────────────────── */}
      {errors.charts && (
        <Grid cols={12} gap={4}>
          <div className="col-span-12">
            <ErrorBanner message={errors.charts} onRetry={fetchCharts} />
          </div>
        </Grid>
      )}

      {/* ── 3. Calls & Sales Trend + Lead Funnel ──────────────────────────── */}
      <Grid cols={12} gap={4}>
        {loading.charts ? (
          <>
            <div className="col-span-8"><Skeleton className="h-72 w-full" /></div>
            <div className="col-span-4"><Skeleton className="h-72 w-full" /></div>
          </>
        ) : (
          <>
            <GAreaChart
              title="Calls & Sales Trend"
              subtitle="Monthly team activity across the year"
              data={callsTrend}
              areas={[
                { key: "calls", label: "Calls", color: "#3b82f6" },
                { key: "sales", label: "Sales", color: "#22c55e" },
              ]}
              size={8}
              height={300}
            />
            <GPieChart
              title="Lead Funnel"
              subtitle="Pipeline status breakdown"
              data={leadFunnel}
              colors={FUNNEL_COLORS}
              size={4}
              height={300}
            />
          </>
        )}
      </Grid>

      {/* ── 4. Executive Performance + Sales Trend ────────────────────────── */}
      <Grid cols={12} gap={4}>
        {loading.charts ? (
          <>
            <div className="col-span-7"><Skeleton className="h-72 w-full" /></div>
            <div className="col-span-5"><Skeleton className="h-72 w-full" /></div>
          </>
        ) : (
          <>
            <GColumnChart
              title="Executive Performance"
              subtitle="Leads, calls and sales per executive"
              data={execPerf}
              bars={[
                { key: "calls", label: "Calls", color: "#14b8a6" },
                { key: "leads", label: "Leads", color: "#3b82f6" },
                { key: "sales", label: "Sales", color: "#22c55e" },
              ]}
              size={7}
              height={300}
            />
            <GLineChart
              title="Sales Trend"
              subtitle="Monthly sales count this year"
              data={salesTrend}
              lines={[{ key: "sales", label: "Sales", color: "#22c55e" }]}
              size={5}
              height={300}
            />
          </>
        )}
      </Grid>

      {/* ── 5. Executive Leaderboard ──────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        {errors.leaderboard && (
          <div className="col-span-12">
            <ErrorBanner
              message={errors.leaderboard}
              onRetry={() => fetchLeaderboard(lbQuery)}
            />
          </div>
        )}
        <DataTable
          title="Executive Leaderboard"
          columns={LEADERBOARD_COLS}
          rows={leaderboard}
          loading={loading.leaderboard}
          actions={[
            {
              icon:    <Eye size={15} />,
              tooltip: "View Details",
              variant: "ghost",
              onClick: openExecDetails,
            },
          ]}
          size={12}
          pageSize={lbQuery.pageSize}
          totalRows={pagination.total}
          currentPage={pagination.page}
          onPageChange={handleLbPageChange}
          onPageSizeChange={handleLbPageSizeChange}
          onSearch={handleLbSearch}
          onSort={handleLbSort}
          searchable
          exportable
          exportFileName="team_leaderboard"
          filters={[
            {
              title:   "Status",
              type:    "toggle",
              key:     "status",
              options: ["Active", "On Leave", "Inactive"],
            },
          ]}
        />
      </Grid>

      {/* ── Executive Detail Modal ────────────────────────────────────────── */}
      <Modal id="tl-exec-view" title="Executive Details" size="md">
        {selectedExec && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selectedExec.executive}
              subtitle={`Rank #${selectedExec.rank}`}
              meta={`Status: ${selectedExec.status}`}
            />
            <ModalGrid title="Contact" cols={2}>
              <ModalData label="Email" value={selectedExec.email ?? "—"} />
              <ModalData label="Status" value={selectedExec.status} />
            </ModalGrid>
            <ModalGrid title="Performance" cols={3}>
              <ModalData label="Calls"      value={selectedExec.calls} />
              <ModalData label="Prospects"  value={selectedExec.prospects} />
              <ModalData label="Sales"      value={selectedExec.sales} />
              <ModalData label="Talk Ratio" value={selectedExec.talkRatio} />
              <ModalData label="Dump"       value={selectedExec.dump} />
              <ModalData label="Missed"     value={selectedExec.missed} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button
                text="Close"
                variant="ghost"
                size={3}
                onClick={() => closeModal("tl-exec-view")}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
