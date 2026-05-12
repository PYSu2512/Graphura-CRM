import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalGrid, Button,
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { kpiAttendance, attendanceRows } from "./HrmStore";
import { CalendarDays, CheckCircle2, XCircle, CalendarClock, Eye } from "lucide-react";
import { useAttendance } from "../../../../context/AttendanceContext";

// Personal attendance card config — 4 cards only
const KPI_CONFIG = [
  { icon: <CalendarDays  size={20} />, accentColor: "#3b82f6" }, // Total Working Days
  { icon: <CheckCircle2  size={20} />, accentColor: "#22c55e" }, // Present Days
  { icon: <XCircle       size={20} />, accentColor: "#f43f5e" }, // Absent Days
  { icon: <CalendarClock size={20} />, accentColor: "#f59e0b" }, // Leaves Taken
];

const COLS = [
  { key: "date",     label: "Date"        },
  { key: "clockIn",  label: "Clock In"    },
  { key: "clockOut", label: "Clock Out"   },
  { key: "hours",    label: "Total Hours" },
  { key: "status",   label: "Status"      },
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

      {/* Personal Attendance Summary Cards */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Attendance" size={12} />
        {kpiAttendance.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_CONFIG[i].icon}
            accentColor={KPI_CONFIG[i].accentColor}
            size={3}
          />
        ))}
      </DashGrid>

      {/* ── Check In / Out Widget ── */}
      <AttendanceWidget />

      {/* ── Attendance Table ── */}
      <DataTable
        title="Attendance Records"
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
          { title: "Status", type: "toggle", key: "status", options: ["Present", "Absent", "Late", "Half Day", "Leave"] },
        ]}
      />

      {/* View modal */}
      <Modal id="att-view-modal" title="Attendance Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Attendance Info" cols={2}>
              <ModalData label="Date"          value={selected.date} />
              <ModalData label="Status"        value={selected.status} />
              <ModalData label="Clock In"      value={selected.clockIn} />
              <ModalData label="Clock Out"     value={selected.clockOut} />
              <ModalData label="Total Hours"   value={selected.hours} />
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