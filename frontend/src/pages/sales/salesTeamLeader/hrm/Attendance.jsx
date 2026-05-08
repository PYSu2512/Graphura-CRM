import { useState, useEffect, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import {
  Heading, DashGrid, DashCard, DataTable,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import {
  Users, UserCheck, UserX, Palmtree,
  Clock, LogIn, LogOut, Timer, Loader2, Eye,
} from "lucide-react";
import { hrmService, MOCK_ATTENDANCE } from "../../../../services/hrmService";
import { currentTL, teamExecutives, attendanceRecords } from "../myTeam/teamStore";

const KPI_ICONS   = [<Users size={22} />, <UserCheck size={22} />, <UserX size={22} />, <Palmtree size={22} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f43f5e", "#f59e0b"];

const COLS = [
  { key: "name",     label: "Employee" },
  { key: "role",     label: "Role" },
  { key: "date",     label: "Date" },
  { key: "clockIn",  label: "Clock In" },
  { key: "clockOut", label: "Clock Out" },
  { key: "hours",    label: "Hours" },
  { key: "status",   label: "Status" }, // auto-renders as colored badge
];

// ─── Build TL's own attendance rows (same shape as teamStore.attendanceRecords) ──
const tlAttendance = MOCK_ATTENDANCE.map((r) => ({
  id:       `ATT-${currentTL.id}-${r.date}`,
  execId:   currentTL.id,
  name:     currentTL.name,
  role:     "Team Leader",
  date:     r.date,
  clockIn:  r.checkIn === "-" ? "—" : r.checkIn,
  clockOut: r.checkOut === "-" ? "—" : r.checkOut,
  hours:    r.hours === "-" ? "—" : r.hours,
  status:   r.status,
}));

// Combined team attendance (TL self + 6 executives)
const COMBINED_ATTENDANCE = [...tlAttendance, ...attendanceRecords].sort((a, b) =>
  b.date.localeCompare(a.date) || a.name.localeCompare(b.name)
);

// ─── Self ClockWidget ───────────────────────────────────────────────────────
function ClockWidget() {
  const [clockInTime,  setClockInTime]  = useState(null);
  const [clockOutTime, setClockOutTime] = useState(null);
  const [elapsed,      setElapsed]      = useState(0);
  const [loading,      setLoading]      = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (clockInTime && !clockOutTime) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - clockInTime.getTime()) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [clockInTime, clockOutTime]);

  const fmtTime    = (d) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const fmtElapsed = (s) => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const handleClockIn = async () => {
    setLoading("in");
    await hrmService.clockIn();
    const now = new Date();
    setClockInTime(now); setClockOutTime(null); setElapsed(0);
    setLoading(null);
    toast.success(`Clock In Successful — ${fmtTime(now)}`, { icon: "🟢", duration: 4000 });
  };

  const handleClockOut = async () => {
    setLoading("out");
    await hrmService.clockOut();
    const now = new Date();
    setClockOutTime(now);
    setLoading(null);
    const s = Math.floor((now - clockInTime) / 1000);
    toast.success(`Clock Out Successful — Total: ${Math.floor(s/3600)}h ${String(Math.floor((s%3600)/60)).padStart(2,"0")}m`, { icon: "🔴", duration: 4000 });
  };

  const isClockedIn  = !!clockInTime && !clockOutTime;
  const isClockedOut = !!clockInTime && !!clockOutTime;
  const isIdle       = !clockInTime;
  const statusLabel  = isIdle ? "Not Clocked In" : isClockedIn ? "Working" : "Clocked Out";
  const statusColor  = isIdle ? "text-slate-400" : isClockedIn ? "text-emerald-600" : "text-rose-500";
  const statusDot    = isIdle ? "bg-slate-300" : isClockedIn ? "bg-emerald-500 animate-pulse" : "bg-rose-500";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${statusColor}`}>{statusLabel}</span>
            </div>
            <div className={`font-mono text-4xl font-black tracking-tight leading-none mb-3 ${isClockedIn ? "text-[#1a2e3f]" : "text-slate-300"}`}>
              {isClockedIn  ? fmtElapsed(elapsed)
              : isClockedOut ? fmtElapsed(Math.floor((clockOutTime - clockInTime) / 1000))
              : "00:00:00"}
            </div>
            <div className="flex items-center gap-4 flex-wrap text-xs">
              {clockInTime && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <LogIn size={11} className="text-emerald-600" />
                  </div>
                  <span>In: <span className="font-bold text-[#1a2e3f]">{fmtTime(clockInTime)}</span></span>
                </div>
              )}
              {clockOutTime && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <div className="w-5 h-5 rounded-md bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <LogOut size={11} className="text-rose-500" />
                  </div>
                  <span>Out: <span className="font-bold text-[#1a2e3f]">{fmtTime(clockOutTime)}</span></span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0 w-full sm:w-auto">
            <button onClick={handleClockIn} disabled={isClockedIn || loading === "in"}
              className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all
                ${isClockedIn || loading === "in"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md active:scale-95"}`}>
              {loading === "in" ? <Loader2 size={16} className="animate-spin" /> : <span className="text-base">🟢</span>}
              {loading === "in" ? "Clocking In…" : "Clock In"}
            </button>
            <button onClick={handleClockOut} disabled={!isClockedIn || loading === "out"}
              className={`flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all
                ${!isClockedIn || loading === "out"
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-rose-500 hover:bg-rose-600 text-white shadow-md active:scale-95"}`}>
              {loading === "out" ? <Loader2 size={16} className="animate-spin" /> : <span className="text-base">🔴</span>}
              {loading === "out" ? "Clocking Out…" : "Clock Out"}
            </button>
            {isClockedOut && (
              <button onClick={() => { setClockInTime(null); setClockOutTime(null); setElapsed(0); }}
                className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors">
                <Clock size={12} /> Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Attendance() {
  const [selected, setSelected] = useState(null);

  // ── Today snapshot ───────────────────────────────────────────────────────
  const today = "2026-05-07"; // anchor matches teamStore + MOCK_ATTENDANCE
  const todayRows = useMemo(() => COMBINED_ATTENDANCE.filter((r) => r.date === today), []);

  const kpis = useMemo(() => {
    const total   = teamExecutives.length + 1; // execs + TL
    const present = todayRows.filter((r) => r.status === "Present").length;
    const absent  = todayRows.filter((r) => r.status === "Absent").length;
    const onLeave = todayRows.filter((r) => r.status === "Leave").length;
    return [
      { title: "Team Size",     value: String(total)   },
      { title: "Present Today", value: String(present) },
      { title: "Absent Today",  value: String(absent)  },
      { title: "On Leave",      value: String(onLeave) },
    ];
  }, [todayRows]);

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

      {/* ── Self Clock In/Out ────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
          <Timer size={13} /> My Attendance — Today
        </p>
        <ClockWidget />
      </div>

      {/* ── Combined attendance log ──────────────────────────────────────── */}
      <DataTable
        title="Attendance Records"
        columns={COLS}
        rows={COMBINED_ATTENDANCE}
        size={12}
        pageSize={10}
        searchable
        date
        exportable
        exportFileName="team_attendance"
        filters={[
          { title: "Status",   type: "toggle", key: "status", options: ["Present", "Late", "Absent", "Leave"] },
          { title: "Role",     type: "toggle", key: "role",   options: ["Team Leader", "Sales Executive"] },
          { title: "Employee", type: "select", key: "name",   options: [currentTL.name, ...teamExecutives.map((e) => e.name)] },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View Details", variant: "ghost",
            onClick: (row) => { setSelected(COMBINED_ATTENDANCE.find((r) => r.id === row.id)); openModal("tl-hrm-att-view"); },
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
