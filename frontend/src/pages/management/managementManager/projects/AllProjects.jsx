import { useState } from "react";
import {
  DataTable,
  DataField,
  SelectField,
  Option,
  Button,
  Modal,
  ModalData,
  ModalGrid,
  ModalProfile,
  Grid,
  openModal,
  closeModal,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Eye,
  Pencil,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  MessageSquarePlus,
} from "lucide-react";
import { teamLeaders, clientList, employeeName } from "../managementManagerStore";
import { PROJECT_COLS, PROJECT_STATUSES, PROJECT_PRIORITIES, deliveryBlockedReasons, asTableRow } from "./projectsStore";

const today = () => new Date().toISOString().slice(0, 10);

const BLANK_CREATE = {
  name: "",
  clientId: "",
  driveLink: "",
  startDate: today(),
  deadline: "",
  priority: "Medium",
  assignedTL: "",
};

const BLANK_UPDATE = { status: "In Progress", note: "" };

const formatINR = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN")}`
    : "—";

const paymentBadge = (p) => {
  if (!p.totalCost) return "Pending";
  if (p.paidAmount >= p.totalCost) return "Paid";
  if (p.paidAmount > 0)            return "Partially Paid";
  return "Pending";
};

export default function AllProjects({ projects, updateProject, addProject }) {
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
  const [createErr,  setCreateErr]  = useState({});

  const tableRows = projects.map(asTableRow);

  // ── Open handlers ──────────────────────────────────────────────────────
  const openView = (row) => {
    setViewRow(projects.find((p) => p.id === row.id));
    openModal("mm-project-view");
  };

  const openEdit = (row) => {
    const full = projects.find((p) => p.id === row.id);
    setEditRow(full);
    setEditForm({
      name:         full.name,
      driveLink:    full.driveLink ?? "",
      handoverLink: full.handoverLink ?? "",
      startDate:    full.startDate,
      deadline:     full.deadline,
      priority:     full.priority,
      status:       full.status,
      progress:     String(full.progress),
    });
    openModal("mm-project-edit");
  };

  const openAssign = (row) => {
    const full = projects.find((p) => p.id === row.id);
    setAssignRow(full);
    setAssignTL(full.assignedTL);
    openModal("mm-project-assign");
  };

  const openAddUpdate = (row) => {
    const full = projects.find((p) => p.id === row.id);
    setUpdateRow(full);
    setUpdateForm({ status: full.status, note: "" });
    openModal("mm-project-add-update");
  };

  const tryDeliver = (row) => {
    const full = projects.find((p) => p.id === row.id);
    const missing = deliveryBlockedReasons(full);
    if (missing.length) {
      setBlockedRow(full);
      setBlockedReasons(missing);
      openModal("mm-deliver-blocked");
      return;
    }
    const stamp = today();
    updateProject(full.id, {
      status:        "Completed",
      progress:      100,
      deliveredDate: stamp,
      lastUpdated:   stamp,
      updates: [
        ...(full.updates ?? []),
        { date: stamp, status: "Completed", note: "Marked completed; handover link shared." },
      ],
    });
  };

  // ── Save handlers ──────────────────────────────────────────────────────
  const saveEdit = () => {
    updateProject(editRow.id, {
      name:         editForm.name,
      driveLink:    editForm.driveLink || null,
      handoverLink: editForm.handoverLink || null,
      startDate:    editForm.startDate,
      deadline:     editForm.deadline,
      priority:     editForm.priority,
      status:       editForm.status,
      progress:     Math.max(0, Math.min(100, Number(editForm.progress) || 0)),
      lastUpdated:  today(),
    });
    closeModal("mm-project-edit");
  };

  const saveAssign = () => {
    const tl = teamLeaders.find((t) => t.id === assignTL);
    updateProject(assignRow.id, {
      assignedTL:     tl.id,
      assignedTLName: tl.name,
      lastUpdated:    today(),
    });
    closeModal("mm-project-assign");
  };

  const saveAddUpdate = () => {
    if (!updateForm.note.trim()) return;
    const stamp = today();
    updateProject(updateRow.id, {
      status:      updateForm.status,
      lastUpdated: stamp,
      updates: [
        ...(updateRow.updates ?? []),
        { date: stamp, status: updateForm.status, note: updateForm.note.trim() },
      ],
    });
    setUpdateForm(BLANK_UPDATE);
    closeModal("mm-project-add-update");
  };

  const jumpToFix = () => {
    closeModal("mm-deliver-blocked");
    openEdit(blockedRow);
  };

  // ── Create project ─────────────────────────────────────────────────────
  const setCreateField = (k, v) => {
    setCreateForm((f) => ({ ...f, [k]: v }));
    if (createErr[k]) setCreateErr((e) => ({ ...e, [k]: "" }));
  };

  const submitCreate = () => {
    const errs = {};
    if (!createForm.name.trim())      errs.name       = "Project name is required.";
    if (!createForm.clientId)         errs.clientId   = "Select a client.";
    if (!createForm.driveLink.trim()) errs.driveLink  = "Drive link is mandatory per spec.";
    if (!createForm.startDate)        errs.startDate  = "Start date is required.";
    if (!createForm.deadline)         errs.deadline   = "Deadline is required.";
    if (createForm.startDate && createForm.deadline && createForm.deadline < createForm.startDate)
      errs.deadline = "Deadline must be on or after start date.";
    if (!createForm.assignedTL)       errs.assignedTL = "Assign a Team Leader.";
    if (Object.keys(errs).length) { setCreateErr(errs); return; }

    const client = clientList.find((c) => c.id === createForm.clientId);
    const tl     = teamLeaders.find((t) => t.id === createForm.assignedTL);
    const nextId = `PRJ-${String(projects.length + 1).padStart(3, "0")}`;

    addProject({
      id:                nextId,
      name:              createForm.name.trim(),
      clientId:          client.id,
      clientName:        client.name,
      clientMobile:      client.mobile,
      driveLink:         createForm.driveLink.trim(),
      startDate:         createForm.startDate,
      deadline:          createForm.deadline,
      priority:          createForm.priority,
      assignedTL:        tl.id,
      assignedTLName:    tl.name,
      assignedEmployees: [],
      status:            "Not Started",
      progress:          0,
      handoverLink:      null,
      deliveredDate:     null,
      lastUpdated:       today(),
      totalCost:         0,
      paidAmount:        0,
      paymentType:       "Partial",
      woGenerated:       false,
      woSigned:          false,
      woSignedDate:      null,
      updates:           [],
    });

    setCreateForm(BLANK_CREATE);
    setCreateErr({});
    closeModal("mm-project-create");
  };

  return (
    <>
      {/* ── Add Project button ─────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button
          text="+ Add Project"
          variant="primary"
          onClick={() => openModal("mm-project-create")}
        />
      </div>

      <DataTable
        title="All Projects"
        columns={PROJECT_COLS}
        rows={tableRows}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="projects_export"
        filters={[
          { title: "Status",   type: "select", key: "status",   options: PROJECT_STATUSES },
          { title: "Priority", type: "toggle", key: "priority", options: PROJECT_PRIORITIES },
        ]}
        actions={[
          { icon: <Eye size={15} />,                tooltip: "View",            variant: "ghost",   onClick: openView },
          { icon: <Pencil size={15} />,             tooltip: "Edit",            variant: "ghost",   onClick: openEdit },
          { icon: <UserPlus size={15} />,           tooltip: "Reassign TL",     variant: "ghost",   onClick: openAssign },
          { icon: <MessageSquarePlus size={15} />,  tooltip: "Add Update",      variant: "ghost",   onClick: openAddUpdate },
          { icon: <CheckCircle2 size={15} />,       tooltip: "Mark Completed",  variant: "success", onClick: tryDeliver },
        ]}
      />

      {/* ── Create modal ───────────────────────────────────────────────── */}
      <Modal id="mm-project-create" title="Add New Project" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={3}>
            <div className="col-span-12">
              <DataField
                label="Project Name *"
                id="mm-create-name"
                value={createForm.name}
                onChange={(e) => setCreateField("name", e.target.value)}
                placeholder="e.g. Acme Website Redesign"
                size={12}
              />
              {createErr.name && <p className="text-xs text-rose-600 mt-1 px-1">{createErr.name}</p>}
            </div>

            <div className="col-span-12">
              <SelectField
                label="Client *"
                id="mm-create-client"
                value={createForm.clientId}
                onChange={(e) => setCreateField("clientId", e.target.value)}
                size={12}
              >
                <Option value="" label="-- Select client --" />
                {clientList.map((c) => (
                  <Option key={c.id} value={c.id} label={`${c.name} · ${c.mobile}`} />
                ))}
              </SelectField>
              {createErr.clientId && <p className="text-xs text-rose-600 mt-1 px-1">{createErr.clientId}</p>}
            </div>

            <div className="col-span-12">
              <DataField
                label="Drive Link * (mandatory per spec)"
                id="mm-create-drive"
                value={createForm.driveLink}
                onChange={(e) => setCreateField("driveLink", e.target.value)}
                placeholder="https://drive.google.com/folder/..."
                size={12}
              />
              {createErr.driveLink && <p className="text-xs text-rose-600 mt-1 px-1">{createErr.driveLink}</p>}
            </div>

            <div className="col-span-6">
              <DataField
                label="Start Date *"
                id="mm-create-start"
                type="date"
                value={createForm.startDate}
                onChange={(e) => setCreateField("startDate", e.target.value)}
                size={12}
              />
              {createErr.startDate && <p className="text-xs text-rose-600 mt-1 px-1">{createErr.startDate}</p>}
            </div>

            <div className="col-span-6">
              <DataField
                label="Deadline *"
                id="mm-create-deadline"
                type="date"
                value={createForm.deadline}
                onChange={(e) => setCreateField("deadline", e.target.value)}
                size={12}
              />
              {createErr.deadline && <p className="text-xs text-rose-600 mt-1 px-1">{createErr.deadline}</p>}
            </div>

            <div className="col-span-6">
              <SelectField
                label="Priority"
                id="mm-create-priority"
                value={createForm.priority}
                onChange={(e) => setCreateField("priority", e.target.value)}
                size={12}
              >
                {PROJECT_PRIORITIES.map((p) => <Option key={p} value={p} label={p} />)}
              </SelectField>
            </div>

            <div className="col-span-6">
              <SelectField
                label="Team Leader *"
                id="mm-create-tl"
                value={createForm.assignedTL}
                onChange={(e) => setCreateField("assignedTL", e.target.value)}
                size={12}
              >
                <Option value="" label="-- Select Team Leader --" />
                {teamLeaders.map((tl) => (
                  <Option key={tl.id} value={tl.id} label={`${tl.name} · ${tl.region}`} />
                ))}
              </SelectField>
              {createErr.assignedTL && <p className="text-xs text-rose-600 mt-1 px-1">{createErr.assignedTL}</p>}
            </div>
          </Grid>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              text="Cancel"
              variant="secondary"
              onClick={() => { setCreateForm(BLANK_CREATE); setCreateErr({}); closeModal("mm-project-create"); }}
            />
            <Button text="Create Project" variant="primary" onClick={submitCreate} />
          </div>
        </div>
      </Modal>

      {/* ── View modal ─────────────────────────────────────────────────── */}
      <Modal id="mm-project-view" title="Project Details" size="lg">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.name}
              subtitle={`${viewRow.clientName} · ${viewRow.assignedTLName}`}
              meta={`${viewRow.id} · Deadline ${viewRow.deadline}`}
            />
            <ModalGrid title="Overview" cols={3}>
              <ModalData label="Status"        value={viewRow.status} />
              <ModalData label="Priority"      value={viewRow.priority} />
              <ModalData label="Progress"      value={`${viewRow.progress}%`} />
              <ModalData label="Start Date"    value={viewRow.startDate} />
              <ModalData label="Deadline"      value={viewRow.deadline} />
              <ModalData label="Completed On"  value={viewRow.deliveredDate ?? "—"} />
            </ModalGrid>
            <ModalGrid title="Client" cols={2}>
              <ModalData label="Name"   value={viewRow.clientName} />
              <ModalData label="Mobile" value={viewRow.clientMobile} />
            </ModalGrid>
            <ModalGrid title="Team" cols={2}>
              <ModalData label="Team Leader" value={viewRow.assignedTLName} />
              <ModalData label="Employees"   value={viewRow.assignedEmployees.map(employeeName).join(", ") || "—"} />
            </ModalGrid>
            <ModalGrid title="Links" cols={1}>
              <ModalData label="Drive Link"    value={viewRow.driveLink    ?? "—"} />
              <ModalData label="Handover Link" value={viewRow.handoverLink ?? "— (mandatory before completion)"} />
            </ModalGrid>
            <ModalGrid title="Payment (Finance-owned, read-only)" cols={3}>
              <ModalData label="Total Cost"  value={formatINR(viewRow.totalCost)} />
              <ModalData label="Amount Paid" value={formatINR(viewRow.paidAmount)} />
              <ModalData label="Remaining"   value={formatINR(Math.max(0, (viewRow.totalCost ?? 0) - (viewRow.paidAmount ?? 0)))} />
              <ModalData label="Type"        value={viewRow.paymentType ?? "—"} />
              <ModalData label="Status"      value={paymentBadge(viewRow)} />
              <ModalData label=""            value="" />
            </ModalGrid>
            <ModalGrid title="Work Order (Finance-owned, read-only)" cols={3}>
              <ModalData label="Generated"   value={viewRow.woGenerated ? "Yes" : "No"} />
              <ModalData label="Signed"      value={viewRow.woSigned ? "Yes" : "No"} />
              <ModalData label="Signed Date" value={viewRow.woSignedDate ?? "—"} />
            </ModalGrid>

            {/* ── Project Updates feed (Brief Section 9 + 14) ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1 mb-2">
                Project Updates ({(viewRow.updates ?? []).length})
              </p>
              {(viewRow.updates ?? []).length === 0 ? (
                <p className="text-sm text-slate-500 px-1">No updates posted yet.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {[...(viewRow.updates ?? [])].reverse().map((u, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#2a465a]">{u.date}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          {u.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{u.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mm-project-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit modal ─────────────────────────────────────────────────── */}
      <Modal id="mm-project-edit" title="Edit Project" size="lg">
        {editRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={editRow.name} subtitle={editRow.clientName} meta={editRow.id} />
            <Grid cols={12} gap={3}>
              <DataField label="Project Name *"   id="mm-edit-name"      value={editForm.name}         onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}         size={12} />
              <DataField label="Drive Link *"     id="mm-edit-drive"     value={editForm.driveLink}    onChange={(e) => setEditForm({ ...editForm, driveLink: e.target.value })}    size={12} />
              <DataField label="Handover Link"    id="mm-edit-handover"  value={editForm.handoverLink} onChange={(e) => setEditForm({ ...editForm, handoverLink: e.target.value })} size={12} />
              <DataField label="Start Date"       id="mm-edit-start"     type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} size={6} />
              <DataField label="Deadline"         id="mm-edit-deadline"  type="date" value={editForm.deadline}  onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}  size={6} />
              <SelectField label="Priority" id="mm-edit-priority" value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })} size={4}>
                {PROJECT_PRIORITIES.map((p) => <Option key={p} value={p} label={p} />)}
              </SelectField>
              <SelectField label="Status" id="mm-edit-status" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} size={4}>
                {PROJECT_STATUSES.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <DataField label="Progress %" id="mm-edit-progress" type="number" value={editForm.progress} onChange={(e) => setEditForm({ ...editForm, progress: e.target.value })} size={4} />
            </Grid>
            <Grid cols={12} gap={2}>
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("mm-project-edit")} />
              <Button text="Save"   variant="primary"   size={6} onClick={saveEdit} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Reassign TL modal ──────────────────────────────────────────── */}
      <Modal id="mm-project-assign" title="Reassign Team Leader" size="md">
        {assignRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={assignRow.name}
              subtitle={`Currently: ${assignRow.assignedTLName}`}
              meta={assignRow.id}
            />
            <SelectField label="New Team Leader" id="mm-assign-tl" value={assignTL} onChange={(e) => setAssignTL(e.target.value)} size={12}>
              {teamLeaders.map((tl) => <Option key={tl.id} value={tl.id} label={`${tl.name} · ${tl.region}`} />)}
            </SelectField>
            <Grid cols={12} gap={2}>
              <Button text="Cancel"   variant="secondary" size={6} onClick={() => closeModal("mm-project-assign")} />
              <Button text="Reassign" variant="primary"   size={6} onClick={saveAssign} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Add Update modal ───────────────────────────────────────────── */}
      <Modal id="mm-project-add-update" title="Add Project Update" size="md">
        {updateRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={updateRow.name}
              subtitle={`Current status: ${updateRow.status}`}
              meta={`${updateRow.id} · Update will be visible on the client tracking page`}
            />
            <Grid cols={12} gap={3}>
              <SelectField
                label="Status (at this update)"
                id="mm-upd-status"
                value={updateForm.status}
                onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                size={12}
              >
                {PROJECT_STATUSES.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <div className="col-span-12">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Description / Note *
                </label>
                <textarea
                  placeholder="What changed? What's next? (Visible on the client tracking page.)"
                  value={updateForm.note}
                  onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 resize-none transition duration-200"
                />
              </div>
            </Grid>
            <Grid cols={12} gap={2}>
              <Button text="Cancel"     variant="secondary" size={6} onClick={() => { setUpdateForm(BLANK_UPDATE); closeModal("mm-project-add-update"); }} />
              <Button text="Post Update" variant="primary"  size={6} onClick={saveAddUpdate} disabled={!updateForm.note.trim()} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Delivery-blocked modal (mandatory drive-link gate) ─────────── */}
      <Modal id="mm-deliver-blocked" title="Cannot Mark Completed" size="sm">
        {blockedRow && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-700">Mandatory fields are missing</p>
                <p className="text-xs text-rose-600 mt-1">
                  Per spec, both the project drive link and the final handover link must be set before completion.
                </p>
              </div>
            </div>
            <ModalGrid title="Project" cols={1}>
              <ModalData label="Name" value={blockedRow.name} />
              <ModalData label="ID"   value={blockedRow.id} />
            </ModalGrid>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Missing</p>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                {blockedReasons.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <Grid cols={12} gap={2}>
              <Button text="Close"        variant="secondary" size={6} onClick={() => closeModal("mm-deliver-blocked")} />
              <Button text="Edit Project" variant="primary"   size={6} onClick={jumpToFix} />
            </Grid>
          </div>
        )}
      </Modal>
    </>
  );
}
