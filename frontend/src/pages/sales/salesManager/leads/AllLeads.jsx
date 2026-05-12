import { useState, useMemo, useEffect } from "react";
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
  const {
    leads,
    assignedLeads,
    updateLead,
    moveToDump,
    assignLead,
    addLeads,
    teamLeaders,
    MAX_LEADS,
    loading,
    fetchLeads,
    fetchAssignedLeads,
    fetchAssignmentTargets,
    distributeLeads,
  } = useLeads();

  // ─── Even distribution builder ────────────────────────────────────────────────
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  const resolveLeadId = (lead) => String(lead?.id || lead?._id || "").trim();

  function buildDistRows(totalLeads, leaders = []) {
    // Build eligible leaders with remaining capacity
    const eligible = leaders
      .map((tl) => ({
        ...tl,
        tlId: tl._id || tl.id,
        capacity: Math.max(0, Number(tl.capacity ?? tl.remaining ?? 0)),
        currentLeads: Number(tl.currentLeads ?? 0),
        effectiveLimit: Number(tl.effectiveLimit ?? tl.limit ?? MAX_LEADS),
      }))
      .filter((tl) => tl.capacity > 0);

    if (eligible.length === 0) return [];

    // Default assignment is 0 for manual distribution control.
    return eligible.map((tl) => ({
      tlId: tl.tlId,
      tlName: tl.name,
      currentLeads: tl.currentLeads,
      capacity: tl.capacity,
      assignLeads: 0,
      target: 0,
    }));
  }

  // Split leads into two lists
  const unassignedLeads = useMemo(
    () => leads.filter((l) => l.assignedTo === "Unassigned" && !l.isDumped),
    [leads]
  );
  const assignedLeadsVisible = useMemo(
    () => assignedLeads.filter((l) => !l.isDumped),
    [assignedLeads]
  );

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
  const [totalToDistribute, setTotalToDistribute] = useState(0);
  const [distLoading,       setDistLoading]       = useState(false);

  useEffect(() => {
    fetchAssignmentTargets("SALES_TL");
  }, [fetchAssignmentTargets]);

  const totalToAssign = useMemo(
    () => distRows.reduce((s, r) => s + r.assignLeads, 0),
    [distRows]
  );

  const openDistModal = async (selected) => {
    const targetLeads = (selected?.length ? selected : unassignedLeads).filter((lead) => !lead.isDumped);
    setDistSelectedLeads(targetLeads);
    const total = targetLeads.length;
    setTotalToDistribute(total);
    setDistError("");
    setDistSuccess(false);
    setDistSummary([]);
    setDistLoading(true);

    const response = await fetchAssignmentTargets("SALES_TL");
    const liveTargets = response?.targets?.length ? response.targets : teamLeaders;
    setDistRows(buildDistRows(total, liveTargets));
    setDistLoading(false);
    openModal("al-dist-modal");
  };

  const updateDistRow = (tlId, field, raw) => {
    const val = Math.max(0, Number(raw) || 0);
    setDistRows((prev) => {
      const otherAssigned = prev
        .filter((r) => r.tlId !== tlId)
        .reduce((s, r) => s + (Number(r.assignLeads) || 0), 0);
      const remaining = Math.max(0, totalToDistribute - otherAssigned);

      return prev.map((r) => {
        // always return a new object to avoid retaining shared references
        if (r.tlId === tlId) {
          if (field === "assignLeads") {
            const assign = Math.min(val, r.capacity, remaining);
            return { ...r, assignLeads: assign, target: Math.min(Math.round(assign * 0.8), assign) };
          }
          if (field === "target") {
            const tgt = Math.min(val, r.assignLeads || 0);
            return { ...r, target: tgt };
          }
        }
        return { ...r };
      });
    });
    setDistError("");
  };

  // Index-based updater to avoid any id/key collisions causing mirrored updates
  const updateDistRowByIndex = (index, field, raw) => {
    const val = Math.max(0, Number(raw) || 0);
    setDistRows((prev) => {
      const otherAssigned = prev
        .filter((_, i) => i !== index)
        .reduce((s, r) => s + (Number(r.assignLeads) || 0), 0);
      const remaining = Math.max(0, totalToDistribute - otherAssigned);

      return prev.map((r, i) => {
        if (i !== index) return { ...r };
        if (field === "assignLeads") {
          const assign = Math.min(val, r.capacity, remaining);
          return { ...r, assignLeads: assign, target: Math.min(Math.round(assign * 0.8), assign) };
        }
        if (field === "target") {
          const tgt = Math.min(val, r.assignLeads || 0);
          return { ...r, target: tgt };
        }
        return { ...r };
      });
    });
    setDistError("");
  };

  const handleTotalToDistributeChange = (raw) => {
    const val = Math.max(0, Number(raw) || 0);
    setTotalToDistribute(val);
    setDistRows((prev) => {
      const currentTotal = prev.reduce((s, r) => s + r.assignLeads, 0);
      if (val === currentTotal) return prev;
      if (val > currentTotal) return prev; // don't auto-increase assignments

      // Need to reduce assignments to match new total. Reduce from end to front.
      let needReduce = currentTotal - val;
      const next = prev.map((r) => ({ ...r }));
      for (let i = next.length - 1; i >= 0 && needReduce > 0; i--) {
        const take = Math.min(next[i].assignLeads, needReduce);
        if (take > 0) {
          next[i].assignLeads -= take;
          next[i].target = Math.min(next[i].target, next[i].assignLeads);
          needReduce -= take;
        }
      }
      return next;
    });
  };

  const confirmDistribute = async () => {
    setDistError("");
    if (totalToAssign === 0) { setDistError("Please assign at least 1 lead."); return; }
    if (totalToAssign > totalToDistribute) {
      setDistError(`Total assigned (${totalToAssign}) exceeds leads to distribute (${totalToDistribute}).`);
      return;
    }
    if (totalToAssign > distSelectedLeads.length) {
      setDistError(`Not enough active unassigned leads selected (${distSelectedLeads.length}) for the assigned total (${totalToAssign}).`);
      return;
    }
    for (const r of distRows) {
      if (r.assignLeads > r.capacity) { setDistError(`${r.tlName} only has capacity for ${r.capacity} more leads.`); return; }
      if (r.target > r.assignLeads)   { setDistError(`Target for ${r.tlName} cannot exceed assigned leads.`); return; }
    }

    const activeLeads = distSelectedLeads.filter((lead) => !lead.isDumped);
    if (activeLeads.length === 0) {
      setDistError('No active leads available for distribution.');
      return;
    }

    const shuffled = [...activeLeads].sort(() => Math.random() - 0.5);
    let pointer = 0;
    const assignments = [];
    const summary = [];
    const today   = new Date().toISOString().split("T")[0];

    for (const r of distRows) {
      if (r.assignLeads === 0) continue;
      const slice = shuffled.slice(pointer, pointer + r.assignLeads);
      pointer += r.assignLeads;

      const leadIds = slice
        .map((lead) => resolveLeadId(lead))
        .filter((id) => objectIdPattern.test(id));

      if (leadIds.length === 0) {
        continue;
      }

      assignments.push({
        userId: r.tlId,
        leadIds,
        reason: `Distributed by Sales Manager on ${today}`,
      });
      summary.push({ tlId: r.tlId, tlName: r.tlName, count: leadIds.length, target: r.target });
    }

    if (assignments.length === 0) {
      setDistError("No valid persisted lead IDs were found in your selection. Refresh leads and try again.");
      return;
    }

    const response = await distributeLeads(assignments);
    if (!response?.success) {
      await fetchLeads();
      await fetchAssignedLeads();
      await fetchAssignmentTargets("SALES_TL");
      const serverMessage = response?.data?.message || response?.data?.error?.message || response?.error;
      setDistError(serverMessage || "Failed to distribute leads.");
      return;
    }

    const result = response?.data || {};
    const persistedAssignedCount = Number(result.assignedCount || 0);
    const persistedGroups = Array.isArray(result.groups) ? result.groups : [];

    if (persistedAssignedCount <= 0) {
      await fetchLeads();
      await fetchAssignedLeads();
      await fetchAssignmentTargets("SALES_TL");
      setDistError("No leads were assigned in database. Please check lead selection and try again.");
      return;
    }

    const summaryTargetByTlId = new Map(summary.map((item) => [String(item.tlId), item.target]));
    const persistedSummary = persistedGroups
      .filter((group) => Number(group.assignedCount || 0) > 0)
      .map((group) => ({
        tlName: group?.targetUser?.name || "Unknown",
        count: Number(group.assignedCount || 0),
        target: summaryTargetByTlId.get(String(group?.targetUser?.id || "")) || 0,
      }));

    await fetchLeads();
    await fetchAssignedLeads();
    await fetchAssignmentTargets("SALES_TL");
    setDistSuccess(true);
    setDistSummary(persistedSummary);
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openDistModal(unassignedLeads)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#274859] text-white text-sm font-bold hover:bg-[#1d3d47] transition active:scale-95"
          >
            <GitBranch size={16} /> Distribute Leads
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2a465a] text-white text-sm font-bold hover:bg-[#1e3a52] transition active:scale-95"
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
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
            onClick: (selected) => openDistModal(selected),
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
            { key: "assignedBy", label: "Assigned By" },
            { key: "team",       label: "Team" },
            { key: "assignedAt", label: "Assigned At" },
            { key: "assignmentReason", label: "Reason" },
          ]}
          rows={assignedLeadsVisible}
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
          {distLoading && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Loader2 size={16} className="animate-spin" />
              Loading live sales team leaders...
            </div>
          )}

          {/* Summary banner */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5">
            <div>
              <p className="text-sm font-bold text-[#2a465a]">
                {distSelectedLeads.length} lead{distSelectedLeads.length !== 1 ? "s" : ""} selected for distribution
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Assigned so far: {" "}
                <span className={`font-bold ${totalToAssign > totalToDistribute ? "text-rose-500" : "text-emerald-600"}`}>
                  {totalToAssign}
                </span>
                {" / "}{totalToDistribute}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Remaining</p>
              <p className="text-lg font-black text-[#2a465a]">{Math.max(0, totalToDistribute - totalToAssign)}</p>
            </div>
          </div>

          {/* Total control */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-600">Leads to distribute</label>
            <input
              type="number"
              min={0}
              value={totalToDistribute}
              onChange={(e) => handleTotalToDistributeChange(e.target.value)}
              className="w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#2a465a] font-semibold focus:outline-none"
            />
            <p className="text-xs text-slate-400">Available: {distSelectedLeads.length}</p>
          </div>

              {distRows.length === 0 && !distLoading && (
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
                  {distRows.map((r, i) => {
                    const limit     = r.effectiveLimit || MAX_LEADS;
                    const usedAfter = r.currentLeads + r.assignLeads;
                    const pct       = Math.round((usedAfter / limit) * 100);
                    const isFull    = r.capacity === 0;
                    const maxAssign = Math.min(
                      r.capacity,
                      Math.max(0, totalToDistribute - distRows.filter(x => x.tlId !== r.tlId).reduce((s, x) => s + x.assignLeads, 0))
                    );

                    return (
                      <div key={r.tlId} className={`rounded-2xl border p-4 ${isFull ? "border-rose-200 bg-rose-50/40 opacity-60" : "border-slate-200 bg-white"}`}>
                        <div className="flex flex-wrap items-start gap-4">
                          <div className="flex-1 min-w-[160px]">
                            <p className="text-sm font-bold text-[#2a465a]">{r.tlName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {r.currentLeads} / {limit} leads
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
                              onChange={(e) => updateDistRowByIndex(i, "assignLeads", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#2a465a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 disabled:opacity-40 disabled:cursor-not-allowed"
                            />
                            <p className="text-[10px] text-slate-400">Max: {maxAssign}</p>
                          </div>

                          <div className="flex flex-col gap-1 w-32">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target (80%)</label>
                            <input
                              type="number" min={0} max={r.assignLeads}
                              value={r.target} disabled={isFull}
                              onChange={(e) => updateDistRowByIndex(i, "target", e.target.value)}
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
