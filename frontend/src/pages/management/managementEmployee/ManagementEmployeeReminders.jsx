import { useMemo, useState } from "react";
import {
  Grid,
  Heading,
  DashGrid,
  DashCard,
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
import {
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Check,
} from "lucide-react";
import { myProjects } from "./managementEmployeeStore";
import { initialReminders, projectName } from "./remindersStore";

const today = () => new Date().toISOString().slice(0, 10);

const COLS = [
  { key: "title",            label: "Title" },
  { key: "linkedProjectName", label: "Project" },
  { key: "dueAt",            label: "Due" },
  { key: "createdAt",        label: "Created" },
  { key: "status",           label: "Status" },   // auto-coloured (Pending=amber, Done≈Completed alias)
];

const KPI_ICONS   = [<Bell size={20} />, <Clock size={20} />, <CheckCircle2 size={20} />, <Bell size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#f59e0b", "#22c55e", "#94a3b8"];

const BLANK_FORM = { title: "", note: "", dueAt: "", linkedProjectId: "" };

export default function ManagementEmployeeReminders() {
  const [reminders, setReminders] = useState(initialReminders);
  const [viewRow, setViewRow] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [formErr, setFormErr] = useState({});

  const rows = useMemo(
    () =>
      reminders
        .map((r) => ({
          ...r,
          linkedProjectName: projectName(r.linkedProjectId),
          // Map "Done" → "Completed" only for the status badge auto-coloring.
          status: r.status === "Done" ? "Completed" : "Pending",
        }))
        .sort((a, b) => (a.dueAt < b.dueAt ? -1 : 1)),
    [reminders]
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
    setForm(BLANK_FORM);
    setFormErr({});
    openModal("me-reminder-add");
  };

  const submitAdd = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.dueAt)        errs.dueAt = "Due date is required.";
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    const next = {
      id:              `REM-${String(reminders.length + 1).padStart(3, "0")}`,
      title:           form.title.trim(),
      note:            form.note.trim(),
      dueAt:           form.dueAt,
      linkedProjectId: form.linkedProjectId || null,
      status:          "Pending",
      createdAt:       today(),
    };
    setReminders((prev) => [next, ...prev]);
    setForm(BLANK_FORM);
    closeModal("me-reminder-add");
  };

  const openView = (row) => {
    setViewRow(reminders.find((r) => r.id === row.id));
    openModal("me-reminder-view");
  };

  const markDone = (row) => {
    setReminders((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: r.status === "Done" ? "Pending" : "Done" } : r)));
  };

  const removeReminder = (row) => {
    setReminders((prev) => prev.filter((r) => r.id !== row.id));
  };

  return (
    <div>
      <Grid cols={12} gap={6}>
        <Heading
          primaryText="My"
          secondaryText="Reminders"
          size={12}
          fontSize="2xl"
        />

        <div className="col-span-12">
          <DashGrid cols={12} gap={4}>
            {kpis.map((k, i) => (
              <DashCard
                key={k.title}
                title={k.title}
                value={k.value}
                icon={KPI_ICONS[i]}
                accentColor={KPI_ACCENTS[i]}
                size={3}
              />
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
            size={12}
            pageSize={10}
            searchable
            exportable
            exportFileName="my_reminders"
            filters={[
              { title: "Status", type: "toggle", key: "status", options: ["Pending", "Completed"] },
            ]}
            actions={[
              { icon: <Eye size={15} />,    tooltip: "View",       variant: "ghost",   onClick: openView },
              { icon: <Check size={15} />,  tooltip: "Toggle Done", variant: "success", onClick: markDone },
              { icon: <Trash2 size={15} />, tooltip: "Delete",     variant: "danger",  onClick: removeReminder },
            ]}
          />
        </div>
      </Grid>

      {/* ── Add Reminder modal ────────────────────────────────────────── */}
      <Modal id="me-reminder-add" title="Add Reminder" size="md">
        <div className="flex flex-col gap-4">
          <Grid cols={12} gap={3}>
            <div className="col-span-12">
              <DataField
                label="Title *"
                id="me-rem-title"
                placeholder="e.g. Email design mockups to client"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
              />
              {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
            </div>
            <div className="col-span-6">
              <DataField
                label="Due Date *"
                id="me-rem-due"
                type="date"
                value={form.dueAt}
                onChange={(e) => setField("dueAt", e.target.value)}
              />
              {formErr.dueAt && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.dueAt}</p>}
            </div>
            <div className="col-span-6">
              <SelectField
                label="Link to Project (optional)"
                id="me-rem-project"
                value={form.linkedProjectId}
                onChange={(e) => setField("linkedProjectId", e.target.value)}
              >
                <Option value="" label="— No link —" />
                {myProjects.map((p) => (
                  <Option key={p.id} value={p.id} label={`${p.id} · ${p.name}`} />
                ))}
              </SelectField>
            </div>
            <div className="col-span-12">
              <DataField
                label="Note"
                id="me-rem-note"
                type="textarea"
                rows={3}
                placeholder="Optional context for yourself."
                value={form.note}
                onChange={(e) => setField("note", e.target.value)}
              />
            </div>
          </Grid>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button text="Cancel" variant="secondary" onClick={() => closeModal("me-reminder-add")} />
            <Button text="Add Reminder" variant="primary" onClick={submitAdd} />
          </div>
        </div>
      </Modal>

      {/* ── View Reminder modal ───────────────────────────────────────── */}
      <Modal id="me-reminder-view" title="Reminder Details" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.title}
              subtitle={projectName(viewRow.linkedProjectId)}
              meta={`${viewRow.id} · Due ${viewRow.dueAt}`}
            />
            <ModalGrid title="Overview" cols={2}>
              <ModalData label="Status"     value={viewRow.status} />
              <ModalData label="Due"        value={viewRow.dueAt} />
              <ModalData label="Created"    value={viewRow.createdAt} />
              <ModalData label="Project"    value={projectName(viewRow.linkedProjectId)} />
            </ModalGrid>
            {viewRow.note && (
              <ModalGrid title="Note" cols={1}>
                <ModalData label="" value={viewRow.note} />
              </ModalGrid>
            )}
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("me-reminder-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
