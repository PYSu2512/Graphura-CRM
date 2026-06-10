/**
 * ReassignProjects.jsx → "Assign Tasks" Tab
 * Create + assign tasks to team members within a project.
 * All data is fetched from / persisted to the backend.
 */

import { useState, useEffect, useCallback } from "react";
import {
  Grid,
  DataField,
  SelectField,
  Option,
  Button,
  DataTable,
} from "../../../../components/shared/Common_Components";
import DatePicker from "../../../../components/shared/DatePicker";
import { fetchFormData, fetchProjectTasks, createTask, deleteTask } from "./tlProjectsApi";
import { Plus, Trash2, ListTodo, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const PRIORITIES = ["Critical", "High", "Medium", "Low"];

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

// ── Component ─────────────────────────────────────────────────────────────────
export default function ReassignProjects() {
  const [projects,   setProjects]   = useState([]);
  const [employees,  setEmployees]  = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [loadingForm,setLoadingForm]= useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting,  setSubmitting]   = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedProject,   setSelectedProject]   = useState(null);

  const [form, setForm] = useState({
    title: "", assignedTo: "", deadline: "", priority: "", description: "",
  });

  // Load form data (projects + employees) once
  const loadFormData = useCallback(async () => {
    setLoadingForm(true);
    try {
      const res = await fetchFormData();
      setProjects(res.data?.data?.projects  || []);
      setEmployees(res.data?.data?.employees || []);
    } catch (err) {
      toast.error("Failed to load form data");
    } finally {
      setLoadingForm(false);
    }
  }, []);

  useEffect(() => { loadFormData(); }, [loadFormData]);

  // Load tasks whenever project changes
  const loadTasks = useCallback(async (projectId) => {
    if (!projectId) { setTasks([]); return; }
    setLoadingTasks(true);
    try {
      const res = await fetchProjectTasks(projectId);
      setTasks(res.data?.data?.tasks || []);
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  const handleProjectChange = (e) => {
    const id = e.target.value;
    setSelectedProjectId(id);
    const proj = projects.find((p) => p.id === id);
    setSelectedProject(proj || null);
    loadTasks(id);
    setForm({ title: "", assignedTo: "", deadline: "", priority: "", description: "" });
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    const { title, assignedTo, deadline, priority } = form;
    if (!selectedProjectId) { toast.error("Please select a project"); return; }
    if (!title.trim())       { toast.error("Task title is required");  return; }
    if (!assignedTo)         { toast.error("Please select an employee"); return; }
    if (!deadline)           { toast.error("Deadline is required");    return; }
    if (!priority)           { toast.error("Priority is required");    return; }

    setSubmitting(true);
    try {
      await createTask(selectedProjectId, form);
      toast.success(`Task "${form.title}" assigned successfully`);
      setForm({ title: "", assignedTo: "", deadline: "", priority: "", description: "" });
      await loadTasks(selectedProjectId);
      // Also refresh project list progress
      await loadFormData();
    } catch (err) {
      toast.error(err?.message || "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete task "${row.title}"?`)) return;
    try {
      await deleteTask(row.id);
      toast.success("Task deleted");
      await loadTasks(selectedProjectId);
    } catch (err) {
      toast.error(err?.message || "Failed to delete task");
    }
  };

  const TASK_COLS = [
    {
      key: "assignee", label: "Assigned To",
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black"
            style={{ background: getAvatarColor(v) }}>
            {getInitials(v)}
          </div>
          <span className="text-sm font-semibold">{v}</span>
        </div>
      ),
    },
    { key: "title",    label: "Task Title" },
    { key: "priority", label: "Priority", render: (v) => <PriorityBadge priority={v} /> },
    { key: "deadline", label: "Deadline" },
    {
      key: "progressPercent", label: "Progress",
      render: (v) => (
        <div className="flex items-center gap-2 min-w-[80px]">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${v}%` }} />
          </div>
          <span className="text-xs font-bold text-slate-600 w-6">{v}%</span>
        </div>
      ),
    },
    { key: "status",   label: "Status",   render: (v) => <StatusPill status={v} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-lg font-black text-[#2a465a]">Assign Tasks</p>
        <p className="text-xs text-slate-400 mt-0.5">Create and assign tasks to team members within a project</p>
      </div>

      {/* Form card */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5">
        <Grid cols={12} gap={4}>
          {/* Select project */}
          <SelectField
            label="Select Project"
            id="at-project"
            size={12}
            placeholder="Choose a project to add tasks to..."
            value={selectedProjectId}
            onChange={handleProjectChange}
            searchable
            disabled={loadingForm}
          >
            {projects.map((p) => (
              <Option key={p.id} value={p.id}
                label={`${p.name} — ${p.status} (${p.progressPercent}%)`} />
            ))}
          </SelectField>

          {/* Project info strip */}
          {selectedProject && (
            <div className="col-span-12 flex flex-wrap gap-2">
              {[
                `📋 ${selectedProject.name}`,
                `⏰ Due: ${selectedProject.deadline || "—"}`,
                `📊 ${selectedProject.progressPercent}% done`,
                `🏷️ ${selectedProject.priority}`,
              ].map((txt) => (
                <span key={txt} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600">{txt}</span>
              ))}
            </div>
          )}

          {/* Divider */}
          {selectedProject && (
            <div className="col-span-12 border-t border-slate-200 pt-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Plus size={12} /> New Task Details
              </p>
            </div>
          )}

          {/* Task fields */}
          <DataField label="Task Title" id="at-title" placeholder="e.g. Implement login API"
            size={6} value={form.title} onChange={set("title")} />

          <SelectField label="Assign To (Employee)" id="at-employee" size={6}
            placeholder="Select employee..." value={form.assignedTo} onChange={set("assignedTo")} searchable={false}
            disabled={loadingForm}>
            {employees.map((e) => (
              <Option key={e.id} value={e.id} label={e.name} />
            ))}
          </SelectField>

          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Task Deadline</label>
            <DatePicker value={form.deadline} onChange={(v) => setForm((f) => ({ ...f, deadline: v }))}
              placeholder="Select task deadline" />
          </div>

          <SelectField label="Priority" id="at-priority" size={6}
            placeholder="Select priority..." value={form.priority} onChange={set("priority")} searchable={false}>
            {PRIORITIES.map((p) => <Option key={p} value={p} label={p} />)}
          </SelectField>

          <DataField label="Task Description" id="at-desc" type="textarea" rows={3}
            placeholder="Brief description of what this task involves..."
            size={12} value={form.description} onChange={set("description")} />

          <Button text={submitting ? "Assigning…" : "Assign Task →"} size={4} variant="primary"
            onClick={handleSubmit} disabled={submitting} />
          <Button text="Clear Form" size={4} variant="secondary"
            onClick={() => setForm({ title:"",assignedTo:"",deadline:"",priority:"",description:"" })} />
        </Grid>
      </div>

      {/* Tasks table */}
      {selectedProject ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-black text-[#2a465a]">
              Tasks in "{selectedProject.name}" ({tasks.length})
            </p>
            <button onClick={() => loadTasks(selectedProjectId)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#2a465a] transition-colors">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
          <DataTable
            columns={TASK_COLS}
            rows={tasks}
            pageSize={5}
            pageSizeOptions={[5, 10, 20]}
            searchable
            loading={loadingTasks}
            filters={[
              { title: "Status",   type: "toggle", key: "status",   options: ["Not Started","In Progress","Review","Completed","Delayed"] },
              { title: "Priority", type: "toggle", key: "priority", options: ["Critical","High","Medium","Low"] },
            ]}
            actions={[
              { icon: <Trash2 size={14} />, tooltip: "Delete Task", variant: "ghost", onClick: handleDelete },
            ]}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 text-slate-400">
          <ListTodo size={40} strokeWidth={1.5} />
          <p className="text-sm font-semibold mt-3">Select a project above to view and assign tasks</p>
        </div>
      )}
    </div>
  );
}
