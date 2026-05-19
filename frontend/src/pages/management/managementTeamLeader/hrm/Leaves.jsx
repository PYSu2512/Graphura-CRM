import { useState, useMemo } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Grid,
  GColumnChart, GPieChart,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  DataField, SelectField, Option,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import DatePicker from "../../../../components/shared/DatePicker";
import {
  Calendar, CheckCircle, Clock, XCircle,
  Eye, Trash2, AlertCircle, BadgeCheck, Ban,
} from "lucide-react";
import {
  kpiLeaves, myLeavesSeed, teamLeaveRequests, LEAVE_TYPES,
  monthlyLeaveTrend, leaveTypeDistribution,
} from "./hrmStore";

const KPI_ICONS   = [<Calendar size={20} />, <CheckCircle size={20} />, <Clock size={20} />, <XCircle size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

// ── Column definitions ────────────────────────────────────────────────────────
const MY_COLS = [
  { key: "type",      label: "Leave Type", width: "16%" },
  { key: "reason",    label: "Reason",     width: "36%" },
  { key: "dateRange", label: "Date Range", width: "20%", align: "center" },
  { key: "days",      label: "Days",       width: "10%", align: "center" },
  { key: "appliedOn", label: "Applied On", width: "10%", align: "center" },
  { key: "status",    label: "Status",     width: "8%", align: "center" },
];

const PENDING_COLS = [
  { key: "name",      label: "Employee Name", width: "16%" },
  { key: "role",      label: "Role",          width: "12%" },
  { key: "type",      label: "Leave Type",    width: "14%" },
  { key: "reason",    label: "Reason",        width: "28%" },
  { key: "dateRange", label: "Date Range",    width: "14%", align: "center" },
  { key: "days",      label: "Days",          width: "6%",  align: "center" },
  { key: "appliedOn", label: "Applied On",    width: "10%", align: "center" },
];

const HISTORY_COLS = [
  { key: "name",      label: "Employee Name", width: "16%" },
  { key: "role",      label: "Role",          width: "12%" },
  { key: "type",      label: "Leave Type",    width: "14%" },
  { key: "reason",    label: "Reason",        width: "28%" },
  { key: "dateRange", label: "Date Range",    width: "14%", align: "center" },
  { key: "appliedOn", label: "Applied On",    width: "10%", align: "center" },
  { key: "status",    label: "Leave Status",  width: "6%",  align: "center" },
];

const calcDays = (from, to) => {
  if (!from || !to) return "";
  const diff = (new Date(to) - new Date(from)) / 86400000;
  return diff < 0 ? "" : String(diff + 1);
};

const today = () => new Date().toISOString().split("T")[0];

export default function Leaves() {
  const [myLeaves,    setMyLeaves]    = useState(myLeavesSeed);
  const [myView,      setMyView]      = useState(null);
  const [teamReqs,    setTeamReqs]    = useState(teamLeaveRequests);
  const [pendingView, setPendingView] = useState(null);
  const [historyView, setHistoryView] = useState(null);

  const EMPTY = { leaveType: "", reason: "", dateFrom: "", dateTo: "" };
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const applyDays = calcDays(form.dateFrom, form.dateTo);



  const onChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const pendingRows = useMemo(() => teamReqs.filter((r) => r.status === "Pending"),  [teamReqs]);
  const historyRows = useMemo(() => teamReqs.filter((r) => r.status !== "Pending"),  [teamReqs]);

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
    const newLeave = {
      id:        `ML-${Date.now()}`,
      type:      form.leaveType,
      reason:    form.reason.trim(),
      from:      form.dateFrom,
      to:        form.dateTo,
      days:      applyDays,
      dateRange: `${form.dateFrom} to ${form.dateTo}`,
      appliedOn: today(),
      status:    "Pending",
    };
    setMyLeaves((prev) => [newLeave, ...prev]);
    setForm(EMPTY);
    setErrors({});
    closeModal("mtl-hrm-leave-apply");
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* ── KPI cards ──────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        {kpiLeaves.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={KPI_ACCENTS[i]}
            size={3}
          />
        ))}
      </DashGrid>

      {/* ── Charts row ───────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <GColumnChart
          title="Monthly Leave Trend"
          subtitle="Approved vs Rejected vs Pending — last 5 months"
          data={monthlyLeaveTrend.map(d => ({ ...d, name: d.month }))}
          bars={[
            { key: "approved", label: "Approved", color: "#22c55e" },
            { key: "rejected", label: "Rejected", color: "#f43f5e" },
            { key: "pending",  label: "Pending",  color: "#f59e0b" },
          ]}
          size={8}
          height={320}
        />
        <GPieChart
          title="Leave Type Breakdown"
          subtitle="Distribution by leave category"
          data={leaveTypeDistribution}
          colors={["#f43f5e", "#3b82f6", "#22c55e", "#94a3b8"]}
          size={4}
          height={320}
        />
      </Grid>

      {/* ── Pending alert banner (shown when there are pending requests) ─── */}
      {pendingRows.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-50 border border-amber-200">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-700">
            <span className="font-black">{pendingRows.length}</span> leave request{pendingRows.length > 1 ? "s" : ""} awaiting your approval.
          </p>
          <Button
            text="Review Now"
            variant="secondary"
            onClick={() => document.getElementById("mtl-pending-section")?.scrollIntoView({ behavior: "smooth" })}
          />
        </div>
      )}

      {/* ── Apply Leave button ───────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button text="+  Apply Leave" variant="primary" onClick={() => openModal("mtl-hrm-leave-apply")} />
      </div>

      {/* ── My Leaves ──────────────────────────────────────────────────────── */}
      <DataTable
        title="My Leaves"
        columns={MY_COLS}
        rows={myLeaves}
        ellipse={4}
        size={12}
        pageSize={5}
        searchable
        filters={[
          { title: "Leave Status", type: "toggle", key: "status", options: ["Pending", "Approved", "Rejected"] },
          { title: "Leave Type",   type: "toggle", key: "type",   options: LEAVE_TYPES },
        ]}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
            onClick: (row) => {
              setMyView(myLeaves.find((l) => l.id === row.id) ?? row);
              openModal("mtl-hrm-myleave-view");
            },
          },
          {
            icon: <Trash2 size={15} />,
            tooltip: "Cancel",
            variant: "danger",
            show: (row) => row.status === "Pending",
            onClick: (row) => setMyLeaves((prev) => prev.filter((l) => l.id !== row.id)),
          },
        ]}
      />

      {/* ── Pending Leaves ─────────────────────────────────────────────────── */}
      <div id="mtl-pending-section">
        <DataTable
          title="Pending Leaves"
          columns={PENDING_COLS}
          rows={pendingRows}
          userProfile="name"
          ellipse={3}
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="pending_leaves"
          filters={[
            { title: "Leave Type", type: "toggle", key: "type", options: LEAVE_TYPES },
          ]}
          actions={[
            {
              icon: <Eye size={15} />,
              tooltip: "View",
              variant: "ghost",
              onClick: (row) => {
                setPendingView(teamReqs.find((r) => r.id === row.id) ?? row);
                openModal("mtl-hrm-pending-view");
              },
            },
            {
              icon: <BadgeCheck size={15} />,
              tooltip: "Accept",
              variant: "primary",
              onClick: (row) => setMemberStatus(row, "Approved"),
            },
            {
              icon: <Ban size={15} />,
              tooltip: "Reject",
              variant: "danger",
              onClick: (row) => setMemberStatus(row, "Rejected"),
            },
          ]}
        />
      </div>

      {/* ── Leave History ──────────────────────────────────────────────────── */}
      <div>
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
          exportFileName="leave_history"
          filters={[
            { title: "Leave Status", type: "toggle", key: "status", options: ["Approved", "Rejected"] },
            { title: "Leave Type", type: "toggle", key: "type", options: LEAVE_TYPES },
          ]}
          actions={[
            {
              icon: <Eye size={15} />,
              tooltip: "View Details",
              variant: "ghost",
              onClick: (row) => {
                setHistoryView(teamReqs.find((r) => r.id === row.id) ?? row);
                openModal("mtl-hrm-history-view");
              },
            },
          ]}
        />
      </div>

      {/* ── Apply Leave Modal ───────────────────────────────────────────────── */}
      <Modal id="mtl-hrm-leave-apply" title="Apply for Leave" size="lg">
        <div className="space-y-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <SelectField label="Leave Type" id="mtl-leave-type" size={12}
                placeholder="Select leave type..." value={form.leaveType}
                onChange={(e) => onChange("leaveType", e.target.value)}>
                <Option value="" label="-- Select leave type --" />
                {LEAVE_TYPES.map((t) => <Option key={t} value={t} label={t} />)}
              </SelectField>
              {errors.leaveType && <p className="text-xs text-rose-600 mt-1 px-1">{errors.leaveType}</p>}
            </div>
            <div className="col-span-5">
              <DatePicker label="Date From" id="mtl-from"
                value={form.dateFrom} onChange={(v) => onChange("dateFrom", v)} />
              {errors.dateFrom && <p className="text-xs text-rose-600 mt-1 px-1">{errors.dateFrom}</p>}
            </div>
            <div className="col-span-5">
              <DatePicker label="Date To" id="mtl-to"
                value={form.dateTo} minDate={form.dateFrom || undefined}
                onChange={(v) => onChange("dateTo", v)} />
              {errors.dateTo && <p className="text-xs text-rose-600 mt-1 px-1">{errors.dateTo}</p>}
            </div>
            <div className="col-span-2">
              <DataField label="Days" id="mtl-days" type="text" size={12}
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
              onClick={() => { setForm(EMPTY); setErrors({}); closeModal("mtl-hrm-leave-apply"); }} />
            <Button text="Submit Application" variant="primary" onClick={submitApply} />
          </div>
        </div>
      </Modal>

      {/* ── My Leave View Modal ─────────────────────────────────────────────── */}
      <Modal id="mtl-hrm-myleave-view" title="My Leave Details" size="md">
        {myView && (
          <div className="flex flex-col gap-4">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold ${
              myView.status === "Approved" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : myView.status === "Rejected" ? "bg-rose-50 border-rose-200 text-rose-700"
            : myView.status === "Pending"  ? "bg-amber-50 border-amber-200 text-amber-700"
            :                                "bg-slate-50 border-slate-200 text-slate-600"
            }`}>
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
                <button
                  onClick={() => {
                    setMyLeaves((prev) => prev.filter((l) => l.id !== myView.id));
                    closeModal("mtl-hrm-myleave-view");
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition active:scale-95"
                >
                  Cancel Application
                </button>
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mtl-hrm-myleave-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Pending Leave View Modal (Approve / Reject) ─────────────────────── */}
      <Modal id="mtl-hrm-pending-view" title="Leave Request Details" size="md">
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
              <ModalData label="Total Days" value={`${pendingView.days} day${pendingView.days === "1" ? "" : "s"}`} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={pendingView.reason} />
            </ModalGrid>
            <div className="flex justify-end">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mtl-hrm-pending-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Leave History View Modal ────────────────────────────────────────── */}
      <Modal id="mtl-hrm-history-view" title="Leave Record" size="md">
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
              <ModalData label="Total Days"  value={`${historyView.days} day${historyView.days === "1" ? "" : "s"}`} />
              <ModalData label="Status"      value={historyView.status} />
              <ModalData label="Actioned On" value={historyView.actionOn || "—"} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={historyView.reason} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mtl-hrm-history-view")} />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}