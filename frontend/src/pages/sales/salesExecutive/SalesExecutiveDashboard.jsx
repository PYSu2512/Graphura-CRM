import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  PhoneCall,
  TrendingUp,
  Clock,
  Trash2,
  Calendar,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  EnhancedDashCard,
  DataTable,
  Heading,
  Grid,
  DashGrid,
  GLineChart,
  GBarChart,
  GDoughnutChart,
} from "../../../components/shared/Common_Components";
import {
  fetchDashboardSummary,
  fetchWeeklyTrend,
  fetchProspectDistribution,
  fetchCallsVsConversion,
  fetchDailyTarget,
  fetchRecentProspects,
  fetchUpcomingReminders,
} from "./api/dashboardApi";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

/** Colour bands for reminder border based on priority */
const REMINDER_BORDER = {
  High:   "border-rose-400",
  Medium: "border-amber-400",
  Low:    "border-blue-400",
};

/** Status badge colours for the prospect table */
const STATUS_BADGE = {
  UNTOUCHED:  "bg-slate-100 text-slate-600",
  TALK:       "bg-blue-100 text-blue-700",
  NOT_TALK:   "bg-orange-100 text-orange-700",
  INTERESTED: "bg-violet-100 text-violet-700",
  CONVERTED:  "bg-emerald-100 text-emerald-700",
  Won:        "bg-emerald-100 text-emerald-700",
  DUMP:       "bg-red-100 text-red-600",
};

const PRIORITY_BADGE = {
  High:   "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-slate-100 text-slate-600",
};

/** Skeleton shimmer block */
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

