import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Grid,
  GPieChart,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  openModal, closeModal
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { useAttendance } from "../../../../context/AttendanceContext";
import { Users, UserCheck, UserX, CalendarClock, Eye } from "lucide-react";
import { hrmService } from "../../../../services/hrmService";

const KPI_ICONS   = [<Users size={20} />, <UserCheck size={20} />, <UserX size={20} />, <CalendarClock size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f43f5e", "#f59e0b"];

const TEAM_COLS = [
  { key: "name",       label: "Member" },
  { key: "role",       label: "Role" },
  { key: "dateDisplay", label: "Date" },
  { key: "clockIn",    label: "Clock In" },
  { key: "clockOut",   label: "Clock Out" },
  { key: "hours",      label: "Total Hours" },
  { key: "status",     label: "Status" },
];

const MY_COLS = [
  { key: "dateDisplay", label: "Date" },
  { key: "clockIn",    label: "Clock In" },
  { key: "clockOut",   label: "Clock Out" },
  { key: "hoursWorked", label: "Hours Worked" },
  { key: "status",     label: "Status" },
];

// ── Bridge: SessionTimer ← AttendanceContext ──────────────────────────────────
function MyAttendanceWidget() {
  const ctx = useAttendance();
  return (
    <div className="flex flex-col gap-4">
      <SessionTimer
        label="Today's Attendance"
        targetSeconds={8 * 60 * 60}
        {...ctx}
        onCheckIn={ctx.checkIn}
        onPause={ctx.pause}
        onResume={ctx.resume}
        onCheckOut={ctx.checkOut}
      />
    </div>
  );
}

export default function Attendance() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRecords, setMyRecords] = useState([]);
  const [teamRecords, setTeamRecords] = useState([]);
  const [myDate, setMyDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [teamDate, setTeamDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const fetchMyData = useCallback(async () => {
    try {
      const res = await hrmService.getMyAttendanceHistory({ startDate: myDate, endDate: myDate });
      if (res.statusCode === 200) {
        setMyRecords(res.data.map(r => {
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
    } catch (err) { console.error(err); }
  }, [myDate]);

  const fetchTeamData = useCallback(async () => {
    try {
      const res = await hrmService.getTeamAttendance({ startDate: teamDate, endDate: teamDate });
      if (res.statusCode === 200) {
        setTeamRecords(res.data.map(r => {
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
        }));
      }
    } catch (err) { console.error(err); }
  }, [teamDate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMyData(), fetchTeamData()]);
    setLoading(false);
  }, [fetchMyData, fetchTeamData]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const kpis = useMemo(() => {
    const present = teamRecords.filter(r => ["Present", "Active", "Late"].includes(r.status)).length;
    const absent = teamRecords.filter(r => r.status === "Absent").length;
    const leave = teamRecords.filter(r => r.status === "Leave").length;
    return [
      { title: "Team Members", value: String(teamRecords.length) },
      { title: "Present Today", value: String(present) },
      { title: "Absent Today", value: String(absent) },
      { title: "On Leave", value: String(leave) },
    ];
  }, [teamRecords]);

  const attendanceDistribution = useMemo(() => [
    { name: "Present", value: teamRecords.filter(r => r.status === "Present").length },
    { name: "Active", value: teamRecords.filter(r => r.status === "Active").length },
    { name: "Absent", value: teamRecords.filter(r => r.status === "Absent").length },
    { name: "Leave", value: teamRecords.filter(r => r.status === "Leave").length },
  ], [teamRecords]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      <DashGrid cols={12} gap={4}>
        {kpis.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={KPI_ACCENTS[i]}
            size={3}
          />
        ))}
      </DashGrid>

      <MyAttendanceWidget />

      <Grid cols={12} gap={4}>
        <GPieChart
          title="Attendance Distribution"
          subtitle={`Team status for ${teamDate}`}
          data={attendanceDistribution}
          colors={["#22c55e", "#3b82f6", "#f43f5e", "#f59e0b"]}
          size={12}
          height={300}
        />
      </Grid>

      {/* ── TL's Own Attendance Table ──────────────────────────────────────── */}
      <DataTable
        title="My Attendance"
        columns={MY_COLS}
        rows={myRecords}
        size={12}
        pageSize={5}
        searchable
        loading={loading}
        onDateFilter={true}
        onApplyFilters={(f) => { if (f.startDate) setMyDate(f.startDate); }}
        exportable
        exportFileName={`my_attendance_${myDate}`}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => { setSelected(row); openModal("mtl-hrm-att-view"); },
          },
        ]}
      />

      {/* ── Team Members Attendance Table ──────────────────────────────────── */}
      <DataTable
        title="Team Attendance Record"
        columns={TEAM_COLS}
        rows={teamRecords}
        userProfile="name"
        size={12}
        pageSize={10}
        searchable
        loading={loading}
        onDateFilter={true}
        onApplyFilters={(f) => { if (f.startDate) setTeamDate(f.startDate); }}
        exportable
        exportFileName={`team_attendance_${teamDate}`}
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Present", "Active", "Absent", "Leave"] },
        ]}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => { setSelected(row); openModal("mtl-hrm-att-view"); },
          },
        ]}
      />

      <Modal id="mtl-hrm-att-view" title="Attendance Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.name || "Self"}
              subtitle={`${selected.role || ""} · ${selected.status}`}
              meta={`Date: ${selected.dateDisplay}`}
            />
            <ModalGrid title="Daily Log" cols={2}>
              <ModalData label="Clock In"  value={selected.clockIn} />
              <ModalData label="Clock Out" value={selected.clockOut} />
              <ModalData label="Total Hours" value={selected.hours || selected.hoursWorked} />
              <ModalData label="Status" value={selected.status} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mtl-hrm-att-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

