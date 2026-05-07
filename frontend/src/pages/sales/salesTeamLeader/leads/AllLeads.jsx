import { useState, useMemo } from "react";
import {
  DataTable, Modal, Button, DataField, SelectField, Option,
  openModal, closeModal, Grid, ModalProfile, ModalGrid, ModalData,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Pencil, UserCheck, Phone, MessageCircle, Eye, AlertTriangle, Users,
} from "lucide-react";
import {
  INITIAL_LEADS, LEAD_STATUS_OPTIONS, teamExecutives, currentTL, executiveNames,
} from "./leadsStore";

const COLS = [
  { key: "name",        label: "Name" },
  { key: "companyName", label: "Company" },
  { key: "mobile",      label: "Mobile" },
  { key: "email",       label: "Email" },
  { key: "status",      label: "Status" },
  { key: "assignedTo",  label: "Assigned To" },
  { key: "createdAt",   label: "Created" },
];

const stripPhone = (m) => (m || "").replace(/\D/g, "");

export default function AllLeads() {
  const [leads, setLeads] = useState(INITIAL_LEADS);

  // ── View / edit state ────────────────────────────────────────────────────
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);

  // ── Single-lead reassign state ───────────────────────────────────────────
  const [assignRow, setAssignRow] = useState(null);
  const [assignTo,  setAssignTo]  = useState("");

  // ── Bulk reassign state ──────────────────────────────────────────────────
  const [bulkLeads, setBulkLeads] = useState([]);
  const [bulkExec,  setBulkExec]  = useState("");
  const [bulkError, setBulkError] = useState("");

  const unassigned = useMemo(() => leads.filter((l) => l.assignedTo === "Unassigned"), [leads]);
  const assigned   = useMemo(() => leads.filter((l) => l.assignedTo !== "Unassigned"), [leads]);

  // ── Lead capacity per executive (each exec capped, mirrors TL.leadCapacity / team size) ──
  const perExecCap = Math.floor(currentTL.leadCapacity / teamExecutives.length);
  const loadByExec = useMemo(() => {
    const m = {};
    teamExecutives.forEach((e) => { m[e.name] = 0; });
    leads.forEach((l) => { if (m[l.assignedTo] !== undefined) m[l.assignedTo]++; });
    return m;
  }, [leads]);

  const today = () => new Date().toISOString().split("T")[0];

  // ── Click-to-connect helpers ─────────────────────────────────────────────
  const callLead     = (row) => { window.location.href = `tel:${stripPhone(row.mobile)}`; };
  const whatsappLead = (row) => { window.open(`https://wa.me/${stripPhone(row.mobile)}`, "_blank", "noopener"); };

  // ── Single-lead reassign ─────────────────────────────────────────────────
  const openAssign = (row) => {
    setAssignRow(row);
    setAssignTo(row.assignedTo === "Unassigned" ? "" : row.assignedTo);
    openModal("tl-lead-assign");
  };

  const confirmAssign = () => {
    if (!assignTo) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === assignRow.id
          ? { ...l, assignedTo: assignTo, assignedAt: today() }
          : l
      )
    );
    closeModal("tl-lead-assign");
  };

  // ── Bulk reassign ────────────────────────────────────────────────────────
  const openBulkAssign = (selected) => {
    setBulkLeads(selected);
    setBulkExec("");
    setBulkError("");
    openModal("tl-lead-bulk-assign");
  };

  const confirmBulkAssign = () => {
    if (!bulkExec) { setBulkError("Pick an executive to assign these leads to."); return; }
    const projectedLoad = loadByExec[bulkExec] + bulkLeads.length;
    if (projectedLoad > perExecCap) {
      setBulkError(`${bulkExec} would exceed the per-executive cap of ${perExecCap} leads (current: ${loadByExec[bulkExec]}).`);
      return;
    }
    const ids = new Set(bulkLeads.map((b) => b.id));
    const stamp = today();
    setLeads((prev) => prev.map((l) => ids.has(l.id) ? { ...l, assignedTo: bulkExec, assignedAt: stamp } : l));
    closeModal("tl-lead-bulk-assign");
  };

  // ── Edit ─────────────────────────────────────────────────────────────────
  const saveEdit = () => {
    setLeads((prev) => prev.map((l) => l.id === editRow.id ? editRow : l));
    closeModal("tl-lead-edit");
  };

  // ── Shared row actions ───────────────────────────────────────────────────
  const baseActions = [
    {
      icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
      onClick: (row) => { setViewRow(leads.find((l) => l.id === row.id)); openModal("tl-lead-view"); },
    },
    {
      icon: <Phone size={15} />, tooltip: "Call", variant: "ghost",
      onClick: callLead,
    },
    {
      icon: <MessageCircle size={15} />, tooltip: "WhatsApp", variant: "ghost",
      onClick: whatsappLead,
    },
    {
      icon: <Pencil size={15} />, tooltip: "Edit", variant: "ghost",
      onClick: (row) => { setEditRow({ ...leads.find((l) => l.id === row.id) }); openModal("tl-lead-edit"); },
    },
    {
      icon: <UserCheck size={15} />, tooltip: "Assign / Reassign", variant: "primary",
      onClick: openAssign,
    },
  ];

  const FILTERS = [
    { title: "Status",      type: "toggle", key: "status",     options: LEAD_STATUS_OPTIONS },
    { title: "Assigned To", type: "select", key: "assignedTo", options: executiveNames },
  ];

  const BULK_ACTIONS = [
    {
      title: "Assign / Reassign",
      icon: <Users size={14} />,
      onClick: (rows) => openBulkAssign(rows.map((r) => leads.find((l) => l.id === r.id)).filter(Boolean)),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Unassigned leads ─────────────────────────────────────────────── */}
      <DataTable
        title="Unassigned Leads"
        columns={COLS.filter((c) => c.key !== "assignedTo")}
        rows={unassigned}
        actions={baseActions.filter((a) => a.tooltip !== "Call" && a.tooltip !== "WhatsApp")}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="team_leads_unassigned"
        bulkAction
        bulkActions={BULK_ACTIONS}
        filters={[{ title: "Status", type: "toggle", key: "status", options: LEAD_STATUS_OPTIONS }]}
      />

      {/* ── Assigned leads ───────────────────────────────────────────────── */}
      <DataTable
        title="Assigned Leads"
        columns={COLS}
        rows={assigned}
        actions={baseActions}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="team_leads_assigned"
        bulkAction
        bulkActions={BULK_ACTIONS}
        filters={FILTERS}
      />

      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="tl-lead-view" title="Lead Details" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.name}
              subtitle={`${viewRow.companyName} · ${viewRow.status}`}
              meta={`ID: ${viewRow.id}`}
            />
            <ModalGrid title="Contact" cols={2}>
              <ModalData label="Mobile" value={viewRow.mobile} />
              <ModalData label="Email"  value={viewRow.email} />
            </ModalGrid>
            <ModalGrid title="Assignment" cols={2}>
              <ModalData label="Assigned To"  value={viewRow.assignedTo} />
              <ModalData label="Assigned At"  value={viewRow.assignedAt || "—"} />
              <ModalData label="Status"       value={viewRow.status} />
              <ModalData label="Created"      value={viewRow.createdAt} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button text="Call"     variant="ghost"   size={2} onClick={() => callLead(viewRow)} />
              <Button text="WhatsApp" variant="ghost"   size={3} onClick={() => whatsappLead(viewRow)} />
              <Button text="Close"    variant="primary" size={3} onClick={() => closeModal("tl-lead-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      <Modal id="tl-lead-edit" title="Edit Lead" size="md">
        {editRow && (
          <div className="space-y-4">
            <Grid cols={12} gap={4}>
              <DataField label="Name"    id="tl-lead-name"    value={editRow.name}        size={6}  onChange={(e) => setEditRow((p) => ({ ...p, name: e.target.value }))} />
              <DataField label="Company" id="tl-lead-company" value={editRow.companyName} size={6}  onChange={(e) => setEditRow((p) => ({ ...p, companyName: e.target.value }))} />
              <DataField label="Mobile"  id="tl-lead-mobile"  value={editRow.mobile}      size={6}  onChange={(e) => setEditRow((p) => ({ ...p, mobile: e.target.value }))} />
              <DataField label="Email"   id="tl-lead-email"   value={editRow.email}       size={6}  type="email" onChange={(e) => setEditRow((p) => ({ ...p, email: e.target.value }))} />
              <SelectField label="Status" value={editRow.status} size={6} onChange={(e) => setEditRow((p) => ({ ...p, status: e.target.value }))}>
                {LEAD_STATUS_OPTIONS.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <SelectField label="Assigned To" value={editRow.assignedTo} size={6} onChange={(e) => setEditRow((p) => ({ ...p, assignedTo: e.target.value }))}>
                <Option value="Unassigned" label="Unassigned" />
                {teamExecutives.map((ex) => <Option key={ex.id} value={ex.name} label={ex.name} />)}
              </SelectField>
              <Button text="Save Changes" variant="primary"   size={6} onClick={saveEdit} />
              <Button text="Cancel"       variant="secondary" size={6} onClick={() => closeModal("tl-lead-edit")} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Single-lead assign modal ─────────────────────────────────────── */}
      <Modal id="tl-lead-assign" title="Assign / Reassign Lead" size="sm">
        {assignRow && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Lead" cols={2}>
              <ModalData label="Name"    value={assignRow.name} />
              <ModalData label="Company" value={assignRow.companyName} />
              <ModalData label="Status"  value={assignRow.status} />
              <ModalData label="Current" value={assignRow.assignedTo} />
            </ModalGrid>
            <SelectField label="Assign To" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
              <Option value="" label="-- Pick an executive --" />
              {teamExecutives.map((ex) => (
                <Option
                  key={ex.id}
                  value={ex.name}
                  label={`${ex.name} (${loadByExec[ex.name]}/${perExecCap})`}
                />
              ))}
            </SelectField>
            <Grid cols={12} gap={2}>
              <Button text="Cancel"  variant="secondary" size={6} onClick={() => closeModal("tl-lead-assign")} />
              <Button text="Confirm" variant="primary"   size={6} onClick={confirmAssign} disabled={!assignTo} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Bulk assign modal ────────────────────────────────────────────── */}
      <Modal id="tl-lead-bulk-assign" title="Bulk Assign Leads" size="md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5">
            <div>
              <p className="text-sm font-bold text-[#2a465a]">
                {bulkLeads.length} lead{bulkLeads.length !== 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Per-executive cap: <span className="font-bold text-[#2a465a]">{perExecCap}</span>
              </p>
            </div>
          </div>

          <SelectField label="Assign To" value={bulkExec} onChange={(e) => { setBulkExec(e.target.value); setBulkError(""); }}>
            <Option value="" label="-- Pick an executive --" />
            {teamExecutives.map((ex) => {
              const room = perExecCap - loadByExec[ex.name];
              return (
                <Option
                  key={ex.id}
                  value={ex.name}
                  label={`${ex.name} — ${loadByExec[ex.name]}/${perExecCap} (room: ${room})`}
                />
              );
            })}
          </SelectField>

          {bulkError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              <AlertTriangle size={15} className="flex-shrink-0" /> {bulkError}
            </div>
          )}

          <Grid cols={12} gap={2}>
            <Button text="Cancel"        variant="secondary" size={6} onClick={() => closeModal("tl-lead-bulk-assign")} />
            <Button text="Confirm Assign" variant="primary"  size={6} onClick={confirmBulkAssign} disabled={!bulkExec || bulkLeads.length === 0} />
          </Grid>
        </div>
      </Modal>
    </div>
  );
}
