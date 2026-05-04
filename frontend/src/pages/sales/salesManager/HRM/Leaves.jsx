import { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, ModalGrid, Button,
  DataField, SelectField, Option, Grid,
} from "../../../../components/shared/Common_Components";
import DatePicker from "../../../../components/shared/DatePicker";
import { kpiLeaves, pendingLeaveRows, leaveHistoryRows } from "./HrmStore";
import { Calendar, CheckCircle, Clock, XCircle, Eye, BadgeCheck, Ban, Trash2, Download, Plus } from "lucide-react";

const KPI_ICONS   = [<Calendar size={22} />, <CheckCircle size={22} />, <Clock size={22} />, <XCircle size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

// Columns for My Leaves table
const MY_LEAVES_COLS = [
  { key: "type",      label: "Leave Type"  },
  { key: "reason",      label: "Reason"  },
  { key: "dateRange", label: "Date Range"  },
  { key: "days",      label: "Days"        },
  { key: "appliedOn", label: "Applied On"  },
  { key: "status",    label: "Status"      },
];

// Seed data — sales manager's own past leaves
const MY_LEAVES_SEED = [
  { id: "ML001", type: "Sick Leave",    from: "2026-04-10", to: "2026-04-11", days: "2", appliedOn: "2026-04-09", reason: "Fever and body ache",              status: "Accepted"    },
  { id: "ML002", type: "Casual Leave",  from: "2026-04-22", to: "2026-04-22", days: "1", appliedOn: "2026-04-20", reason: "Personal errand",                  status: "Rejected"    },
  { id: "ML003", type: "Earned Leave",  from: "2026-05-01", to: "2026-05-03", days: "3", appliedOn: "2026-04-28", reason: "Family trip planned in advance",    status: "Accepted"    },
  { id: "ML004", type: "Casual Leave",  from: "2026-05-15", to: "2026-05-15", days: "1", appliedOn: "2026-05-13", reason: "Home maintenance work",             status: "Not Respond" },
  { id: "ML005", type: "Sick Leave",    from: "2026-05-28", to: "2026-05-29", days: "2", appliedOn: "2026-05-27", reason: "Viral infection — doctor advised rest", status: "Pending" },
].map((r) => ({ ...r, dateRange: `${r.from} to ${r.to}` }));
const PENDING_COLS = [
  { key: "name",      label: "Employee" },
  { key: "role",      label: "Role" },
  { key: "type",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "appliedOn", label: "Applied On" },
];

// Columns for Leave History table
const HISTORY_COLS = [
  { key: "name",      label: "Employee" },
  { key: "role",      label: "Role" },
  { key: "type",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "actionOn",  label: "Actioned On" },
  { key: "status",    label: "Status" },
];

export default function Leaves() {
  const [pending, setPending] = useState(
    pendingLeaveRows.map((r) => ({ ...r, dateRange: `${r.from} to ${r.to}` }))
  );
  const [history, setHistory] = useState(
    leaveHistoryRows.map((r) => ({ ...r, dateRange: `${r.from} to ${r.to}` }))
  );

  // My Leaves
  const [myLeaves,     setMyLeaves]     = useState(MY_LEAVES_SEED);
  const [myLeaveView,  setMyLeaveView]  = useState(null);

  // Separate selected state for each modal
  const [pendingSelected, setPendingSelected] = useState(null);
  const [historySelected, setHistorySelected] = useState(null);

  // ── Apply Leave form state ──
  const LEAVE_TYPES = [
    "Sick Leave",
    "Casual Leave",
    "Earned Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Bereavement Leave",
    "Unpaid Leave",
    "Other",
  ];
  const [applyForm, setApplyForm] = useState({
    leaveType: "",
    reason: "",
    dateFrom: "",
    dateTo: "",
  });
  const [applyError, setApplyError] = useState({});

  const calcDays = (from, to) => {
    if (!from || !to) return "";
    const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
    return diff < 0 ? "" : String(diff + 1);
  };

  const applyDays = calcDays(applyForm.dateFrom, applyForm.dateTo);

  const handleApplyChange = (field, value) => {
    setApplyForm((prev) => ({ ...prev, [field]: value }));
    if (applyError[field]) setApplyError((e) => ({ ...e, [field]: "" }));
  };

  const handleApplySubmit = () => {
    const errs = {};
    if (!applyForm.leaveType) errs.leaveType = "Please select a leave type.";
    if (!applyForm.reason.trim()) errs.reason = "Reason is required.";
    if (!applyForm.dateFrom) errs.dateFrom = "Start date is required.";
    if (!applyForm.dateTo)   errs.dateTo   = "End date is required.";
    if (applyForm.dateFrom && applyForm.dateTo && applyForm.dateTo < applyForm.dateFrom)
      errs.dateTo = "End date must be on or after start date.";
    if (Object.keys(errs).length) { setApplyError(errs); return; }

    // Add to pending list
    const today = new Date().toISOString().split("T")[0];
    const newId = `ML${Date.now()}`;
    const newLeave = {
      id: newId,
      name: "You (Sales Manager)",
      role: "Sales Manager",
      teamLeader: "—",
      type: applyForm.leaveType,
      reason: applyForm.reason,
      from: applyForm.dateFrom,
      to: applyForm.dateTo,
      days: applyDays,
      dateRange: `${applyForm.dateFrom} to ${applyForm.dateTo}`,
      appliedOn: today,
      status: "Pending",
    };
    setPending((prev) => [newLeave, ...prev]);

    // Also add to My Leaves
    setMyLeaves((prev) => [newLeave, ...prev]);

    // Reset form and close
    setApplyForm({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
    setApplyError({});
    closeModal("apply-leave-modal");
  };

  const changeStatus = (row, newStatus) => {
    const today = new Date().toISOString().split("T")[0];

    // Remove from pending
    setPending((prev) => prev.filter((r) => r.id !== row.id));

    // Add/update in history
    setHistory((prev) => {
      const exists = prev.find((r) => r.id === row.id);
      const updated = { ...row, status: newStatus, actionOn: today, dateRange: row.dateRange ?? `${row.from} to ${row.to}` };
      if (exists) return prev.map((r) => r.id === row.id ? updated : r);
      return [updated, ...prev];
    });

    // Keep pending modal in sync if open
    setPendingSelected((s) => s && s.id === row.id ? { ...s, status: newStatus, actionOn: today } : s);
  };

  // Pending table: View + Accept + Reject
  const pendingActions = [
    {
      icon: <Eye size={15} />,
      tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => {
        setPendingSelected(pending.find((r) => r.id === row.id) ?? row);
        openModal("leave-pending-modal");
      },
    },
    {
      icon: <BadgeCheck size={15} />,
      tooltip: "Accept",
      variant: "primary",
      onClick: (row) => changeStatus(row, "Accepted"),
    },
    {
      icon: <Ban size={15} />,
      tooltip: "Reject",
      variant: "danger",
      onClick: (row) => changeStatus(row, "Rejected"),
    },
  ];

  // History table: View + Delete only
  const historyActions = [
    {
      icon: <Eye size={15} />,
      tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => {
        setHistorySelected(history.find((r) => r.id === row.id) ?? row);
        openModal("leave-history-modal");
      },
    },
    {
      icon: <Trash2 size={15} />,
      tooltip: "Delete",
      variant: "danger",
      onClick: (row) => setHistory((prev) => prev.filter((r) => r.id !== row.id)),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Leaves" size={12} />
        {kpiLeaves.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      {/* Apply Leave button */}
      <div className="flex justify-end">
        <Button
          text="+ &nbsp; Apply Leave"
          onClick={() => openModal("apply-leave-modal")}
        />
      </div>

      {/* ── My Leaves ──────────────────────────────────────────────────────── */}
      <DataTable
        title="My Leaves"
        columns={MY_LEAVES_COLS}
        rows={myLeaves}
        ellipse={4}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => {
              setMyLeaveView(myLeaves.find((r) => r.id === row.id) ?? row);
              openModal("my-leave-view-modal");
            },
          },
          {
            icon: <Trash2 size={15} />,
            tooltip: "Cancel / Delete",
            variant: "danger",
            onClick: (row) => setMyLeaves((prev) => prev.filter((r) => r.id !== row.id)),
          },
        ]}
        size={12}
        pageSize={5}
        searchable
        exportable
        exportFileName="my-leaves"
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Pending", "Accepted", "Rejected", "Not Respond"] },
          { title: "Leave Type", type: "toggle", key: "type",   options: ["Sick Leave", "Casual Leave", "Earned Leave", "Maternity Leave", "Paternity Leave", "Bereavement Leave", "Unpaid Leave", "Other"] },
        ]}
      />

      {/* ── Pending Leaves ─────────────────────────────────────────────────── */}
      <DataTable
        title="Pending Leaves"
        columns={PENDING_COLS}
        rows={pending}
        actions={pendingActions}
        ellipse={3}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="pending-leaves"
        filters={[
          { title: "Leave Type", type: "toggle", key: "type",       options: ["Sick Leave", "Casual Leave", "Earned Leave"] },
          { title: "Team Leader", type: "select", key: "teamLeader", options: [...new Set(pendingLeaveRows.map((r) => r.teamLeader))] },
          { title: "Role",        type: "toggle", key: "role",       options: ["Executive", "Team Leader"] },
        ]}
      />

      {/* ── Leave History ───────────────────────────────────────────────────── */}
      <DataTable
        title="Leave History"
        columns={HISTORY_COLS}
        rows={history}
        actions={historyActions}
        bulkAction
        bulkActions={[
          {
            title: "Delete Selected",
            icon: <Trash2 size={14} />,
            onClick: (selected) => {
              const ids = new Set(selected.map((r) => r.id));
              setHistory((prev) => prev.filter((r) => !ids.has(r.id)));
            },
          },
          {
            title: "Export Selected",
            icon: <Download size={14} />,
            onClick: (selected) => {
              if (!selected.length) return;
              const keys    = Object.keys(selected[0]);
              const header  = keys.join(",");
              const escape  = (v) => { const s = v == null ? "" : String(v); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
              const csvRows = selected.map((r) => keys.map((k) => escape(r[k])).join(","));
              const blob    = new Blob(["\uFEFF" + [header, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
              const url     = URL.createObjectURL(blob);
              const a       = document.createElement("a");
              a.href = url; a.download = "leave-history-selected.csv"; a.click();
              URL.revokeObjectURL(url);
            },
          },
        ]}
        ellipse={3}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="leave-history"
        filters={[
          { title: "Status",      type: "toggle", key: "status",     options: ["Accepted", "Rejected", "Not Respond"] },
          { title: "Leave Type",  type: "toggle", key: "type",       options: ["Sick Leave", "Casual Leave", "Earned Leave"] },
          { title: "Team Leader", type: "select", key: "teamLeader", options: [...new Set(leaveHistoryRows.map((r) => r.teamLeader))] },
          { title: "Role",        type: "toggle", key: "role",       options: ["Executive", "Team Leader"] },
        ]}
      />

      {/* ── My Leave View Modal ─────────────────────────────────────────────── */}
      <Modal id="my-leave-view-modal" title="My Leave Details" size="md">
        {myLeaveView && (
          <div className="flex flex-col gap-4">
            {/* Status banner */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold ${
              myLeaveView.status === "Accepted"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : myLeaveView.status === "Rejected"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : myLeaveView.status === "Pending"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-slate-50 border-slate-200 text-slate-600"
            }`}>
              <span className="text-xs font-black uppercase tracking-widest">Status:</span>
              {myLeaveView.status}
            </div>

            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type"  value={myLeaveView.type} />
              <ModalData label="Applied On"  value={myLeaveView.appliedOn} />
              <ModalData label="From Date"   value={myLeaveView.from} />
              <ModalData label="To Date"     value={myLeaveView.to} />
              <ModalData label="Total Days"  value={`${myLeaveView.days} day${myLeaveView.days === "1" ? "" : "s"}`} />
              <ModalData label="Status"      value={myLeaveView.status} />
            </ModalGrid>

            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={myLeaveView.reason} />
            </ModalGrid>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              {myLeaveView.status === "Pending" && (
                <button
                  onClick={() => {
                    setMyLeaves((prev) => prev.filter((r) => r.id !== myLeaveView.id));
                    closeModal("my-leave-view-modal");
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition active:scale-95"
                >
                  Cancel Application
                </button>
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("my-leave-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Apply Leave Modal ───────────────────────────────────────────────── */}
      <Modal id="apply-leave-modal" title="Apply for Leave" size="lg">
        <div className="space-y-5">
          <Grid cols={12} gap={4}>

            {/* Leave Type */}
            <div className="col-span-12">
              <SelectField
                label="Leave Type"
                id="apply-leave-type"
                size={12}
                placeholder="Select leave type..."
                value={applyForm.leaveType}
                onChange={(e) => handleApplyChange("leaveType", e.target.value)}
              >
                {LEAVE_TYPES.map((t) => (
                  <Option key={t} value={t} label={t} />
                ))}
              </SelectField>
              {applyError.leaveType && (
                <p className="text-xs text-rose-600 mt-1 px-1">{applyError.leaveType}</p>
              )}
            </div>

            {/* Date From */}
            <div className="col-span-5">
              <DatePicker
                label="Date From"
                id="apply-date-from"
                value={applyForm.dateFrom}
                onChange={(v) => handleApplyChange("dateFrom", v)}
              />
              {applyError.dateFrom && (
                <p className="text-xs text-rose-600 mt-1 px-1">{applyError.dateFrom}</p>
              )}
            </div>

            {/* Date To */}
            <div className="col-span-5">
              <DatePicker
                label="Date To"
                id="apply-date-to"
                value={applyForm.dateTo}
                minDate={applyForm.dateFrom || undefined}
                onChange={(v) => handleApplyChange("dateTo", v)}
              />
              {applyError.dateTo && (
                <p className="text-xs text-rose-600 mt-1 px-1">{applyError.dateTo}</p>
              )}
            </div>

            {/* Days — auto-calculated, disabled */}
            <div className="col-span-2">
              <DataField
                label="Days"
                id="apply-days"
                type="text"
                size={12}
                value={applyDays ? `${applyDays} day${applyDays === "1" ? "" : "s"}` : ""}
                placeholder="# Days"
                disabled
              />
            </div>

            {/* Reason */}
            <div className="col-span-12">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                placeholder="Briefly describe the reason for your leave..."
                value={applyForm.reason}
                onChange={(e) => handleApplyChange("reason", e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 resize-none transition duration-200"
              />
              {applyError.reason && (
                <p className="text-xs text-rose-600 mt-1 px-1">{applyError.reason}</p>
              )}
            </div>

          </Grid>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              text="Cancel"
              variant="ghost"
              onClick={() => {
                setApplyForm({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
                setApplyError({});
                closeModal("apply-leave-modal");
              }}
            />
            <Button
              text="Submit Application"
              onClick={handleApplySubmit}
            />
          </div>
        </div>
      </Modal>

      {/* ── Pending Leave View Modal (with Accept / Reject) ─────────────────── */}
      <Modal id="leave-pending-modal" title="Leave Request Details" size="md">
        {pendingSelected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={pendingSelected.name}
              subtitle={`${pendingSelected.role} · ${pendingSelected.teamLeader}`}
              meta={`Applied: ${pendingSelected.appliedOn}`}
            />
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type"  value={pendingSelected.type} />
              <ModalData label="From Date"   value={pendingSelected.from} />
              <ModalData label="To Date"     value={pendingSelected.to} />
              <ModalData label="Total Days"  value={pendingSelected.days} />
              <ModalData label="Team Leader" value={pendingSelected.teamLeader} />
              <ModalData label="Role"        value={pendingSelected.role} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={pendingSelected.reason} />
            </ModalGrid>

            {/* Accept / Reject buttons — only when still Pending */}
            {pendingSelected.status === "Pending" && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Button
                  text="Accept"
                  variant="primary"
                  size={6}
                  onClick={() => {
                    changeStatus(pendingSelected, "Accepted");
                    closeModal("leave-pending-modal");
                  }}
                />
                <Button
                  text="Reject"
                  variant="danger"
                  size={6}
                  onClick={() => {
                    changeStatus(pendingSelected, "Rejected");
                    closeModal("leave-pending-modal");
                  }}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("leave-pending-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Leave History View Modal (read-only) ────────────────────────────── */}
      <Modal id="leave-history-modal" title="Leave Record Details" size="md">
        {historySelected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={historySelected.name}
              subtitle={`${historySelected.role} · ${historySelected.teamLeader}`}
              meta={`Applied: ${historySelected.appliedOn}`}
            />
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type"          value={historySelected.type} />
              <ModalData label="From Date"           value={historySelected.from} />
              <ModalData label="To Date"             value={historySelected.to} />
              <ModalData label="Total Days"          value={historySelected.days} />
              <ModalData label="Status"              value={historySelected.status} />
              <ModalData label="Accepted/Rejected On" value={historySelected.actionOn || "—"} />
              <ModalData label="Team Leader"         value={historySelected.teamLeader} />
              <ModalData label="Role"                value={historySelected.role} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={historySelected.reason} />
            </ModalGrid>
            <div className="flex justify-end">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("leave-history-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
