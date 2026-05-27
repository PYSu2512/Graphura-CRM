import { useState, useEffect } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, ModalGrid, Button,
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { kpiAttendance, attendanceRows } from "./HrmStore";
import { Users, UserCheck, UserX, Clock, Calendar, Eye } from "lucide-react";
import { useAttendance } from "../../../../context/AttendanceContext";
import { hrmService } from "../../../../services/hrmService";

const KPI_ICONS = [<Users size={22} />, <UserCheck size={22} />, <UserX size={22} />, <Calendar size={22} />, <Clock size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f43f5e", "#f59e0b", "#8b5cf6"];

const COLS = [
  { key: "name", label: "Employee" },
  { key: "role", label: "Role" },
  { key: "teamLeader", label: "Team Leader" },
  { key: "date", label: "Date" },
  { key: "clockIn", label: "Clock In" },
  { key: "clockOut", label: "Clock Out" },
  { key: "hours", label: "Hours" },
  { key: "status", label: "Status" },
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
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({});

  const fetchTeam = async (filters = {}) => {
    setLoading(true);
    try {
      // If no date range is provided, default to today (Local)
      const params = { ...filters };
      if (!params.startDate && !params.endDate) {
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        params.startDate = todayStr;
        params.endDate = todayStr;
      }

      const res = await hrmService.getTeamAttendance(params);
      if (res.success) {
        const mapped = res.data.map(u => {
          const att = u.attendance;
          const status = u.status || "Absent";

          const formatTime = (date) => {
             if (!date) return "—";
             const d = new Date(date);
             return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          };

          const formatRole = (str) => {
            if (!str) return "";
            // Remove SALES_, FINANCE_, MANAGEMENT_ prefixes
            const clean = str.replace(/^(SALES|FINANCE|MANAGEMENT)_/, '');
            if (clean === 'TL') return "Team Leader";
            return clean.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          };

          const d = new Date(u.date);
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

          return {
            id: u.id,
            name: u.name,
            role: formatRole(u.role),
            teamLeader: u.teamLeader || "Unknown",
            date: dateStr,
            clockIn: formatTime(att?.clockIn),
            clockOut: formatTime(att?.clockOut),
            hours: att?.hoursWorked ? `${att.hoursWorked}h` : "—",
            status: status,
            raw: u
          };
        });
        setTeamAttendance(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch team attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam(currentFilters);
    const interval = setInterval(() => fetchTeam(currentFilters), 60000); // Auto-refresh every 60s
    return () => clearInterval(interval);
  }, [currentFilters]);

  const handleApplyFilters = (filters) => {
    setCurrentFilters(filters);
  };

  const handleClockOutMember = async (row) => {
    if (!window.confirm(`Are you sure you want to clock out ${row.name}?`)) return;
    try {
      const res = await hrmService.clockOut(row.id);
      if (res.success) {
        fetchTeam(currentFilters); // Refresh table with current filters
      }
    } catch (err) {
      console.error("Failed to clock out member:", err);
    }
  };

  const present = teamAttendance.filter(r => r.status === "Present" || r.status === "Active").length;
  const absent  = teamAttendance.filter(r => r.status === "Absent").length;
  const leave   = teamAttendance.filter(r => r.status === "Leave").length;
  
  const kpis = [
    { title: "Total Records",    value: String(teamAttendance.length) },
    { title: "Present",          value: String(present) },
    { title: "Absent",           value: String(absent) },
    { title: "On Leave",         value: String(leave) },
    { title: "Avg Performance",  value: "92%" },
  ];

  const teamLeaders = [...new Set(teamAttendance.map(r => r.teamLeader))];
  const roles = [...new Set(teamAttendance.map(r => r.role))];

  return (
    <div className="flex flex-col gap-6">

      {/* KPI cards */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Attendance" size={12} />
        {kpis.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
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
        rows={teamAttendance}
        loading={loading}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => { setSelected(row); openModal("att-view-modal"); },
          },
          {
            icon: <UserX size={15} />,
            tooltip: "Force Clock Out",
            variant: "danger",
            onClick: handleClockOutMember,
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
          { title: "Status", type: "toggle", key: "status", options: ["Present", "Active", "Absent", "Leave"] },
          { title: "Role", type: "toggle", key: "role", options: roles },
          { title: "Team Leader", type: "select", key: "teamLeader", options: teamLeaders },
        ]}
        onApplyFilters={handleApplyFilters}
      />

      {/* View modal */}
      <Modal id="att-view-modal" title="Attendance Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.name}
              subtitle={`${selected.role} · ${selected.teamLeader}`}
              meta={`Date: ${selected.date}`}
            />
            <ModalGrid title="Attendance Info" cols={2}>
              <ModalData label="Clock In" value={selected.clockIn} />
              <ModalData label="Clock Out" value={selected.clockOut} />
              <ModalData label="Working Hours" value={selected.hours} />
              <ModalData label="Attendance %" value={selected.attendancePct} />
              <ModalData label="Status" value={selected.status} />
              <ModalData label="Team Leader" value={selected.teamLeader} />
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
