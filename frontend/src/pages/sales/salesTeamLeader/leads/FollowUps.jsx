import { useState, useMemo } from "react";
import {
  DataTable, Modal, Button, DataField, SelectField, Option,
  openModal, closeModal, ModalProfile, ModalData, ModalGrid, Grid,
  DashGrid, EnhancedDashCard,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Eye, CheckCircle2, RotateCcw, CalendarClock, AlertTriangle, Calendar,
} from "lucide-react";
import {
  INITIAL_FOLLOWUPS, FOLLOWUP_TYPES, FOLLOWUP_PRIORITIES,
  executiveNames, teamExecutives,
} from "./leadsStore";

const TODAY = new Date().toISOString().split("T")[0];

// Promote any pending follow-up dated before today to "Overdue" automatically.
const promoteOverdue = (rows) =>
  rows.map((r) =>
    r.status === "Pending" && r.date < TODAY ? { ...r, status: "Overdue" } : r
  );

const COLS = [
  { key: "leadName",     label: "Lead" },
  { key: "type",         label: "Type" },
  { key: "date",         label: "Date" },
  { key: "time",         label: "Time" },
  { key: "priority",     label: "Priority" },
  { key: "assignedExec", label: "Executive" },
  { key: "status",       label: "Status" }, // auto-renders as colored badge
];

const initialForm = {
  leadName: "", date: TODAY, time: "10:00", type: "Call",
  priority: "Medium", assignedExec: "", notes: "",
};

