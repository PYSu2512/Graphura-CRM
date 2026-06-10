/**
 * ManagementTeamLeaderDashboard.jsx
 * Fully dynamic — data from /api/management-tl/dashboard
 */

import { useState, useEffect, useCallback } from "react";
import {
  Grid, Heading, EnhancedDashCard, DataTable,
  GColumnChart, GPieChart,
  Button, openModal, closeModal, Modal, ModalProfile, ModalGrid, ModalData,
} from "../../../components/shared/Common_Components";
import {
  Briefcase, CheckCircle, Clock, AlertTriangle, ListTodo, Eye,
} from "lucide-react";
import apiClient from "../../../services/apiClient";
import toast from "react-hot-toast";

// ── helpers ───────────────────────────────────────────────────────────────────
const getAvatarColor = (name = "") => {
  const colors = ["#6366f1","#3b82f6","#22c55e","#f97316","#ec4899","#14b8a6","#a855f7","#eab308"];
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};
const getInitials = (n = "") => n.split(" ").map((w) => w[0]).join("").slice(0,2).toUpperCase();

function StatusPill({ status }) {
  const map = {
    "Completed":   { bg: "#dcfce7", color: "#16a34a" },
    "In Progress": { bg: "#dbeafe", color: "#2563eb" },
    "Review":      { bg: "#fef3c7", color: "#d97706" },
    "Not Started": { bg: "#f1f5f9", color: "#64748b" },
    "Delayed":     { bg: "#fee2e2", color: "#dc2626" },
  };
  const s = map[status] || map["Not Started"];
  return <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold" style={{ background: s.bg, color: s.color }}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const map = {
    Critical: { bg:"#fef2f2", color:"#dc2626", border:"#fecaca" },
    High:     { bg:"#fff7ed", color:"#ea580c", border:"#fed7aa" },
    Medium:   { bg:"#fffbeb", color:"#d97706", border:"#fde68a" },
    Low:      { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
  };
  const s = map[priority] || map["Medium"];
  return <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border" style={{ background:s.bg, color:s.color, borderColor:s.border }}>{priority}</span>;
}

function AvatarCell({ name }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-black flex-shrink-0" style={{ background: getAvatarColor(name) }}>
        {getInitials(name)}
      </div>
      <span className="text-xs font-semibold text-slate-800">{name}</span>
    </div>
  );
}

const countBadge = (v, cls) => (
  <span className={`inline-flex min-w-[1.75rem] justify-center px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{v}</span>
);

export default function ManagementTeamLeaderDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [selTask, setSelTask] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/management-tl/dashboard");
      setData(res.data?.data || null);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = data ? [
    { title: "Total Projects",    value: String(data.kpis.totalProjects), icon: <Briefcase size={20}/>, accent: "#3b82f6" },
    { title: "Total Tasks",       value: String(data.kpis.total),         icon: <ListTodo size={20}/>,  accent: "#6366f1" },
    { title: "Completed Tasks",   value: String(data.kpis.completed),     icon: <CheckCircle size={20}/>,accent: "#10b981" },
    { title: "Delayed / Overdue", value: String(data.kpis.delayed + data.kpis.overdue), icon: <AlertTriangle size={20}/>, accent: "#ef4444" },
  ] : Array(4).fill({ title: "—", value: "—", icon: <Clock size={20}/>, accent: "#94a3b8" });

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-8 pb-10">
      <Grid cols={12} gap={4}>
        <Heading primaryText="Team Leader" secondaryText="Dashboard" size={12} />
      </Grid>

      {/* KPIs */}
      <Grid cols={12} gap={4}>
        {kpis.map((k, i) => (
          <EnhancedDashCard key={i} title={k.title} value={loading ? "—" : k.value}
            icon={k.icon} accentColor={k.accent} size={3} />
        ))}
      </Grid>

      {/* Charts */}
      {data && (
        <Grid cols={12} gap={4}>
          <GColumnChart
            title="Task Completion by Project"
            subtitle="Completed vs remaining tasks per project"
            data={data.projectTaskBreakdown}
            bars={[
              { key: "completed", label: "Completed", color: "#22c55e" },
              { key: "remaining", label: "Remaining",  color: "#f59e0b" },
            ]}
            size={8} height={320}
          />
          <GPieChart
            title="Task Status Distribution"
            subtitle="Current status across all tasks"
            data={data.taskStatusDistribution}
            colors={["#22c55e","#3b82f6","#94a3b8","#ef4444"]}
            size={4} height={320}
          />
        </Grid>
      )}

      {/* Upcoming tasks */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Upcoming Tasks"
          columns={[
            { key: "title",      label: "Task" },
            { key: "projectName",label: "Project" },
            { key: "assignee",   label: "Assignee", render: (v) => <AvatarCell name={v} /> },
            { key: "priority",   label: "Priority", render: (v) => <PriorityBadge priority={v} /> },
            { key: "deadline",   label: "Deadline",
              render: (v, row) => <span className={row.isOverdue ? "text-rose-600 font-bold" : ""}>{v || "—"}</span> },
            { key: "status",     label: "Status",   render: (v) => <StatusPill status={v} /> },
          ]}
          rows={data?.upcomingTasks || []}
          pageSize={5}
          searchable
          loading={loading}
          actions={[
            { icon: <Eye size={16}/>, tooltip: "View", variant: "ghost",
              onClick: (row) => { setSelTask(row); openModal("dash-task-modal"); } },
          ]}
          filters={[
            { title: "Status",   type: "toggle", key: "status",   options: ["Not Started","In Progress","Review","Delayed"] },
            { title: "Priority", type: "toggle", key: "priority", options: ["Critical","High","Medium","Low"] },
          ]}
        />
      </Grid>

      {/* Employee workload */}
      <Grid cols={12} gap={4}>
        <DataTable
          title="Employee Workload"
          columns={[
            { key: "name",       label: "Employee",    render: (v) => <AvatarCell name={v} /> },
            { key: "total",      label: "Total",       render: (v) => countBadge(v, "bg-slate-100 text-slate-600") },
            { key: "completed",  label: "Completed",   render: (v) => countBadge(v, "bg-emerald-100 text-emerald-700") },
            { key: "inProgress", label: "In Progress", render: (v) => countBadge(v, "bg-blue-100 text-blue-700") },
            { key: "delayed",    label: "Delayed",     render: (v) => countBadge(v, v > 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500") },
          ]}
          rows={data?.employeeWorkload || []}
          pageSize={5}
          loading={loading}
        />
      </Grid>

      {/* Task detail modal */}
      <Modal id="dash-task-modal" title="Task Details" size="lg">
        {selTask && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selTask.title} subtitle={selTask.description || "No description."}
              meta={`Project: ${selTask.projectName}  ·  Assigned: ${selTask.assignee}`} />
            <ModalGrid title="Details" cols={3}>
              <ModalData label="Status"   value={<StatusPill status={selTask.status} />} />
              <ModalData label="Priority" value={<PriorityBadge priority={selTask.priority} />} />
              <ModalData label="Deadline" value={selTask.deadline || "—"} />
              <ModalData label="Progress" value={`${selTask.progressPercent}%`} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" onClick={() => closeModal("dash-task-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
