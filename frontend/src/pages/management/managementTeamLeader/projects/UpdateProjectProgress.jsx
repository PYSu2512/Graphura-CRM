/**
 * UpdateProjectProgress.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Tab: "Update Progress"
 * • Select a project → auto-fill employee + current progress
 * • Slider for % + status dropdown + note
 * • Live progress table of all projects
 * • Uses Common_Components + projectsStore
 */

import React, { useState } from "react";
import {
  Grid,
  DataField,
  SelectField,
  Option,
  Button,
  DataTable,
} from "../../../../components/shared/Common_Components";
import {
  useProjectsStore,
  STATUSES,
  getAvatarColor,
  getInitials,
} from "./projectsStore";

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const cls =
    type === "success"
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : "bg-amber-50 border-amber-200 text-amber-700";
  return (
    <div className={`col-span-12 rounded-2xl border px-4 py-3 text-sm font-semibold ${cls}`}>
      {msg}
    </div>
  );
}

// ── Progress bar cell ─────────────────────────────────────────────────────────
function ProgressCell({ value }) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${value}%`,
            background: "linear-gradient(90deg,#2a465a,#38bdf8)",
          }}
        />
      </div>
      <span className="text-xs font-bold text-[#2a465a] w-8 text-right">{value}%</span>
    </div>
  );
}

// ── Avatar cell ───────────────────────────────────────────────────────────────
function AvatarCell({ name }) {
  const bg = getAvatarColor(name);
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
        style={{ background: bg }}
      >
        {getInitials(name)}
      </div>
      <span className="text-sm font-semibold text-[#0f172a]">{name}</span>
    </div>
  );
}

// ── Live table columns ────────────────────────────────────────────────────────
const PROGRESS_COLUMNS = [
  {
    key: "employee",
    label: "Employee",
    render: (val) => <AvatarCell name={val} />,
  },
  { key: "name", label: "Project" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  {
    key: "progress",
    label: "Progress",
    render: (val) => <ProgressCell value={val} />,
    sortValue: (row) => row.progress,
  },
  { key: "deadline", label: "Deadline" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function UpdateProjectProgress() {
  const { projects, updateProgress } = useProjectsStore();

  const [form, setForm] = useState({
    projectId: "",
    status: "",
    progress: 0,
    note: "",
  });
  const [toast, setToast] = useState({ msg: "", type: "" });

  const selectedProject = projects.find((p) => p.id === Number(form.projectId));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  const handleProjectChange = (e) => {
    const project = projects.find((p) => p.id === Number(e.target.value));
    setForm((f) => ({
      ...f,
      projectId: e.target.value,
      status: project?.status ?? "",
      progress: project?.progress ?? 0,
      note: "",
    }));
  };

  const handleSave = () => {
    const { projectId, status, progress } = form;
    if (!projectId || !status) {
      showToast("⚠️ Please select a project and status.", "warning");
      return;
    }
    const entry = updateProgress({
      projectId: Number(projectId),
      status,
      progress: Number(progress),
      note: form.note,
    });
    showToast(`✅ "${entry.project}" updated to ${entry.newPct}% — ${entry.status}.`);
    setForm({ projectId: "", status: "", progress: 0, note: "" });
  };

  const handleClear = () =>
    setForm({ projectId: "", status: "", progress: 0, note: "" });

  return (
    <div className="flex flex-col gap-6">
      {/* ── Section header ── */}
      <div>
        <p className="text-lg font-black text-[#2a465a]">Update Project Progress</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Update the completion percentage and status for assigned projects
        </p>
      </div>

      {/* ── Form ── */}
      <div className="bg-[#efefefb1] rounded-2xl p-5">
        <Grid cols={12} gap={4}>

          {/* Project selector */}
          <SelectField
            label="Select Project"
            id="progress-project"
            size={6}
            placeholder="Choose a project..."
            value={form.projectId}
            onChange={handleProjectChange}
            searchable={true}
          >
            {projects.map((p) => (
              <Option key={p.id} value={String(p.id)} label={p.name} />
            ))}
          </SelectField>

          {/* Auto-filled employee */}
          <DataField
            label="Assigned Employee"
            id="progress-employee"
            size={6}
            value={selectedProject?.employee ?? ""}
            readOnly
            placeholder="Auto-filled..."
          />

          {/* Status */}
          <SelectField
            label="Update Status"
            id="progress-status"
            size={6}
            placeholder="Select status..."
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            searchable={false}
          >
            {STATUSES.map((s) => (
              <Option key={s} value={s} label={s} />
            ))}
          </SelectField>

          {/* Progress slider */}
          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none">
              Progress Percentage
            </label>
            <div className="flex items-center gap-4 mt-1 bg-white rounded-2xl border border-slate-200 px-4 py-3">
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={form.progress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, progress: Number(e.target.value) }))
                }
                className="flex-1 h-1.5 rounded-full accent-[#2a465a] cursor-pointer"
              />
              <span className="text-lg font-black text-[#2a465a] min-w-[48px] text-right tabular-nums">
                {form.progress}%
              </span>
            </div>
            {/* Gradient progress preview */}
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${form.progress}%`,
                  background: "linear-gradient(90deg,#2a465a,#38bdf8)",
                }}
              />
            </div>
          </div>

          {/* Note */}
          <DataField
            label="Progress Note / Update"
            id="progress-note"
            type="textarea"
            rows={3}
            placeholder="Describe what was completed, blockers, next steps..."
            size={12}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />

          <Button
            text="Save Progress →"
            size={4}
            variant="primary"
            onClick={handleSave}
          />
          <Button
            text="Clear"
            size={4}
            variant="secondary"
            onClick={handleClear}
          />

          {toast.msg && <Toast msg={toast.msg} type={toast.type} />}
        </Grid>
      </div>

      {/* ── Live table ── */}
      <div>
        <p className="text-sm font-black text-[#2a465a] mb-3">
          All Projects — Live Progress
        </p>
        <DataTable
          columns={PROGRESS_COLUMNS}
          rows={projects}
          size={12}
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          searchable={true}
          filters={[
            {
              title: "Status",
              type: "toggle",
              key: "status",
              options: ["Pending", "In Progress", "Completed", "Delayed", "On Hold"],
            },
            {
              title: "Priority",
              type: "toggle",
              key: "priority",
              options: ["Critical", "High", "Medium", "Low"],
            },
          ]}
          exportable
          exportFileName="project-progress"
        />
      </div>
    </div>
  );
}
