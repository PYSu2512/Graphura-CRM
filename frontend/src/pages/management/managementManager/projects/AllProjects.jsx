import { useState } from "react";
import {
  DataTable, DataField, SelectField, Option, Button,
  Modal, ModalData, ModalGrid, ModalProfile, Grid,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Eye, Pencil, UserPlus, CheckCircle2, AlertTriangle, MessageSquarePlus,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../../services/apiClient.js";

// ── constants ─────────────────────────────────────────────────────────────────
const PROJECT_STATUSES  = [
  "Not Started", "Work Started", "In Progress",
  "Review Stage", "Finalization", "Completed", "Delivered", "Delayed",
];
const PROJECT_PRIORITIES = ["High", "Medium", "Low", "Urgent"];

const today = () => new Date().toISOString().slice(0, 10);

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtINR = (n) => typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "—";

const statusColor = (s) => {
  if (s === "Completed" || s === "Delivered") return "bg-emerald-100 text-emerald-700";
  if (s === "Delayed")     return "bg-rose-100 text-rose-700";
  if (s === "In Progress" || s === "Work Started") return "bg-blue-100 text-blue-700";
  if (s === "Review Stage" || s === "Finalization") return "bg-violet-100 text-violet-700";
  return "bg-amber-100 text-amber-700";
};

const priorityColor = (p) => {
  if (p === "High" || p === "Urgent") return "bg-rose-100 text-rose-700";
  if (p === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

const BLANK_CREATE = {
  name: "", clientId: "", driveLink: "", startDate: today(),
  deadline: "", priority: "Medium", teamLeaderId: "",
  description: "", workOrderId: "",
};

// Create mode: "wo" = from work order | "manual" = manual entry
const BLANK_CREATE_MODE = "wo";

const BLANK_UPDATE = { status: "In Progress", note: "", isClientVisible: true };

const PROJECT_COLS = [
  { key: "projectNumber", label: "ID" },
  { key: "name",          label: "Project" },
  { key: "clientName",    label: "Client" },
  { key: "assignedTLName",label: "Team Leader" },
  { key: "deadline",      label: "Deadline" },
  { key: "progressPercent", label: "Progress",
    render: (v) => (
      <div className="flex items-center gap-2 min-w-[80px]">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#2a465a] rounded-full" style={{ width: `${v || 0}%` }} />
        </div>
        <span className="text-xs font-bold text-slate-600 shrink-0">{v || 0}%</span>
      </div>
    ),
  },
  { key: "priority", label: "Priority",
    render: (v) => <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${priorityColor(v)}`}>{v}</span> },
  { key: "status",   label: "Status",
    render: (v) => <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(v)}`}>{v}</span> },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function AllProjects({ projects, formData, onRefresh }) {
  const { clients = [], leaders = [], workOrders = [] } = formData;

  const [viewRow,    setViewRow]    = useState(null);
  const [editRow,    setEditRow]    = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [assignRow,  setAssignRow]  = useState(null);
  const [assignTL,   setAssignTL]   = useState("");
  const [updateRow,  setUpdateRow]  = useState(null);
  const [updateForm, setUpdateForm] = useState(BLANK_UPDATE);
  const [blockedRow, setBlockedRow] = useState(null);
  const [blockedReasons, setBlockedReasons] = useState([]);
  const [createForm, setCreateForm] = useState(BLANK_CREATE);
  const [createMode, setCreateMode] = useState(BLANK_CREATE_MODE); // "wo" | "manual"
  const [createErr,  setCreateErr]  = useState({});
  const [saving,     setSaving]     = useState(false);

  // ── When WO is selected, pre-fill name ───────────────────────────────────
  const onWoSelect = (woId) => {
    const wo = workOrders.find((w) => w.id === woId);
    setCreateForm((f) => ({
      ...f,
      workOrderId: woId,
      name: wo ? (f.name || wo.service || "") : f.name,
    }));
  };

  // ── Open handlers ─────────────────────────────────────────────────────────
  const openView = (row) => { setViewRow(projects.find((p) => p.id === row.id)); openModal("mm-project-view"); };
  const openEdit = (row) => {
    const full = projects.find((p) => p.id === row.id) || row;
    setEditRow(full);
    setEditForm({
      name:          full.name,
      description:   full.description || "",
      driveLink:     full.driveLink    || "",
      handoverLink:  full.handoverLink || "",
      startDate:     full.startDate    || "",
      deadline:      full.deadline     || "",
      priority:      full.priority     || "Medium",
      status:        full.status       || "Not Started",
      progressPercent: String(full.progressPercent || 0),
      teamLeaderId:  full.assignedTL   || "",
    });
    openModal("mm-project-edit");
  };
  const openAssign = (row) => {
    const full = projects.find((p) => p.id === row.id);
    setAssignRow(full);
    setAssignTL(full.assignedTL || "");
    openModal("mm-project-assign");
  };
  const openAddUpdate = (row) => {
    const full = projects.find((p) => p.id === row.id);
    setUpdateRow(full);
    setUpdateForm({ status: full.status, note: "", isClientVisible: true });
    openModal("mm-project-add-update");
  };

  // ── Save handlers ─────────────────────────────────────────────────────────
  const saveEdit = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/management/projects/${editRow.id}`, {
        name:           editForm.name,
        description:    editForm.description,
        driveLink:      editForm.driveLink   || null,
        handoverLink:   editForm.handoverLink || null,
        startDate:      editForm.startDate,
        deadline:       editForm.deadline,
        priority:       editForm.priority,
        status:         editForm.status,
        progressPercent: Number(editForm.progressPercent) || 0,
        teamLeaderId:   editForm.teamLeaderId || undefined,
      });
      toast.success("Project updated");
      closeModal("mm-project-edit");
      onRefresh();
    } catch (err) {
      toast.error(err?.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const saveAssign = async () => {
    if (!assignTL) return;
    setSaving(true);
    try {
      await apiClient.put(`/management/projects/${assignRow.id}`, { teamLeaderId: assignTL });
      toast.success("Team leader reassigned");
      closeModal("mm-project-assign");
      onRefresh();
    } catch (err) {
      toast.error(err?.message || "Reassign failed");
    } finally {
      setSaving(false);
    }
  };

  const saveAddUpdate = async () => {
    if (!updateForm.note.trim()) return;
    setSaving(true);
    try {
      await apiClient.post(`/management/projects/${updateRow.id}/updates`, {
        status:          updateForm.status,
        note:            updateForm.note.trim(),
        isClientVisible: updateForm.isClientVisible,
      });
      toast.success("Update added");
      closeModal("mm-project-add-update");
      onRefresh();
    } catch (err) {
      toast.error(err?.message || "Failed to add update");
    } finally {
      setSaving(false);
    }
  };

  const tryDeliver = async (row) => {
    const full = projects.find((p) => p.id === row.id);
    const missing = [];
    if (!full.driveLink)   missing.push("Drive link is missing");
    if (!full.handoverLink) missing.push("Handover link is missing");
    if (missing.length) {
      setBlockedRow(full); setBlockedReasons(missing);
      openModal("mm-deliver-blocked"); return;
    }
    try {
      await apiClient.post(`/management/projects/${full.id}/complete`);
      toast.success("Project marked completed");
      onRefresh();
    } catch (err) {
      toast.error(err?.message || "Failed to complete project");
    }
  };

  // ── Create project ────────────────────────────────────────────────────────
  const setCreateField = (k, v) => {
    setCreateForm((f) => ({ ...f, [k]: v }));
    if (createErr[k]) setCreateErr((e) => ({ ...e, [k]: "" }));
  };

  const submitCreate = async () => {
    const errs = {};
    if (!createForm.name.trim())      errs.name         = "Project name is required.";
    if (createMode === "manual" && !createForm.clientId) errs.clientId = "Select a client.";
    if (createMode === "wo"     && !createForm.workOrderId) errs.workOrderId = "Select a work order.";
    if (!createForm.driveLink.trim()) errs.driveLink    = "Drive link is mandatory per spec.";
    if (!createForm.startDate)        errs.startDate    = "Start date is required.";
    if (!createForm.deadline)         errs.deadline     = "Deadline is required.";
    if (createForm.startDate && createForm.deadline && createForm.deadline < createForm.startDate)
      errs.deadline = "Deadline must be on or after start date.";
    if (!createForm.teamLeaderId)     errs.teamLeaderId = "Assign a Team Leader.";
    if (Object.keys(errs).length) { setCreateErr(errs); return; }

    // For WO mode: backend derives clientId from the work order
    const payload = {
      name:         createForm.name.trim(),
      driveLink:    createForm.driveLink.trim(),
      startDate:    createForm.startDate,
      deadline:     createForm.deadline,
      priority:     createForm.priority,
      teamLeaderId: createForm.teamLeaderId,
      description:  createForm.description || "",
    };
    if (createMode === "wo") {
      payload.workOrderId = createForm.workOrderId;
    } else {
      payload.clientId = createForm.clientId;
    }

    setSaving(true);
    try {
      await apiClient.post("/management/projects", payload);
      toast.success("Project created");
      setCreateForm(BLANK_CREATE);
      setCreateErr({});
      closeModal("mm-project-create");
      onRefresh();
    } catch (err) {
      toast.error(err?.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Header + Add button */}
      <div className="flex justify-end">
        <Button text="+ Add Project" variant="primary"
          onClick={() => { setCreateForm(BLANK_CREATE); setCreateErr({}); openModal("mm-project-create"); }} />
      </div>

      <DataTable
        title="All Projects"
        columns={PROJECT_COLS}
        rows={projects}
        pageSize={10}
        searchable
        exportable
        exportFileName="projects_export"
        filters={[
          { title: "Status",   type: "select", key: "status",   options: PROJECT_STATUSES },
          { title: "Priority", type: "toggle", key: "priority", options: PROJECT_PRIORITIES },
        ]}
        actions={[
          { icon: <Eye size={15}/>,              tooltip: "View",           variant: "ghost",   onClick: openView },
          { icon: <Pencil size={15}/>,           tooltip: "Edit",           variant: "ghost",   onClick: openEdit },
          { icon: <UserPlus size={15}/>,         tooltip: "Reassign TL",    variant: "ghost",   onClick: openAssign },
          { icon: <MessageSquarePlus size={15}/>,tooltip: "Add Update",     variant: "ghost",   onClick: openAddUpdate },
          { icon: <CheckCircle2 size={15}/>,     tooltip: "Mark Completed", variant: "success", onClick: tryDeliver },
        ]}
      />

      {/* ── Create Project Modal ───────────────────────────────────────────── */}
      <Modal id="mm-project-create" title="Add New Project" size="lg">
        <div className="flex flex-col gap-5">

          {/* ── Mode switcher ──────────────────────────────────────────────── */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              type="button"
              onClick={() => { setCreateMode("wo"); setCreateForm(BLANK_CREATE); setCreateErr({}); }}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                createMode === "wo"
                  ? "bg-[#2a465a] text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              📋 From Work Order
            </button>
            <button
              type="button"
              onClick={() => { setCreateMode("manual"); setCreateForm(BLANK_CREATE); setCreateErr({}); }}
              className={`flex-1 py-2.5 text-sm font-bold transition-all border-l border-slate-200 ${
                createMode === "manual"
                  ? "bg-[#2a465a] text-white"
                  : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              ✏️ Create Manually
            </button>
          </div>

          {/* ── MODE: From Work Order ───────────────────────────────────────── */}
          {createMode === "wo" && (
            <div className="flex flex-col gap-4">
              {workOrders.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                  No approved work orders available. All work orders have already been linked to projects, or none have been approved yet.
                </div>
              ) : (
                <>
                  <div>
                    <SelectField label="Select Work Order *" id="mm-create-wo"
                      value={createForm.workOrderId}
                      onChange={(e) => onWoSelect(e.target.value)}>
                      <Option value="" label="— Select a Work Order —" />
                      {workOrders.map((w) => (
                        <Option key={w.id} value={w.id}
                          label={`${w.woNumber} · ${w.clientName} · ${w.service || "—"} · ₹${Number(w.netPayable || 0).toLocaleString("en-IN")}`} />
                      ))}
                    </SelectField>
                    {createErr.workOrderId && <p className="text-xs text-rose-600 mt-1">{createErr.workOrderId}</p>}
                  </div>

                  {/* Show WO preview when selected */}
                  {createForm.workOrderId && (() => {
                    const wo = workOrders.find((w) => w.id === createForm.workOrderId);
                    if (!wo) return null;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-2 gap-3 text-sm">
                        <div><span className="text-slate-400 text-xs">Client</span><p className="font-semibold text-slate-800">{wo.clientName}</p></div>
                        <div><span className="text-slate-400 text-xs">Service</span><p className="font-semibold text-slate-800">{wo.service || "—"}</p></div>
                        <div><span className="text-slate-400 text-xs">Net Payable</span><p className="font-semibold text-slate-800">₹{Number(wo.netPayable || 0).toLocaleString("en-IN")}</p></div>
                        <div><span className="text-slate-400 text-xs">Payment</span><p className="font-semibold text-slate-800">{wo.paymentStatus}</p></div>
                        <div><span className="text-slate-400 text-xs">Signed</span><p className="font-semibold text-slate-800">{wo.signedStatus}</p></div>
                      </div>
                    );
                  })()}

                  <Grid cols={12} gap={3}>
                    <div className="col-span-12">
                      <DataField label="Project Name *" id="mm-create-name-wo" value={createForm.name}
                        onChange={(e) => setCreateField("name", e.target.value)}
                        placeholder="e.g. Acme Website Redesign" size={12} />
                      {createErr.name && <p className="text-xs text-rose-600 mt-1">{createErr.name}</p>}
                    </div>
                    <div className="col-span-12">
                      <DataField label="Drive Link * (mandatory per spec)" id="mm-create-drive-wo"
                        value={createForm.driveLink}
                        onChange={(e) => setCreateField("driveLink", e.target.value)}
                        placeholder="https://drive.google.com/folder/..." size={12} />
                      {createErr.driveLink && <p className="text-xs text-rose-600 mt-1">{createErr.driveLink}</p>}
                    </div>
                    <div className="col-span-6">
                      <DataField label="Start Date *" id="mm-create-start-wo" type="date"
                        value={createForm.startDate}
                        onChange={(e) => setCreateField("startDate", e.target.value)} size={12} />
                      {createErr.startDate && <p className="text-xs text-rose-600 mt-1">{createErr.startDate}</p>}
                    </div>
                    <div className="col-span-6">
                      <DataField label="Deadline *" id="mm-create-deadline-wo" type="date"
                        value={createForm.deadline}
                        onChange={(e) => setCreateField("deadline", e.target.value)} size={12} />
                      {createErr.deadline && <p className="text-xs text-rose-600 mt-1">{createErr.deadline}</p>}
                    </div>
                    <div className="col-span-6">
                      <SelectField label="Priority" id="mm-create-priority-wo" value={createForm.priority}
                        onChange={(e) => setCreateField("priority", e.target.value)} size={12}>
                        {PROJECT_PRIORITIES.map((p) => <Option key={p} value={p} label={p} />)}
                      </SelectField>
                    </div>
                    <div className="col-span-6">
                      <SelectField label="Team Leader *" id="mm-create-tl-wo" value={createForm.teamLeaderId}
                        onChange={(e) => setCreateField("teamLeaderId", e.target.value)} size={12}>
                        <Option value="" label="-- Select Team Leader --" />
                        {leaders.map((l) => <Option key={l.id} value={l.id} label={l.name} />)}
                      </SelectField>
                      {createErr.teamLeaderId && <p className="text-xs text-rose-600 mt-1">{createErr.teamLeaderId}</p>}
                    </div>
                  </Grid>
                </>
              )}
            </div>
          )}

          {/* ── MODE: Manual ────────────────────────────────────────────────── */}
          {createMode === "manual" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs text-blue-700">
                Only clients who have previously made a successful payment are shown below.
              </div>
              <Grid cols={12} gap={3}>
                <div className="col-span-12">
                  <DataField label="Project Name *" id="mm-create-name" value={createForm.name}
                    onChange={(e) => setCreateField("name", e.target.value)}
                    placeholder="e.g. Acme Website Redesign" size={12} />
                  {createErr.name && <p className="text-xs text-rose-600 mt-1">{createErr.name}</p>}
                </div>
                <div className="col-span-12">
                  <SelectField label="Client * (paying customers only)" id="mm-create-client" value={createForm.clientId}
                    onChange={(e) => setCreateField("clientId", e.target.value)} size={12}>
                    <Option value="" label="-- Select client --" />
                    {clients.length === 0 && <Option value="" label="No paying clients found" />}
                    {clients.map((c) => (
                      <Option key={c.id} value={c.id} label={`${c.name}${c.mobile ? " · " + c.mobile : ""}`} />
                    ))}
                  </SelectField>
                  {createErr.clientId && <p className="text-xs text-rose-600 mt-1">{createErr.clientId}</p>}
                </div>
                <div className="col-span-12">
                  <DataField label="Drive Link * (mandatory per spec)" id="mm-create-drive"
                    value={createForm.driveLink}
                    onChange={(e) => setCreateField("driveLink", e.target.value)}
                    placeholder="https://drive.google.com/folder/..." size={12} />
                  {createErr.driveLink && <p className="text-xs text-rose-600 mt-1">{createErr.driveLink}</p>}
                </div>
                <div className="col-span-6">
                  <DataField label="Start Date *" id="mm-create-start" type="date"
                    value={createForm.startDate}
                    onChange={(e) => setCreateField("startDate", e.target.value)} size={12} />
                  {createErr.startDate && <p className="text-xs text-rose-600 mt-1">{createErr.startDate}</p>}
                </div>
                <div className="col-span-6">
                  <DataField label="Deadline *" id="mm-create-deadline" type="date"
                    value={createForm.deadline}
                    onChange={(e) => setCreateField("deadline", e.target.value)} size={12} />
                  {createErr.deadline && <p className="text-xs text-rose-600 mt-1">{createErr.deadline}</p>}
                </div>
                <div className="col-span-6">
                  <SelectField label="Priority" id="mm-create-priority" value={createForm.priority}
                    onChange={(e) => setCreateField("priority", e.target.value)} size={12}>
                    {PROJECT_PRIORITIES.map((p) => <Option key={p} value={p} label={p} />)}
                  </SelectField>
                </div>
                <div className="col-span-6">
                  <SelectField label="Team Leader *" id="mm-create-tl" value={createForm.teamLeaderId}
                    onChange={(e) => setCreateField("teamLeaderId", e.target.value)} size={12}>
                    <Option value="" label="-- Select Team Leader --" />
                    {leaders.map((l) => <Option key={l.id} value={l.id} label={l.name} />)}
                  </SelectField>
                  {createErr.teamLeaderId && <p className="text-xs text-rose-600 mt-1">{createErr.teamLeaderId}</p>}
                </div>
                <div className="col-span-12">
                  <DataField label="Description (optional)" id="mm-create-desc"
                    type="textarea" value={createForm.description}
                    onChange={(e) => setCreateField("description", e.target.value)} size={12} />
                </div>
              </Grid>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button text="Cancel" variant="ghost"
              onClick={() => { setCreateForm(BLANK_CREATE); setCreateErr({}); setCreateMode(BLANK_CREATE_MODE); closeModal("mm-project-create"); }} />
            <Button text={saving ? "Creating…" : "Create Project"} variant="primary" onClick={submitCreate} />
          </div>
        </div>
      </Modal>

      {/* ── View Modal ─────────────────────────────────────────────────────── */}
      <Modal id="mm-project-view" title="Project Details" size="lg">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={viewRow.name}
              subtitle={`${viewRow.clientName} · ${viewRow.assignedTLName}`}
              meta={`${viewRow.projectNumber} · Deadline: ${viewRow.deadline || "—"}`} />

            <ModalGrid title="Overview" cols={3}>
              <ModalData label="Status"     value={viewRow.status} />
              <ModalData label="Priority"   value={viewRow.priority} />
              <ModalData label="Progress"   value={`${viewRow.progressPercent || 0}%`} />
              <ModalData label="Start Date" value={viewRow.startDate || "—"} />
              <ModalData label="Deadline"   value={viewRow.deadline  || "—"} />
              <ModalData label="Delivered"  value={viewRow.deliveredAt || "—"} />
            </ModalGrid>

            <ModalGrid title="Client" cols={2}>
              <ModalData label="Name"   value={viewRow.clientName}   />
              <ModalData label="Mobile" value={viewRow.clientMobile  || "—"} />
            </ModalGrid>

            <ModalGrid title="Team" cols={2}>
              <ModalData label="Team Leader" value={viewRow.assignedTLName || "—"} />
            </ModalGrid>

            <ModalGrid title="Links" cols={1}>
              <ModalData label="Drive Link"    value={viewRow.driveLink    || "—"} />
              <ModalData label="Handover Link" value={viewRow.handoverLink || "— (required before completion)"} />
            </ModalGrid>

            {viewRow.workOrderNumber && (
              <ModalGrid title="Work Order" cols={2}>
                <ModalData label="WO Number" value={viewRow.workOrderNumber} />
              </ModalGrid>
            )}

            <ModalGrid title="Finance (read-only)" cols={3}>
              <ModalData label="Total Cost"  value={fmtINR(viewRow.totalCost)}  />
              <ModalData label="Paid"        value={fmtINR(viewRow.paidAmount)} />
              <ModalData label="Remaining"   value={fmtINR(Math.max(0, (viewRow.totalCost || 0) - (viewRow.paidAmount || 0)))} />
            </ModalGrid>

            {/* Updates timeline */}
            {(viewRow.updates || []).length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Project Updates ({viewRow.updates.length})
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {[...viewRow.updates].reverse().map((u, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2a465a]">{u.date}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">{u.status}</span>
                      </div>
                      <p className="text-sm text-slate-700">{u.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mm-project-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <Modal id="mm-project-edit" title="Edit Project" size="lg">
        {editRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={editRow.name} subtitle={editRow.clientName} meta={editRow.projectNumber} />
            <Grid cols={12} gap={3}>
              <DataField label="Project Name *"  id="mm-edit-name"     value={editForm.name}         onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}         size={12} />
              <DataField label="Drive Link *"    id="mm-edit-drive"    value={editForm.driveLink}    onChange={(e) => setEditForm({ ...editForm, driveLink: e.target.value })}    size={12} />
              <DataField label="Handover Link"   id="mm-edit-handover" value={editForm.handoverLink} onChange={(e) => setEditForm({ ...editForm, handoverLink: e.target.value })} size={12} />
              <DataField label="Description"     id="mm-edit-desc"     value={editForm.description || ""} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} size={12} />
              <DataField label="Start Date"      id="mm-edit-start"    type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} size={6} />
              <DataField label="Deadline"        id="mm-edit-deadline" type="date" value={editForm.deadline}  onChange={(e) => setEditForm({ ...editForm, deadline:  e.target.value })} size={6} />
              <SelectField label="Priority" id="mm-edit-priority" value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })} size={4}>
                {PROJECT_PRIORITIES.map((p) => <Option key={p} value={p} label={p} />)}
              </SelectField>
              <SelectField label="Status" id="mm-edit-status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} size={4}>
                {PROJECT_STATUSES.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <DataField label="Progress %" id="mm-edit-progress" type="number" value={editForm.progressPercent} onChange={(e) => setEditForm({ ...editForm, progressPercent: e.target.value })} size={4} />
            </Grid>
            <Grid cols={12} gap={2}>
              <Button text="Cancel" variant="ghost"    size={6} onClick={() => closeModal("mm-project-edit")} />
              <Button text={saving ? "Saving…" : "Save"} variant="primary" size={6} onClick={saveEdit} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Reassign TL Modal ──────────────────────────────────────────────── */}
      <Modal id="mm-project-assign" title="Reassign Team Leader" size="md">
        {assignRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={assignRow.name}
              subtitle={`Currently: ${assignRow.assignedTLName}`} meta={assignRow.projectNumber} />
            <SelectField label="New Team Leader" id="mm-assign-tl" value={assignTL} onChange={(e) => setAssignTL(e.target.value)} size={12}>
              <Option value="" label="-- Select Team Leader --" />
              {leaders.map((l) => <Option key={l.id} value={l.id} label={l.name} />)}
            </SelectField>
            <Grid cols={12} gap={2}>
              <Button text="Cancel"   variant="ghost"   size={6} onClick={() => closeModal("mm-project-assign")} />
              <Button text={saving ? "Saving…" : "Reassign"} variant="primary" size={6} onClick={saveAssign} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Add Update Modal ───────────────────────────────────────────────── */}
      <Modal id="mm-project-add-update" title="Add Project Update" size="md">
        {updateRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={updateRow.name}
              subtitle={`Current: ${updateRow.status}`}
              meta={`${updateRow.projectNumber} · Visible on client tracking page`} />
            <Grid cols={12} gap={3}>
              <SelectField label="Status" id="mm-upd-status" value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })} size={12}>
                {PROJECT_STATUSES.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <div className="col-span-12">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">Description / Note *</label>
                <textarea
                  placeholder="What changed? What's next?"
                  value={updateForm.note}
                  onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 resize-none"
                />
              </div>
            </Grid>
            <Grid cols={12} gap={2}>
              <Button text="Cancel"   variant="ghost"   size={6} onClick={() => { setUpdateForm(BLANK_UPDATE); closeModal("mm-project-add-update"); }} />
              <Button text={saving ? "Posting…" : "Post Update"} variant="primary" size={6} onClick={saveAddUpdate} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Delivery-blocked Modal ─────────────────────────────────────────── */}
      <Modal id="mm-deliver-blocked" title="Cannot Mark Completed" size="sm">
        {blockedRow && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-rose-700">Mandatory fields are missing</p>
                <p className="text-xs text-rose-600 mt-1">Both drive link and handover link must be set before completion.</p>
              </div>
            </div>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {blockedReasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
            <Grid cols={12} gap={2}>
              <Button text="Close"        variant="ghost"   size={6} onClick={() => closeModal("mm-deliver-blocked")} />
              <Button text="Edit Project" variant="primary" size={6} onClick={() => { closeModal("mm-deliver-blocked"); openEdit(blockedRow); }} />
            </Grid>
          </div>
        )}
      </Modal>
    </>
  );
}
