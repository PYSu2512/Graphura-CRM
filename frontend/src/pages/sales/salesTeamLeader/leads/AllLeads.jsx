import { useState, useMemo, useEffect } from "react";
import {
  DataTable, Modal, Button, DataField, SelectField, Option,
  openModal, closeModal, Grid, ModalProfile, ModalGrid, ModalData,
} from "../../../../components/shared/Common_Components.jsx";
import {
  Pencil, UserCheck, Phone, MessageCircle, Eye, AlertTriangle, Users, GitBranch, Loader2, CheckCircle,
} from "lucide-react";
import {
  LEAD_STATUS_OPTIONS,
} from "./leadsStore";
import apiClient from "../../../../services/apiClient";
import { maskId } from "../../../../utils/idMask";

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
  const [unassignedLeads, setUnassignedLeads] = useState([]);
  const [assignedLeads, setAssignedLeads] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── View / edit state ────────────────────────────────────────────────────
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);

  // ── Single-lead reassign state ───────────────────────────────────────────
  const [assignRow, setAssignRow] = useState(null);
  const [assignTo,  setAssignTo]  = useState("");

  // ── Distribution state ────────────────────────────────────────────────────
  const [distSelectedLeads, setDistSelectedLeads] = useState([]);
  const [distRows,          setDistRows]          = useState([]);
  const [distError,         setDistError]         = useState("");
  const [distSuccess,       setDistSuccess]       = useState(false);
  const [distSummary,       setDistSummary]       = useState([]);
  const [totalToDistribute, setTotalToDistribute] = useState(0);
  const [distLoading,       setDistLoading]       = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/sales-team-leader/leads/workspace");
      if (res.data.success) {
        const { pool, assigned, targets } = res.data.data;
        setUnassignedLeads(pool || []);
        setAssignedLeads(assigned || []);
        setExecutives(targets || []);
      }
    } catch (error) {
      console.error("Failed to fetch leads data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const executiveNames = useMemo(() => executives.map(e => e.name), [executives]);

  const today = () => new Date().toISOString().split("T")[0];

  // ── Click-to-connect helpers ─────────────────────────────────────────────
  const callLead     = (row) => { window.location.href = `tel:${stripPhone(row.mobile)}`; };
  const whatsappLead = (row) => { window.open(`https://wa.me/${stripPhone(row.mobile)}`, "_blank", "noopener"); };

  // ── Distribution Logic Helpers ──
  function buildDistRows(total, targets = []) {
    return targets
      .map((ex) => ({
        id: ex.id,
        name: ex.name,
        capacity: Math.max(0, ex.remaining || 0),
        currentLeads: ex.currentAssigned || 0,
        effectiveLimit: ex.effectiveLimit || 250,
        assignLeads: 0,
      }))
      .filter((ex) => ex.capacity > 0);
  }

  const openDistModal = (selected) => {
    const targetLeads = selected?.length ? selected : unassignedLeads;
    setDistSelectedLeads(targetLeads);
    setTotalToDistribute(targetLeads.length);
    setDistRows(buildDistRows(targetLeads.length, executives));
    setDistError("");
    setDistSuccess(false);
    openModal("tl-dist-modal");
  };

  const updateDistRowByIndex = (index, field, raw) => {
    const val = Math.max(0, Number(raw) || 0);
    setDistRows((prev) => {
      const otherAssigned = prev
        .filter((_, i) => i !== index)
        .reduce((s, r) => s + (Number(r.assignLeads) || 0), 0);
      const remaining = Math.max(0, totalToDistribute - otherAssigned);

      return prev.map((r, i) => {
        if (i !== index) return { ...r };
        const assign = Math.min(val, r.capacity, remaining);
        return { ...r, assignLeads: assign };
      });
    });
  };

  const handleTotalToDistributeChange = (raw) => {
    const val = Math.max(0, Number(raw) || 0);
    setTotalToDistribute(Math.min(val, distSelectedLeads.length));
  };

  const totalToAssign = useMemo(() => distRows.reduce((s, r) => s + r.assignLeads, 0), [distRows]);

  const confirmDistribute = async () => {
    setDistError("");
    if (totalToAssign === 0) { setDistError("Please assign at least 1 lead."); return; }

    const shuffled = [...distSelectedLeads].sort(() => Math.random() - 0.5);
    let pointer = 0;
    const assignments = [];

    for (const r of distRows) {
      if (r.assignLeads === 0) continue;
      const slice = shuffled.slice(pointer, pointer + r.assignLeads);
      pointer += r.assignLeads;
      assignments.push({
        userId: r.id,
        leadIds: slice.map(l => l.id),
        reason: "Distributed by Team Leader"
      });
    }

    try {
      setDistLoading(true);
      const res = await apiClient.post("/sales-manager/leads/bulk/distribute", { assignments });
      if (res.data.success) {
        setDistSuccess(true);
        setDistSummary(distRows.filter(r => r.assignLeads > 0));
        await fetchData();
      }
    } catch (error) {
      setDistError(error.response?.data?.message || "Failed to distribute leads");
    } finally {
      setDistLoading(false);
    }
  };

  // ── Single-lead reassign ─────────────────────────────────────────────────
  const openAssign = (row) => {
    setAssignRow(row);
    setAssignTo("");
    openModal("tl-lead-assign");
  };

  const confirmAssign = async () => {
    if (!assignTo || !assignRow) return;
    const targetExec = executives.find(e => e.name === assignTo);
    if (!targetExec) return;

    try {
      const res = await apiClient.post(`/sales-manager/leads/${assignRow.id}/assign`, {
        userId: targetExec.id,
        reason: "Manual assignment from TL"
      });
      if (res.data.success) {
        await fetchData();
        closeModal("tl-lead-assign");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Assignment failed");
    }
  };

  // ── Row actions ───────────────────────────────────────────────────
  const baseActions = [
    {
      icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
      onClick: (row) => { 
        const found = unassignedLeads.find((l) => l.id === row.id) || assignedLeads.find((l) => l.id === row.id);
        setViewRow(found); 
        openModal("tl-lead-view"); 
      },
    },
    { icon: <Phone size={15} />, tooltip: "Call", variant: "ghost", onClick: callLead },
    { icon: <MessageCircle size={15} />, tooltip: "WhatsApp", variant: "ghost", onClick: whatsappLead },
    {
      icon: <Pencil size={15} />, tooltip: "Edit", variant: "ghost",
      onClick: (row) => { 
        const found = unassignedLeads.find((l) => l.id === row.id) || assignedLeads.find((l) => l.id === row.id);
        setEditRow({ ...found }); 
        openModal("tl-lead-edit"); 
      },
    },
    { icon: <UserCheck size={15} />, tooltip: "Assign", variant: "primary", onClick: openAssign },
  ];

  const capColor = (used, max) => {
    const pct = (used / max) * 100;
    if (pct >= 95) return "bg-rose-500";
    if (pct >= 75) return "bg-amber-400";
    return "bg-emerald-500";
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end mb-1">
        <button
          onClick={() => openDistModal(unassignedLeads)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2a465a] text-white text-sm font-bold hover:bg-[#1e3a52] transition active:scale-95 shadow-sm"
        >
          <GitBranch size={16} /> Distribute Leads
        </button>
      </div>

      <DataTable
        title="Unassigned Pool"
        columns={COLS.map(c => c.key === "assignedTo" ? { ...c, label: "Status" } : c)}
        rows={unassignedLeads.map(l => ({ ...l, assignedTo: "Unassigned" }))}
        actions={baseActions.filter(a => ["View", "Assign"].includes(a.tooltip))}
        size={12}
        pageSize={10}
        searchable
        bulkAction
        bulkActions={[{ title: "Distribute", icon: <GitBranch size={14} />, onClick: openDistModal }]}
        filters={[{ title: "Status", type: "toggle", key: "status", options: LEAD_STATUS_OPTIONS }]}
      />

      <DataTable
        title="Team Assignments"
        columns={COLS}
        rows={assignedLeads}
        actions={baseActions}
        size={12}
        pageSize={10}
        searchable
        filters={[
          { title: "Status", type: "toggle", key: "status", options: LEAD_STATUS_OPTIONS },
          { title: "Executive", type: "select", key: "assignedTo", options: executiveNames },
        ]}
      />

      {/* ── Distribution Modal ─────────────────────────────────────────────── */}
      <Modal id="tl-dist-modal" title="Distribute Leads to Team" size="xl">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5">
            <div>
              <p className="text-sm font-bold text-[#2a465a]">{distSelectedLeads.length} leads selected</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Assigned: <span className="font-bold text-emerald-600">{totalToAssign}</span> / {totalToDistribute}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Available</p>
              <p className="text-lg font-black text-[#2a465a]">{Math.max(0, totalToDistribute - totalToAssign)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-600">Leads to distribute</label>
            <input
              type="number" min={0} max={distSelectedLeads.length}
              value={totalToDistribute}
              onChange={(e) => handleTotalToDistributeChange(e.target.value)}
              className="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#2a465a] font-bold"
            />
          </div>

          {distSuccess ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl">
                <CheckCircle size={18} />
                <p className="text-sm font-semibold">Distribution successful!</p>
              </div>
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="py-3 px-4 text-left font-bold text-[#2a465a]">Executive</th>
                      <th className="py-3 px-4 text-left font-bold text-[#2a465a]">Leads Assigned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distSummary.map((r) => (
                      <tr key={r.id} className="border-t border-slate-100">
                        <td className="py-3 px-4 font-medium">{r.name}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">+{r.assignLeads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button text="Close" variant="primary" size={3} onClick={() => closeModal("tl-dist-modal")} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {distRows.map((r, i) => {
                  const usedAfter = r.currentLeads + r.assignLeads;
                  const pct = Math.round((usedAfter / r.effectiveLimit) * 100);
                  return (
                    <div key={r.id} className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-bold text-[#2a465a]">{r.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                            {r.currentLeads} / {r.effectiveLimit} Leads
                          </p>
                        </div>
                        <input
                          type="number" min={0} max={r.capacity}
                          value={r.assignLeads}
                          onChange={(e) => updateDistRowByIndex(i, "assignLeads", e.target.value)}
                          className="w-16 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-center"
                        />
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${capColor(usedAfter, r.effectiveLimit)}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {distError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} /> {distError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("tl-dist-modal")} />
                <Button
                  text={distLoading ? "Processing..." : "Confirm Distribution"}
                  variant="primary" size={4}
                  disabled={distLoading || totalToAssign === 0}
                  onClick={confirmDistribute}
                />
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ── Standard Modals (View/Edit/Assign) ── */}
      <Modal id="tl-lead-view" title="Lead Details" size="md">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={viewRow.name} subtitle={`${viewRow.companyName} · ${viewRow.status}`} meta={`Ref: ${maskId(viewRow.id, 'LEA')}`} />
            <ModalGrid title="Contact" cols={2}>
              <ModalData label="Mobile" value={viewRow.mobile} />
              <ModalData label="Email"  value={viewRow.email} />
            </ModalGrid>
            <ModalGrid title="Assignment" cols={2}>
              <ModalData label="Assigned To"  value={viewRow.assignedTo} />
              <ModalData label="Created"      value={viewRow.createdAt} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button text="Call" variant="ghost" size={2} onClick={() => callLead(viewRow)} />
              <Button text="Close" variant="primary" size={3} onClick={() => closeModal("tl-lead-view")} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="tl-lead-assign" title="Assign Lead" size="sm">
        {assignRow && (
          <div className="flex flex-col gap-4">
            <SelectField label="Select Executive" value={assignTo} onChange={(e) => setAssignTo(e.target.value)}>
              <Option value="" label="-- Select Member --" />
              {executives.map((ex) => <Option key={ex.id} value={ex.name} label={`${ex.name} (${ex.currentAssigned}/${ex.effectiveLimit})`} />)}
            </SelectField>
            <div className="flex gap-2 pt-2">
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("tl-lead-assign")} />
              <Button text="Confirm" variant="primary" size={6} onClick={confirmAssign} disabled={!assignTo} />
            </div>
          </div>
        )}
      </Modal>

      <Modal id="tl-lead-edit" title="Edit Lead" size="md">
        {editRow && (
          <div className="space-y-4">
            <Grid cols={12} gap={4}>
              <DataField label="Name" value={editRow.name} size={6} onChange={(e) => setEditRow((p) => ({ ...p, name: e.target.value }))} />
              <DataField label="Mobile" value={editRow.mobile} size={6} onChange={(e) => setEditRow((p) => ({ ...p, mobile: e.target.value }))} />
              <SelectField label="Status" value={editRow.status} size={12} onChange={(e) => setEditRow((p) => ({ ...p, status: e.target.value }))}>
                {LEAD_STATUS_OPTIONS.map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <Button text="Save Changes" variant="primary" size={6} onClick={() => { setAssignedLeads(p => p.map(l => l.id === editRow.id ? editRow : l)); closeModal("tl-lead-edit"); }} />
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("tl-lead-edit")} />
            </Grid>
          </div>
        )}
      </Modal>
    </div>
  );
}
