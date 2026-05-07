import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays, CheckCircle2, XCircle, Palmtree, CalendarCheck,
  Clock, BarChart2, AlertCircle, LogIn, LogOut, Timer, Loader2,
} from "lucide-react";
import {
  Heading, DashGrid, DashCard, DataTable,
  GColumnChart, GLineChart, GPieChart,
} from "../../../../components/shared/Common_Components";
import { hrmService, MOCK_ATTENDANCE, MOCK_LEAVES_INIT } from "../../../../services/hrmService";

// ─── Section header ──────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, iconColor, title, badge }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${iconColor}`}>
      <Icon size={15} className="text-white" />
    </div>
    <h2 className="text-base font-bold text-[#1a2e3f] tracking-tight">{title}</h2>
    {badge !== undefined && (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1a2e3f]/10 text-[#1a2e3f]">{badge}</span>
    )}
    <div className="flex-1 h-px bg-slate-100 ml-1" />
  </div>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const parseHoursToMins = (hoursStr) => {
  const hMatch = hoursStr.match(/(\d+)h/);
  const mMatch = hoursStr.match(/(\d+)m/);
  return (hMatch ? parseInt(hMatch[1], 10) : 0) * 60 + (mMatch ? parseInt(mMatch[1], 10) : 0);
};

// ─── Chart data (derived from MOCK_ATTENDANCE) ───────────────────────────────
const BAR_DATA = MOCK_ATTENDANCE
  .filter((r) => !["Weekend", "Holiday"].includes(r.status))
  .slice(0, 7)
  .map((r) => ({
    name: `${r.day} ${r.date.slice(8)}`,
    Present: r.status === "Present" ? 1 : 0,
    Absent:  r.status === "Absent"  ? 1 : 0,
    Late:    r.status === "Late"    ? 1 : 0,
    Leave:   r.status === "Leave"   ? 1 : 0,
  }));

const LINE_DATA = MOCK_ATTENDANCE
  .filter((r) => r.hours && r.hours !== "—")
  .map((r) => ({
    name:  `${r.day} ${r.date.slice(8)}`,
    hours: parseFloat((parseHoursToMins(r.hours) / 60).toFixed(2)),
  }));

const PIE_DATA = [
  { name: "Present", value: MOCK_ATTENDANCE.filter((r) => r.status === "Present").length },
  { name: "Absent",  value: MOCK_ATTENDANCE.filter((r) => r.status === "Absent").length  },
  { name: "Late",    value: MOCK_ATTENDANCE.filter((r) => r.status === "Late").length    },
  { name: "Leave",   value: MOCK_ATTENDANCE.filter((r) => r.status === "Leave").length   },
].filter((d) => d.value > 0);

const PIE_COLORS = ["#10b981", "#f43f5e", "#f59e0b", "#8b5cf6"];

// ─── Work summary ────────────────────────────────────────────────────────────
const WORK_SUMMARY = (() => {
  const rows  = MOCK_ATTENDANCE.filter((r) => r.hours && r.hours !== "—");
  const mins  = rows.reduce((s, r) => s + parseHoursToMins(r.hours), 0);
  const late  = MOCK_ATTENDANCE.filter((r) => r.status === "Late").length;
  const early = rows.filter((r) => r.checkIn && r.checkIn !== "—" && +r.checkIn.split(":")[0] < 9).length;
  return {
    totalHours:  rows.length ? (mins / 60).toFixed(1) : "0.0",
    avgPerDay:   rows.length ? (mins / rows.length / 60).toFixed(2) : "0.00",
    lateCount:   late,
    workingDays: rows.length,
    punctuality: rows.length ? Math.round(((rows.length - late - early) / rows.length) * 100) : 0,
  };
})();

const fmtAttDate = (d) => {
  const [, m, day] = d.split("-");
  return `${day} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} 2026`;
};

