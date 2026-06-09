/**
 * ManagementEmployeeReminders.jsx
 * Personal reminders for the employee — frontend-local (no backend needed).
 * Links to real tasks fetched from the API for the project dropdown.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Grid,
  Heading,
  DashGrid,
  EnhancedDashCard,
  DataTable,
  DataField,
  SelectField,
  Option,
  Button,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components.jsx";
import { Bell, CheckCircle2, Clock, Trash2, Eye, Check } from "lucide-react";
import { fetchTasks } from "./projects/employeeTasksApi";
import toast from "react-hot-toast";

const today = () => new Date().toISOString().slice(0, 10);
const BLANK  = { title: "", note: "", dueAt: "", linkedTaskId: "" };

// ── Local storage key ─────────────────────────────────────────────────────────
const STORAGE_KEY = "me_reminders";

function loadReminders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveReminders(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

// ── Columns ───────────────────────────────────────────────────────────────────
const COLS = [
  { key: "title",         label: "Title" },
  { key: "linkedTaskName",label: "Linked Task" },
  { key: "dueAt",         label: "Due" },
  { key: "createdAt",     label: "Created" },
  { key: "status",        label: "Status" },
];

const KPI_ICONS   = [<Bell size={20}/>, <Clock size={20}/>, <CheckCircle2 size={20}/>, <Bell size={20}/>];
const KPI_ACCENTS = ["#3b82f6", "#f59e0b", "#22c55e", "#94a3b8"];

export default function ManagementEmployeeReminders() {
  const [reminders, setReminders] = useState(loadReminders);
  const [tasks,     setTasks]     = useState([]);
  const [viewRow,   setViewRow]   = useState(null);
  const [form,      setForm]      = useState(BLANK);
  const [formErr,   setFormErr]   = useState({});

  // Load real tasks for the dropdown
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetchTasks();
      setTasks(res.data?.data?.tasks || []);
    } catch {}
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  // Persist on every change
  useEffect(() => { saveReminders(reminders); }, [reminders]);

  const rows = useMemo(() =>
    reminders.map((r) => ({
      ...r,
      linkedTaskName: r.linkedTaskId
        ? (tasks.find((t) => t.id === r.linkedTaskId)?.title || r.linkedTaskId)
        : "—",
      status: r.status === "Done" ? "Completed" : "Pending",
    })).sort((a, b) => a.dueAt < b.dueAt ? -1 : 1),
    [reminders, tasks],
  );

  const kpis = useMemo(() => [
    { title: "Total",   value: String(reminders.length) },
    { title: "Pending", value: String(reminders.filter((r) => r.status === "Pending").length) },
    { title: "Done",    value: String(reminders.filter((r) => r.status === "Done").length) },
    { title: "Overdue", value: String(reminders.filter((r) => r.status === "Pending" && r.dueAt < today()).length) },
  ], [reminders]);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (formErr[k]) setFormErr((e) => ({ ...e, [k]: "" }));
  };

  const openAdd = () => {
    setForm(BLANK);
    setFormErr({});
    openModal("me-reminder-add");
  };

  const submitAdd = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.dueAt)        errs.dueAt  = "Due date is required.";
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    const next = {
      id:           `REM-${Date.now()}`,
      title:        form.title.trim(),
      note:         form.note.trim(),
      dueAt:        form.dueAt,
      linkedTaskId: form.linkedTaskId || null,
      status:       "Pending",
      createdAt:    today(),
    };
    setReminders((prev) => [next, ...prev]);
    closeModal("me-reminder-add");
    toast.success("Reminder added");
  };

  const openView = (row) => {
    setViewRow(reminders.find((r) => r.id === row.id));
    openModal("me-reminder-view");
  };

  const markDone = (row) => {
    setReminders((prev) =>
      prev.map((r) => r.id === row.id ? { ...r, status: r.status === "Done" ? "Pending" : "Done" } : r)
    );
  };

  const removeReminder = (row) => {
    if (!window.confirm("Delete this reminder?")) return;
    setReminders((prev) => prev.filter((r) => r.id !== row.id));
  };

  return (
    <div>
      <Grid cols={12} gap={6}>
        <Heading primaryText="My" secondaryText="Reminders" size={12} fontSize="2xl" />

        <div className="col-span-12">
          <DashGrid cols={12} gap={4}>
            {kpis.map((k, i) => (
              <EnhancedDashCard key={k.title} title={k.title} value={k.value}
                icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
            ))}
          </DashGrid>
        </div>

        <div className="col-span-12 flex justify-end">
          <Button text="+ Add Reminder" variant="primary" onClick={openAdd} />
        </div>

        <div className="col-span-12">
          <DataTable
            title="My Reminders"
            columns={COLS}
            rows={rows}
            pageSize={10}
            searchable
            exportable
            exportFileName="my_reminders"
            filters={[
              { title: "Status", type: "toggle", key: "status", options: ["Pending", "Completed"] },
            ]}
            actions={[
              { icon: <Eye size={15} />,    tooltip: "View",        variant: "ghost",   onClick: openView },
              { icon: <Check size={15} />,  tooltip: "Toggle Done", variant: "success", onClick: markDone },
              { icon: <Trash2 size={15} />, tooltip: "Delete",      variant: "danger",  onClick: removeReminder },
            ]}
          />
        </div>
      </Grid>

      {/* Add modal */}
      <Modal id="me-reminder-add" title="Add Reminder" size="md">
        <div className="flex flex-col gap-4">
          <Grid cols={12} gap={3}>
            <div className="col-span-12">
              <DataField label="Title *" id="me-rem-title"
                placeholder="e.g. Submit design mockups to TL"
                value={form.title} onChange={(e) => setField("title", e.target.value)} />
              {formErr.title && <p className="text-xs text-rose-600 mt-1">{formErr.title}</p>}
            </div>
            <div className="col-span-6">
              <DataField label="Due Date *" id="me-rem-due" type="date"
                value={form.dueAt} onChange={(e) => setField("dueAt", e.target.value)} />
              {formErr.dueAt && <p className="text-xs text-rose-600 mt-1">{formErr.dueAt}</p>}
            </div>
            <div className="col-span-6">
              <SelectField label="Link to Task (optional)" id="me-rem-task"
                value={form.linkedTaskId} onChange={(e) => setField("linkedTaskId", e.target.value)}>
                <Option value="" label="— No link —" />
                {tasks.map((t) => (
                  <Option key={t.id} value={t.id} label={`${t.title} (${t.projectName})`} />
                ))}
              </SelectField>
            </div>
            <div className="col-span-12">
              <DataField label="Note" id="me-rem-note" type="textarea" rows={3}
                placeholder="Optional context for yourself."
                value={form.note} onChange={(e) => setField("note", e.target.value)} />
            </div>
          </Grid>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button text="Cancel"       variant="secondary" onClick={() => closeModal("me-reminder-add")} />
            <Button text="Add Reminder" variant="primary"   onClick={submitAdd} />
          </div>
        </div>
      </Modal>

      {/* View modal */}
      <Modal id="me-reminder-view" title="Reminder Details" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.title}
              subtitle={viewRow.linkedTaskId
                ? (tasks.find((t) => t.id === viewRow.linkedTaskId)?.title || viewRow.linkedTaskId)
                : "No linked task"}
              meta={`Due ${viewRow.dueAt}`}
            />
            <ModalGrid title="Overview" cols={2}>
              <ModalData label="Status"  value={viewRow.status} />
              <ModalData label="Due"     value={viewRow.dueAt} />
              <ModalData label="Created" value={viewRow.createdAt} />
            </ModalGrid>
            {viewRow.note && (
              <ModalGrid title="Note" cols={1}>
                <ModalData label="" value={viewRow.note} />
              </ModalGrid>
            )}
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" onClick={() => closeModal("me-reminder-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
