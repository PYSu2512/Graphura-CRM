import { useState, useEffect, useCallback } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, ModalGrid, Button,
  DataField, SelectField, Option, Grid,
} from "../../components/shared/Common_Components";
import SessionTimer from "../../components/shared/SessionTimer";
import DatePicker from "../../components/shared/DatePicker";
import { useAttendance } from "../../context/AttendanceContext";
import { hrmService } from "../../services/hrmService";
import { toast } from "react-hot-toast";
import { Users, UserCheck, Umbrella, Clock, Eye, CalendarCheck, Loader2, Plus, Trash2 } from "lucide-react";

const KPI_ICONS = [
  <Users size={22} />,
  <UserCheck size={22} />,
  <Umbrella size={22} />,
  <Clock size={22} />,
  <Eye size={22} />,
];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e", "#8b5cf6"];

const ATT_COLS = [
  { key: "date",     label: "Date"      },
  { key: "clockIn",  label: "Clock In"  },
  { key: "clockOut", label: "Clock Out" },
  { key: "hours",    label: "Hours"     },
  { key: "status",   label: "Status"    },
];

const LEAVE_COLS = [
  { key: "type",      label: "Leave Type" },
  { key: "reason",    label: "Reason"     , render: (v) => {
      if (!v) return "—";
      const words = String(v).trim().split(/\s+/);
      return words.length > 4 ? words.slice(0, 4).join(" ") + "…" : v;
    }
  },
  { key: "range",     label: "Date Range" },
  { key: "days",      label: "Days"       },
  { key: "appliedOn", label: "Applied On" },
  { key: "status",    label: "Status"     },
];

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

function AttendanceWidget() {
  const ctx = useAttendance();
  return (
    <SessionTimer
      label="Today's Attendance"
      targetSeconds={8 * 60 * 60}
      status={ctx.status}
      elapsed={ctx.elapsed}
      pct={ctx.pct}
      remaining={ctx.remaining}
      checkInAt={ctx.checkInAt}
      checkOutAt={ctx.checkOutAt}
      targetReached={ctx.targetReached}
      onCheckIn={ctx.checkIn}
      onPause={ctx.pause}
      onResume={ctx.resume}
      onCheckOut={ctx.checkOut}
    />
  );
}

