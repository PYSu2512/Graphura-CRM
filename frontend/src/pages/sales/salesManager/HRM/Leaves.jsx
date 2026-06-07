import { useState, useEffect } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, ModalGrid, Button,
  DataField, SelectField, Option, Grid,
} from "../../../../components/shared/Common_Components";
import DatePicker from "../../../../components/shared/DatePicker";
import { Calendar, CheckCircle, Clock, XCircle, Eye, BadgeCheck, Ban, Trash2, Download, Plus } from "lucide-react";
import { hrmService } from "../../../../services/hrmService";
import { toast } from "react-hot-toast";
import { useCurrentUser } from "../../../../hooks/useCurrentUser";

const KPI_ICONS   = [<Calendar size={22} />, <CheckCircle size={22} />, <Clock size={22} />, <XCircle size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];

// Columns for My Leaves table
const MY_LEAVES_COLS = [
  { key: "leaveType",      label: "Leave Type"  },
  { key: "reason",      label: "Reason"  },
  { key: "dateRange", label: "Date Range"  },
  { key: "days",      label: "Days"        },
  { key: "appliedOn", label: "Applied On", sortValue: (row) => new Date(row.raw?.createdAt || row.createdAt).getTime() },
  { key: "status",    label: "Status"      },
];

const PENDING_COLS = [
  { key: "name",      label: "Employee" },
  { key: "role",      label: "Role" },
  { key: "leaveType",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "appliedOn", label: "Applied On", sortValue: (row) => new Date(row.raw?.createdAt || row.createdAt).getTime() },
];

// Columns for Leave History table
const HISTORY_COLS = [
  { key: "name",      label: "Employee" },
  { key: "role",      label: "Role" },
  { key: "leaveType",      label: "Leave Type" },
  { key: "reason",    label: "Reason" },
  { key: "dateRange", label: "Date Range" },
  { key: "days",      label: "Days" },
  { key: "actionOn",  label: "Actioned On", sortValue: (row) => row.approvedAt ? new Date(row.approvedAt).getTime() : 0 },
  { key: "status",    label: "Status" },
];

