/**
 * ReassignProjects.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Tab: "Reassign Projects"
 * • Select a project → auto-fill current assignee
 * • Pick a new employee + reason → confirm
 * • Reassignment history table
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
  EMPLOYEES,
  REASSIGN_REASONS,
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

// ── History table columns ─────────────────────────────────────────────────────
const HISTORY_COLUMNS = [
  { key: "project", label: "Project" },
  {
    key: "from",
    label: "From",
    render: (val) => <AvatarCell name={val} />,
  },
  {
    key: "to",
    label: "To",
    render: (val) => <AvatarCell name={val} />,
  },
  { key: "reason", label: "Reason" },
  { key: "date", label: "Date" },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ReassignProjects() {
  const { projects, reassignHistory, reassignProject } = useProjectsStore();

  const [form, setForm] = useState({
    projectId: "",
    newEmployee: "",
    reason: "",
    notes: "",
  });
  const [toast, setToast] = useState({ msg: "", type: "" });

  const selectedProject = projects.find((p) => p.id === Number(form.projectId));

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  const handleProjectChange = (e) => {
    setForm((f) => ({ ...f, projectId: e.target.value, newEmployee: "", reason: "" }));
  };

  const handleReassign = () => {
    const { projectId, newEmployee, reason } = form;
    if (!projectId || !newEmployee || !reason) {
      showToast("⚠️ Please fill all required fields.", "warning");
      return;
    }
    if (selectedProject?.employee === newEmployee) {
      showToast("⚠️ New employee is the same as the current assignee.", "warning");
      return;
    }
    const entry = reassignProject({
      projectId: Number(projectId),
      newEmployee,
      reason,
      notes: form.notes,
    });
    showToast(
      `✅ "${entry.project}" reassigned from ${entry.from} to ${entry.to}.`
    );
    setForm({ projectId: "", newEmployee: "", reason: "", notes: "" });
  };

  const handleClear = () =>
    setForm({ projectId: "", newEmployee: "", reason: "", notes: "" });

  return (
    <div className="flex flex-col gap-6">
      {/* ── Section header ── */}
      <div>
        <p className="text-lg font-black text-[#2a465a]">Reassign Projects</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Transfer a project from one employee to another
        </p>
      </div>

      {/* ── Form ── */}
      <div className="bg-[#efefefb1] rounded-2xl p-5">
        <Grid cols={12} gap={4}>

          {/* Project selector */}
          <SelectField
            label="Select Project to Reassign"
            id="reassign-project"
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

          {/* Auto-filled current assignee */}
          <DataField
            label="Currently Assigned To"
            id="reassign-current"
            size={6}
            value={selectedProject?.employee ?? ""}
            readOnly
            placeholder="Auto-filled after selection..."
          />

          {/* New employee — exclude the current one */}
          <SelectField
            label="Reassign To (New Employee)"
            id="reassign-new-emp"
            size={6}
            placeholder="Select new employee..."
            value={form.newEmployee}
            onChange={set("newEmployee")}
            searchable={false}
          >
            {EMPLOYEES.filter((e) => e !== selectedProject?.employee).map((e) => (
              <Option key={e} value={e} label={e} />
            ))}
          </SelectField>

          {/* Reason */}
          <SelectField
            label="Reason for Reassignment"
            id="reassign-reason"
            size={6}
            placeholder="Select reason..."
            value={form.reason}
            onChange={set("reason")}
            searchable={false}
          >
            {REASSIGN_REASONS.map((r) => (
              <Option key={r} value={r} label={r} />
            ))}
          </SelectField>

          {/* Notes */}
          <DataField
            label="Additional Notes"
            id="reassign-notes"
            type="textarea"
            rows={3}
            placeholder="Any additional context for the reassignment..."
            size={12}
            value={form.notes}
            onChange={set("notes")}
          />

          <Button
            text="Confirm Reassignment →"
            size={4}
            variant="primary"
            onClick={handleReassign}
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

      {/* ── History table ── */}
      <div>
        <p className="text-sm font-black text-[#2a465a] mb-3">Reassignment History</p>
        <DataTable
          columns={HISTORY_COLUMNS}
          rows={reassignHistory}
          size={12}
          pageSize={5}
          pageSizeOptions={[5, 10, 20]}
          searchable={true}
          exportable
          exportFileName="reassignment-history"
        />
      </div>
    </div>
  );
}