export default function FinanceHRM() {
  const [attSelected,   setAttSelected]   = useState(null);
  const [leaveSelected, setLeaveSelected] = useState(null);
  const [active, setActive] = useState("Attendance");
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    leaveDays: 0,
    avgPerf: "0%"
  });

  // ── Apply Leave form state ──
  const [applyForm, setApplyForm] = useState({
    leaveType: "",
    reason: "",
    dateFrom: "",
    dateTo: "",
  });
  const [applyError, setApplyError] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const res = await hrmService.getMyAttendanceHistory();
      if (res.success && res.data) {
        const rows = res.data.map(a => {
          const d = new Date(a.date);
          const dateStr = d.toISOString().split('T')[0];
          
          const formatTime = (iso) => {
            if (!iso) return "—";
            const dt = new Date(iso);
            return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          };

          const clockInTime = formatTime(a.clockIn);
          const clockOutTime = formatTime(a.clockOut);
          
          let status = "Absent";
          if (a.isAbsent) status = "Absent";
          else if (a.isHalfDay) status = "Half Day";
          else if (a.clockIn && !a.clockOut) status = "Working";
          else if (a.clockIn && a.clockOut) status = "Present";

          let hoursStr = "—";
          if (a.hoursWorked) {
            const h = Math.floor(a.hoursWorked);
            const m = Math.round((a.hoursWorked - h) * 60);
            hoursStr = `${h}h ${m}m`;
          }

          return {
            ...a,
            date: dateStr,
            clockIn: clockInTime,
            clockOut: clockOutTime,
            hours: hoursStr,
            status
          };
        });
        setAttendance(rows);

        // Derive stats (for the purpose of this mock-derived summary)
        const presentCount = rows.filter(r => ["Present", "Working"].includes(r.status)).length;
        const absentCount = rows.filter(r => r.status === "Absent").length;
        setStats(prev => ({
          ...prev,
          present: presentCount,
          absent: absentCount,
          avgPerf: "92%"
        }));
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await hrmService.getMyLeaves();
      if (res.success && res.data) {
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

        const rows = res.data.map(l => ({
          ...l,
          id: l._id,
          type: LEAVE_MAP[l.leaveType] || l.leaveType,
          range: `${new Date(l.fromDate).toLocaleDateString()} – ${new Date(l.toDate).toLocaleDateString()}`,
          appliedOn: new Date(l.createdAt).toLocaleDateString(),
          status: l.status.charAt(0).toUpperCase() + l.status.slice(1).toLowerCase(),
          raw: l
        }));
        setLeaves(rows);
        setStats(prev => ({
          ...prev,
          leaveDays: rows.filter(r => r.raw.status === 'APPROVED').reduce((sum, r) => sum + r.days, 0)
        }));
      }
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
      toast.error("Failed to load leaves.");
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
    fetchLeaves();
  }, [fetchAttendance, fetchLeaves]);

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

  const handleDeleteLeave = async (row) => {
    if (!window.confirm("Are you sure you want to cancel this leave application?")) return;
    try {
      const res = await hrmService.deleteLeave(row.id);
      if (res.success) {
        toast.success("Leave canceled.");
        fetchLeaves();
        closeModal("fin-leave-view");
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel leave.");
    }
  };

  const kpi = [
    { title: "Present",         value: String(stats.present), accent: KPI_ACCENTS[1], icon: KPI_ICONS[1] },
    { title: "Absent",          value: String(stats.absent),  accent: KPI_ACCENTS[3], icon: KPI_ICONS[3] },
    { title: "Total Leave Days",        value: String(stats.leaveDays),   accent: KPI_ACCENTS[2], icon: KPI_ICONS[2] },
    { title: "Avg Performance", value: stats.avgPerf,              accent: KPI_ACCENTS[4], icon: KPI_ICONS[4] },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Finance" secondaryText="HRM" size={12} />
        {kpi.map((k) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
            icon={k.icon} accentColor={k.accent} size={3} />
        ))}
      </DashGrid>

      {/* HRM Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {[
          { key: "Attendance", label: "Attendance", icon: CalendarCheck },
          { key: "Leaves", label: "Leaves", icon: Umbrella },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              active === key
                ? "bg-[#2a465a] text-white shadow"
                : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
            }`}
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {active === "Attendance" && (
        <>
          {/* Attendance widget */}
          <AttendanceWidget />

          {/* Attendance table */}
          <DataTable
            title="Attendance Records"
            columns={ATT_COLS}
            rows={attendance}
            loading={loading}
            actions={[{
              icon: <Eye size={15}/>, tooltip: "View",
              variant: "ghost",
              onClick: (row) => { setAttSelected(row); openModal("fin-att-view"); },
            }]}
            size={12} pageSize={5} searchable exportable exportFileName="finance-attendance"
            filters={[
              { title: "Status", type: "toggle", key: "status", options: ["Present","Working","Absent","Half Day"] },
            ]}
          />
        </>
      )}

      {active === "Leaves" && (
        <>
          {/* Apply Leave button */}
          <div className="flex justify-end">
            <Button
              text="+ &nbsp; Apply Leave"
              onClick={() => openModal("apply-leave-modal")}
            />
          </div>

          {/* Leave table */}
          <DataTable
            title="Leave Records"
            columns={LEAVE_COLS}
            rows={leaves}
            actions={[
              {
                icon: <Eye size={15}/>, tooltip: "View",
                variant: "ghost",
                onClick: (row) => { setLeaveSelected(row); openModal("fin-leave-view"); },
              },
              {
                icon: <Trash2 size={15} />,
                tooltip: "Cancel",
                variant: "danger",
                disabled: (row) => row.raw.status !== 'PENDING',
                onClick: handleDeleteLeave,
              },
            ]}
            size={12} pageSize={10} searchable exportable exportFileName="finance-leaves"
            filters={[
              { title: "Status", type: "toggle", key: "status", options: ["Approved","Pending","Rejected"] },
              { title: "Leave Type", type: "toggle", key: "type", options: LEAVE_TYPES },
            ]}
          />
        </>
      )}

      {/* Attendance modal */}
      <Modal id="fin-att-view" title="Attendance Details" size="md">
        {attSelected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={attSelected.name || "Finance Manager"} subtitle={attSelected.role || "Finance Manager"} meta={`Status: ${attSelected.status}`} />
            <ModalGrid title="Attendance Info" cols={2}>
              <ModalData label="Clock In"  value={attSelected.clockIn}  />
              <ModalData label="Clock Out" value={attSelected.clockOut} />
              <ModalData label="Hours"     value={attSelected.hours}    />
              <ModalData label="Status"    value={attSelected.status}   />
              <ModalData label="IP Address" value={attSelected.ipAddress || "—"} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("fin-att-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Leave modal */}
      <Modal id="fin-leave-view" title="Leave Details" size="md">
        {leaveSelected && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Name"       value={leaveSelected.name || "Finance Manager"}   />
              <ModalData label="Leave Type" value={leaveSelected.type}   />
              <ModalData label="Range"      value={leaveSelected.range}  />
              <ModalData label="Applied On" value={leaveSelected.appliedOn} />
              <ModalData label="Days"       value={String(leaveSelected.days)} />
              <ModalData label="Status"     value={leaveSelected.status} />
            </ModalGrid>
            <ModalGrid title="Reason" cols={1}>
              <ModalData label="Full Reason" value={leaveSelected.reason} />
            </ModalGrid>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              {leaveSelected.raw.status === "PENDING" && (
                <button
                  onClick={() => handleDeleteLeave(leaveSelected)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition active:scale-95"
                >
                  Cancel Application
                </button>
              )}
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("fin-leave-view")} />
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
    </div>
  );
}
