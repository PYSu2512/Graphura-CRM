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
} from "lucide-react";
import { teamLeaders, employees, employeeName } from "../managementManagerStore";
import { PROJECT_COLS, PROJECT_STATUSES, PROJECT_PRIORITIES, deliveryBlockedReasons, asTableRow } from "./projectsStore";

export default function AllProjects({ projects, updateProject, titleOverride, filterFn }) {
  const [viewRow,    setViewRow]    = useState(null);
  const [editRow,    setEditRow]    = useState(null);
  const [editForm,   setEditForm]   = useState({});
  const [assignRow,  setAssignRow]  = useState(null);
  const [assignTL,   setAssignTL]   = useState("");
  const [blockedRow, setBlockedRow] = useState(null);
  const [blockedReasons, setBlockedReasons] = useState([]);

  const visible = filterFn ? projects.filter(filterFn) : projects;
  const tableRows = visible.map(asTableRow);

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

  const tryDeliver = (row) => {
    const full = projects.find((p) => p.id === row.id);
    const missing = deliveryBlockedReasons(full);
    if (missing.length) {
      setBlockedRow(full);
      setBlockedReasons(missing);
      openModal("mm-deliver-blocked");
      return;
    }
    updateProject(full.id, {
      status:        "Delivered",
      progress:      100,
      deliveredDate: new Date().toISOString().slice(0, 10),
      lastUpdated:   new Date().toISOString().slice(0, 10),
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
      lastUpdated:  new Date().toISOString().slice(0, 10),
    });
    closeModal("mm-project-edit");
  };

  const saveAssign = () => {
    const tl = teamLeaders.find((t) => t.id === assignTL);
    updateProject(assignRow.id, {
      assignedTL:     tl.id,
      assignedTLName: tl.name,
      lastUpdated:    new Date().toISOString().slice(0, 10),
    });
    closeModal("mm-project-assign");
  };

  const jumpToFix = () => {
    closeModal("mm-deliver-blocked");
    openEdit(blockedRow);
  };

  return (
    <>
      <DataTable
        title={titleOverride ?? "All Projects"}
        columns={PROJECT_COLS}
        rows={tableRows}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="projects_export"
        filters={[
          { title: "Status",   type: "toggle", key: "status",   options: PROJECT_STATUSES },
          { title: "Priority", type: "toggle", key: "priority", options: PROJECT_PRIORITIES },
        ]}
        actions={[
          { icon: <Eye size={15} />,          tooltip: "View",            variant: "ghost",   onClick: openView },
          { icon: <Pencil size={15} />,       tooltip: "Edit",            variant: "ghost",   onClick: openEdit },
          { icon: <UserPlus size={15} />,     tooltip: "Reassign TL",     variant: "ghost",   onClick: openAssign },
          { icon: <CheckCircle2 size={15} />, tooltip: "Mark Delivered",  variant: "success", onClick: tryDeliver },
        ]}
      />

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
              <ModalData label="Status"     value={viewRow.status} />
              <ModalData label="Priority"   value={viewRow.priority} />
              <ModalData label="Progress"   value={`${viewRow.progress}%`} />
              <ModalData label="Start Date" value={viewRow.startDate} />
              <ModalData label="Deadline"   value={viewRow.deadline} />
              <ModalData label="Delivered"  value={viewRow.deliveredDate ?? "—"} />
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
              <ModalData label="Handover Link" value={viewRow.handoverLink ?? "— (mandatory before delivery)"} />
            </ModalGrid>
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

      {/* ── Delivery-blocked modal (mandatory drive-link gate) ─────────── */}
      <Modal id="mm-deliver-blocked" title="Cannot Mark Delivered" size="sm">
        {blockedRow && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <AlertTriangle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-700">Mandatory fields are missing</p>
                <p className="text-xs text-rose-600 mt-1">
                  Per spec, both the project drive link and the final handover link must be set before delivery.
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
