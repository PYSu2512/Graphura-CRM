/**
 * ManagementEmployeeDashboard.jsx
 * Main dashboard for Management Employee.
 * All data sourced from real ProjectTask API.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Grid,
  Heading,
  EnhancedDashCard,
  DataTable,
  GColumnChart,
  GPieChart,
} from "../../../components/shared/Common_Components.jsx";
import {
  FolderOpen, Activity, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { fetchStats, fetchTasks } from "./projects/employeeTasksApi";
import toast from "react-hot-toast";

// ── helpers ───────────────────────────────────────────────────────────────────
function deadlineBucket(deadline) {
  if (!deadline) return "No Deadline";
  const d   = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - now) / 86400000);
  if (diff < 0)   return "Overdue";
  if (diff <= 7)  return "This Week";
  if (diff <= 30) return "This Month";
  return "Future";
}

function StatusPill({ status }) {
  const map = {
    "Completed":   { bg: "#dcfce7", color: "#16a34a" },
    "In Progress": { bg: "#dbeafe", color: "#2563eb" },
    "Review":      { bg: "#fef3c7", color: "#d97706" },
    "Not Started": { bg: "#f1f5f9", color: "#64748b" },
    "Delayed":     { bg: "#fee2e2", color: "#dc2626" },
  };
  const s = map[status] || map["Not Started"];
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}>{status}</span>
  );
}

const DEADLINE_COLS = [
  { key: "title",           label: "Task" },
  { key: "projectName",     label: "Project" },
  { key: "deadline",        label: "Deadline",
    render: (v, row) => <span className={row.bucket === "Overdue" ? "text-rose-600 font-bold" : ""}>{v || "—"}</span>,
  },
  { key: "progressPercent", label: "Progress",
    render: (v) => <span className="text-xs font-bold text-slate-700">{v}%</span>,
  },
  { key: "bucket",          label: "Bucket" },
  { key: "status",          label: "Status", render: (v) => <StatusPill status={v} /> },
];

const KPI_ICONS   = [<FolderOpen size={20}/>, <Activity size={20}/>, <CheckCircle2 size={20}/>, <AlertTriangle size={20}/>];
const KPI_ACCENTS = ["#3b82f6", "#14b8a6", "#22c55e", "#f59e0b"];

export default function ManagementEmployeeDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [tasks,     setTasks]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, tasksRes] = await Promise.all([
        fetchStats(),
        fetchTasks(),
      ]);
      setStatsData(statsRes.data?.data || null);
      setTasks(tasksRes.data?.data?.tasks || []);
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats     = statsData?.stats     || {};
  const statusMix = statsData?.statusMix || [];
  const weeklyTrend = statsData?.weeklyTrend || [];

  const kpis = [
    { title: "My Tasks",    value: loading ? "—" : String(stats.totalTasks  || 0) },
    { title: "Active",      value: loading ? "—" : String(stats.activeTasks || 0) },
    { title: "Completed",   value: loading ? "—" : String(stats.completed   || 0) },
    { title: "Overdue",     value: loading ? "—" : String(stats.overdue     || 0) },
  ];

  // Upcoming deadlines — active tasks sorted by deadline
  const upcomingDeadlines = useMemo(() =>
    tasks
      .filter((t) => t.status !== "Completed")
      .map((t) => ({ ...t, bucket: deadlineBucket(t.deadline) }))
      .sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline < b.deadline ? -1 : 1;
      })
      .slice(0, 10),
    [tasks],
  );

  // Get user name from first task's TL info (just for greeting)
  const firstName = "there";

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <Grid cols={12} gap={4}>
        <Heading
          primaryText={`Hi,`}
          secondaryText={`${stats.totalTasks || 0} tasks · ${stats.totalProjects || 0} projects`}
          size={12}
        />
      </Grid>

      {/* KPI Cards */}
      <Grid cols={12} gap={4}>
        {kpis.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </Grid>

      {/* Charts */}
      <Grid cols={12} gap={4}>
        <GPieChart
          title="My Task Status Mix"
          subtitle="Current distribution across all your tasks"
          data={statusMix}
          colors={["#94a3b8","#f59e0b","#0ea5e9","#22c55e","#f43f5e"]}
          size={5}
          height={300}
        />
        <GColumnChart
          title="Weekly Completions"
          subtitle="Tasks completed per week (last 8 weeks)"
          data={weeklyTrend}
          bars={[{ key: "completed", label: "Completed", color: "#3b82f6" }]}
          size={7}
          height={300}
        />
      </Grid>

      {/* Upcoming deadlines */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Upcoming Task Deadlines"
          columns={DEADLINE_COLS}
          rows={upcomingDeadlines}
          size={12}
          pageSize={6}
          searchable
          loading={loading}
          filters={[
            { title: "Bucket", type: "toggle", key: "bucket", options: ["Overdue","This Week","This Month","Future"] },
            { title: "Status", type: "toggle", key: "status", options: ["Not Started","In Progress","Review","Delayed"] },
          ]}
        />
      </Grid>
    </div>
  );
}
