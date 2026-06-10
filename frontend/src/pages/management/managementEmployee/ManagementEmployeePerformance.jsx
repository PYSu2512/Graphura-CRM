/**
 * ManagementEmployeePerformance.jsx
 * Real performance metrics from ProjectTask data:
 *   - KPI cards: Total Tasks / Completed / Active / Avg Progress
 *   - Status mix pie chart
 *   - Weekly completion trend line chart
 */

import { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Heading,
  DashGrid,
  EnhancedDashCard,
  GLineChart,
  GPieChart,
} from "../../../components/shared/Common_Components.jsx";
import { FolderOpen, CheckCircle2, Activity, TrendingUp } from "lucide-react";
import { fetchStats } from "./projects/employeeTasksApi";
import toast from "react-hot-toast";

const KPI_ICONS   = [<FolderOpen size={20}/>, <CheckCircle2 size={20}/>, <Activity size={20}/>, <TrendingUp size={20}/>];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#14b8a6", "#8b5cf6"];

const STATUS_COLORS = ["#94a3b8", "#f59e0b", "#0ea5e9", "#22c55e", "#f43f5e"];

export default function ManagementEmployeePerformance() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchStats();
      setData(res.data?.data || null);
    } catch {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats      = data?.stats      || {};
  const statusMix  = data?.statusMix  || [];
  const weeklyTrend= data?.weeklyTrend|| [];

  const onTimePct = stats.completed > 0
    ? `${Math.round((stats.completed / (stats.totalTasks || 1)) * 100)}%`
    : "—";

  const kpis = [
    { title: "Total Tasks",   value: loading ? "—" : String(stats.totalTasks  || 0) },
    { title: "Completed",     value: loading ? "—" : String(stats.completed   || 0) },
    { title: "Active",        value: loading ? "—" : String(stats.activeTasks || 0) },
    { title: "Avg Progress",  value: loading ? "—" : `${stats.avgProgress || 0}%` },
  ];

  return (
    <div>
      <Grid cols={12} gap={6}>
        <Heading primaryText="My" secondaryText="Performance" size={12} fontSize="2xl" />

        <div className="col-span-12">
          <DashGrid cols={12} gap={4}>
            {kpis.map((k, i) => (
              <EnhancedDashCard key={k.title} title={k.title} value={k.value}
                icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
            ))}
          </DashGrid>
        </div>

        {/* Completion trend */}
        <GLineChart
          title="Weekly Task Completions"
          subtitle="Tasks completed per week (last 8 weeks)"
          data={weeklyTrend}
          lines={[{ key: "completed", label: "Completed", color: "#2a465a" }]}
          size={7}
          height={300}
        />

        {/* Status mix */}
        <GPieChart
          title="My Task Status Mix"
          subtitle="Current status distribution"
          data={statusMix}
          colors={STATUS_COLORS}
          size={5}
          height={300}
        />

        {/* Summary detail cards */}
        {!loading && (
          <div className="col-span-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Not Started", value: stats.notStarted || 0, color: "#94a3b8" },
                { label: "In Progress", value: stats.activeTasks  || 0, color: "#3b82f6" },
                { label: "Completed",   value: stats.completed   || 0, color: "#22c55e" },
                { label: "Delayed",     value: stats.delayed     || 0, color: "#ef4444" },
                { label: "Overdue",     value: stats.overdue     || 0, color: "#f97316" },
                { label: "Projects",    value: stats.totalProjects|| 0, color: "#8b5cf6" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                  <span className="text-2xl font-black" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Grid>
    </div>
  );
}