export default function Leaves() {
  const currentUser = useCurrentUser();
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [myLeaveView,  setMyLeaveView]  = useState(null);
  const [pendingSelected, setPendingSelected] = useState(null);
  const [historySelected, setHistorySelected] = useState(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const [myRes, teamRes] = await Promise.all([
        hrmService.getMyLeaves(),
        hrmService.getTeamLeaves()
      ]);

      const formatRole = (str) => {
        if (!str) return "";
        const clean = str.replace(/^(SALES|FINANCE|MANAGEMENT)_/, '');
        if (clean === 'TL') return "Team Leader";
        return clean.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      };

      const mapLeave = (l) => {
        const LEAVE_MAP = {
          'SICK': 'Sick Leave',
          'CASUAL': 'Casual Leave',
          'EARNED': 'Earned Leave',
          'MATERNITY': 'Maternity Leave',
          'PATERNITY': 'Paternity Leave',
          'BEREAVEMENT': 'Bereavement Leave',
          'UNPAID': 'Unpaid Leave',
          'HALF_DAY': 'Half Day',
          'OTHER': 'Other',
        };

        return {
          ...l,
          id: l._id,
          name: l.user?.name || "Unknown",
          role: formatRole(l.user?.role),
          leaveType: LEAVE_MAP[l.leaveType] || l.leaveType,
          dateRange: `${new Date(l.fromDate).toLocaleDateString()} to ${new Date(l.toDate).toLocaleDateString()}`,
          appliedOn: new Date(l.createdAt).toLocaleDateString(),
          actionOn: l.approvedAt ? new Date(l.approvedAt).toLocaleDateString() : "—",
          status: l.status.charAt(0).toUpperCase() + l.status.slice(1).toLowerCase(),
          raw: l
        };
      };

      if (myRes.success) {
        setMyLeaves(myRes.data.map(mapLeave).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }

      if (teamRes.success) {
        // Exclude self from team tables (robust check)
        const currentId = String(currentUser?._id || currentUser?.id || "");
        const allTeam = teamRes.data
          .filter(l => String(l.user?._id || l.user?.id || "") !== currentId)
          .map(mapLeave)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setPending(allTeam.filter(l => l.raw.status === 'PENDING'));
        setHistory(allTeam.filter(l => l.raw.status !== 'PENDING'));
      }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      toast.error("Failed to load leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // ── Apply Leave form state ──
  const LEAVE_TYPES = [
    "Sick Leave",
    "Casual Leave",
    "Earned Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Bereavement Leave",
    "Unpaid Leave",
    "Half Day",
    "Other",
  ];
  const [applyForm, setApplyForm] = useState({
    leaveType: "",
    reason: "",
    dateFrom: "",
    dateTo: "",
  });
  const [applyError, setApplyError] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const calcDays = (from, to) => {
    if (!from || !to) return 0;
    const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
    return diff < 0 ? 0 : diff + 1;
  };

  const applyDays = calcDays(applyForm.dateFrom, applyForm.dateTo);

  const handleApplyChange = (field, value) => {
    setApplyForm((prev) => ({ ...prev, [field]: value }));
    if (applyError[field]) setApplyError((e) => ({ ...e, [field]: "" }));
  };

  const handleApplySubmit = async () => {
    const errs = {};
    if (!applyForm.leaveType) errs.leaveType = "Please select a leave type.";
    if (!applyForm.reason.trim()) errs.reason = "Reason is required.";
    if (!applyForm.dateFrom) errs.dateFrom = "Start date is required.";
    if (!applyForm.dateTo)   errs.dateTo   = "End date is required.";
    if (applyForm.dateFrom && applyForm.dateTo && applyForm.dateTo < applyForm.dateFrom)
      errs.dateTo = "End date must be on or after start date.";
    if (Object.keys(errs).length) { setApplyError(errs); return; }

    setSubmitting(true);
    try {
      const res = await hrmService.applyLeave({
        leaveType: applyForm.leaveType,
        fromDate: applyForm.dateFrom,
        toDate: applyForm.dateTo,
        reason: applyForm.reason,
        days: applyDays
      });

      if (res.success) {
        toast.success("Leave applied successfully.");
        fetchLeaves();
        setApplyForm({ leaveType: "", reason: "", dateFrom: "", dateTo: "" });
        setApplyError({});
        closeModal("apply-leave-modal");
      }
    } catch (err) {
      toast.error(err.message || "Failed to apply leave.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (row, newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus.toLowerCase()} this leave request?`)) return;
    try {
      const res = await hrmService.updateLeaveStatus(row.id, newStatus.toUpperCase());
      if (res.success) {
        toast.success(`Leave ${newStatus.toLowerCase()}ed.`);
        fetchLeaves();
        closeModal("leave-pending-modal");
      }
    } catch (err) {
      toast.error(err.message || "Action failed.");
    }
  };

  const handleDeleteLeave = async (row) => {
    if (!window.confirm("Are you sure you want to cancel this leave application?")) return;
    try {
      const res = await hrmService.deleteLeave(row.id);
      if (res.success) {
        toast.success("Leave canceled.");
        fetchLeaves();
        closeModal("my-leave-view-modal");
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel leave.");
    }
  };

  // Pending table: View + Accept + Reject
  const pendingActions = [
    {
      icon: <Eye size={15} />,
      tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => {
        setPendingSelected(row);
        openModal("leave-pending-modal");
      },
    },
    {
      icon: <BadgeCheck size={15} />,
      tooltip: "Accept",
      variant: "primary",
      onClick: (row) => handleUpdateStatus(row, "Approved"),
    },
    {
      icon: <Ban size={15} />,
      tooltip: "Reject",
      variant: "danger",
      onClick: (row) => handleUpdateStatus(row, "Rejected"),
    },
  ];

  // History table: View only
  const historyActions = [
    {
      icon: <Eye size={15} />,
      tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => {
        setHistorySelected(row);
        openModal("leave-history-modal");
      },
    }
  ];

  const totalApplied = myLeaves.length;
  const approved = myLeaves.filter(l => l.raw.status === 'APPROVED').length;
  const pendingCount = myLeaves.filter(l => l.raw.status === 'PENDING').length;
  const rejected = myLeaves.filter(l => l.raw.status === 'REJECTED').length;

  const kpis = [
    { title: "Total Applied", value: String(totalApplied) },
    { title: "Approved",      value: String(approved) },
    { title: "Pending",       value: String(pendingCount) },
    { title: "Rejected",      value: String(rejected) },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI cards */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Leaves" size={12} />
        {kpis.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
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
        loading={loading}
        ellipse={4}
        defaultSortKey="appliedOn"
        defaultSortDir="desc"
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => {
              setMyLeaveView(row);
              openModal("my-leave-view-modal");
            },
          },
          {
            icon: <Trash2 size={15} />,
            tooltip: "Cancel / Delete",
            variant: "danger",
            disabled: (row) => row.raw.status !== 'PENDING',
            onClick: handleDeleteLeave,
          },
        ]}
        size={12}
        pageSize={5}
        searchable
        exportable
        exportFileName="my-leaves"
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Pending", "Approved", "Rejected"] },
          { title: "Leave Type", type: "toggle", key: "leaveType",   options: LEAVE_TYPES },
        ]}
      />

      {/* ── Pending Leaves ─────────────────────────────────────────────────── */}
      <DataTable
        title="Pending Leaves"
        userProfile="name"
        columns={PENDING_COLS}
        rows={pending}
        loading={loading}
        defaultSortKey="appliedOn"
        defaultSortDir="desc"
        actions={pendingActions}
        ellipse={3}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="pending-leaves"
        filters={[
          { title: "Leave Type", type: "toggle", key: "leaveType",       options: LEAVE_TYPES },
          { title: "Role",        type: "toggle", key: "role",       options: [...new Set(pending.map(l => l.role))] },
        ]}
      />

      {/* ── Leave History ───────────────────────────────────────────────────── */}
      <DataTable
        title="Leave History"
        userProfile={"name"}
        columns={HISTORY_COLS}
        rows={history}
        loading={loading}
        defaultSortKey="actionOn"
        defaultSortDir="desc"
        actions={historyActions}
        ellipse={3}
        size={12}
        pageSize={10}
        exportable
        exportFileName="leave-history"
        filters={[
          { title: "Status",      type: "toggle", key: "status",     options: ["Approved", "Rejected"] },
          { title: "Leave Type",  type: "toggle", key: "leaveType",       options: LEAVE_TYPES },
          { title: "Role",        type: "toggle", key: "role",       options: [...new Set(history.map(l => l.role))] },
        ]}
      />

      {/* ── My Leave View Modal ─────────────────────────────────────────────── */}
      <Modal id="my-leave-view-modal" title="My Leave Details" size="md">
        {myLeaveView && (
          <div className="flex flex-col gap-4">
            {/* Status banner */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold ${
              myLeaveView.raw.status === "APPROVED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : myLeaveView.raw.status === "REJECTED"
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : myLeaveView.raw.status === "PENDING"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-slate-50 border-slate-200 text-slate-600"
            }`}>
              <span className="text-xs font-black uppercase tracking-widest">Status:</span>
              {myLeaveView.status}
            </div>

            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type"  value={myLeaveView.leaveType} />
              <ModalData label="Applied On"  value={myLeaveView.appliedOn} />
              <ModalData label="From Date"   value={new Date(myLeaveView.raw.fromDate).toLocaleDateString()} />
              <ModalData label="To Date"     value={new Date(myLeaveView.raw.toDate).toLocaleDateString()} />
              <ModalData label="Total Days"  value={`${myLeaveView.days} day${myLeaveView.days === 1 ? "" : "s"}`} />
              <ModalData label="Status"      value={myLeaveView.status} />
            </ModalGrid>

            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={myLeaveView.reason} />
            </ModalGrid>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              {myLeaveView.raw.status === "PENDING" && (
                <button
                  onClick={() => handleDeleteLeave(myLeaveView)}
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
                value={applyDays ? `${applyDays} day${applyDays === 1 ? "" : "s"}` : ""}
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
              loading={submitting}
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
              subtitle={`${pendingSelected.role}`}
              meta={`Applied: ${pendingSelected.appliedOn}`}
            />
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type"  value={pendingSelected.leaveType} />
              <ModalData label="From Date"   value={new Date(pendingSelected.raw.fromDate).toLocaleDateString()} />
              <ModalData label="To Date"     value={new Date(pendingSelected.raw.toDate).toLocaleDateString()} />
              <ModalData label="Total Days"  value={pendingSelected.days} />
              <ModalData label="Role"        value={pendingSelected.role} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={pendingSelected.reason} />
            </ModalGrid>

            {/* Accept / Reject buttons — only when still Pending */}
            {pendingSelected.raw.status === "PENDING" && (
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <Button
                  text="Accept"
                  variant="primary"
                  size={6}
                  onClick={() => handleUpdateStatus(pendingSelected, "Approved")}
                />
                <Button
                  text="Reject"
                  variant="danger"
                  size={6}
                  onClick={() => handleUpdateStatus(pendingSelected, "Rejected")}
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
              subtitle={`${historySelected.role}`}
              meta={`Applied: ${historySelected.appliedOn}`}
            />
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Leave Type"          value={historySelected.leaveType} />
              <ModalData label="From Date"           value={new Date(historySelected.raw.fromDate).toLocaleDateString()} />
              <ModalData label="To Date"             value={new Date(historySelected.raw.toDate).toLocaleDateString()} />
              <ModalData label="Total Days"          value={historySelected.days} />
              <ModalData label="Status"              value={historySelected.status} />
              <ModalData label="Accepted/Rejected On" value={historySelected.actionOn || "—"} />
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
