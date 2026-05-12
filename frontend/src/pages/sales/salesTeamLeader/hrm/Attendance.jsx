import { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { useAttendance } from "../../../../context/AttendanceContext";
import {
  Users, UserCheck, UserX, Palmtree, Eye,
} from "lucide-react";
import { currentTL, attendanceRecords, todayAttendance, ATTENDANCE_STATUS } from "../myTeam/teamStore";

const KPI_ICONS   = [<Users size={22} />, <UserCheck size={22} />, <UserX size={22} />, <Palmtree size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f43f5e", "#f59e0b"];

const COLS = [
  { key: "name",     label: "Executive" },
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

export default function Attendance() {
  const [selected, setSelected] = useState(null);

  // ── Today's KPIs (team executives only — TL self-attendance lives in the SessionTimer above) ──
  const present = todayAttendance.filter((r) => r.status === "Present").length;
  const late    = todayAttendance.filter((r) => r.status === "Late").length;
  const absent  = todayAttendance.filter((r) => r.status === "Absent").length;
  const onLeave = todayAttendance.filter((r) => r.status === "Leave").length;
  const kpis = [
    { title: "Present Today", value: String(present + late) }, // execs who showed up (Present + Late)
    { title: "On Time",       value: String(present)         },
    { title: "Absent Today",  value: String(absent)          },
    { title: "On Leave",      value: String(onLeave)         },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Attendance" secondaryText={currentTL.team} size={12} />
        {kpis.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      {/* ── My Attendance — SessionTimer (shared with Navbar via AttendanceContext) ── */}
      <MyAttendanceWidget />

      {/* ── Team executives' attendance log ───────────────────────────────── */}
      <DataTable
        title="Team Attendance"
        columns={COLS}
        rows={attendanceRecords}
        userProfile="name"
        size={12}
        pageSize={10}
        searchable
        date
        exportable
        exportFileName="team_attendance"
        filters={[
          { title: "Status",    type: "toggle", key: "status", options: ATTENDANCE_STATUS },
          { title: "Executive", type: "select", key: "name",   options: [...new Set(attendanceRecords.map((r) => r.name))] },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View Details", variant: "ghost",
            onClick: (row) => { setSelected(attendanceRecords.find((r) => r.id === row.id)); openModal("tl-hrm-att-view"); },
          },
        ]}
      />

      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="tl-hrm-att-view" title="Attendance Details" size="md">
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
              <Button text="Close" variant="primary" size={3} onClick={() => closeModal("tl-hrm-att-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
