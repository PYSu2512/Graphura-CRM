import { useState, useMemo } from "react";
import {
  DataTable, Modal, Button, DataField, SelectField, Option,
  openModal, closeModal, ModalProfile, ModalData, ModalGrid, Grid,
} from "../../../../components/shared/Common_Components";
import {
  Eye, Pencil, UserCheck, Trash2, AlertTriangle, GitBranch, CheckCircle,
} from "lucide-react";
import { useLeads } from "./LeadsContext";
import { TEAM_LEADERS, MAX_LEADS } from "./leadsStore";

// ─── Same distribution builder as AllLeads ────────────────────────────────────
function buildDistRows(totalLeads) {
  const eligible = TEAM_LEADERS
    .map((tl) => ({ ...tl, capacity: MAX_LEADS - tl.currentLeads }))
    .filter((tl) => tl.capacity > 0);
  if (eligible.length === 0) return [];
  const base      = Math.floor(totalLeads / eligible.length);
  const remainder = totalLeads % eligible.length;
  return eligible.map((tl, i) => {
    const share  = base + (i < remainder ? 1 : 0);
    const assign = Math.min(share, tl.capacity);
    return { tlId: tl.id, tlName: tl.name, currentLeads: tl.currentLeads, capacity: tl.capacity, assignLeads: assign, target: Math.round(assign * 0.8) };
  });
}

