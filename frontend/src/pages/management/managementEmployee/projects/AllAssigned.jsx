/**
 * AllAssigned.jsx
 * Reusable task table used by All Assigned / Active / Completed tabs.
 * Receives `tasks`, `loading`, `onRefresh` from parent.
 *
 * Actions per row:
 *   👁 View detail modal (read-only full info)
 *   🔄 Update task (status + progress slider + note) — locked when TL-owned status
 *   📋 View project context
 */

import { useState } from "react";
import {
  DataTable,
  DataField,
  SelectField,
  Option,
  Button,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  Grid,
  openModal,
  closeModal,
} from "../../../../components/shared/Common_Components.jsx";
import { Eye, RefreshCw, Lock, AlertTriangle } from "lucide-react";
import { updateMyTask } from "./employeeTasksApi";
import toast from "react-hot-toast";

// Statuses employee can self-set
const ALLOWED_STATUSES = ["Not Started", "In Progress", "Review"];

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

function ProgressBar({ value }) {
  const color = value === 100 ? "#22c55e" : value > 0 ? "#3b82f6" : "#94a3b8";
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: `linear-gradient(90deg,#2a465a,${color})` }} />
      </div>
      <span className="text-xs font-bold text-[#2a465a] w-7 text-right">{value}%</span>
    </div>
  );
}

function ProgressSlider({ value, onChange }) {
  const color = value === 100 ? "#22c55e" : value > 50 ? "#3b82f6" : value > 0 ? "#f59e0b" : "#94a3b8";
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Progress %</label>
        <span className="text-sm font-black" style={{ color }}>{value}%</span>
      </div>
      <input type="range" min={0} max={100} step={5} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: color }} />
      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
      </div>
    </div>
  );
}

