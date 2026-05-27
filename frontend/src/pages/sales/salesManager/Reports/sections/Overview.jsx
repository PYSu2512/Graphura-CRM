import { useState, useEffect, useCallback } from "react";
import {
  Heading, DashGrid, EnhancedDashCard,
  GLineChart, GColumnChart, GDoughnutChart,
} from "../../../../../components/shared/Common_Components";
import { salesManagerReportsService } from "../../../../../services/salesManagerReportsService";
import {
  Users, Phone, TrendingUp, CheckCircle,
  Trash2, AlertCircle, BarChart2,
} from "lucide-react";

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />;
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
      <AlertCircle size={16} className="shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-medium underline">Retry</button>
      )}
    </div>
  );
}

const LEAD_STATUS_COLORS = ["#22c55e", "#8b5cf6", "#3b82f6", "#14b8a6", "#f43f5e", "#f59e0b"];

export default function Overview() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await salesManagerReportsService.getOverview();
      setData(result);
    } catch (err) {
      setError(err?.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // KPI definitions — NO revenue
  const kpiDefs = data
    ? [
        { title: "Total Leads",       value: String(data.kpis.totalLeads),       icon: <Users size={22}/>,       accent: "#3b82f6", size: 3 },
        { title: "Total Calls",       value: String(data.kpis.totalCalls),       icon: <Phone size={22}/>,       accent: "#14b8a6", size: 3 },
        { title: "Total Prospects",   value: String(data.kpis.totalProspects),   icon: <TrendingUp size={22}/>,  accent: "#8b5cf6", size: 3 },
        { title: "Total Sales",       value: String(data.kpis.totalSales),       icon: <CheckCircle size={22}/>, accent: "#22c55e", size: 3 },
        { title: "Dump Leads",        value: String(data.kpis.dumpLeads),        icon: <Trash2 size={22}/>,      accent: "#f43f5e", size: 4 },
        { title: "Missed Follow-ups", value: String(data.kpis.missedFollowUps),  icon: <AlertCircle size={22}/>, accent: "#ef4444", size: 4 },
        { title: "Conversion Rate",   value: `${data.kpis.conversionRate}%`,     icon: <BarChart2 size={22}/>,   accent: "#10b981", size: 4 },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Reports" secondaryText="Overview" size={12} />
      </DashGrid>

      {error && (
        <DashGrid cols={12} gap={4}>
          <div className="col-span-12"><ErrorBanner message={error} onRetry={fetchData} /></div>
        </DashGrid>
      )}

      {/* ── KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={i < 4 ? "col-span-3" : "col-span-4"}>
                <Skeleton className="h-24 w-full" />
              </div>
            ))
          : kpiDefs.map((k) => (
              <EnhancedDashCard
                key={k.title}
                title={k.title}
                value={k.value}
                icon={k.icon}
                accentColor={k.accent}
                size={k.size}
              />
            ))}
      </DashGrid>

      {/* ── Charts Row 1: Calls vs Sales + Leads vs Prospects ── */}
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
              subtitle="Weekly team-wide trend"
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
              subtitle="Weekly team-wide trend"
              data={data?.leadsVsProspects || []}
              lines={[
                { key: "leads",     color: "#8b5cf6", label: "Leads"     },
                { key: "prospects", color: "#f59e0b", label: "Prospects" },
              ]}
              size={6}
              height={260}
            />
          </>
        )}
      </DashGrid>

      {/* ── Charts Row 2: Team Performance + Lead Status (NO revenue chart) ── */}
      <DashGrid cols={12} gap={4}>
        {loading ? (
          <>
            <div className="col-span-8"><Skeleton className="h-64 w-full" /></div>
            <div className="col-span-4"><Skeleton className="h-64 w-full" /></div>
          </>
        ) : (
          <>
            <GColumnChart
              title="Team Performance Comparison"
              subtitle="Calls, Prospects & Sales per team"
              data={data?.teamPerfComparison || []}
              bars={[
                { key: "calls",     color: "#3b82f6", label: "Calls"     },
                { key: "prospects", color: "#8b5cf6", label: "Prospects" },
                { key: "sales",     color: "#22c55e", label: "Sales"     },
              ]}
              size={8}
              height={260}
            />
            <GDoughnutChart
              title="Lead Status Breakdown"
              subtitle="All teams combined"
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
