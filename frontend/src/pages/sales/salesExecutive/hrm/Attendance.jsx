import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard as DashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, ModalGrid, Button,
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { kpiAttendance, attendanceRows } from "./HrmStore";
import { Users, UserCheck, UserX, Clock, Calendar, Eye } from "lucide-react";
import { useAttendance } from "../../../../context/AttendanceContext";

const KPI_ICONS = [<Users size={22} />, <UserCheck size={22} />, <UserX size={22} />, <Calendar size={22} />, <Clock size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f43f5e", "#f59e0b", "#8b5cf6"];

const COLS = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "date", label: "Date" },
  { key: "clockIn", label: "Clock In" },
  { key: "clockOut", label: "Clock Out" },
  { key: "hours", label: "Hours" },
  { key: "attendancePct", label: "Attendance" },
  { key: "status", label: "Status" },
];

// ── Bridge: SessionTimer ← AttendanceContext (shared with Navbar) ────────────
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

// ── Main Attendance Page ──────────────────────────────────────────────────────
export default function Attendance() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-col gap-6">

      {/* KPI cards */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Attendance" size={12} />
        {kpiAttendance.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      {/* ── Check In / Out Widget ── */}
      <AttendanceWidget />

      {/* ── Attendance Table ── */}
      <DataTable
        title="Attendance Records"
        userProfile="name"
        columns={COLS}
        rows={attendanceRows}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => { setSelected(row); openModal("att-view-modal"); },
          },
        ]}
        size={12}
        pageSize={10}
        searchable
        onDateFilter={true}
        date
        exportable
        exportFileName="attendance-report"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Present", "Working", "Paused", "Absent", "Late", "Half Day", "Leave"] },
          { title: "Role", type: "toggle", key: "role", options: ["Sales Executive", "Senior Sales Executive"] },
        ]}
      />

      {/* View modal */}
      <Modal id="att-view-modal" title="Attendance Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.name}
              subtitle={selected.role}
              meta={`Date: ${selected.date}`}
            />
            <ModalGrid title="Attendance Info" cols={2}>
              <ModalData label="Clock In" value={selected.clockIn} />
              <ModalData label="Clock Out" value={selected.clockOut} />
              <ModalData label="Working Hours" value={selected.hours} />
              <ModalData label="Attendance %" value={selected.attendancePct} />
              <ModalData label="Status" value={selected.status} />
              <ModalData label="Role" value={selected.role} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("att-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}