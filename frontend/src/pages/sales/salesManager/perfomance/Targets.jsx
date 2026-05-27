import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Grid, DataField,
  Button, SelectField, Option, openModal, closeModal,
  Modal, ModalData, ModalGrid, ModalProfile,
} from "../../../../components/shared/Common_Components";
import { kpiTargets, initialTargets } from "./PerfomanceStore";
import { Target, CheckCircle, Clock, AlertTriangle, Eye, Pencil, TrendingUp, Trash2, Plus } from "lucide-react";

const KPI_ICONS   = [<Target size={22} />, <CheckCircle size={22} />, <Clock size={22} />, <AlertTriangle size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

// Only key columns — full details in View modal
const TARGET_COLS = [
  { key: "id",         label: "ID" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "type",       label: "Type" },
  { key: "target",     label: "Target" },
  { key: "achieved",   label: "Achieved" },
  { key: "remaining",  label: "Remaining" },
  { key: "deadline",   label: "Deadline" },
  { key: "status",     label: "Status" },
];

const BLANK = { assignedTo: "", role: "", teamLeader: "", type: "", leads: "", target: "", start: "", end: "" };

export default function Targets() {
  const [targets,     setTargets]     = useState(initialTargets);
  const [form,        setForm]        = useState(BLANK);
  const [errors,      setErrors]      = useState({});
  const [editId,      setEditId]      = useState(null);
  const [viewRow,     setViewRow]     = useState(null);
  const [progressRow, setProgressRow] = useState(null);
  const [progressVal, setProgressVal] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.assignedTo.trim()) e.assignedTo = "Required";
    if (!form.target)            e.target     = "Required";
    if (form.leads && form.target && Number(form.target) > Number(form.leads))
      e.target = "Target cannot exceed assigned leads";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const entry = {
      id:         editId ?? `TGT-${String(targets.length + 1).padStart(3, "0")}`,
      assignedTo: form.assignedTo,
      role:       form.role       || "Executive",
      teamLeader: form.teamLeader || "—",
      type:       form.type       || "Monthly",
      leads:      Number(form.leads)  || 0,
      target:     Number(form.target),
      achieved:   0,
      remaining:  Number(form.target),
      deadline:   form.end || "—",
      status:     "Pending",
    };
    setTargets((prev) => editId
      ? prev.map((t) => t.id === editId ? { ...t, ...entry } : t)
      : [...prev, entry]
    );
    setForm(BLANK); setErrors({}); setEditId(null);
    closeModal("tgt-form-modal");
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({ assignedTo: row.assignedTo, role: row.role, teamLeader: row.teamLeader,
      type: row.type, leads: String(row.leads), target: String(row.target),
      start: "", end: row.deadline !== "—" ? row.deadline : "" });
    openModal("tgt-form-modal");
  };

  const openProgress = (row) => {
    setProgressRow(row);
    setProgressVal(String(row.achieved));
    openModal("tgt-progress-modal");
  };

  const saveProgress = () => {
    const val = Number(progressVal);
    setTargets((prev) => prev.map((t) => t.id === progressRow.id
      ? { ...t, achieved: val, remaining: Math.max(0, t.target - val),
          status: val >= t.target ? "Completed" : "In Progress" }
      : t
    ));
    closeModal("tgt-progress-modal");
  };

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Sales" secondaryText="Targets" size={12} />
        {kpiTargets.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      <div className="flex justify-end">
        <Button text="+ &nbsp; Create Target" variant="primary" size={3}
          onClick={() => { setEditId(null); setForm(BLANK); setErrors({}); openModal("tgt-form-modal"); }}
        />
      </div>

      {/* Table — key columns only */}
      <DataTable
        title="Target List"
        columns={TARGET_COLS}
        rows={targets}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => { setViewRow(targets.find((t) => t.id === row.id)); openModal("tgt-view-modal"); },
          },
          {
            icon: <Pencil size={15} />,
            tooltip: "Edit",
            variant: "ghost",
            onClick: (row) => openEdit(targets.find((t) => t.id === row.id)),
          },
          {
            icon: <TrendingUp size={15} />,
            tooltip: "Update Progress",
            variant: "primary",
            onClick: (row) => openProgress(targets.find((t) => t.id === row.id)),
          },
          {
            icon: <Trash2 size={15} />,
            tooltip: "Delete",
            variant: "danger",
            onClick: (row) => setTargets((prev) => prev.filter((t) => t.id !== row.id)),
          },
        ]}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="targets"
        filters={[
          { title: "Type",        type: "toggle", key: "type",       options: ["Daily", "Weekly", "Monthly"] },
          { title: "Status",      type: "toggle", key: "status",     options: ["Pending", "In Progress", "Completed"] },
          { title: "Role",        type: "toggle", key: "role",       options: ["Executive", "Team Leader"] },
          { title: "Team Leader", type: "select", key: "teamLeader", options: [...new Set(initialTargets.map((t) => t.teamLeader).filter((t) => t !== "Self"))] },
        ]}
      />

      {/* ── View Modal ──────────────────────────────────────────────────────── */}
      <Modal id="tgt-view-modal" title="Target Details" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.assignedTo}
              subtitle={`${viewRow.role} · ${viewRow.teamLeader}`}
              meta={`ID: ${viewRow.id} · Deadline: ${viewRow.deadline}`}
            />
            <ModalGrid title="Target Info" cols={2}>
              <ModalData label="Type"           value={viewRow.type} />
              <ModalData label="Assigned Leads" value={viewRow.leads} />
              <ModalData label="Target"         value={viewRow.target} />
              <ModalData label="Achieved"       value={viewRow.achieved} />
              <ModalData label="Remaining"      value={viewRow.remaining} />
              <ModalData label="Status"         value={viewRow.status} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tgt-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      <Modal id="tgt-form-modal" title={editId ? "Edit Target" : "Create Target"} size="md">
        <Grid cols={12} gap={4}>
          <DataField label="Assign To *" id="assignedTo" size={6}
            value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} />
          <SelectField label="Role" id="role" size={6} value={form.role}
            onChange={(e) => set("role", e.target.value)} placeholder="Select Role" searchable={false}>
            <Option value="Executive"   label="Executive" />
            <Option value="Team Leader" label="Team Leader" />
          </SelectField>
          <DataField label="Team Leader" id="tl" size={6}
            value={form.teamLeader} onChange={(e) => set("teamLeader", e.target.value)} />
          <SelectField label="Target Type" id="type" size={6} value={form.type}
            onChange={(e) => set("type", e.target.value)} placeholder="Daily / Weekly / Monthly" searchable={false}>
            <Option value="Daily"   label="Daily" />
            <Option value="Weekly"  label="Weekly" />
            <Option value="Monthly" label="Monthly" />
          </SelectField>
          <DataField label="Assigned Leads" id="leads" type="number" size={6}
            value={form.leads} onChange={(e) => set("leads", e.target.value)} />
          <DataField label="Target Value *" id="target" type="number" size={6}
            value={form.target} onChange={(e) => set("target", e.target.value)} />
          {errors.target && <p className="col-span-12 text-xs text-rose-500">{errors.target}</p>}
          <DataField label="Start Date" id="start" type="date" size={6}
            value={form.start} onChange={(e) => set("start", e.target.value)} />
          <DataField label="End Date" id="end" type="date" size={6}
            value={form.end} onChange={(e) => set("end", e.target.value)} />
          <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("tgt-form-modal")} />
          <Button text={editId ? "Update Target" : "Create Target"} variant="primary" size={6} onClick={handleSubmit} />
        </Grid>
      </Modal>

      {/* ── Progress Modal ──────────────────────────────────────────────────── */}
      <Modal id="tgt-progress-modal" title="Update Progress" size="sm">
        {progressRow && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Target Info" cols={2}>
              <ModalData label="Assigned To"  value={progressRow.assignedTo} />
              <ModalData label="Target Value" value={progressRow.target} />
              <ModalData label="Current"      value={progressRow.achieved} />
            </ModalGrid>
            <DataField label="Achieved So Far" id="progress" type="number"
              value={progressVal} onChange={(e) => setProgressVal(e.target.value)} />
            <div className="flex gap-2 pt-2">
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("tgt-progress-modal")} />
              <Button text="Save"   variant="primary"   size={6} onClick={saveProgress} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
