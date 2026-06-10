/**
 * UpdateProjectProgress.jsx → "Task Board" Tab
 * Shows ALL tasks across ALL projects.
 * Edit action opens a modal with:
 *   - Status dropdown
 *   - Progress % slider
 *   - Optional note
 * No redundant "task-status only" approach — TL controls both status + progress.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Grid,
  DataField,
  SelectField,
  Option,
  Button,
  DataTable,
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  openModal,
  closeModal,
} from "../../../../components/shared/Common_Components";
import { Eye, PencilLine, CheckCircle2, Clock, AlertTriangle, ListTodo, RefreshCw } from "lucide-react";
import { fetchAllTasks, updateTask } from "./tlProjectsApi";
import toast from "react-hot-toast";

const TASK_STATUSES = ["Not Started", "In Progress", "Review", "Completed", "Delayed"];

// ── helpers ───────────────────────────────────────────────────────────────────
const getAvatarColor = (name = "") => {
  const colors = ["#6366f1","#3b82f6","#22c55e","#f97316","#ec4899","#14b8a6","#a855f7","#eab308"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};
const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// ── UI atoms ──────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  "Completed":   { bg: "#dcfce7", color: "#16a34a" },
  "In Progress": { bg: "#dbeafe", color: "#2563eb" },
  "Review":      { bg: "#fef3c7", color: "#d97706" },
  "Not Started": { bg: "#f1f5f9", color: "#64748b" },
  "Delayed":     { bg: "#fee2e2", color: "#dc2626" },
};
function StatusPill({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE["Not Started"];
  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, color: s.color }}>{status}</span>
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
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>{priority}</span>
  );
}

function AvatarCell({ name }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-black"
        style={{ background: getAvatarColor(name) }}>
        {getInitials(name)}
      </div>
      <span className="text-xs font-semibold text-slate-800">{name}</span>
    </div>
  );
}

// ── Progress slider ───────────────────────────────────────────────────────────
function ProgressSlider({ value, onChange }) {
  const color = value === 100 ? "#22c55e" : value > 50 ? "#3b82f6" : value > 0 ? "#f59e0b" : "#94a3b8";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Progress %</label>
        <span className="text-sm font-black" style={{ color }}>{value}%</span>
      </div>
      <input
        type="range" min={0} max={100} step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
      </div>
    </div>
  );
}

// ── Table columns ─────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "title",       label: "Task" },
  { key: "projectName", label: "Project" },
  { key: "assignee",    label: "Assignee",  render: (v) => <AvatarCell name={v} /> },
  { key: "priority",    label: "Priority",  render: (v) => <PriorityBadge priority={v} /> },
  { key: "deadline",    label: "Deadline" },
  {
    key: "progressPercent", label: "Progress",
    render: (v) => (
      <div className="flex items-center gap-2 min-w-[80px]">
        <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${v}%`, background: v === 100 ? "#22c55e" : "#3b82f6" }} />
        </div>
        <span className="text-xs font-bold text-slate-600 w-6">{v}%</span>
      </div>
    ),
  },
  { key: "status",      label: "Status",    render: (v) => <StatusPill status={v} /> },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function UpdateProjectProgress() {
  const [tasks,    setTasks]   = useState([]);
  const [projects, setProjects]= useState([]);
  const [stats,    setStats]   = useState({ total:0, inProgress:0, completed:0, delayed:0 });
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);

  const [viewTask,   setViewTask]   = useState(null);
  const [editTask,   setEditTask]   = useState(null);
  const [editForm,   setEditForm]   = useState({ status: "", progressPercent: 0, statusNote: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAllTasks();
      setTasks(res.data?.data?.tasks    || []);
      setStats(res.data?.data?.stats    || {});
      setProjects(res.data?.data?.projects || []);
    } catch {
      toast.error("Failed to load task board");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleView = (row) => {
    setViewTask(row);
    openModal("tb-task-view-modal");
  };

  const handleEdit = (row) => {
    setEditTask(row);
    setEditForm({ status: row.status, progressPercent: row.progressPercent, statusNote: row.statusNote || "" });
    openModal("tb-task-edit-modal");
  };

  const handleSave = async () => {
    if (!editTask) return;
    setSaving(true);
    try {
      await updateTask(editTask.id, {
        status:          editForm.status,
        progressPercent: editForm.progressPercent,
        statusNote:      editForm.statusNote,
      });
      toast.success(`Task "${editTask.title}" updated`);
      closeModal("tb-task-edit-modal");
      setEditTask(null);
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const STAT_BADGES = [
    { label: `${stats.total} Total`,       icon: <ListTodo size={13} />,     bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" },
    { label: `${stats.inProgress} In Progress`, icon: <Clock size={13} />,   bg: "#dbeafe", color: "#2563eb", border: "#bfdbfe" },
    { label: `${stats.completed} Completed`, icon: <CheckCircle2 size={13} />,bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
    { label: `${stats.delayed} Delayed`,   icon: <AlertTriangle size={13} />, bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-lg font-black text-[#2a465a]">Task Board</p>
          <p className="text-xs text-slate-400 mt-0.5">View and manage all tasks across all projects</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {STAT_BADGES.map(({ label, icon, bg, color, border }) => (
            <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold"
              style={{ background: bg, color, borderColor: border }}>
              {icon} {label}
            </div>
          ))}
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:text-[#2a465a] hover:bg-slate-100 transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <DataTable
        title="All Tasks"
        columns={COLUMNS}
        rows={tasks}
        pageSize={8}
        pageSizeOptions={[5, 8, 15, 25]}
        searchable
        loading={loading}
        filters={[
          { title: "Project",  type: "toggle", key: "projectName", options: projects.map((p) => p.name) },
          { title: "Status",   type: "toggle", key: "status",      options: ["Not Started","In Progress","Review","Completed","Delayed"] },
          { title: "Priority", type: "toggle", key: "priority",    options: ["Critical","High","Medium","Low"] },
        ]}
        actions={[
          { icon: <Eye size={15} />,        tooltip: "View Details", variant: "ghost",   onClick: handleView },
          { icon: <PencilLine size={15} />, tooltip: "Edit Status",  variant: "primary", onClick: handleEdit },
        ]}
        exportable
        exportFileName="task-board"
      />

      {/* View Modal */}
      <Modal id="tb-task-view-modal" title="Task Details" size="lg">
        {viewTask && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewTask.title}
              subtitle={viewTask.description || "No description provided."}
              meta={`Project: ${viewTask.projectName}  ·  Assigned to: ${viewTask.assignee}`}
            />
            <ModalGrid title="Details" cols={3}>
              <ModalData label="Status"   value={<StatusPill status={viewTask.status} />} />
              <ModalData label="Priority" value={<PriorityBadge priority={viewTask.priority} />} />
              <ModalData label="Deadline" value={viewTask.deadline || "—"} />
              <ModalData label="Progress" value={`${viewTask.progressPercent}%`} />
              <ModalData label="Assignee" value={viewTask.assignee} />
              {viewTask.statusNote && <ModalData label="Last Note" value={viewTask.statusNote} />}
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" onClick={() => closeModal("tb-task-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal — status + progress slider + note */}
      <Modal id="tb-task-edit-modal" title="Update Task" size="md">
        {editTask && (
          <div className="flex flex-col gap-5">
            {/* Task context strip */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <p className="text-sm font-black text-[#2a465a]">{editTask.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {editTask.projectName}  ·  Assigned to: {editTask.assignee}  ·  Due: {editTask.deadline || "—"}
              </p>
            </div>

            {/* Status */}
            <Grid cols={12} gap={4}>
              <SelectField
                label="Status"
                id="tb-edit-status"
                size={12}
                placeholder="Select status..."
                value={editForm.status}
                onChange={(e) => {
                  const s = e.target.value;
                  setEditForm((f) => ({
                    ...f,
                    status: s,
                    // auto-set 100% when completed
                    progressPercent: s === "Completed" ? 100 : f.progressPercent,
                  }));
                }}
                searchable={false}
              >
                {TASK_STATUSES.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
            </Grid>

            {/* Progress slider */}
            <ProgressSlider
              value={editForm.progressPercent}
              onChange={(v) => setEditForm((f) => ({ ...f, progressPercent: v }))}
            />

            {/* Note */}
            <DataField
              label="Status Note (optional)"
              id="tb-edit-note"
              type="textarea"
              rows={2}
              placeholder="Describe progress, blockers, or decisions…"
              value={editForm.statusNote}
              onChange={(e) => setEditForm((f) => ({ ...f, statusNote: e.target.value }))}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button text="Cancel" variant="secondary" onClick={() => closeModal("tb-task-edit-modal")} />
              <Button text={saving ? "Saving…" : "Save Changes"} variant="primary"
                onClick={handleSave} disabled={saving} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
