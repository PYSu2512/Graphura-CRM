import { CalendarClock, CalendarDays, Clock, Eye } from "lucide-react";
import { useState } from "react";
import {
    Button,
    closeModal,
    DashGrid,
    DataTable,
    EnhancedDashCard,
    Heading,
    Modal,
    ModalData,
    ModalGrid,
    openModal,
} from "../../../../components/shared/Common_Components.jsx";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { useAttendance } from "../../../../context/AttendanceContext";
import { attendanceRecords } from "./hrmStore";

const KPI_ICONS = [
  <CalendarDays size={22} />, 
  <Clock size={22} />,
  <Clock size={22} />,
  <CalendarClock size={22} />,
];

const COLS = [
  { key: "date", label: "Date" },
  { key: "clockIn", label: "Clock In" },
  { key: "clockOut", label: "Clock Out" },
  { key: "hours", label: "Total Hours" },
  { key: "status", label: "Status" },
];

function parseHours(hours) {
  const match = hours.match(/(\d+)h\s*(\d+)m/);
  if (!match) return 0;
  return Number(match[1]) + Number(match[2]) / 60;
}

function AttendanceWidget() {
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

  const todayRecord = attendanceRecords[attendanceRecords.length - 1];
  const todayStatus = todayRecord?.status ?? "Absent";
  const weekCount = attendanceRecords.filter((rec) => {
    const d = new Date(rec.date);
    const now = new Date("2026-05-25");
    return (now - d) / 86400000 <= 7;
  }).length;
  const monthCount = attendanceRecords.filter((rec) => {
    const d = new Date(rec.date);
    const now = new Date("2026-05-25");
    return (now - d) / 86400000 <= 30;
  }).length;
  const avgHours = (
    attendanceRecords.reduce((sum, rec) => sum + parseHours(rec.hours), 0) /
    attendanceRecords.length
  ).toFixed(1);

  const kpis = [
    { title: "Today's status", value: todayStatus },
    { title: "This Week", value: String(weekCount) },
    { title: "This Month", value: String(monthCount) },
    { title: "Avg Hours", value: `${avgHours}h` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Attendance" size={12} />
        {kpis.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={["#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b"][i]}
            size={3}
          />
        ))}
      </DashGrid>

      <AttendanceWidget />

      <DataTable
        title="My Attendance History"
        columns={COLS}
        rows={attendanceRecords}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => {
              setSelected(row);
              openModal("me-att-view-modal");
            },
          },
        ]}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="my_attendance_history"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Present", "Active", "Absent"] },
        ]}
      />

      <Modal id="me-att-view-modal" title="Attendance Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Attendance Info" cols={2}>
              <ModalData label="Date" value={selected.date} />
              <ModalData label="Status" value={selected.status} />
              <ModalData label="Clock In" value={selected.clockIn} />
              <ModalData label="Clock Out" value={selected.clockOut} />
              <ModalData label="Total Hours" value={selected.hours} />
            </ModalGrid>
            <div className="flex justify-end pt-2">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("me-att-view-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
