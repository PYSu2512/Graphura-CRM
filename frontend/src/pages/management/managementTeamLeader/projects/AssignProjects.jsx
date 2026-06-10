/**
 * AssignProjects.jsx → "My Projects" Tab
 * Fetches real projects assigned to this TL from the backend.
 * Edit action → opens an inline progress detail panel (no more task-status dropdown modal).
 */

import { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Button,
  DataTable,
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  openModal,
  closeModal,
} from "../../../../components/shared/Common_Components";
import { Eye, CheckCircle2, AlertTriangle, ListTodo, Clock, TrendingUp } from "lucide-react";
import { fetchMyProjects } from "./tlProjectsApi";
import toast from "react-hot-toast";

// ── helpers ───────────────────────────────────────────────────────────────────
const getAvatarColor = (name = "") => {
  const colors = ["#6366f1","#3b82f6","#22c55e","#f97316","#ec4899","#14b8a6","#a855f7","#eab308"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// ── Sub-components ────────────────────────────────────────────────────────────
function ProgressBar({ value }) {
  const color = value === 100 ? "#22c55e" : value > 0 ? "#3b82f6" : "#94a3b8";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: `linear-gradient(90deg,#2a465a,${color})` }}
        />
      </div>
      <span className="text-xs font-bold text-[#2a465a] w-8 text-right">{value}%</span>
    </div>
  );
}

