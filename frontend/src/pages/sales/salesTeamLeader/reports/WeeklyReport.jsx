import { useState, useEffect, useCallback } from "react";
import {
  Heading, DashGrid, DashCard, DataTable, GAreaChart,
} from "../../../../components/shared/Common_Components";
import { salesTLReportsService } from "../../../../services/salesTeamLeaderReportsService";
import { Phone, TrendingUp, ClipboardList, BarChart2, AlertCircle } from "lucide-react";

// ── Skeleton placeholder ──────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  );
}

// ── Error banner with retry ───────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-medium underline">
          Retry
        </button>
      )}
    </div>
  );
}

// NO revenue column
const COLS = [
  { key: "weekStart",  label: "Week Start" },
  { key: "weekEnd",    label: "Week End" },
  { key: "totalCalls", label: "Total Calls" },
  { key: "prospects",  label: "Prospects" },
  { key: "sales",      label: "Sales" },
  { key: "dump",       label: "Dump" },
  { key: "conversion", label: "Conversion %" },
];

const DEFAULT_PAGINATION = { total: 0, page: 1, pageSize: 10, totalPages: 1 };

export default function WeeklyReport() {
  const [currentWeek, setCurrentWeek] = useState(null);
  const [trend,       setTrend]       = useState([]);
  const [history,     setHistory]     = useState([]);
  const [pagination,  setPagination]  = useState(DEFAULT_PAGINATION);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);

  const fetchData = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesTLReportsService.getWeekly({ page, pageSize });
      setCurrentWeek(result.currentWeek || null);
      setTrend(result.trend || []);
      setHistory(result.history || []);
      setPagination(result.pagination || DEFAULT_PAGINATION);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load weekly report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(1, 10); }, [fetchData]);

  const handlePageChange     = (page)     => fetchData(page, pagination.pageSize);
  const handlePageSizeChange = (pageSize) => fetchData(1, pageSize);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Weekly" secondaryText="Report" size={12} />
      </DashGrid>

      {/* ── Error ── */}
      {error && (
        <DashGrid cols={12} gap={4}>
          <div className="col-span-12">
            <ErrorBanner message={error} onRetry={() => fetchData(pagination.page, pagination.pageSize)} />
          </div>
        </DashGrid>
      )}

      {/* ── Current week KPIs (NO revenue) ── */}
      <DashGrid cols={12} gap={4}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="col-span-3">
              <Skeleton className="h-24 w-full" />
            </div>
          ))
        ) : (
          <>
            <DashCard title="Calls (this week)"     value={String(currentWeek?.calls          ?? 0)} icon={<Phone size={22}/>}         accentColor="#3b82f6" size={3} />
            <DashCard title="Prospects (this week)" value={String(currentWeek?.prospects      ?? 0)} icon={<ClipboardList size={22}/>} accentColor="#8b5cf6" size={3} />
            <DashCard title="Sales (this week)"     value={String(currentWeek?.sales          ?? 0)} icon={<TrendingUp size={22}/>}    accentColor="#22c55e" size={3} />
            <DashCard title="Conversion Rate"       value={`${currentWeek?.conversionRate ?? 0}%`}   icon={<BarChart2 size={22}/>}     accentColor="#10b981" size={3} />
          </>
        )}
      </DashGrid>

      {/* ── Trend chart ── */}
      {loading ? (
        <DashGrid cols={12} gap={4}>
          <div className="col-span-12"><Skeleton className="h-72 w-full" /></div>
        </DashGrid>
      ) : (
        <GAreaChart
          title="Weekly Calls vs Sales Trend"
          subtitle="Team activity across recent weeks"
          data={trend}
          areas={[
            { key: "calls", label: "Calls", color: "#3b82f6" },
            { key: "sales", label: "Sales", color: "#22c55e" },
          ]}
          size={12}
          height={280}
        />
      )}

      {/* ── Weekly history table ── */}
      <DataTable
        title="Weekly Report History"
        columns={COLS}
        rows={history}
        size={12}
        pageSize={pagination.pageSize}
        totalRows={pagination.total}
        currentPage={pagination.page}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        serverSide
        exportable
        exportFileName="weekly_report"
      />
    </div>
  );
}
