import { useState, useEffect, useCallback } from "react";
import {
  Heading, DashGrid, DashCard,
  GLineChart, GColumnChart, GDoughnutChart,
} from "../../../../components/shared/Common_Components";
import { salesTLReportsService } from "../../../../services/salesTeamLeaderReportsService";
import {
  Users, Phone, ClipboardList, TrendingUp,
  Trash2, AlertCircle, BarChart2,
} from "lucide-react";

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

const LEAD_STATUS_COLORS = [
  "#22c55e", "#8b5cf6", "#3b82f6", "#14b8a6", "#f43f5e", "#f59e0b",
];

export default function Overview() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesTLReportsService.getOverview();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── KPI definitions (no revenue) ──
  const kpiDefs = data
    ? [
        { title: "Total Leads",       value: String(data.kpis.totalLeads),       icon: <Users size={22}/>,       accent: "#3b82f6" },
        { title: "Total Calls",       value: String(data.kpis.totalCalls),       icon: <Phone size={22}/>,       accent: "#14b8a6" },
        { title: "Total Prospects",   value: String(data.kpis.totalProspects),   icon: <ClipboardList size={22}/>, accent: "#8b5cf6" },
        { title: "Total Sales",       value: String(data.kpis.totalSales),       icon: <TrendingUp size={22}/>,  accent: "#22c55e" },
        { title: "Dump Leads",        value: String(data.kpis.dumpLeads),        icon: <Trash2 size={22}/>,      accent: "#f43f5e" },
        { title: "Missed Follow-ups", value: String(data.kpis.missedFollowUps),  icon: <AlertCircle size={22}/>, accent: "#ef4444" },
        { title: "Conversion Rate",   value: `${data.kpis.conversionRate}%`,     icon: <BarChart2 size={22}/>,   accent: "#10b981" },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Team Reports" secondaryText="Overview" size={12} />
      </DashGrid>

      {/* ── Error ── */}
      {error && (
        <DashGrid cols={12} gap={4}>
          <div className="col-span-12">
            <ErrorBanner message={error} onRetry={fetchData} />
          </div>
        </DashGrid>
      )}

      {/* ── KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="col-span-3">
                <Skeleton className="h-24 w-full" />
              </div>
            ))
          : kpiDefs.map((k) => (
              <DashCard
                key={k.title}
                title={k.title}
                value={k.value}
                icon={k.icon}
                accentColor={k.accent}
                size={k.title === "Dump Leads" || k.title === "Missed Follow-ups" || k.title === "Conversion Rate" ? 4 : 3}
              />
            ))}
      </DashGrid>

      {/* ── Charts Row 1 ── */}
      <DashGrid cols={12} gap={4}>
        {loading ? (
          <>
            <div className="col-span-6"><Skeleton className="h-64 w-full" /></div>
            <div className="col-span-6"><Skeleton className="h-64 w-full" /></div>
          </>
        ) : (
          <>
            <GLineChart
              title="Calls vs Sales"
              subtitle="Last 7 days team trend"
              data={data?.callsVsSales || []}
              lines={[
                { key: "calls", color: "#3b82f6", label: "Calls" },
                { key: "sales", color: "#22c55e", label: "Sales" },
              ]}
              size={6}
              height={260}
            />
            <GLineChart
              title="Leads vs Prospects"
              subtitle="Last 7 days team trend"
              data={data?.leadsVsProspects || []}
              lines={[
                { key: "leads",     color: "#8b5cf6", label: "Leads" },
                { key: "prospects", color: "#f59e0b", label: "Prospects" },
              ]}
              size={6}
              height={260}
            />
          </>
        )}
      </DashGrid>

      {/* ── Charts Row 2 ── */}
      <DashGrid cols={12} gap={4}>
        {loading ? (
          <>
            <div className="col-span-8"><Skeleton className="h-64 w-full" /></div>
            <div className="col-span-4"><Skeleton className="h-64 w-full" /></div>
          </>
        ) : (
          <>
            <GColumnChart
              title="Executive Performance"
              subtitle="Calls, Prospects & Sales per executive"
              data={data?.execPerformance || []}
              bars={[
                { key: "calls",     color: "#3b82f6", label: "Calls" },
                { key: "prospects", color: "#8b5cf6", label: "Prospects" },
                { key: "sales",     color: "#22c55e", label: "Sales" },
              ]}
              size={8}
              height={260}
            />
            <GDoughnutChart
              title="Lead Status Breakdown"
              subtitle="Team-wide distribution"
              data={data?.leadStatusBreakdown || []}
              colors={LEAD_STATUS_COLORS}
              size={4}
              height={260}
            />
          </>
        )}
      </DashGrid>
    </div>
  );
}