const ATTENDANCE_COLS = [
  { key: "dateDisplay", label: "Date" },
  { key: "checkIn",     label: "Check-in" },
  { key: "checkOut",    label: "Check-out" },
  { key: "hours",       label: "Total Hours" },
  { key: "status",      label: "Status" }, // auto-renders as colored badge
];

// ─── Clock Widget ────────────────────────────────────────────────────────────
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
  const totalHours = () => {
    if (!clockInTime || !clockOutTime) return null;
    const s = Math.floor((clockOutTime - clockInTime) / 1000);
    return `${Math.floor(s/3600)}h ${String(Math.floor((s%3600)/60)).padStart(2,"0")}m`;
  };

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
              {isClockedOut && totalHours() && (
                <div className="flex items-center gap-1.5 text-slate-500">
                  <div className="w-5 h-5 rounded-md bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Timer size={11} className="text-sky-600" />
                  </div>
                  <span>Total: <span className="font-bold text-sky-600">{totalHours()}</span></span>
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
        {(isClockedIn || isClockedOut) && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Progress (9h target)</span>
              <span className="text-[10px] font-bold text-[#1a2e3f]">{Math.min(100, Math.round((elapsed / (9*3600)) * 100))}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000
                ${elapsed >= 9*3600 ? "bg-emerald-500" : elapsed >= 7*3600 ? "bg-sky-500" : "bg-[#38bdf8]"}`}
                style={{ width: `${Math.min(100, (elapsed / (9*3600)) * 100)}%` }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function Attendance() {
  const [todayStatus, setTodayStatus] = useState(null);
  const [autoMarked,  setAutoMarked]  = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (autoMarked) return;
      try {
        setAutoMarked(true);
        const res = await hrmService.autoMarkAttendance();
        const { status } = res.data;
        if (status === "Present") {
          setTodayStatus("Present");
          toast.success("Auto Attendance: Marked Present for today.", { icon: "🟢" });
        } else if (!status || status === "Absent") {
          setTodayStatus("Absent");
          toast.error("Auto Status: No clock-in detected — marked Absent.", { icon: "🔴" });
        } else if (status === "Leave") {
          setTodayStatus("Leave");
          toast("Today is marked as Leave.", { icon: "🟣" });
        }
      } catch {
        toast.error("Failed to load HRM data.");
      }
    }, 600);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  const presentDays      = MOCK_ATTENDANCE.filter((r) => r.status === "Present").length;
  const absentDays       = MOCK_ATTENDANCE.filter((r) => r.status === "Absent").length;
  const leavesTaken      = MOCK_LEAVES_INIT.filter((l) => l.status === "Approved").reduce((s, l) => s + l.days, 0);
  const totalWorkingDays = MOCK_ATTENDANCE.filter((r) => !["Weekend", "Holiday"].includes(r.status)).length;
  const remainingLeaves  = Math.max(0, 12 - leavesTaken);

  const attendanceRows = MOCK_ATTENDANCE.map((r) => ({ ...r, dateDisplay: fmtAttDate(r.date) }));

  return (
    <div className="flex flex-col gap-6">
      {/* ── Today's status banner ─────────────────────────────────────────── */}
      {todayStatus && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
          ${todayStatus === "Present" ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : todayStatus === "Absent"  ? "bg-rose-50 border-rose-200 text-rose-700"
          : todayStatus === "Leave"   ? "bg-violet-50 border-violet-200 text-violet-800"
          : "bg-slate-50 border-slate-200 text-slate-600"}`}>
          <span className="text-base flex-shrink-0">
            {todayStatus === "Present" ? "🟢" : todayStatus === "Absent" ? "🔴" : "🟣"}
          </span>
          <div className="flex-1">
            <span className="font-bold">Today's Status: {todayStatus}</span>
            {todayStatus === "Present" && <span className="ml-2 text-xs opacity-80">— Auto-marked on login</span>}
            {todayStatus === "Absent"  && <span className="ml-2 text-xs opacity-80">— No clock-in detected</span>}
            {todayStatus === "Leave"   && <span className="ml-2 text-xs opacity-80">— Approved leave</span>}
          </div>
          {todayStatus !== "Absent" && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0
              ${todayStatus === "Present" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}>
              {remainingLeaves} leaves left
            </span>
          )}
        </div>
      )}

      {/* ── Summary KPIs (5 cards in one row) ─────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Working Days"     value={String(totalWorkingDays)} icon={<CalendarDays  size={22} />} accentColor="#38bdf8" size={2} />
        <DashCard title="Present"          value={String(presentDays)}      icon={<CheckCircle2  size={22} />} accentColor="#22c55e" size={2} />
        <DashCard title="Absent"           value={String(absentDays)}       icon={<XCircle       size={22} />} accentColor="#f43f5e" size={2} />
        <DashCard title="Leaves Taken"     value={String(leavesTaken)}      icon={<Palmtree      size={22} />} accentColor="#f59e0b" size={3} />
        <DashCard title="Remaining Leaves" value={String(remainingLeaves)}  icon={<CalendarCheck size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      {/* ── Clock In / Out ────────────────────────────────────────────────── */}
      <div>
        <SectionHeader icon={Clock} iconColor="bg-emerald-500" title="Today's Attendance" />
        <ClockWidget />
      </div>

      {/* ── Attendance table ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader icon={CalendarDays} iconColor="bg-[#1a2e3f]" title="Attendance Log" badge={`${MOCK_ATTENDANCE.length} records`} />
        <DataTable
          title="Attendance Log"
          columns={ATTENDANCE_COLS}
          rows={attendanceRows}
          searchable={false}
          pageSize={7}
          hidePagination={true}
          size={12}
          filters={[
            { title: "Status", type: "toggle", key: "status",
              options: ["Present", "Absent", "Late", "Leave", "Holiday", "Weekend"] },
          ]}
        />
      </div>

      {/* ── Work Summary ──────────────────────────────────────────────────── */}
      <div>
        <SectionHeader icon={Timer} iconColor="bg-sky-500" title="Work Summary — May 2026" />
        <DashGrid cols={12} gap={4}>
          <DashCard title="Total Hours"    value={`${WORK_SUMMARY.totalHours}h`}  icon={<Clock       size={22} />} accentColor="#38bdf8" size={3} />
          <DashCard title="Avg Hours/Day"  value={`${WORK_SUMMARY.avgPerDay}h`}   icon={<Timer       size={22} />} accentColor="#22c55e" size={3} />
          <DashCard title="Late Entries"   value={String(WORK_SUMMARY.lateCount)} icon={<AlertCircle size={22} />} accentColor="#f59e0b" size={3} />
          <DashCard title="Punctuality"    value={`${WORK_SUMMARY.punctuality}%`} icon={<CheckCircle2 size={22} />} accentColor="#8b5cf6" size={3} />
        </DashGrid>
      </div>

      {/* ── Analytics charts ──────────────────────────────────────────────── */}
      <div>
        <SectionHeader icon={BarChart2} iconColor="bg-[#38bdf8]" title="Attendance Analytics" />
        <div className="space-y-4">
          <GColumnChart
            title="Weekly Attendance Breakdown"
            subtitle="Present · Absent · Late · Leave per day"
            data={BAR_DATA}
            bars={[
              { key: "Present", label: "Present", color: "#10b981" },
              { key: "Absent",  label: "Absent",  color: "#f43f5e" },
              { key: "Late",    label: "Late",    color: "#f59e0b" },
              { key: "Leave",   label: "Leave",   color: "#8b5cf6" },
            ]}
            size={12} height={260}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <GLineChart
                title="Daily Working Hours"
                subtitle="Hours logged on each working day"
                data={LINE_DATA}
                lines={[{ key: "hours", label: "Hours Worked", color: "#38bdf8" }]}
                size={12} height={260}
              />
            </div>
            <div>
              <GPieChart
                title="Attendance Distribution"
                subtitle="Breakdown by status"
                data={PIE_DATA} colors={PIE_COLORS}
                size={12} height={260}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
