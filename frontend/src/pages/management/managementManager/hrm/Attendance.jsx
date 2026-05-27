import { useMemo, useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { useAttendance } from "../../../../context/AttendanceContext";
import { Users, UserCheck, UserX, Palmtree, CalendarDays, Eye } from "lucide-react";
import { currentMM, attendanceRecords, todayAttendance } from "./hrmStore";

const KPI_ICONS   = [<Users size={22} />, <UserCheck size={22} />, <UserX size={22} />, <Palmtree size={22} />, <CalendarDays size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f43f5e", "#f59e0b", "#8b5cf6"];

const COLS = [
  { key: "name",     label: "Member" },
  { key: "role",     label: "Role" },
  { key: "date",     label: "Date" },
  { key: "clockIn",  label: "Clock In" },
  { key: "clockOut", label: "Clock Out" },
  { key: "hours",    label: "Hours" },
  { key: "status",   label: "Status" }, // auto-renders as colored badge
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

  const kpis = useMemo(() => {
    const presentCount = todayAttendance.filter((r) => r.status === "Present" || r.status === "Late" || r.status === "Half Day").length;
    const onTimeCount  = todayAttendance.filter((r) => r.status === "Present").length;
    const absentCount  = todayAttendance.filter((r) => r.status === "Absent").length;
    const leaveCount   = todayAttendance.filter((r) => r.status === "Leave").length;
    // Brief Section 16: Manager sees "Total Working Days" at Dept scope.
    // Count = distinct (member, date) pairs across the dept attendance log
    // where the member was actually present (Present / Late / Half Day).
    const workingDays = new Set(
      attendanceRecords
        .filter((r) => ["Present", "Late", "Half Day"].includes(r.status))
        .map((r) => `${r.name}|${r.date}`),
    ).size;
    return [
      { title: "Present Today",      value: String(presentCount) },
      { title: "On Time",            value: String(onTimeCount)  },
      { title: "Absent Today",       value: String(absentCount)  },
      { title: "On Leave",           value: String(leaveCount)   },
      { title: "Total Working Days", value: String(workingDays)  },
    ];
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Attendance" secondaryText={`${currentMM.department} Department`} size={12} />
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
        rows={attendanceRecords}
        userProfile="name"
        size={12}
        pageSize={10}
        searchable
        date
        exportable
        exportFileName="department_attendance"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Present", "Late", "Absent", "Leave", "Half Day"] },
          { title: "Member", type: "select", key: "name",   options: [...new Set(attendanceRecords.map((r) => r.name))] },
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
              meta={`Date: ${selected.date}`}
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
