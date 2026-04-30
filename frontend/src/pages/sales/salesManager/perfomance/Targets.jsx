import React, { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable, Grid, DataField,
  Button, Select, Option, openModal, closeModal, Modal, ModalData,
} from "../../../../components/shared/Common_Components";
import { kpiTargets, initialTargets } from "./PerfomanceStore";
import { Target, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const kpiIcons = [
  <Target size={22} />, <CheckCircle size={22} />,
  <Clock size={22} />, <AlertTriangle size={22} />,
];
const kpiAccents = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

const targetCols = [
  { key: "id",         label: "Target ID" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "role",       label: "Role" },
  { key: "teamLeader", label: "Team Leader" },
  { key: "type",       label: "Target Type" },
  { key: "leads",      label: "Assigned Leads" },
  { key: "target",     label: "Target" },
  { key: "achieved",   label: "Achieved" },
  { key: "remaining",  label: "Remaining" },
  { key: "deadline",   label: "Deadline" },
  { key: "status",     label: "Status" },
];

const blankForm = {
  assignedTo: "", role: "", teamLeader: "",
  type: "", leads: "", target: "", start: "", end: "",
};

export default function Targets() {
  const [targets, setTargets] = useState(initialTargets);
  const [form, setForm] = useState(blankForm);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [progressVal, setProgressVal] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.assignedTo.trim()) e.assignedTo = "Required";
    if (!form.target) e.target = "Required";
    if (form.leads && form.target && Number(form.target) > Number(form.leads))
      e.target = "Target cannot exceed assigned leads";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newEntry = {
      id: editId ?? `TGT-${String(targets.length + 1).padStart(3, "0")}`,
      assignedTo: form.assignedTo,
      role: form.role || "Executive",
      teamLeader: form.teamLeader || "—",
      type: form.type || "Monthly",
      leads: Number(form.leads) || 0,
      target: Number(form.target),
      achieved: 0,
      remaining: Number(form.target),
      deadline: form.end || "—",
      status: "Pending",
    };
    if (editId) {
      setTargets((prev) => prev.map((t) => (t.id === editId ? { ...t, ...newEntry } : t)));
    } else {
      setTargets((prev) => [...prev, newEntry]);
    }
    setForm(blankForm);
    setErrors({});
    setEditId(null);
    closeModal("target-form-modal");
  };

  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      assignedTo: row.assignedTo, role: row.role, teamLeader: row.teamLeader,
      type: row.type, leads: String(row.leads), target: String(row.target),
      start: "", end: row.deadline !== "—" ? row.deadline : "",
    });
    openModal("target-form-modal");
  };

  const openProgress = (row) => {
    setSelectedRow(row);
    setProgressVal(String(row.achieved));
    openModal("target-progress-modal");
  };

  const handleProgressSave = () => {
    const val = Number(progressVal);
    setTargets((prev) =>
      prev.map((t) =>
        t.id === selectedRow.id
          ? { ...t, achieved: val, remaining: Math.max(0, t.target - val),
              status: val >= t.target ? "Completed" : "In Progress" }
          : t
      )
    );
    closeModal("target-progress-modal");
  };

  const handleDelete = (row) =>
    setTargets((prev) => prev.filter((t) => t.id !== row.id));

  const actions = [
    { label: "View",            variant: "ghost",   onClick: (row) => { setSelectedRow(row); openModal("target-view-modal"); } },
    { label: "Edit",            variant: "primary", onClick: openEdit },
    { label: "Update Progress", variant: "ghost",   onClick: openProgress },
    { label: "Delete",          variant: "danger",  onClick: handleDelete },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Sales" secondaryText="Targets" size={12} />
        {kpiTargets.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={kpiIcons[i]} accentColor={kpiAccents[i]} size={3} />
        ))}
      </DashGrid>

      <div className="flex justify-end">
        <button
          onClick={() => { setEditId(null); setForm(blankForm); setErrors({}); openModal("target-form-modal"); }}
          className="px-5 py-2.5 rounded-xl bg-[#2a465a] text-white text-sm font-bold shadow"
        >
          + Create Target
        </button>
      </div>

      <DataTable
        title="Target List"
        columns={targetCols}
        rows={targets}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        filters={[
          { title: "Type",   type: "toggle", key: "type",   options: ["Daily", "Weekly", "Monthly"] },
          { title: "Status", type: "toggle", key: "status", options: ["Pending", "In Progress", "Completed"] },
        ]}
      />

      {/* Create / Edit Modal */}
      <Modal id="target-form-modal" title={editId ? "Edit Target" : "Create Target"} size="md">
        <Grid cols={12} gap={4}>
          <DataField label="Assign To *" id="assignedTo" size={6}
            value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} />
          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Role</label>
            <Select value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Select Role" size={12}>
              <Option value="Executive"   label="Executive" />
              <Option value="Team Leader" label="Team Leader" />
            </Select>
          </div>
          <DataField label="Team Leader" id="tl" size={6}
            value={form.teamLeader} onChange={(e) => set("teamLeader", e.target.value)} />
          <div className="col-span-12 sm:col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Target Type</label>
            <Select value={form.type} onChange={(e) => set("type", e.target.value)} placeholder="Daily/Weekly/Monthly" size={12}>
              <Option value="Daily"   label="Daily" />
              <Option value="Weekly"  label="Weekly" />
              <Option value="Monthly" label="Monthly" />
            </Select>
          </div>
          <DataField label="Assigned Leads" id="leads" type="number" size={6}
            value={form.leads} onChange={(e) => set("leads", e.target.value)} />
          <DataField label="Target Value *" id="target" type="number" size={6}
            value={form.target} onChange={(e) => set("target", e.target.value)} />
          {errors.target && <p className="col-span-12 text-xs text-rose-500">{errors.target}</p>}
          <DataField label="Start Date" id="start" type="date" size={6}
            value={form.start} onChange={(e) => set("start", e.target.value)} />
          <DataField label="End Date" id="end" type="date" size={6}
            value={form.end} onChange={(e) => set("end", e.target.value)} />
          <div className="col-span-6">
            <Button text="Cancel" variant="secondary" onClick={() => closeModal("target-form-modal")} />
          </div>
          <div className="col-span-6">
            <Button text={editId ? "Update Target" : "Create Target"} variant="primary" onClick={handleSubmit} />
          </div>
        </Grid>
      </Modal>

      {/* View Modal */}
      <Modal id="target-view-modal" title="Target Details" size="md">
        {selectedRow && (
          <div className="grid grid-cols-2 gap-4">
            <ModalData label="Target ID"     value={selectedRow.id} />
            <ModalData label="Assigned To"   value={selectedRow.assignedTo} />
            <ModalData label="Role"          value={selectedRow.role} />
            <ModalData label="Team Leader"   value={selectedRow.teamLeader} />
            <ModalData label="Type"          value={selectedRow.type} />
            <ModalData label="Assigned Leads"value={selectedRow.leads} />
            <ModalData label="Target"        value={selectedRow.target} />
            <ModalData label="Achieved"      value={selectedRow.achieved} />
            <ModalData label="Remaining"     value={selectedRow.remaining} />
            <ModalData label="Deadline"      value={selectedRow.deadline} />
            <ModalData label="Status"        value={selectedRow.status} />
          </div>
        )}
      </Modal>

      {/* Progress Modal */}
      <Modal id="target-progress-modal" title="Update Progress" size="sm">
        {selectedRow && (
          <div className="flex flex-col gap-4">
            <ModalData label="Target For"   value={selectedRow.assignedTo} />
            <ModalData label="Target Value" value={selectedRow.target} />
            <DataField label="Achieved So Far" id="progress" type="number"
              value={progressVal} onChange={(e) => setProgressVal(e.target.value)} />
            <div className="flex gap-2 pt-2">
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("target-progress-modal")} />
              <Button text="Save" variant="primary" size={6} onClick={handleProgressSave} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}