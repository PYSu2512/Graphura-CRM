import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  DataField, SelectField, Option, Grid,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import DatePicker from "../../../../components/shared/DatePicker";
import {
  Calendar, CheckCircle, Clock, XCircle, Eye, BadgeCheck, Ban, Trash2, Download,
} from "lucide-react";
import { myLeavesInit, leaveRequests as DEPT_LEAVES, LEAVE_TYPES } from "./hrmStore";

const KPI_ICONS   = [<Calendar size={22} />, <CheckCircle size={22} />, <Clock size={22} />, <XCircle size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

const today = () => new Date().toISOString().split("T")[0];

const toMyRow = (l) => ({
  ...l,
  appliedOn: l.appliedOn || today(),
  dateRange: `${l.from} to ${l.to}`,
  days:      typeof l.days === "string" ? l.days : String(l.days),
});

const toDeptRow = (l) => ({
  ...l,
  dateRange: `${l.from} to ${l.to}`,
  days:      typeof l.days === "string" ? l.days : String(l.days),
});

const MY_COLS = [
  { key: "type",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "appliedOn", label: "Applied On", sortValue: (row) => new Date(row.appliedOn).getTime() },
  { key: "status",    label: "Status" },
];

const PENDING_COLS = [
  { key: "name",      label: "Member" },
  { key: "role",      label: "Role" },
  { key: "type",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "appliedOn", label: "Applied On", sortValue: (row) => new Date(row.appliedOn).getTime() },
];

const HISTORY_COLS = [
  { key: "name",      label: "Member" },
  { key: "role",      label: "Role" },
  { key: "type",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "actionOn",  label: "Actioned On", sortValue: (row) => new Date(row.actionOn).getTime() },
  { key: "status",    label: "Status" },
];

const calcDays = (from, to) => {
  if (!from || !to) return "";
  const diff = (new Date(to) - new Date(from)) / 86400000;
  return diff < 0 ? "" : String(diff + 1);
};

export default function Leaves() {
  const [myLeaves, setMyLeaves] = useState(() => 
    myLeavesInit.map(toMyRow).sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn))
  );
  const [deptReqs, setDeptReqs] = useState(() => 
    DEPT_LEAVES.map(toDeptRow).sort((a, b) => new Date(b.appliedOn) - new Date(a.appliedOn))
  );

  const [myView,      setMyView]      = useState(null);
  const [pendingView, setPendingView] = useState(null);
  const [historyView, setHistoryView] = useState(null);

  const EMPTY_FORM = { leaveType: "", reason: "", dateFrom: "", dateTo: "" };
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const applyDays = calcDays(form.dateFrom, form.dateTo);

  // ── KPIs ────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const all      = [...myLeaves, ...deptReqs];
    const total    = all.length;
    const approved = all.filter((l) => l.status === "Approved").length;
    const pending  = all.filter((l) => l.status === "Pending").length;
    const rejected = all.filter((l) => l.status === "Rejected").length;
    return [
      { title: "Total Leaves", value: String(total)    },
      { title: "Approved",     value: String(approved) },
      { title: "Pending",      value: String(pending)  },
      { title: "Rejected",     value: String(rejected) },
    ];
  }, [myLeaves, deptReqs]);

  const pendingRows = useMemo(() => deptReqs.filter((r) => r.status === "Pending"), [deptReqs]);
  const historyRows = useMemo(() => deptReqs.filter((r) => r.status !== "Pending"), [deptReqs]);

  const onChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.leaveType)     e.leaveType = "Select a leave type.";
    if (!form.reason.trim()) e.reason    = "Reason is required.";
    if (!form.dateFrom)      e.dateFrom  = "Start date is required.";
    if (!form.dateTo)        e.dateTo    = "End date is required.";
    if (form.dateFrom && form.dateTo && form.dateTo < form.dateFrom)
      e.dateTo = "End date must be on or after start date.";
    return e;
  };

  const submitApply = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    const newLeave = toMyRow({
      id:        `MM-LV-${Date.now()}`,
      type:      form.leaveType,
      reason:    form.reason.trim(),
      from:      form.dateFrom,
      to:        form.dateTo,
      days:      Number(applyDays),
      appliedOn: today(),
      status:    "Pending",
    });
    setMyLeaves((prev) => [newLeave, ...prev]);
    setForm(EMPTY_FORM);
    setSubmitting(false);
    closeModal("mm-hrm-leave-apply");
    toast.success("Leave Applied Successfully!", { icon: "📋" });
  };

  const cancelMyLeave = (row) => {
    setMyLeaves((prev) => prev.filter((l) => l.id !== row.id));
    toast("Leave application cancelled.", { icon: "🟡" });
  };

  const setDeptStatus = (row, newStatus) => {
    const stamp = today();
    setDeptReqs((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, status: newStatus, actionOn: stamp } : r))
    );
    toast.success(`Leave ${newStatus.toLowerCase()} for ${row.name}.`,
      { icon: newStatus === "Approved" ? "✅" : "🛑" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Leave" secondaryText="Management" size={12} />
        {kpis.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      {/* ── Apply Leave button ───────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button text="+  Apply Leave" variant="primary" onClick={() => openModal("mm-hrm-leave-apply")} />
      </div>

      {/* ── My Leaves table ──────────────────────────────────────────────── */}
      <DataTable
        title="My Leaves"
        columns={MY_COLS}
        rows={myLeaves}
        ellipse={4}
        size={12}
        pageSize={5}
        searchable
        exportable
        defaultSortKey="appliedOn"
        defaultSortDir="desc"
        exportFileName="my_leaves"
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Pending", "Approved", "Rejected"] },
          { title: "Leave Type", type: "toggle", key: "type",   options: LEAVE_TYPES },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setMyView(myLeaves.find((l) => l.id === row.id)); openModal("mm-hrm-myleave-view"); },
          },
          {
            icon: <Trash2 size={15} />, tooltip: "Cancel / Delete", variant: "danger",
            onClick: (row) => {
              if (row.status === "Pending") cancelMyLeave(row);
              else setMyLeaves((prev) => prev.filter((l) => l.id !== row.id));
            },
          },
        ]}
      />

      {/* ── Pending Leaves table (TLs + Employees) ───────────────────────── */}
      <DataTable
        title={`Pending Leaves${pendingRows.length ? ` (${pendingRows.length})` : ""}`}
        columns={PENDING_COLS}
        rows={pendingRows}
        userProfile="name"
        ellipse={3}
        size={12}
        pageSize={10}
        searchable
        exportable
        defaultSortKey="appliedOn"
        defaultSortDir="desc"
        exportFileName="pending_leaves"
        filters={[
          { title: "Leave Type", type: "toggle", key: "type", options: LEAVE_TYPES },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View Details", variant: "ghost",
            onClick: (row) => { setPendingView(deptReqs.find((r) => r.id === row.id)); openModal("mm-hrm-pending-view"); },
          },
          {
            icon: <BadgeCheck size={15} />, tooltip: "Approve", variant: "primary",
            onClick: (row) => setDeptStatus(row, "Approved"),
          },
          {
            icon: <Ban size={15} />, tooltip: "Reject", variant: "danger",
            onClick: (row) => setDeptStatus(row, "Rejected"),
          },
        ]}
      />

      {/* ── Leave History table (actioned) ───────────────────────────────── */}
      <DataTable
        title="Leave History"
        columns={HISTORY_COLS}
        rows={historyRows}
        userProfile="name"
        ellipse={3}
        size={12}
        pageSize={10}
        searchable
        exportable
        defaultSortKey="actionOn"
        defaultSortDir="desc"
        exportFileName="leave_history"
        bulkAction
        bulkActions={[
          {
            title: "Delete Selected",
            icon: <Trash2 size={14} />,
            onClick: (selected) => {
              const ids = new Set(selected.map((r) => r.id));
              setDeptReqs((prev) => prev.filter((r) => !ids.has(r.id) || r.status === "Pending"));
              toast.success(`${selected.length} record(s) removed.`);
            },
          },
          {
            title: "Export Selected",
            icon: <Download size={14} />,
            onClick: (selected) => {
              if (!selected.length) return;
              const keys = Object.keys(selected[0]);
              const escape = (v) => {
                const s = v == null ? "" : String(v);
                return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
              };
              const csv = [keys.join(","), ...selected.map((r) => keys.map((k) => escape(r[k])).join(","))].join("\n");
              const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement("a");
              a.href = url; a.download = "leave_history_selected.csv"; a.click();
              URL.revokeObjectURL(url);
            },
          },
        ]}
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Approved", "Rejected"] },
          { title: "Leave Type", type: "toggle", key: "type",   options: LEAVE_TYPES },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View Details", variant: "ghost",
            onClick: (row) => { setHistoryView(deptReqs.find((r) => r.id === row.id)); openModal("mm-hrm-history-view"); },
          },
        ]}
      />

      {/* ── Apply Leave modal ────────────────────────────────────────────── */}
      <Modal id="mm-hrm-leave-apply" title="Apply for Leave" size="lg">
        <div className="space-y-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <SelectField label="Leave Type" value={form.leaveType}
                onChange={(e) => onChange("leaveType", e.target.value)}>
                <Option value="" label="-- Select leave type --" />
                {LEAVE_TYPES.map((t) => <Option key={t} value={t} label={t} />)}
              </SelectField>
              {errors.leaveType && <p className="text-xs text-rose-600 mt-1 px-1">{errors.leaveType}</p>}
            </div>

            <div className="col-span-5">
              <DatePicker label="Date From" id="mm-hrm-from"
                value={form.dateFrom} onChange={(v) => onChange("dateFrom", v)} />
              {errors.dateFrom && <p className="text-xs text-rose-600 mt-1 px-1">{errors.dateFrom}</p>}
            </div>

            <div className="col-span-5">
              <DatePicker label="Date To" id="mm-hrm-to"
                value={form.dateTo} minDate={form.dateFrom || undefined}
                onChange={(v) => onChange("dateTo", v)} />
              {errors.dateTo && <p className="text-xs text-rose-600 mt-1 px-1">{errors.dateTo}</p>}
            </div>

            <div className="col-span-2">
              <DataField label="Days" id="mm-hrm-days" type="text" size={12}
                value={applyDays ? `${applyDays} day${applyDays === "1" ? "" : "s"}` : ""}
                placeholder="—" disabled />
            </div>

            <div className="col-span-12">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                placeholder="Briefly describe the reason for your leave..."
                value={form.reason}
                onChange={(e) => onChange("reason", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 resize-none transition duration-200"
              />
              {errors.reason && <p className="text-xs text-rose-600 mt-1 px-1">{errors.reason}</p>}
            </div>
          </Grid>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button text="Cancel" variant="ghost"
              onClick={() => { setForm(EMPTY_FORM); setErrors({}); closeModal("mm-hrm-leave-apply"); }} />
            <Button text={submitting ? "Submitting..." : "Submit Application"}
              variant="primary" onClick={submitApply} disabled={submitting} />
          </div>
        </div>
      </Modal>

      {/* ── My Leave View modal ──────────────────────────────────────────── */}
      <Modal id="mm-hrm-myleave-view" title="My Leave Details" size="md">
        {myView && (
          <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold
              ${myView.status === "Approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : myView.status === "Rejected" ? "bg-rose-50 border-rose-200 text-rose-700"
              : myView.status === "Pending"  ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-slate-50 border-slate-200 text-slate-600"}`}>
              <span className="text-xs font-black uppercase tracking-widest">Status:</span>
              {myView.status}
            </div>
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type" value={myView.type} />
              <ModalData label="Applied On" value={myView.appliedOn} />
              <ModalData label="From Date"  value={myView.from} />
              <ModalData label="To Date"    value={myView.to} />
              <ModalData label="Total Days" value={`${myView.days} day${myView.days === "1" ? "" : "s"}`} />
              <ModalData label="Status"     value={myView.status} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={myView.reason} />
            </ModalGrid>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {myView.status === "Pending" && (
                <Button text="Cancel Application" variant="danger" size={4}
                  onClick={() => { cancelMyLeave(myView); closeModal("mm-hrm-myleave-view"); }} />
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mm-hrm-myleave-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Pending Leave View modal (with Approve / Reject) ─────────────── */}
      <Modal id="mm-hrm-pending-view" title="Leave Request Details" size="md">
        {pendingView && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={pendingView.name}
              subtitle={`${pendingView.role} · ${pendingView.type}`}
              meta={`Applied: ${pendingView.appliedOn}`}
            />
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type" value={pendingView.type} />
              <ModalData label="From Date"  value={pendingView.from} />
              <ModalData label="To Date"    value={pendingView.to} />
              <ModalData label="Total Days" value={pendingView.days} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={pendingView.reason} />
            </ModalGrid>
            {pendingView.status === "Pending" && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Button text="Approve" variant="primary" size={6}
                  onClick={() => { setDeptStatus(pendingView, "Approved"); closeModal("mm-hrm-pending-view"); }} />
                <Button text="Reject" variant="danger" size={6}
                  onClick={() => { setDeptStatus(pendingView, "Rejected"); closeModal("mm-hrm-pending-view"); }} />
              </div>
            )}
            <div className="flex justify-end">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mm-hrm-pending-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Leave History View modal (read-only) ─────────────────────────── */}
      <Modal id="mm-hrm-history-view" title="Leave Record" size="md">
        {historyView && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={historyView.name}
              subtitle={`${historyView.role} · ${historyView.status}`}
              meta={`Applied: ${historyView.appliedOn}`}
            />
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type"  value={historyView.type} />
              <ModalData label="From Date"   value={historyView.from} />
              <ModalData label="To Date"     value={historyView.to} />
              <ModalData label="Total Days"  value={historyView.days} />
              <ModalData label="Status"      value={historyView.status} />
              <ModalData label="Actioned On" value={historyView.actionOn || "—"} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={historyView.reason} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="primary" size={3} onClick={() => closeModal("mm-hrm-history-view")} />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
