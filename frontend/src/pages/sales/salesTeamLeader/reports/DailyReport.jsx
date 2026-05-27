import { useState, useEffect, useCallback } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
} from "../../../../components/shared/Common_Components";
import { salesTLReportsService } from "../../../../services/salesTeamLeaderReportsService";
import { Phone, ClipboardList, TrendingUp, Trash2, EyeOff, AlertCircle } from "lucide-react";

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

const HISTORY_COLS = [
  { key: "date",           label: "Date" },
  { key: "totalCalls",     label: "Total Calls" },
  { key: "todayCalls",     label: "Today Calls" },
  { key: "todayProspects", label: "Prospects" },
  { key: "todaySells",     label: "Sells" },
  { key: "todayDump",      label: "Dump" },
  { key: "totalUntouched", label: "Untouched" },
];

const DEFAULT_PAGINATION = { total: 0, page: 1, pageSize: 10, totalPages: 1 };

export default function DailyReport() {
  const [today,      setToday]      = useState(null);
  const [history,    setHistory]    = useState([]);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchData = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesTLReportsService.getDaily({ page, pageSize });
      setToday(result.today);
      setHistory(result.history || []);
      setPagination(result.pagination || DEFAULT_PAGINATION);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load daily report");
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
        <Heading primaryText="My Daily" secondaryText="Report" size={12} />
      </DashGrid>

      {/* ── Error ── */}
      {error && (
        <DashGrid cols={12} gap={4}>
          <div className="col-span-12">
            <ErrorBanner message={error} onRetry={() => fetchData(pagination.page, pagination.pageSize)} />
          </div>
        </DashGrid>
      )}

      {/* ── Today's KPIs ── */}
      <DashGrid cols={12} gap={4}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-span-2">
              <Skeleton className="h-24 w-full" />
            </div>
          ))
        ) : (
          <>
            <EnhancedDashCard title="Total Calls"     value={String(today?.totalCalls     ?? 0)} icon={<Phone size={22}/>}         accentColor="#3b82f6" size={2} />
            <EnhancedDashCard title="Today Calls"     value={String(today?.todayCalls     ?? 0)} icon={<Phone size={22}/>}         accentColor="#14b8a6" size={2} />
            <EnhancedDashCard title="Today Prospects" value={String(today?.todayProspects ?? 0)} icon={<ClipboardList size={22}/>} accentColor="#8b5cf6" size={2} />
            <EnhancedDashCard title="Today Sells"     value={String(today?.todaySells     ?? 0)} icon={<TrendingUp size={22}/>}    accentColor="#22c55e" size={2} />
            <EnhancedDashCard title="Today Dump"      value={String(today?.todayDump      ?? 0)} icon={<Trash2 size={22}/>}        accentColor="#f43f5e" size={2} />
            <EnhancedDashCard title="Total Untouched" value={String(today?.totalUntouched ?? 0)} icon={<EyeOff size={22}/>}        accentColor="#f59e0b" size={2} />
          </>
        )}
      </DashGrid>

      <p className="text-xs text-slate-500">
        Personal report covering my activity. As Team Leader my daily numbers are tracked alongside the team.
      </p>

      {/* ── History table ── */}
      <DataTable
        title="Daily Report History"
        columns={HISTORY_COLS}
        rows={history}
        size={12}
        pageSize={pagination.pageSize}
        totalRows={pagination.total}
        currentPage={pagination.page}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        serverSide
        exportable
        exportFileName="my_daily_report"
      />
    </div>
  );
}
