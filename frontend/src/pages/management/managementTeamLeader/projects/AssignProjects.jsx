/**
 * AssignProjects.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Tab: "Assign Projects"
 * • Form to assign a new project to an employee
 * • Live table of all current assignments
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
import DatePicker from "../../../../components/shared/DatePicker";
import {
  useProjectsStore,
  EMPLOYEES,
  PRIORITIES,
  getAvatarColor,
  getInitials,
} from "./projectsStore";

// ── Inline toast ─────────────────────────────────────────────────────────────
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
          className="h-full rounded-full"
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

// ── Columns ───────────────────────────────────────────────────────────────────
const COLUMNS = [
  {
    key: "employee",
    label: "Employee",
    render: (val) => <AvatarCell name={val} />,
  },
  { key: "name", label: "Project Name" },
  { key: "status", label: "Status" },
  { key: "deadline", label: "Deadline" },
  { key: "priority", label: "Priority" },
  {
    key: "progress",
    label: "Progress",
    render: (val) => <ProgressCell value={val} />,
    sortValue: (row) => row.progress,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function AssignProjects() {
  const { projects, addProject } = useProjectsStore();

  const [form, setForm] = useState({
    name: "",
    employee: "",
    deadline: "",
    priority: "",
    description: "",
  });
  const [toast, setToast] = useState({ msg: "", type: "" });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 4000);
  };

  const handleAssign = () => {
    const { name, employee, deadline, priority } = form;
    if (!name.trim() || !employee || !deadline || !priority) {
      showToast("⚠️ Please fill all required fields.", "warning");
      return;
    }
    const project = addProject(form);
    showToast(`✅ "${project.name}" successfully assigned to ${project.employee}.`);
    setForm({ name: "", employee: "", deadline: "", priority: "", description: "" });
  };

  const handleClear = () =>
    setForm({ name: "", employee: "", deadline: "", priority: "", description: "" });

  return (
    <div className="flex flex-col gap-6">
      {/* ── Section header ── */}
      <div>
        <p className="text-lg font-black text-[#2a465a]">Assign Projects</p>
        <p className="text-xs text-slate-400 mt-0.5">
          Assign new or existing projects to team employees
        </p>
      </div>

      {/* ── Form ── */}
      <div className="bg-[#efefefb1] rounded-2xl p-5">
        <Grid cols={12} gap={4}>
          <DataField
            label="Project Name"
            id="assign-name"
            placeholder="e.g. Employee Mobile Dashboard"
            size={6}
            value={form.name}
            onChange={set("name")}
          />

          <SelectField
            label="Assign To (Employee)"
            id="assign-employee"
            size={6}
            placeholder="Select employee..."
            value={form.employee}
            onChange={set("employee")}
            searchable={false}
          >
            {EMPLOYEES.map((e) => (
              <Option key={e} value={e} label={e} />
            ))}
          </SelectField>

          {/* Deadline — DatePicker */}
          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] select-none">
              Deadline
            </label>
            <DatePicker
              value={form.deadline}
              onChange={(val) => setForm((f) => ({ ...f, deadline: val }))}
              placeholder="Select deadline"
            />
          </div>

          <SelectField
            label="Priority"
            id="assign-priority"
            size={6}
            placeholder="Select priority..."
            value={form.priority}
            onChange={set("priority")}
            searchable={false}
          >
            {PRIORITIES.map((p) => (
              <Option key={p} value={p} label={p} />
            ))}
          </SelectField>

          <DataField
            label="Project Description"
            id="assign-desc"
            type="textarea"
            rows={3}
            placeholder="Brief description of the project scope and goals..."
            size={12}
            value={form.description}
            onChange={set("description")}
          />

          <Button
            text="Assign Project →"
            size={4}
            variant="primary"
            onClick={handleAssign}
          />
          <Button
            text="Clear Form"
            size={4}
            variant="secondary"
            onClick={handleClear}
          />

          {toast.msg && <Toast msg={toast.msg} type={toast.type} />}
        </Grid>
      </div>

      {/* ── Table ── */}
      <div>
        <p className="text-sm font-black text-[#2a465a] mb-3">Current Assignments</p>
        <DataTable
          columns={COLUMNS}
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
          exportFileName="project-assignments"
        />
      </div>
    </div>
  );
}