function TaskBadge({ stats }) {
  const { completed = 0, total = 0 } = stats || {};
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{
        background: completed === total && total > 0 ? "#dcfce7" : "#f1f5f9",
        color:      completed === total && total > 0 ? "#16a34a" : "#475569",
      }}
    >
      <CheckCircle2 size={11} />
      {completed}/{total}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    "Completed":    { bg: "#dcfce7", color: "#16a34a" },
    "Delivered":    { bg: "#d1fae5", color: "#059669" },
    "In Progress":  { bg: "#dbeafe", color: "#2563eb" },
    "Work Started": { bg: "#ede9fe", color: "#7c3aed" },
    "Not Started":  { bg: "#f1f5f9", color: "#64748b" },
    "Delayed":      { bg: "#fee2e2", color: "#dc2626" },
    "Review Stage": { bg: "#fef3c7", color: "#d97706" },
    "Finalization": { bg: "#fce7f3", color: "#db2777" },
  };
  const s = map[status] || map["Not Started"];
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const map = {
    Critical: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    High:     { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
    Medium:   { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    Low:      { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  };
  const s = map[priority] || map["Medium"];
  return (
    <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {priority}
    </span>
  );
}

// ── Task status pill (for modal task list) ────────────────────────────────────
const TASK_STATUS_STYLE = {
  "Completed":   { bg: "#dcfce7", color: "#16a34a" },
  "In Progress": { bg: "#dbeafe", color: "#2563eb" },
  "Review":      { bg: "#fef3c7", color: "#d97706" },
  "Not Started": { bg: "#f1f5f9", color: "#64748b" },
  "Delayed":     { bg: "#fee2e2", color: "#dc2626" },
};
function TaskStatusPill({ status }) {
  const s = TASK_STATUS_STYLE[status] || TASK_STATUS_STYLE["Not Started"];
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

// ── Table columns ─────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "name",     label: "Project Name" },
  { key: "priority", label: "Priority",    render: (v) => <PriorityBadge priority={v} /> },
  { key: "deadline", label: "Deadline" },
  { key: "taskStats",label: "Tasks",       render: (v) => <TaskBadge stats={v} /> },
  { key: "progressPercent", label: "Progress", render: (v) => <ProgressBar value={v} />, sortValue: (row) => row.progressPercent },
  { key: "status",   label: "Status",      render: (v) => <StatusPill status={v} /> },
];

const TASK_COLS = [
  {
    key: "assignee", label: "Assignee",
    render: (v) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-black"
          style={{ background: getAvatarColor(v) }}>
          {getInitials(v)}
        </div>
        <span className="text-xs font-semibold">{v}</span>
      </div>
    ),
  },
  { key: "title",    label: "Task" },
  { key: "priority", label: "Priority", render: (v) => <PriorityBadge priority={v} /> },
  { key: "deadline", label: "Deadline" },
  { key: "progressPercent", label: "Progress %", render: (v) => <span className="text-xs font-bold text-[#2a465a]">{v}%</span> },
  { key: "status",   label: "Status",   render: (v) => <TaskStatusPill status={v} /> },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AssignProjects() {
  const [projects, setProjects] = useState([]);
  const [stats,    setStats]    = useState({ total: 0, active: 0, completed: 0, delayed: 0, totalTasks: 0 });
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null); // project for detail modal

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMyProjects();
      setProjects(res.data?.data?.projects || []);
      setStats(res.data?.data?.stats || {});
    } catch (err) {
      toast.error(err?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleView = (row) => {
    setSelected(row);
    openModal("tl-project-detail-modal");
  };

  // Derived summary stats for the badge bar
  const totalTasks    = stats.totalTasks ?? projects.reduce((s, p) => s + (p.taskStats?.total || 0), 0);
  const inProgTasks   = projects.reduce((s, p) => s + (p.taskStats?.inProgress || 0), 0);
  const doneTasks     = projects.reduce((s, p) => s + (p.taskStats?.completed  || 0), 0);
  const delayedTasks  = projects.reduce((s, p) => s + (p.taskStats?.delayed    || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-lg font-black text-[#2a465a]">My Projects</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Overview of all projects assigned to your team with task completion status
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: `${totalTasks} Tasks`,   icon: <ListTodo size={13} />, bg: "#dbeafe", color: "#2563eb", border: "#bfdbfe" },
            { label: `${inProgTasks} Active`, icon: <Clock size={13} />,    bg: "#cffafe", color: "#0891b2", border: "#a5f3fc" },
            { label: `${doneTasks} Done`,     icon: <CheckCircle2 size={13} />, bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
            ...(delayedTasks > 0 ? [{ label: `${delayedTasks} Delayed`, icon: <AlertTriangle size={13} />, bg: "#fee2e2", color: "#dc2626", border: "#fecaca" }] : []),
          ].map(({ label, icon, bg, color, border }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold"
              style={{ background: bg, color, borderColor: border }}>
              {icon} {label}
            </div>
          ))}
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        rows={projects}
        pageSize={5}
        pageSizeOptions={[5, 10, 20]}
        searchable
        loading={loading}
        filters={[
          { title: "Status",   type: "toggle", key: "status",   options: ["Not Started","Work Started","In Progress","Review Stage","Finalization","Completed","Delivered","Delayed"] },
          { title: "Priority", type: "toggle", key: "priority", options: ["Critical","High","Medium","Low"] },
        ]}
        actions={[
          { icon: <Eye size={16} />, tooltip: "View Details", variant: "ghost", onClick: handleView },
        ]}
        exportable
        exportFileName="my-projects"
      />

      {/* Project Detail Modal */}
      <Modal id="tl-project-detail-modal" title="Project Details" size="xl">
        {selected && (
          <div className="flex flex-col gap-5">
            <ModalProfile
              name={selected.name}
              subtitle={selected.description || "No description."}
              meta={`Priority: ${selected.priority}  ·  Deadline: ${selected.deadline || "—"}  ·  Client: ${selected.clientName || "—"}`}
            />

            <ModalGrid title="Overview" cols={4}>
              <ModalData label="Status"   value={<StatusPill status={selected.status} />} />
              <ModalData label="Progress" value={<ProgressBar value={selected.progressPercent} />} />
              <ModalData label="Tasks"    value={`${selected.taskStats?.completed}/${selected.taskStats?.total} done`} />
              <ModalData label="Delayed"  value={<span className={selected.taskStats?.delayed > 0 ? "text-rose-600 font-bold" : ""}>{selected.taskStats?.delayed} delayed</span>} />
            </ModalGrid>

            {/* Task breakdown inside modal */}
            {selected.tasks?.length > 0 ? (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Task Breakdown</p>

                {/* Mini progress bars per assignee */}
                <div className="flex flex-col gap-2 mb-4">
                  {selected.tasks.map((t) => (
                    <div key={t.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-slate-50 border-slate-100">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0"
                        style={{ background: getAvatarColor(t.assignee) }}>
                        {getInitials(t.assignee)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#2a465a] truncate">{t.title}</span>
                          <TaskStatusPill status={t.status} />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-500">{t.assignee}</span>
                          <span className="text-slate-300">·</span>
                          <PriorityBadge priority={t.priority} />
                          <span className="text-slate-300">·</span>
                          <span className="text-[10px] text-slate-500">Due: {t.deadline || "—"}</span>
                        </div>
                        <div className="mt-1.5">
                          <ProgressBar value={t.progressPercent} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-slate-400">
                <ListTodo size={28} strokeWidth={1.5} />
                <p className="text-xs font-semibold mt-2">No tasks yet. Use "Assign Tasks" tab to add tasks.</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button text="Close" variant="ghost" onClick={() => closeModal("tl-project-detail-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