// ─────────────────────────────────────────────────────────────
// DAILY TARGET WIDGET
// ─────────────────────────────────────────────────────────────
const DailyTargetWidget = ({ data, loading, onViewReport }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full flex flex-col gap-6">
        <Skeleton className="h-6 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2.5 w-full" />
          </div>
        ))}
      </div>
    );
  }

  const { overallPercent = 0, hasTarget = false, targets = {} } = data || {};
  const calls     = targets.calls     || { target: 0, achieved: 0, percent: 0 };
  const prospects = targets.prospects || { target: 0, achieved: 0, percent: 0 };
  const reminders = targets.reminders || { target: 0, achieved: 0, percent: 0 };

  const pctColor = overallPercent >= 80
    ? "bg-emerald-50 text-emerald-600"
    : overallPercent >= 50
    ? "bg-amber-50 text-amber-600"
    : "bg-rose-50 text-rose-600";

  const bars = [
    { label: "Calls Made",          achieved: calls.achieved,     target: calls.target,     percent: calls.percent,     color: "bg-blue-500" },
    { label: "Prospects Converted", achieved: prospects.achieved, target: prospects.target, percent: prospects.percent, color: "bg-emerald-500" },
    { label: "Reminders Done",      achieved: reminders.achieved, target: reminders.target, percent: reminders.percent, color: "bg-purple-500" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full flex flex-col justify-between overflow-hidden relative group">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#2a465a]/5 rounded-full blur-3xl group-hover:bg-[#2a465a]/10 transition-colors duration-500" />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#2a465a]">Daily Target</h3>
          {hasTarget ? (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${pctColor}`}>
              {overallPercent}% Done
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">
              No Target Set
            </span>
          )}
        </div>

        <div className="space-y-6">
          {bars.map(({ label, achieved, target, percent, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                <span>{label}</span>
                <span>
                  {target > 0 ? `${achieved}/${target}` : achieved}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${color} rounded-full transition-all duration-700`}
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onViewReport}
        className="mt-8 w-full py-3 bg-[#2a465a] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1e3a52] transition-colors shadow-lg shadow-[#2a465a]/20"
      >
        View Full Report <ArrowRight size={16} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// UPCOMING REMINDERS WIDGET
// ─────────────────────────────────────────────────────────────
const UpcomingRemindersWidget = ({ reminders, loading, onViewAll }) => (
  <div className="bg-[#2a465a] rounded-3xl p-6 shadow-xl shadow-[#2a465a]/20 text-white relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-10">
      <Calendar size={80} />
    </div>
    <h3 className="text-lg font-bold mb-4 relative z-10">Upcoming Reminders</h3>

    {loading ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-l-2 border-white/20 pl-3 space-y-2">
            <div className="h-4 bg-white/20 rounded animate-pulse" />
            <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative z-10">
        {reminders.length === 0 && (
          <p className="text-sm text-slate-300 col-span-3">No upcoming reminders.</p>
        )}
        {reminders.map((r) => (
          <div
            key={r.id}
            className={`flex gap-3 items-start border-l-2 pl-3 ${REMINDER_BORDER[r.priority] || "border-blue-400"}`}
          >
            <div>
              <p className="text-sm font-bold leading-snug">{r.title}</p>
              <p className="text-xs text-slate-300 mt-0.5">{r.displayTime}</p>
              {r.clientName && r.clientName !== r.title && (
                <p className="text-xs text-slate-400 mt-0.5">{r.clientName}</p>
              )}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center">
          <button
            onClick={onViewAll}
            className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors"
          >
            View All Reminders
          </button>
        </div>
      </div>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────
const SalesExecutiveDashboard = () => {
  const navigate = useNavigate();

  // ── State ──
  const [summary,      setSummary]      = useState(null);
  const [weeklyTrend,  setWeeklyTrend]  = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [callsConv,    setCallsConv]    = useState(null);
  const [dailyTarget,  setDailyTarget]  = useState(null);
  const [prospects,    setProspects]    = useState([]);
  const [reminders,    setReminders]    = useState([]);
  const [prospectMeta, setProspectMeta] = useState({ total: 0, page: 1, pageSize: 5, totalPages: 1 });

  const [loading, setLoading] = useState({
    summary:      true,
    weeklyTrend:  true,
    distribution: true,
    callsConv:    true,
    dailyTarget:  true,
    prospects:    true,
    reminders:    true,
  });

  const [error, setError] = useState(null);

  // ── Fetch helpers ──
  const setLoad = (key, val) =>
    setLoading((prev) => ({ ...prev, [key]: val }));

  const loadSummary = useCallback(async () => {
    setLoad("summary", true);
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
    } catch (e) {
      setError(e?.message || "Failed to load summary");
    } finally {
      setLoad("summary", false);
    }
  }, []);

  const loadWeeklyTrend = useCallback(async () => {
    setLoad("weeklyTrend", true);
    try {
      const data = await fetchWeeklyTrend();
      // Transform to { name, leads, closed } shape for GLineChart
      const transformed = (data.labels || []).map((label, i) => ({
        name:   label,
        leads:  data.newProspects?.[i] ?? 0,
        closed: data.conversions?.[i]  ?? 0,
      }));
      setWeeklyTrend(transformed);
    } catch {
      setWeeklyTrend([]);
    } finally {
      setLoad("weeklyTrend", false);
    }
  }, []);

  const loadDistribution = useCallback(async () => {
    setLoad("distribution", true);
    try {
      const data = await fetchProspectDistribution();
      // Transform to { name, value } shape for GDoughnutChart
      const transformed = (data.distribution || []).map((d) => ({
        name:  d.label,
        value: d.count,
      }));
      setDistribution(transformed);
    } catch {
      setDistribution([]);
    } finally {
      setLoad("distribution", false);
    }
  }, []);

  const loadCallsConv = useCallback(async () => {
    setLoad("callsConv", true);
    try {
      const data = await fetchCallsVsConversion();
      // Transform to { name, calls, conversions } shape for GBarChart
      const transformed = (data.weeks || []).map((w) => ({
        name:        w.label,
        calls:       w.totalCalls,
        conversions: w.conversions,
      }));
      setCallsConv(transformed);
    } catch {
      setCallsConv([]);
    } finally {
      setLoad("callsConv", false);
    }
  }, []);

  const loadDailyTarget = useCallback(async () => {
    setLoad("dailyTarget", true);
    try {
      const data = await fetchDailyTarget();
      setDailyTarget(data);
    } catch {
      setDailyTarget(null);
    } finally {
      setLoad("dailyTarget", false);
    }
  }, []);

  const loadProspects = useCallback(async (page = 1, pageSize = 5) => {
    setLoad("prospects", true);
    try {
      const data = await fetchRecentProspects({ page, pageSize });
      setProspects(data.prospects || []);
      setProspectMeta(data.pagination || { total: 0, page, pageSize, totalPages: 1 });
    } catch {
      setProspects([]);
    } finally {
      setLoad("prospects", false);
    }
  }, []);

  const loadReminders = useCallback(async () => {
    setLoad("reminders", true);
    try {
      const data = await fetchUpcomingReminders(3);
      setReminders(data.reminders || []);
    } catch {
      setReminders([]);
    } finally {
      setLoad("reminders", false);
    }
  }, []);

  // ── Initial load — all in parallel ──
  useEffect(() => {
    loadSummary();
    loadWeeklyTrend();
    loadDistribution();
    loadCallsConv();
    loadDailyTarget();
    loadProspects();
    loadReminders();
  }, [
    loadSummary, loadWeeklyTrend, loadDistribution,
    loadCallsConv, loadDailyTarget, loadProspects, loadReminders,
  ]);

  // ── Derived values for KPI cards ──
  const kpiCards = [
    {
      title:       "Total Leads",
      value:       loading.summary ? "—" : String(summary?.totalLeads ?? 0),
      icon:        <Users />,
      accentColor: "#3b82f6",
    },
    {
      title:       "Today Calls",
      value:       loading.summary ? "—" : String(summary?.todayCalls ?? 0),
      icon:        <PhoneCall />,
      accentColor: "#8b5cf6",
    },
    {
      title:       "Conversion Rate",
      value:       loading.summary ? "—" : `${summary?.conversionRate ?? 0}%`,
      icon:        <TrendingUp />,
      accentColor: "#10b981",
    },
    {
      title:       "Pending Follow-ups",
      value:       loading.summary ? "—" : String(summary?.pendingFollowUps ?? 0),
      icon:        <Clock />,
      accentColor: "#ef4444",
    },
    {
      title:       "Dump Leads",
      value:       loading.summary ? "—" : String(summary?.dumpLeads ?? 0),
      icon:        <Trash2 />,
      accentColor: "#64748b",
    },
  ];

  // ── Table columns ──
  const columns = [
    { key: "name",         label: "Lead Name" },
    {
      key:    "status",
      label:  "Status",
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[row?.status] || "bg-slate-100 text-slate-600"}`}>
          {row?.status}
        </span>
      ),
    },
    { key: "executive",    label: "Executive" },
    { key: "lastActivity", label: "Last Activity" },
    {
      key:    "nextReminder",
      label:  "Next Reminder",
      render: (row) => (row?.nextReminder ? row.nextReminder : <span className="text-slate-400 text-xs">—</span>),
    },
    {
      key:    "priority",
      label:  "Priority",
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_BADGE[row?.priority] || "bg-slate-100 text-slate-600"}`}>
          {row?.priority}
        </span>
      ),
    },
  ];

  // ── Map API prospect rows → table rows (skip null/invalid entries)
  const tableRows = (prospects || []).filter(Boolean).map((p) => ({
    id:           p.id,
    name:         p.name,
    status:       p.status,
    executive:    p.executive,
    lastActivity: p.lastActivity,
    nextReminder: p.nextReminder,
    priority:     p.priority,
  }));

  // ── Refresh all ──
  const handleRefresh = () => {
    setError(null);
    loadSummary();
    loadWeeklyTrend();
    loadDistribution();
    loadCallsConv();
    loadDailyTarget();
    loadProspects();
    loadReminders();
  };

  return (
    <div className="p-1 space-y-8 animate-in fade-in duration-700">

      {/* HEADING + REFRESH */}
      <div>
        <Heading
          primaryText="Sales Executive"
          secondaryText=" Dashboard"
          showAnimations={true}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleRefresh}
            title="Refresh dashboard"
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#2a465a] transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
      </div>

      {/* GLOBAL ERROR BANNER */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl px-4 py-3 text-sm font-medium">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-rose-400 hover:text-rose-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── KPI CARDS (5 cards, no Revenue) ── */}
      <DashGrid cols={12} gap={4}>
        {kpiCards.map((card) => (
          <EnhancedDashCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            accentColor={card.accentColor}
            size={4}
          />
        ))}
      </DashGrid>

      {/* ── CHARTS ROW 1: Line Chart + Daily Target ── */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 lg:col-span-8">
          {loading.weeklyTrend ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-[380px] flex flex-col gap-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="flex-1 w-full mt-2" />
            </div>
          ) : (
            <GLineChart
              title="Weekly Prospect Trend"
              subtitle="Comparison of New Prospects vs Conversions"
              data={weeklyTrend || []}
              lines={[
                { key: "leads",  label: "New Prospects", color: "#3b82f6" },
                { key: "closed", label: "Conversions",   color: "#10b981" },
              ]}
              size={12}
              height={320}
            />
          )}
        </div>

        <div className="col-span-12 lg:col-span-4">
          <DailyTargetWidget
            data={dailyTarget}
            loading={loading.dailyTarget}
            onViewReport={() => navigate("prospects")}
          />
        </div>
      </Grid>

      {/* ── CHARTS ROW 2: Donut + Bar ── */}
      <Grid cols={12} gap={6}>
        <div className="col-span-12 lg:col-span-4">
          {loading.distribution ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-[340px] flex flex-col gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-52" />
              <div className="flex-1 flex items-center justify-center">
                <Skeleton className="h-44 w-44 rounded-full" />
              </div>
            </div>
          ) : (
            <GDoughnutChart
              title="Prospect Distribution"
              subtitle="By Current Interest Level"
              data={distribution || []}
              colors={["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"]}
              size={12}
              height={300}
            />
          )}
        </div>

        <div className="col-span-12 lg:col-span-8">
          {loading.callsConv ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 h-[340px] flex flex-col gap-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-56" />
              <Skeleton className="flex-1 w-full mt-2" />
            </div>
          ) : (
            <GBarChart
              title="Calls vs Conversion"
              subtitle="Weekly performance breakdown"
              data={callsConv || []}
              bars={[
                { key: "calls",       label: "Total Calls",  color: "#64748b" },
                { key: "conversions", label: "Conversions",  color: "#3b82f6" },
              ]}
              size={12}
              height={300}
            />
          )}
        </div>
      </Grid>

      {/* ── RECENT PROSPECT ACTIVITY TABLE ── */}
      {loading.prospects ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <Skeleton className="h-6 w-56" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          title="Recent Prospect Activity"
          columns={columns}
          rows={tableRows}
          pageSize={prospectMeta.pageSize}
          searchable={true}
          size={12}
          filters={[
            {
              title:   "Status",
              type:    "toggle",
              key:     "status",
              options: ["UNTOUCHED", "TALK", "NOT_TALK", "INTERESTED", "CONVERTED"],
            },
            {
              title:   "Priority",
              type:    "toggle",
              key:     "priority",
              options: ["Low", "Medium", "High"],
            },
          ]}
        />
      )}

      {/* ── UPCOMING REMINDERS ── */}
      <Grid cols={12}>
        <div className="col-span-12">
          <UpcomingRemindersWidget
            reminders={reminders}
            loading={loading.reminders}
            onViewAll={() => navigate("leads")}
          />
        </div>
      </Grid>

    </div>
  );
};

export default SalesExecutiveDashboard;
