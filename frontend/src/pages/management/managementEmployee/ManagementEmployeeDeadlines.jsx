/**
 * ManagementEmployeeDeadlines.jsx
 * Shows task deadlines grouped by bucket (Overdue / This Week / This Month / Future).
 * Data sourced from real ProjectTask records assigned to this employee.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Grid,
  Heading,
  DashGrid,
  EnhancedDashCard,
  DataTable,
} from "../../../components/shared/Common_Components.jsx";
import { AlertTriangle, CalendarClock, CalendarDays, Clock } from "lucide-react";
import { fetchTasks } from "./projects/employeeTasksApi";
import toast from "react-hot-toast";

function deadlineBucket(deadline) {
  if (!deadline) return "No Deadline";
  const d    = new Date(deadline);
  const now  = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - now) / 86400000);
  if (diff < 0)   return "Overdue";
  if (diff <= 7)  return "This Week";
  if (diff <= 30) return "This Month";
  return "Future";
}

function PriorityBadge({ priority }) {
  const map = {
    Critical: { bg: "#fef2f2", color: "#dc2626" },
    High:     { bg: "#fff7ed", color: "#ea580c" },
    Medium:   { bg: "#fffbeb", color: "#d97706" },
    Low:      { bg: "#f0fdf4", color: "#16a34a" },
  };
  const s = map[priority] || map["Medium"];
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold"
      style={{ background: s.bg, color: s.color }}>{priority}</span>
  );
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

function BucketBadge({ bucket }) {
  const map = {
    "Overdue":    { bg: "#fee2e2", color: "#dc2626" },
    "This Week":  { bg: "#fef3c7", color: "#d97706" },
    "This Month": { bg: "#dbeafe", color: "#2563eb" },
    "Future":     { bg: "#f1f5f9", color: "#64748b" },
    "No Deadline":{ bg: "#f1f5f9", color: "#94a3b8" },
  };
  const s = map[bucket] || map["Future"];
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}>{bucket}</span>
  );
}

const COLS = [
  { key: "title",       label: "Task" },
  { key: "projectName", label: "Project" },
  { key: "deadline",    label: "Deadline",
    render: (v, row) => (
      <span className={row.bucket === "Overdue" ? "text-rose-600 font-bold" : ""}>{v || "—"}</span>
    ),
  },
  { key: "progressPercent", label: "Progress",
    render: (v) => (
      <div className="flex items-center gap-2 min-w-[80px]">
        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${v}%`, background: v===100?"#22c55e":"#3b82f6" }} />
        </div>
        <span className="text-xs font-bold text-slate-600 w-7">{v}%</span>
      </div>
    ),
  },
  { key: "bucket",   label: "Bucket",   render: (v) => <BucketBadge bucket={v} /> },
  { key: "priority", label: "Priority", render: (v) => <PriorityBadge priority={v} /> },
  { key: "status",   label: "Task Status", render: (v) => <StatusPill status={v} /> },
];

const KPI_ICONS   = [<AlertTriangle size={20}/>, <Clock size={20}/>, <CalendarDays size={20}/>, <CalendarClock size={20}/>];
const KPI_ACCENTS = ["#f97316", "#f59e0b", "#3b82f6", "#94a3b8"];

export default function ManagementEmployeeDeadlines() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTasks();
      // Exclude completed tasks from deadlines view
      const active = (res.data?.data?.tasks || []).filter((t) => t.status !== "Completed");
      setTasks(active);
    } catch {
      toast.error("Failed to load deadlines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() =>
    tasks
      .map((t) => ({ ...t, bucket: deadlineBucket(t.deadline) }))
      .sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline < b.deadline ? -1 : 1;
      }),
    [tasks],
  );

  const kpis = useMemo(() => [
    { title: "Overdue",    value: String(rows.filter((r) => r.bucket === "Overdue").length) },
    { title: "This Week",  value: String(rows.filter((r) => r.bucket === "This Week").length) },
    { title: "This Month", value: String(rows.filter((r) => r.bucket === "This Month").length) },
    { title: "Future",     value: String(rows.filter((r) => r.bucket === "Future").length) },
  ], [rows]);

  return (
    <div>
      <Grid cols={12} gap={6}>
        <Heading primaryText="My" secondaryText="Deadlines" size={12} fontSize="2xl" />

        <div className="col-span-12">
          <DashGrid cols={12} gap={4}>
            {kpis.map((k, i) => (
              <EnhancedDashCard key={k.title} title={k.title} value={loading ? "—" : k.value}
                icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
            ))}
          </DashGrid>
        </div>

        <div className="col-span-12">
          <DataTable
            title="Upcoming Deadlines"
            columns={COLS}
            rows={rows}
            pageSize={10}
            searchable
            exportable
            exportFileName="my_deadlines"
            loading={loading}
            filters={[
              { title: "Bucket",   type: "toggle", key: "bucket",   options: ["Overdue","This Week","This Month","Future","No Deadline"] },
              { title: "Priority", type: "toggle", key: "priority", options: ["Critical","High","Medium","Low"] },
              { title: "Status",   type: "toggle", key: "status",   options: ["Not Started","In Progress","Review","Delayed"] },
            ]}
          />
        </div>
      </Grid>
    </div>
  );
}
