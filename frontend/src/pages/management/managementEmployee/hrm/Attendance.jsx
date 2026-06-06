import { CalendarClock, CalendarDays, Clock, Eye } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { hrmService } from "../../../../services/hrmService";

const KPI_ICONS = [
  <CalendarDays size={22} />, 
  <Clock size={22} />,
  <Clock size={22} />,
  <CalendarClock size={22} />,
];

const COLS = [
  { key: "dateDisplay", label: "Date" },
  { key: "clockIn", label: "Clock In" },
  { key: "clockOut", label: "Clock Out" },
  { key: "hoursWorked", label: "Total Hours" },
  { key: "status", label: "Status" },
];

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
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hrmService.getMyAttendanceHistory({ startDate: dateFilter, endDate: dateFilter });
      if (res.statusCode === 200) {
        setRecords(res.data.map(r => {
          const formatHours = (hours) => {
            const h = Math.floor(hours || 0);
            const m = Math.round(((hours || 0) % 1) * 60);
            return `${h}h ${m}m`;
          };

          return {
            ...r,
            dateDisplay: new Date(r.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            clockIn: r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
            clockOut: r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—",
            hoursWorked: r.clockOut ? formatHours(r.hoursWorked) : (r.clockIn ? "Working..." : "—"),
            status: r.isAbsent ? "Absent" : (r.clockOut ? "Present" : "Active")
          };
        }));
      }
    } catch (err) {
      console.error("Failed to fetch my attendance:", err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpis = useMemo(() => {
    const todayRec = records[0]; // Since we filter by one day, it's the first one if it exists
    const status = todayRec ? todayRec.status : "Absent";
    const hours = todayRec ? todayRec.hoursWorked : "0h 0m";

    return [
      { title: "Today's Status", value: status },
      { title: "Hours Worked", value: hours },
      { title: "Shift Target", value: "8h 0m" },
      { title: "Selected Date", value: new Date(dateFilter).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) },
    ];
  }, [records, dateFilter]);

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
        rows={records}
        loading={loading}
        onDateFilter={true}
        onApplyFilters={(f) => { if (f.startDate) setDateFilter(f.startDate); }}
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
        exportFileName={`my_attendance_${dateFilter}`}
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Present", "Active", "Absent"] },
        ]}
      />

      <Modal id="me-att-view-modal" title="Attendance Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Attendance Info" cols={2}>
              <ModalData label="Date" value={selected.dateDisplay} />
              <ModalData label="Status" value={selected.status} />
              <ModalData label="Clock In" value={selected.clockIn} />
              <ModalData label="Clock Out" value={selected.clockOut} />
              <ModalData label="Total Hours" value={selected.hoursWorked} />
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

