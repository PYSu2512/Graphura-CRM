import { useState, useEffect } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalGrid, Button,
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { CalendarDays, CheckCircle2, XCircle, CalendarClock, Eye } from "lucide-react";
import { useAttendance } from "../../../../context/AttendanceContext";
import { hrmService } from "../../../../services/hrmService";

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
      {...ctx}
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
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attDate, setAttDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const fetchMyAttendance = async (filters = {}) => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (!params.startDate) params.startDate = attDate;
      if (!params.endDate)   params.endDate   = attDate;

      const res = await hrmService.getMyAttendanceHistory(params);
      if (res.success) {
        const mapped = res.data.map(r => {
          const formatTime = (date) => {
            if (!date) return "—";
            return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          };

          const d = new Date(r.date);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

          let status = "Present";
          if (r.clockIn && !r.clockOut) status = "Active";
          if (r.isHalfDay) status = "Half Day";
          if (r.isAbsent) status = "Absent";

          return {
            ...r,
            date: dateStr,
            clockIn: formatTime(r.clockIn),
            clockOut: formatTime(r.clockOut),
            hours: r.hoursWorked ? `${r.hoursWorked}h` : "—",
            status: status
          };
        });
        setRecords(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch attendance history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [attDate]);

  const totalDays = records.length;
  const presentDays = records.filter(r => r.status === "Present" || r.status === "Active").length;
  const absentDays = records.filter(r => r.status === "Absent").length;
  
  const kpis = [
    { title: "Working Days", value: String(totalDays) },
    { title: "Present",      value: String(presentDays) },
    { title: "Absent",       value: String(absentDays) },
    { title: "Leaves Taken", value: "0" }, // Simplified
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Personal Attendance Summary Cards */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Attendance" size={12} />
        {kpis.map((k, i) => (
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
        title={`Attendance for ${attDate}`}
        columns={COLS}
        rows={records}
        loading={loading}
        onDateFilter={true}
        onApplyFilters={(f) => { if (f.startDate) setAttDate(f.startDate); }}
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
        exportable
        exportFileName={`attendance_${attDate}`}
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Present", "Absent", "Active", "Half Day"] },
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