export default function FollowUps() {
  const [rows,     setRows]     = useState(promoteOverdue(INITIAL_FOLLOWUPS));
  const [viewRow,  setViewRow]  = useState(null);
  const [reschRow, setReschRow] = useState(null);
  const [reschTo,  setReschTo]  = useState({ date: "", time: "" });

  const [form,     setForm]     = useState(initialForm);
  const [formErr,  setFormErr]  = useState({});

  const today    = useMemo(() => rows.filter((r) => r.date === TODAY && r.status !== "Done").length, [rows]);
  const overdue  = useMemo(() => rows.filter((r) => r.status === "Overdue").length, [rows]);
  const upcoming = useMemo(() => rows.filter((r) => r.date > TODAY && r.status !== "Done").length, [rows]);
  const done     = useMemo(() => rows.filter((r) => r.status === "Done").length, [rows]);

  const markDone = (row) => {
    setRows((prev) => prev.map((r) => r.id === row.id ? { ...r, status: "Done" } : r));
  };

  const openResch = (row) => {
    setReschRow(row);
    setReschTo({ date: row.date, time: row.time });
    openModal("tl-fu-resch");
  };

  const confirmResch = () => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === reschRow.id
          ? { ...r, date: reschTo.date, time: reschTo.time, status: reschTo.date < TODAY ? "Overdue" : "Pending" }
          : r
      )
    );
    closeModal("tl-fu-resch");
  };

  const openAdd = () => {
    setForm(initialForm);
    setFormErr({});
    openModal("tl-fu-add");
  };

  const saveAdd = () => {
    const errs = {};
    if (!form.leadName.trim())   errs.leadName     = "Lead name is required.";
    if (!form.date)              errs.date         = "Date is required.";
    if (!form.time)              errs.time         = "Time is required.";
    if (!form.assignedExec)      errs.assignedExec = "Pick an executive.";
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    const newRow = {
      id:           `FU-${Date.now()}`,
      leadName:     form.leadName.trim(),
      date:         form.date,
      time:         form.time,
      type:         form.type,
      priority:     form.priority,
      assignedExec: form.assignedExec,
      notes:        form.notes.trim(),
      status:       form.date < TODAY ? "Overdue" : "Pending",
    };
    setRows((prev) => [newRow, ...prev]);
    closeModal("tl-fu-add");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Today"     value={String(today)}    icon={<CalendarClock size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Overdue"   value={String(overdue)}  icon={<AlertTriangle size={22} />} accentColor="#f43f5e" size={3} />
        <EnhancedDashCard title="Upcoming"  value={String(upcoming)} icon={<Calendar      size={22} />} accentColor="#14b8a6" size={3} />
        <EnhancedDashCard title="Completed" value={String(done)}     icon={<CheckCircle2  size={22} />} accentColor="#22c55e" size={3} />
      </DashGrid>

      {/* ── Add reminder button ──────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button text="+  Add Reminder" variant="primary" onClick={openAdd} />
      </div>

      {/* ── Follow-ups table ─────────────────────────────────────────────── */}
      <DataTable
        title="Team Follow-ups"
        columns={COLS}
        rows={rows}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="team_followups"
        filters={[
          { title: "Status",    type: "toggle", key: "status",       options: ["Pending", "Overdue", "Done"] },
          { title: "Type",      type: "toggle", key: "type",         options: FOLLOWUP_TYPES },
          { title: "Priority",  type: "toggle", key: "priority",     options: FOLLOWUP_PRIORITIES },
          { title: "Executive", type: "select", key: "assignedExec", options: executiveNames },
        ]}
        actions={[
          { icon: <Eye size={15} />,           tooltip: "View",        variant: "ghost",
            onClick: (row) => { setViewRow(rows.find((r) => r.id === row.id)); openModal("tl-fu-view"); } },
          { icon: <CheckCircle2 size={15} />,  tooltip: "Mark Done",   variant: "primary",
            onClick: markDone },
          { icon: <RotateCcw size={15} />,     tooltip: "Reschedule",  variant: "ghost",
            onClick: openResch },
        ]}
      />

      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="tl-fu-view" title="Follow-up Details" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.leadName}
              subtitle={`${viewRow.type} · ${viewRow.status}`}
              meta={`Assigned to ${viewRow.assignedExec}`}
            />
            <ModalGrid title="Schedule" cols={2}>
              <ModalData label="Date"     value={viewRow.date} />
              <ModalData label="Time"     value={viewRow.time} />
              <ModalData label="Type"     value={viewRow.type} />
              <ModalData label="Priority" value={viewRow.priority} />
            </ModalGrid>
            <ModalGrid title="Notes" cols={1}>
              <ModalData label="Agenda" value={viewRow.notes || "—"} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {viewRow.status !== "Done" && (
                <Button text="Mark Done" variant="primary" size={3}
                  onClick={() => { markDone(viewRow); closeModal("tl-fu-view"); }} />
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-fu-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Add reminder modal ───────────────────────────────────────────── */}
      <Modal id="tl-fu-add" title="Add Reminder" size="md">
        <div className="space-y-4">
          <Grid cols={12} gap={4}>
            <DataField label="Lead Name" id="tl-fu-lead" value={form.leadName} size={12}
              onChange={(e) => { setForm((p) => ({ ...p, leadName: e.target.value })); setFormErr((er) => ({ ...er, leadName: "" })); }} />
            {formErr.leadName && <p className="col-span-12 -mt-2 text-xs text-rose-600 px-1">{formErr.leadName}</p>}

            <DataField label="Date" id="tl-fu-date" type="date" value={form.date} size={6}
              onChange={(e) => { setForm((p) => ({ ...p, date: e.target.value })); setFormErr((er) => ({ ...er, date: "" })); }} />
            <DataField label="Time" id="tl-fu-time" type="time" value={form.time} size={6}
              onChange={(e) => { setForm((p) => ({ ...p, time: e.target.value })); setFormErr((er) => ({ ...er, time: "" })); }} />

            <SelectField label="Type" value={form.type} size={6} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {FOLLOWUP_TYPES.map((t) => <Option key={t} value={t} label={t} />)}
            </SelectField>
            <SelectField label="Priority" value={form.priority} size={6} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
              {FOLLOWUP_PRIORITIES.map((p) => <Option key={p} value={p} label={p} />)}
            </SelectField>

            <SelectField label="Assigned Executive" value={form.assignedExec} size={12}
              onChange={(e) => { setForm((p) => ({ ...p, assignedExec: e.target.value })); setFormErr((er) => ({ ...er, assignedExec: "" })); }}>
              <Option value="" label="-- Pick an executive --" />
              {teamExecutives.map((ex) => <Option key={ex.id} value={ex.name} label={ex.name} />)}
            </SelectField>
            {formErr.assignedExec && <p className="col-span-12 -mt-2 text-xs text-rose-600 px-1">{formErr.assignedExec}</p>}

            <DataField label="Notes / Agenda" id="tl-fu-notes" value={form.notes} size={12}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />

            <Button text="Save Reminder" variant="primary"   size={6} onClick={saveAdd} />
            <Button text="Cancel"        variant="secondary" size={6} onClick={() => closeModal("tl-fu-add")} />
          </Grid>
        </div>
      </Modal>

      {/* ── Reschedule modal ─────────────────────────────────────────────── */}
      <Modal id="tl-fu-resch" title="Reschedule Follow-up" size="sm">
        {reschRow && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Current" cols={2}>
              <ModalData label="Lead" value={reschRow.leadName} />
              <ModalData label="When" value={`${reschRow.date} ${reschRow.time}`} />
            </ModalGrid>
            <Grid cols={12} gap={4}>
              <DataField label="New Date" id="tl-fu-resch-date" type="date" value={reschTo.date} size={6}
                onChange={(e) => setReschTo((p) => ({ ...p, date: e.target.value }))} />
              <DataField label="New Time" id="tl-fu-resch-time" type="time" value={reschTo.time} size={6}
                onChange={(e) => setReschTo((p) => ({ ...p, time: e.target.value }))} />
            </Grid>
            <Grid cols={12} gap={2}>
              <Button text="Cancel"  variant="secondary" size={6} onClick={() => closeModal("tl-fu-resch")} />
              <Button text="Confirm" variant="primary"   size={6} onClick={confirmResch} disabled={!reschTo.date || !reschTo.time} />
            </Grid>
          </div>
        )}
      </Modal>
    </div>
  );
}