// ── Table columns ─────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: "projectName", label: "Project" },
  { key: "title",       label: "Task" },
  { key: "tlName",      label: "My TL" },
  { key: "deadline",    label: "Deadline",
    render: (v, row) => (
      <span className={row.isOverdue ? "text-rose-600 font-bold" : ""}>{v || "—"}</span>
    ),
  },
  { key: "progressPercent", label: "Progress", render: (v) => <ProgressBar value={v} />, sortValue: (row) => row.progressPercent },
  { key: "priority",    label: "Priority", render: (v) => <PriorityBadge priority={v} /> },
  { key: "status",      label: "Status",   render: (v) => <StatusPill status={v} /> },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AllAssigned({ tasks, loading, onRefresh, title = "My Projects" }) {
  const [viewTask,  setViewTask]  = useState(null);
  const [editTask,  setEditTask]  = useState(null);
  const [blockedTask, setBlockedTask] = useState(null);
  const [editForm,  setEditForm]  = useState({ status: "", progressPercent: 0, statusNote: "" });
  const [saving,    setSaving]    = useState(false);

  const openView = (row) => {
    setViewTask(row);
    openModal("me-task-view");
  };

  const openEdit = (row) => {
    if (!row.canUpdate) {
      setBlockedTask(row);
      openModal("me-task-blocked");
      return;
    }
    setEditTask(row);
    setEditForm({ status: row.status, progressPercent: row.progressPercent, statusNote: row.statusNote || "" });
    openModal("me-task-edit");
  };

  const handleSave = async () => {
    if (!editTask) return;
    setSaving(true);
    try {
      await updateMyTask(editTask.id, {
        status:          editForm.status,
        progressPercent: editForm.progressPercent,
        statusNote:      editForm.statusNote,
      });
      toast.success(`Task "${editTask.title}" updated`);
      closeModal("me-task-edit");
      setEditTask(null);
      onRefresh();
    } catch (err) {
      toast.error(err?.message || "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DataTable
        title={title}
        columns={COLUMNS}
        rows={tasks}
        pageSize={10}
        pageSizeOptions={[5, 10, 20]}
        searchable
        exportable
        exportFileName="my_tasks"
        loading={loading}
        filters={[
          { title: "Status",   type: "toggle", key: "status",   options: ["Not Started","In Progress","Review","Completed","Delayed"] },
          { title: "Priority", type: "toggle", key: "priority", options: ["Critical","High","Medium","Low"] },
        ]}
        actions={[
          { icon: <Eye size={15} />,       tooltip: "View Details",   variant: "ghost", onClick: openView },
          { icon: <RefreshCw size={15} />, tooltip: "Update Progress", variant: "ghost", onClick: openEdit },
        ]}
      />

      {/* ── View Detail Modal ── */}
      <Modal id="me-task-view" title="Task Details" size="lg">
        {viewTask && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewTask.title}
              subtitle={viewTask.description || "No description provided."}
              meta={`Project: ${viewTask.projectName}  ·  TL: ${viewTask.tlName}`}
            />
            <ModalGrid title="Task Info" cols={3}>
              <ModalData label="Status"    value={<StatusPill status={viewTask.status} />} />
              <ModalData label="Priority"  value={<PriorityBadge priority={viewTask.priority} />} />
              <ModalData label="Deadline"  value={
                <span className={viewTask.isOverdue ? "text-rose-600 font-bold" : ""}>
                  {viewTask.deadline || "—"} {viewTask.isOverdue ? "⚠ Overdue" : ""}
                </span>
              } />
              <ModalData label="Progress"  value={`${viewTask.progressPercent}%`} />
              <ModalData label="Completed" value={viewTask.completedAt || "—"} />
              {viewTask.statusNote && <ModalData label="Last Note" value={viewTask.statusNote} />}
            </ModalGrid>
            <ModalGrid title="Project Context" cols={2}>
              <ModalData label="Project"          value={viewTask.projectName} />
              <ModalData label="Project Status"   value={viewTask.projectStatus} />
              <ModalData label="Project Deadline" value={viewTask.projectDeadline || "—"} />
              <ModalData label="Team Leader"      value={viewTask.tlName} />
            </ModalGrid>

            {/* Progress bar visual */}
            <div className="px-1">
              <ProgressBar value={viewTask.progressPercent} />
            </div>

            {/* Locked status notice */}
            {!viewTask.canUpdate && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <Lock size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Status <b>"{viewTask.status}"</b> is managed by your Team Leader. You can only
                  update tasks that are <b>Not Started</b>, <b>In Progress</b>, or <b>Review</b>.
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" onClick={() => closeModal("me-task-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Update Modal ── */}
      <Modal id="me-task-edit" title="Update Task Progress" size="md">
        {editTask && (
          <div className="flex flex-col gap-5">
            {/* Context strip */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <p className="text-sm font-black text-[#2a465a]">{editTask.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {editTask.projectName}  ·  TL: {editTask.tlName}  ·  Due: {editTask.deadline || "—"}
              </p>
            </div>

            {/* Allowed statuses notice */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
              <AlertTriangle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                You can set: <b>Not Started</b>, <b>In Progress</b>, or <b>Review</b>.
                Completed and Delayed are managed by your Team Leader.
              </p>
            </div>

            {/* Status */}
            <Grid cols={12} gap={4}>
              <SelectField label="Status" id="me-edit-status" size={12}
                placeholder="Select status..."
                value={editForm.status}
                onChange={(e) => {
                  const s = e.target.value;
                  setEditForm((f) => ({
                    ...f, status: s,
                    progressPercent: s === "Review" && f.progressPercent < 90 ? 90 : f.progressPercent,
                  }));
                }}
                searchable={false}>
                {ALLOWED_STATUSES.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
            </Grid>

            {/* Progress slider */}
            <ProgressSlider
              value={editForm.progressPercent}
              onChange={(v) => setEditForm((f) => ({ ...f, progressPercent: v }))}
            />

            {/* Note */}
            <DataField label="Progress Note (optional)" id="me-edit-note" type="textarea" rows={2}
              placeholder="What did you complete? Any blockers?"
              value={editForm.statusNote}
              onChange={(e) => setEditForm((f) => ({ ...f, statusNote: e.target.value }))} />

            <div className="flex justify-end gap-2 pt-1">
              <Button text="Cancel" variant="secondary" onClick={() => closeModal("me-task-edit")} />
              <Button text={saving ? "Saving…" : "Save Progress"} variant="primary"
                onClick={handleSave} disabled={saving} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Status Locked Modal ── */}
      <Modal id="me-task-blocked" title="Status Locked" size="sm">
        {blockedTask && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Lock size={20} className="text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700">
                This task is currently <b>"{blockedTask.status}"</b>. Only your Team Leader
                can change tasks in this state. Contact <b>{blockedTask.tlName}</b> if you think this
                needs updating.
              </p>
            </div>
            <ModalGrid title="Task" cols={1}>
              <ModalData label="Task"    value={blockedTask.title} />
              <ModalData label="Project" value={blockedTask.projectName} />
              <ModalData label="TL"      value={blockedTask.tlName} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Got it" variant="primary" onClick={() => closeModal("me-task-blocked")} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
