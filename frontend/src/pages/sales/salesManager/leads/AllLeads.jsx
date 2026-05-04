import { useState, useMemo } from "react";
import {
  DataTable, Modal, Button, DataField, SelectField, Option,
  openModal, closeModal, Grid,
} from "../../../../components/shared/Common_Components";
import {
  Pencil, ArchiveX, Trash2,
  AlertTriangle, CheckCircle, GitBranch, UserCheck, Plus, Loader2,
} from "lucide-react";
import { useLeads } from "./LeadsContext";

export default function AllLeads() {
  const { leads, updateLead, moveToDump, assignLead, addLeads, teamLeaders, MAX_LEADS, loading } = useLeads();

  // ─── Even distribution builder ────────────────────────────────────────────────
  function buildDistRows(totalLeads) {
    const eligible = teamLeaders
      .map((tl) => ({ ...tl, id: tl._id, capacity: MAX_LEADS - tl.currentLeads }))
      .filter((tl) => tl.capacity > 0);

    if (eligible.length === 0) return [];

    const base      = Math.floor(totalLeads / eligible.length);
    const remainder = totalLeads % eligible.length;

    return eligible.map((tl, i) => {
      const share  = base + (i < remainder ? 1 : 0);
      const assign = Math.min(share, tl.capacity);
      return {
        tlId:         tl.id || tl._id,
        tlName:       tl.name,
        currentLeads: tl.currentLeads,
        capacity:     tl.capacity,
        assignLeads:  assign,
        target:       Math.round(assign * 0.8),
      };
    });
  }

  // Split leads into two lists
  const unassignedLeads = useMemo(() => leads.filter((l) => l.assignedTo === "Unassigned"), [leads]);
  const assignedLeads   = useMemo(() => leads.filter((l) => l.assignedTo !== "Unassigned"),  [leads]);

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editLead, setEditLead] = useState(null);

  // ── Add Lead modal ────────────────────────────────────────────────────────
  const [newLead, setNewLead]     = useState({ name: "", mobile: "", email: "" });
  const [addError, setAddError]   = useState("");

  const openAddModal = () => {
    setNewLead({ name: "", mobile: "", email: "" });
    setAddError("");
    openModal("al-add-modal");
  };

  const confirmAddLead = () => {
    const { name, mobile, email } = newLead;
    if (!name.trim())                              { setAddError("Name is required."); return; }
    if (!/^\d{10}$/.test(mobile.trim()))           { setAddError("Mobile must be exactly 10 digits."); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))      { setAddError("Enter a valid email address."); return; }
    if (leads.some((l) => l.mobile === mobile.trim())) { setAddError("This mobile number already exists."); return; }
    if (leads.some((l) => l.email  === email.trim()))  { setAddError("This email already exists."); return; }

    const today = new Date().toISOString().split("T")[0];
    addLeads([{
      id:         `L${String(leads.length + 1).padStart(3, "0")}`,
      name:       name.trim(),
      mobile:     mobile.trim(),
      email:      email.trim(),
      status:     "New",
      assignedTo: "Unassigned",
      createdAt:  today,
      assignedAt: "",
    }]);
    closeModal("al-add-modal");
  };

  // ── Distribution modal ────────────────────────────────────────────────────
  const [distSelectedLeads, setDistSelectedLeads] = useState([]);
  const [distRows,          setDistRows]          = useState([]);
  const [distError,         setDistError]         = useState("");
  const [distSuccess,       setDistSuccess]       = useState(false);
  const [distSummary,       setDistSummary]       = useState([]);

  const totalToAssign = useMemo(
    () => distRows.reduce((s, r) => s + r.assignLeads, 0),
    [distRows]
  );

  const openDistModal = (selected) => {
    setDistSelectedLeads(selected);
    setDistRows(buildDistRows(selected.length));
    setDistError("");
    setDistSuccess(false);
    setDistSummary([]);
    openModal("al-dist-modal");
  };

  const updateDistRow = (tlId, field, raw) => {
    const val = Math.max(0, Number(raw) || 0);
    setDistRows((prev) => {
      const otherAssigned = prev
        .filter((r) => r.tlId !== tlId)
        .reduce((s, r) => s + r.assignLeads, 0);
      const remaining = distSelectedLeads.length - otherAssigned;

      return prev.map((r) => {
        if (r.tlId !== tlId) return r;
        if (field === "assignLeads") {
          const assign = Math.min(val, r.capacity, remaining);
          return { ...r, assignLeads: assign, target: Math.round(assign * 0.8) };
        }
        if (field === "target") {
          return { ...r, target: Math.min(val, r.assignLeads) };
        }
        return r;
      });
    });
    setDistError("");
  };

  const confirmDistribute = () => {
    setDistError("");
    if (totalToAssign === 0) { setDistError("Please assign at least 1 lead."); return; }
    if (totalToAssign > distSelectedLeads.length) {
      setDistError(`Total assigned (${totalToAssign}) exceeds selected leads (${distSelectedLeads.length}).`);
      return;
    }
    for (const r of distRows) {
      if (r.assignLeads > r.capacity) { setDistError(`${r.tlName} only has capacity for ${r.capacity} more leads.`); return; }
      if (r.target > r.assignLeads)   { setDistError(`Target for ${r.tlName} cannot exceed assigned leads.`); return; }
    }

    const shuffled = [...distSelectedLeads].sort(() => Math.random() - 0.5);
    let pointer = 0;
    const updates = {};
    const summary = [];
    const today   = new Date().toISOString().split("T")[0];

    for (const r of distRows) {
      if (r.assignLeads === 0) continue;
      const slice = shuffled.slice(pointer, pointer + r.assignLeads);
      pointer += r.assignLeads;
      slice.forEach((l) => { updates[l.id] = { tlName: r.tlName, date: today }; });
      summary.push({ tlName: r.tlName, count: slice.length, target: r.target });
    }

    Object.entries(updates).forEach(([id, { tlName, date }]) => {
      const lead = leads.find((l) => l.id === id);
      if (lead) updateLead({ ...lead, assignedTo: tlName, assignedAt: date });
    });

    setDistSuccess(true);
    setDistSummary(summary);
  };

  const capColor = (used, max) => {
    const pct = (used / max) * 100;
    if (pct >= 95) return "bg-rose-500";
    if (pct >= 75) return "bg-amber-400";
    return "bg-emerald-500";
  };

  // ── Shared edit action ────────────────────────────────────────────────────
  const editAction = [
    {
      icon: <Pencil size={15} />,
      tooltip: "Edit",
      variant: "ghost",
      onClick: (row) => {
        setEditLead({ ...leads.find((l) => l.id === row.id) });
        openModal("al-edit-modal");
      },
    },
  ];

  return (
    <>
      {/* ── Add Lead button ───────────────────────────────────────────────── */}
      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2a465a] text-white text-sm font-bold hover:bg-[#1e3a52] transition active:scale-95"
        >
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* ══ UNASSIGNED LEADS ══════════════════════════════════════════════════ */}
      <DataTable
        title="Unassigned Leads"
        columns={[
          { key: "name",      label: "Name" },
          { key: "mobile",    label: "Mobile" },
          { key: "email",     label: "Email" },
          { key: "companyName", label: "Company" },
          { key: "status",    label: "Status" },
          { key: "createdAt", label: "Created At" },
        ]}
        rows={unassignedLeads}
        searchable
        date={true}
        bulkAction
        bulkActions={[
          {
            title: "Distribute Leads",
            icon: <GitBranch size={14} />,
            onClick: (selected) => {
              const objs = selected.map((r) => leads.find((l) => l.id === r.id)).filter(Boolean);
              openDistModal(objs);
            },
          },
        ]}
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["UNTOUCHED", "New", "Follow-up", "Prospect", "Converted"] },
        ]}
        actions={editAction}
        size={12}
        pageSize={10}
      />

      {/* ══ ASSIGNED LEADS ════════════════════════════════════════════════════ */}
      <div className="mt-6">
        <DataTable
          title="Assigned Leads"
          columns={[
            { key: "name",       label: "Name" },
            { key: "mobile",     label: "Mobile" },
            { key: "email",      label: "Email" },
            { key: "companyName", label: "Company" },
            { key: "status",     label: "Status" },
            { key: "assignedTo", label: "Assigned To" },
            { key: "assignedAt", label: "Assigned At" },
          ]}
          rows={assignedLeads}
          searchable
          date={true}
          bulkAction
          bulkActions={[
            {
              title: "Move to Dump",
              icon: <Trash2 size={14} />,
              onClick: (selected) => selected.forEach((row) => {
                const lead = leads.find((l) => l.id === row.id);
                if (lead) moveToDump(lead);
              }),
            },
          ]}
          filters={[
            { title: "Status",      type: "toggle", key: "status",     options: ["UNTOUCHED", "New", "Follow-up", "Prospect", "Converted"] },
            { title: "Assigned To", type: "select", key: "assignedTo", options: teamLeaders.map((t) => t.name) },
          ]}
          actions={[
            ...editAction,
            {
              icon: <ArchiveX size={15} />,
              tooltip: "Dump",
              variant: "danger",
              onClick: (row) => {
                const lead = leads.find((l) => l.id === row.id);
                if (lead) moveToDump(lead);
              },
            },
          ]}
          size={12}
          pageSize={10}
        />
      </div>

      {/* ── Distribution Modal ─────────────────────────────────────────────── */}
      <Modal id="al-dist-modal" title="Distribute Leads" size="xl">
        <div className="flex flex-col gap-5">

          {/* Summary banner */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5">
            <div>
              <p className="text-sm font-bold text-[#2a465a]">
                {distSelectedLeads.length} lead{distSelectedLeads.length !== 1 ? "s" : ""} selected for distribution
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Assigned so far:{" "}
                <span className={`font-bold ${totalToAssign > distSelectedLeads.length ? "text-rose-500" : "text-emerald-600"}`}>
                  {totalToAssign}
                </span>
                {" / "}{distSelectedLeads.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Remaining</p>
              <p className="text-lg font-black text-[#2a465a]">{distSelectedLeads.length - totalToAssign}</p>
            </div>
          </div>

          {distRows.length === 0 && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              <AlertTriangle size={16} className="flex-shrink-0" />
              All team leaders have reached their maximum capacity of {MAX_LEADS} leads.
            </div>
          )}

          {distSuccess ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl">
                <CheckCircle size={18} className="flex-shrink-0" />
                <p className="text-sm font-semibold">
                  {distSummary.reduce((s, r) => s + r.count, 0)} leads distributed across {distSummary.length} team leader(s).
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#2a465a] to-[#3a5a7a]">
                      <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Team Leader</th>
                      <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Leads Assigned</th>
                      <th className="py-3 px-4 text-left text-xs font-black text-white uppercase tracking-[0.2em]">Target Set</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distSummary.map((row, i) => (
                      <tr key={row.tlName} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                        <td className="py-3 px-4 font-semibold text-[#2a465a]">
                          <span className="flex items-center gap-1.5">
                            <UserCheck size={13} className="text-emerald-600" /> {row.tlName}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            {row.count} lead{row.count !== 1 ? "s" : ""}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{row.target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <Button text="Close" variant="primary" size={3} onClick={() => closeModal("al-dist-modal")} />
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
                    const maxAssign = Math.min(
                      r.capacity,
                      distSelectedLeads.length - distRows.filter(x => x.tlId !== r.tlId).reduce((s, x) => s + x.assignLeads, 0)
                    );

                    return (
                      <div key={r.tlId} className={`rounded-2xl border p-4 ${isFull ? "border-rose-200 bg-rose-50/40 opacity-60" : "border-slate-200 bg-white"}`}>
                        <div className="flex flex-wrap items-start gap-4">
                          <div className="flex-1 min-w-[160px]">
                            <p className="text-sm font-bold text-[#2a465a]">{r.tlName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {r.currentLeads} / {MAX_LEADS} leads
                              {isFull && <span className="ml-1.5 text-rose-500 font-semibold">· Full</span>}
                            </p>
                            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${capColor(usedAfter, MAX_LEADS)}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              After assignment: {usedAfter} ({pct}%) · Capacity left: {Math.max(0, r.capacity - r.assignLeads)}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1 w-32">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assign Leads</label>
                            <input
                              type="number" min={0} max={maxAssign}
                              value={r.assignLeads} disabled={isFull}
                              onChange={(e) => updateDistRow(r.tlId, "assignLeads", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#2a465a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                            <p className="text-[10px] text-slate-400">Max: {maxAssign}</p>
                          </div>

                          <div className="flex flex-col gap-1 w-32">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target (80%)</label>
                            <input
                              type="number" min={0} max={r.assignLeads}
                              value={r.target} disabled={isFull}
                              onChange={(e) => updateDistRow(r.tlId, "target", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#2a465a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            />
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
                <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("al-dist-modal")} />
                <Button
                  text="Confirm Distribution"
                  variant="primary"
                  size={4}
                  disabled={distRows.length === 0 || totalToAssign === 0}
                  onClick={confirmDistribute}
                />
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      <Modal id="al-edit-modal" title="Edit Lead" size="md">
        {editLead && (
          <div className="space-y-4">
            <Grid cols={12} gap={4}>
              <DataField label="Name"   id="al-name"   value={editLead.name}   size={6} onChange={(e) => setEditLead((p) => ({ ...p, name: e.target.value }))} />
              <DataField label="Mobile" id="al-mobile" value={editLead.mobile} size={6} onChange={(e) => setEditLead((p) => ({ ...p, mobile: e.target.value }))} />
              <DataField label="Email"  id="al-email"  value={editLead.email}  size={12} type="email" onChange={(e) => setEditLead((p) => ({ ...p, email: e.target.value }))} />
              <SelectField label="Status" value={editLead.status} size={6} onChange={(e) => setEditLead((p) => ({ ...p, status: e.target.value }))}>
                {["New", "Follow-up", "Prospect", "Converted"].map((s) => <Option key={s} value={s} label={s} />)}
              </SelectField>
              <SelectField label="Assign To" value={editLead.assignedTo} size={6} onChange={(e) => setEditLead((p) => ({ ...p, assignedTo: e.target.value }))}>
                <Option value="Unassigned" label="Unassigned" />
                {teamLeaders.map((tl) => <Option key={tl._id} value={tl.name} label={tl.name} />)}
              </SelectField>
              <Button text="Save Changes" variant="primary" size={6} onClick={() => { updateLead(editLead); closeModal("al-edit-modal"); }} />
              <Button text="Cancel" variant="secondary" size={6} onClick={() => closeModal("al-edit-modal")} />
            </Grid>
          </div>
        )}
      </Modal>

      {/* ── Add Lead Modal ──────────────────────────────────────────────────── */}
      <Modal id="al-add-modal" title="Add New Lead" size="sm">
        <div className="space-y-4">
          <Grid cols={12} gap={4}>
            <DataField
              label="Full Name" id="add-name" placeholder="e.g. Rahul Sharma"
              value={newLead.name} size={12}
              onChange={(e) => { setNewLead((p) => ({ ...p, name: e.target.value })); setAddError(""); }}
            />
            <DataField
              label="Mobile Number" id="add-mobile" placeholder="10-digit mobile"
              value={newLead.mobile} size={12}
              onChange={(e) => { setNewLead((p) => ({ ...p, mobile: e.target.value })); setAddError(""); }}
            />
            <DataField
              label="Email Address" id="add-email" type="email" placeholder="name@example.com"
              value={newLead.email} size={12}
              onChange={(e) => { setNewLead((p) => ({ ...p, email: e.target.value })); setAddError(""); }}
            />
          </Grid>
          {addError && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              <AlertTriangle size={14} className="flex-shrink-0" /> {addError}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Button text="Add Lead" variant="primary"   size={6} onClick={confirmAddLead} />
            <Button text="Cancel"   variant="secondary" size={6} onClick={() => closeModal("al-add-modal")} />
          </div>
        </div>
      </Modal>
    </>
  );
}
