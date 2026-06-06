import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { useAttendance } from "../../../../context/AttendanceContext";
import { Users, UserCheck, UserX, Palmtree, CalendarDays, Eye } from "lucide-react";
import { hrmService } from "../../../../services/hrmService";

const KPI_ICONS   = [<Users size={22} />, <UserCheck size={22} />, <UserX size={22} />, <Palmtree size={22} />, <CalendarDays size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f43f5e", "#f59e0b", "#8b5cf6"];

const COLS = [
  { key: "name",       label: "Member" },
  { key: "role",       label: "Role" },
  { key: "dateDisplay", label: "Date" },
  { key: "clockIn",    label: "Clock In" },
  { key: "clockOut",   label: "Clock Out" },
  { key: "hours",      label: "Hours" },
  { key: "status",     label: "Status" }, // auto-renders as colored badge
];

// ─── Bridge: SessionTimer ← AttendanceContext (shared with Navbar) ──────────
function MyAttendanceWidget() {
  const ctx = useAttendance();
  return (
    <SessionTimer
      label="Today's Attendance"
      targetSeconds={8 * 60 * 60}
      {...ctx}
      onCheckIn={ctx.checkIn}
      onPause={ctx.pause}
      onResume={ctx.resume}
      onCheckOut={ctx.checkOut}
    />
  );
}

export default function Attendance() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch team attendance for the selected date
      const res = await hrmService.getTeamAttendance({ startDate: dateFilter, endDate: dateFilter });
      if (res.statusCode === 200) {
        const mapped = res.data.map(r => {
          const formatHours = (hours) => {
            const h = Math.floor(hours || 0);
            const m = Math.round(((hours || 0) % 1) * 60);
            return `${h}h ${m}m`;
          };

          return {
            ...r,
            dateDisplay: new Date(r.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            clockIn: r.attendance?.clockIn ? new Date(r.attendance.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
            clockOut: r.attendance?.clockOut ? new Date(r.attendance.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
            hours: r.attendance?.clockOut ? formatHours(r.attendance.hoursWorked) : (r.attendance?.clockIn ? "Working..." : "—")
          };
        });
        setRecords(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch team attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = useMemo(() => {
    const presentCount = records.filter((r) => r.status === "Present" || r.status === "Active" || r.status === "Late" || r.status === "Half Day").length;
    const onTimeCount  = records.filter((r) => r.status === "Present").length;
    const absentCount  = records.filter((r) => r.status === "Absent").length;
    const leaveCount   = records.filter((r) => r.status === "Leave").length;
    
    // For "Today's" view (when filter is today), these are useful.
    // "Total Working Days" is harder to calculate from a single day's view, 
    // but for now we'll just show total members in the list as a placeholder or 0.
    const memberCount = records.length;

    return [
      { title: "Present",      value: String(presentCount) },
      { title: "On Time",      value: String(onTimeCount)  },
      { title: "Absent",       value: String(absentCount)  },
      { title: "On Leave",     value: String(leaveCount)   },
      { title: "Total Members", value: String(memberCount)  },
    ];
  }, [records]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Attendance" secondaryText="Department-wide" size={12} />
        {kpis.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={2} />
        ))}
      </DashGrid>

      {/* ── My Attendance — SessionTimer (shared with Navbar) ─────────────── */}
      <MyAttendanceWidget />

      {/* ── Department-wide attendance log (TLs + Employees) ──────────────── */}
      <DataTable
        title="Department Attendance"
        columns={COLS}
        rows={records}
        userProfile="name"
        size={12}
        pageSize={10}
        searchable
        loading={loading}
        onDateFilter={true}
        onApplyFilters={(filters) => {
          if (filters.startDate) setDateFilter(filters.startDate);
        }}
        exportable
        exportFileName={`dept_attendance_${dateFilter}`}
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Present", "Active", "Absent", "Leave", "Half Day"] },
          { title: "Member", type: "select", key: "name",   options: [...new Set(records.map((r) => r.name))] },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View Details", variant: "ghost",
            onClick: (row) => { setSelected(row); openModal("mm-hrm-att-view"); },
          },
        ]}
      />

      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="mm-hrm-att-view" title="Attendance Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.name}
              subtitle={`${selected.role} · ${selected.status}`}
              meta={`Date: ${selected.dateDisplay}`}
            />
            <ModalGrid title="Clock" cols={2}>
              <ModalData label="Clock In"  value={selected.clockIn} />
              <ModalData label="Clock Out" value={selected.clockOut} />
              <ModalData label="Hours"     value={selected.hours} />
              <ModalData label="Status"    value={selected.status} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="primary" size={3} onClick={() => closeModal("mm-hrm-att-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