export default function DumpData() {
  const { dumpData, reassignFromDump, deleteDumpRow, addLeads } = useLeads();

  // ── View modal ────────────────────────────────────────────────────────────
  const [viewRow, setViewRow] = useState(null);

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editRow, setEditRow] = useState(null);

  // ── Reassign modal ────────────────────────────────────────────────────────
  const [reassignRow,     setReassignRow]     = useState(null);
  const [reassignTL,      setReassignTL]      = useState("");
  const [reassignWarning, setReassignWarning] = useState("");

  // ── Delete modal ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Bulk distribute modal ─────────────────────────────────────────────────
  const [distSelected, setDistSelected] = useState([]);
  const [distRows,     setDistRows]     = useState([]);
  const [distError,    setDistError]    = useState("");
  const [distSuccess,  setDistSuccess]  = useState(false);
  const [distSummary,  setDistSummary]  = useState([]);

  const totalToAssign = useMemo(() => distRows.reduce((s, r) => s + r.assignLeads, 0), [distRows]);

  const openDistModal = (selected) => {
    setDistSelected(selected);
    setDistRows(buildDistRows(selected.length));
    setDistError("");
    setDistSuccess(false);
    setDistSummary([]);
    openModal("dd-dist-modal");
  };

  const updateDistRow = (tlId, field, raw) => {
    const val = Math.max(0, Number(raw) || 0);
    setDistRows((prev) => {
      const otherAssigned = prev.filter((r) => r.tlId !== tlId).reduce((s, r) => s + r.assignLeads, 0);
      const remaining = distSelected.length - otherAssigned;
      return prev.map((r) => {
        if (r.tlId !== tlId) return r;
        if (field === "assignLeads") { const assign = Math.min(val, r.capacity, remaining); return { ...r, assignLeads: assign, target: Math.round(assign * 0.8) }; }
        if (field === "target")      return { ...r, target: Math.min(val, r.assignLeads) };
        return r;
      });
    });
    setDistError("");
  };

  const confirmDistribute = () => {
    setDistError("");
    if (totalToAssign === 0) { setDistError("Please assign at least 1 lead."); return; }
    if (totalToAssign > distSelected.length) { setDistError(`Total (${totalToAssign}) exceeds selected (${distSelected.length}).`); return; }
    for (const r of distRows) {
      if (r.assignLeads > r.capacity) { setDistError(`${r.tlName} only has capacity for ${r.capacity} more leads.`); return; }
      if (r.target > r.assignLeads)   { setDistError(`Target for ${r.tlName} cannot exceed assigned leads.`); return; }
    }

    const shuffled = [...distSelected].sort(() => Math.random() - 0.5);
    let pointer = 0;
    const updates = {};
    const summary = [];
    const today   = new Date().toISOString().split("T")[0];

    for (const r of distRows) {
      if (r.assignLeads === 0) continue;
      const slice = shuffled.slice(pointer, pointer + r.assignLeads);
      pointer += r.assignLeads;
      slice.forEach((d) => { updates[d.id] = { tlName: r.tlName, date: today }; });
      summary.push({ tlName: r.tlName, count: slice.length, target: r.target });
    }

    // Move distributed dump rows back to leads
    const newLeads = Object.entries(updates).map(([id, { tlName, date }]) => {
      const d = dumpData.find((x) => x.id === id);
      return { id, name: d.name, mobile: d.mobile, email: d.email, status: "New", assignedTo: tlName, createdAt: d.dumpDate, assignedAt: date };
    });
    addLeads(newLeads);
    newLeads.forEach((l) => deleteDumpRow(l.id));

    setDistSuccess(true);
    setDistSummary(summary);
  };

  const confirmReassign = () => {
    if (!reassignTL) return;
    const result = reassignFromDump(reassignRow, reassignTL);
    if (result.error) { setReassignWarning(result.error); return; }
    setReassignRow(null); setReassignTL(""); setReassignWarning("");
    closeModal("dd-reassign-modal");
  };

  const capColor = (used, max) => {
    const pct = (used / max) * 100;
    if (pct >= 95) return "bg-rose-500";
    if (pct >= 75) return "bg-amber-400";
    return "bg-emerald-500";
  };

  return (
    <>
      <DataTable
        title="Dump Data"
        columns={[
          { key: "name",       label: "Name" },
          { key: "mobile",     label: "Mobile" },
          { key: "email",      label: "Email" },
          { key: "dumpReason", label: "Dump Reason" },
          { key: "dumpedBy",   label: "Dumped By" },
          { key: "dumpDate",   label: "Dump Date" },
        ]}
        rows={dumpData}
        searchable
        bulkAction
        bulkActions={[
          {
            title: "Distribute",
            icon: <GitBranch size={14} />,
            onClick: (selected) => {
              const objs = selected.map((r) => dumpData.find((d) => d.id === r.id)).filter(Boolean);
              openDistModal(objs);
            },
          },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setViewRow(dumpData.find((d) => d.id === row.id)); openModal("dd-view-modal"); },
          },
          {
            icon: <Pencil size={15} />, tooltip: "Edit", variant: "ghost",
            onClick: (row) => { setEditRow({ ...dumpData.find((d) => d.id === row.id) }); openModal("dd-edit-modal"); },
          },
          {
            icon: <UserCheck size={15} />, tooltip: "Reassign", variant: "primary",
            onClick: (row) => { const d = dumpData.find((x) => x.id === row.id); setReassignRow(d); setReassignTL(""); setReassignWarning(""); openModal("dd-reassign-modal"); },
          },
          {
            icon: <Trash2 size={15} />, tooltip: "Delete", variant: "danger",
            onClick: (row) => { setDeleteTarget(dumpData.find((d) => d.id === row.id)); openModal("dd-delete-modal"); },
          },
        ]}
        size={12}
        pageSize={10}
      />

      {/* ── View Modal ──────────────────────────────────────────────────────── */}
      <Modal id="dd-view-modal" title="Dump Lead Details" size="md">
        {viewRow && (
          <div className="space-y-4">
            <ModalProfile name={viewRow.name} subtitle={viewRow.mobile} meta={viewRow.email} />
            <ModalGrid title="Dump Info" cols={2}>
              <ModalData label="Dump Reason" value={viewRow.dumpReason} />
              <ModalData label="Dumped By"   value={viewRow.dumpedBy} />
              <ModalData label="Dump Date"   value={viewRow.dumpDate} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("dd-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal id="dd-edit-modal" title="Edit Dump Lead" size="md">
        {editRow && (
          <div className="space-y-4">
            <Grid cols={12} gap={4}>
              <DataField label="Name"        id="dd-name"   value={editRow.name}       size={6} onChange={(e) => setEditRow((p) => ({ ...p, name: e.target.value }))} />
              <DataField label="Mobile"      id="dd-mobile" value={editRow.mobile}     size={6} onChange={(e) => setEditRow((p) => ({ ...p, mobile: e.target.value }))} />
              <DataField label="Email"       id="dd-email"  value={editRow.email}      size={12} type="email" onChange={(e) => setEditRow((p) => ({ ...p, email: e.target.value }))} />
              <DataField label="Dump Reason" id="dd-reason" value={editRow.dumpReason} size={12} onChange={(e) => setEditRow((p) => ({ ...p, dumpReason: e.target.value }))} />
              <Button text="Save Changes" variant="primary"   size={6} onClick={() => { /* update in context if needed */ closeModal("dd-edit-modal"); }} />
              <Button text="Cancel"       variant="secondary" size={6} onClick={() => closeModal("dd-edit-modal")} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Reassign Modal ───────────────────────────────────────────────────── */}
      <Modal id="dd-reassign-modal" title="Reassign Lead" size="md">
        {reassignRow && (
          <div className="space-y-4">
            <ModalProfile name={reassignRow.name} subtitle={reassignRow.mobile} meta={reassignRow.email} />
            <SelectField label="Select Team Leader" value={reassignTL}
              onChange={(e) => { setReassignTL(e.target.value); setReassignWarning(""); }}
              placeholder="Choose a TL">
              {TEAM_LEADERS.map((tl) => {
                const cap = MAX_LEADS - tl.currentLeads;
                return <Option key={tl.id} value={tl.name} label={`${tl.name} (${cap} capacity)`} disabled={cap === 0} />;
              })}
            </SelectField>
            {reassignWarning && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
                <AlertTriangle size={15} /> {reassignWarning}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button text="Reassign" variant="primary"   size={6} onClick={confirmReassign} />
              <Button text="Cancel"   variant="secondary" size={6} onClick={() => closeModal("dd-reassign-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal id="dd-delete-modal" title="Delete Lead" size="sm">
        {deleteTarget && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-slate-600">
              Permanently delete <span className="font-bold text-[#2a465a]">{deleteTarget.name}</span> from dump data? This cannot be undone.
            </p>
            <ModalGrid title="Lead Info" cols={2}>
              <ModalData label="Mobile"      value={deleteTarget.mobile} />
              <ModalData label="Dump Reason" value={deleteTarget.dumpReason} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-1">
              <Button text="Cancel" variant="ghost"  size={4} onClick={() => { setDeleteTarget(null); closeModal("dd-delete-modal"); }} />
              <Button text="Delete" variant="danger" size={4} onClick={() => { deleteDumpRow(deleteTarget.id); setDeleteTarget(null); closeModal("dd-delete-modal"); }} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Bulk Distribute Modal ────────────────────────────────────────────── */}
      <Modal id="dd-dist-modal" title="Distribute Dump Leads" size="xl">
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5">
            <div>
              <p className="text-sm font-bold text-[#2a465a]">{distSelected.length} dump lead{distSelected.length !== 1 ? "s" : ""} selected</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Assigned so far: <span className={`font-bold ${totalToAssign > distSelected.length ? "text-rose-500" : "text-emerald-600"}`}>{totalToAssign}</span> / {distSelected.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Remaining</p>
              <p className="text-lg font-black text-[#2a465a]">{distSelected.length - totalToAssign}</p>
            </div>
          </div>

          {distRows.length === 0 && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              <AlertTriangle size={16} className="flex-shrink-0" /> All team leaders are at maximum capacity.
            </div>
          )}

          {distSuccess ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl">
                <CheckCircle size={18} className="flex-shrink-0" />
                <p className="text-sm font-semibold">{distSummary.reduce((s, r) => s + r.count, 0)} leads distributed and moved back to All Leads.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#2a465a] to-[#3a5a7a]">
                      <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Team Leader</th>
                      <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Leads</th>
                      <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distSummary.map((row, i) => (
                      <tr key={row.tlName} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                        <td className="py-3 px-4 font-semibold text-[#2a465a]">{row.tlName}</td>
                        <td className="py-3 px-4"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{row.count}</span></td>
                        <td className="py-3 px-4 text-slate-600">{row.target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <Button text="Close" variant="primary" size={3} onClick={() => closeModal("dd-dist-modal")} />
              </div>
            </div>
          ) : (
            <>
              {distRows.length > 0 && (
                <div className="flex flex-col gap-3">
                  {distRows.map((r) => {
                    const usedAfter = r.currentLeads + r.assignLeads;
                    const pct       = Math.round((usedAfter / MAX_LEADS) * 100);
                    const isFull    = r.capacity === 0;
                    const maxAssign = Math.min(r.capacity, distSelected.length - distRows.filter(x => x.tlId !== r.tlId).reduce((s, x) => s + x.assignLeads, 0));
                    return (
                      <div key={r.tlId} className={`rounded-2xl border p-4 ${isFull ? "border-rose-200 bg-rose-50/40 opacity-60" : "border-slate-200 bg-white"}`}>
                        <div className="flex flex-wrap items-start gap-4">
                          <div className="flex-1 min-w-[160px]">
                            <p className="text-sm font-bold text-[#2a465a]">{r.tlName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{r.currentLeads} / {MAX_LEADS} leads{isFull && <span className="ml-1.5 text-rose-500 font-semibold">· Full</span>}</p>
                            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-300 ${capColor(usedAfter, MAX_LEADS)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">After: {usedAfter} ({pct}%) · Left: {Math.max(0, r.capacity - r.assignLeads)}</p>
                          </div>
                          <div className="flex flex-col gap-1 w-32">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assign</label>
                            <input type="number" min={0} max={maxAssign} value={r.assignLeads} disabled={isFull}
                              onChange={(e) => updateDistRow(r.tlId, "assignLeads", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#2a465a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 disabled:opacity-40 disabled:cursor-not-allowed" />
                            <p className="text-[10px] text-slate-400">Max: {maxAssign}</p>
                          </div>
                          <div className="flex flex-col gap-1 w-32">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target (80%)</label>
                            <input type="number" min={0} max={r.assignLeads} value={r.target} disabled={isFull}
                              onChange={(e) => updateDistRow(r.tlId, "target", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#2a465a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 disabled:opacity-40 disabled:cursor-not-allowed" />
                            <p className="text-[10px] text-slate-400">Max: {r.assignLeads}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {distError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                  <AlertTriangle size={15} className="flex-shrink-0" /> {distError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
                <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("dd-dist-modal")} />
                <Button text="Confirm Distribution" variant="primary" size={4} disabled={distRows.length === 0 || totalToAssign === 0} onClick={confirmDistribute} />
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
