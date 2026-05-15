import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Grid,
  GColumnChart, GDoughnutChart, GPieChart, GAreaChart,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  openModal, closeModal, DataField, SelectField, Option
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { useAttendance } from "../../../../context/AttendanceContext";
import { Users, UserCheck, UserX, CalendarClock, Eye, Clock, TrendingUp } from "lucide-react";
import {
  kpiAttendance, attendanceRows, ATTENDANCE_STATUS, currentTL,
  weeklyAttendance, attendanceDistribution, myTimingLogs, employeeAttendanceSummary,
  monthlyAttendanceGraph, employeeAttendanceBar, clockInTrendGraph, leaveTypeDistribution
} from "./hrmStore";

const KPI_ICONS   = [<Users size={20} />, <UserCheck size={20} />, <UserX size={20} />, <CalendarClock size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f43f5e", "#f59e0b"];

const COLS = [
  { key: "employeeId", label: "Emp ID",      width: "10%" },
  { key: "name",       label: "Member",      width: "16%" },
  { key: "role",       label: "Role",        width: "12%" },
  { key: "department", label: "Department",  width: "14%" },
  { key: "date",       label: "Date",        width: "10%" },
  { key: "clockIn",    label: "Clock In",    width: "10%" },
  { key: "clockOut",   label: "Clock Out",   width: "10%" },
  { key: "hours",      label: "Total Hours", width: "10%" },
  { key: "status",     label: "Status",      width: "8%" },
];


const SUMMARY_COLS = [
  { key: "name",            label: "Employee Name",    width: "22%" },
  { key: "present",         label: "Present Days",     width: "12%" },
  { key: "absent",          label: "Absent Days",      width: "12%" },
  { key: "leaves",          label: "Leave Count",      width: "12%" },
  { key: "percentage",      label: "Attendance %",     width: "14%" },
  { key: "workingDays",     label: "Working Days",     width: "14%" },
  { key: "remainingLeaves", label: "Remaining Leaves", width: "14%" },
];


// ── Bridge: SessionTimer ← AttendanceContext ──────────────────────────────────
function MyAttendanceWidget() {
  const ctx = useAttendance();
  return (

    <div className="flex flex-col gap-4">
      {/* ── Page Action Buttons ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button text="+ Add Attendance" variant="primary" onClick={() => openModal("mtl-hrm-add-attendance")} />
        <Button text="View Employee History" variant="ghost" onClick={() => openModal("mtl-hrm-emp-history")} />
      </div>

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
    </div>

  );
}

export default function Attendance() {
  const [selected, setSelected] = useState(null);


  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === "—") return "—";
    const [h, m] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(h, 10));
    date.setMinutes(parseInt(m, 10));
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Modal States
  const [addAttEmp, setAddAttEmp] = useState("");
  const [addAttDate, setAddAttDate] = useState("");
  const [addAttIn, setAddAttIn] = useState("");
  const [addAttOut, setAddAttOut] = useState("");
  const [addAttNotes, setAddAttNotes] = useState("");

  const [historyEmp, setHistoryEmp] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const summaryRowsWithBadges = employeeAttendanceSummary.map((row) => {
    const p = row.percentage;
    let badgeColor = "bg-rose-100 text-rose-700";
    if (p > 90) badgeColor = "bg-emerald-100 text-emerald-700";
    else if (p >= 70 && p <= 90) badgeColor = "bg-amber-100 text-amber-700";
    return {
      ...row,
      rawPercentage: p,
      percentage: <span className={`px-2 py-1 rounded-full text-xs font-bold ${badgeColor}`}>{p}%</span>
    };
  });

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">

      {/* ── KPI cards ──────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>

        {kpiAttendance.map((k, i) => (
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

      {/* ── My attendance session timer ───────────────────────────────────── */}
      <MyAttendanceWidget />

      {/* ── Analytics & Insights Section (moved up) ──────────────────────── */}
      <Grid cols={12} gap={4}>
        <GPieChart
          title="Attendance Overview"
          subtitle="Overall distribution"
          data={attendanceDistribution}
          colors={["#22c55e", "#f43f5e", "#f59e0b", "#3b82f6", "#94a3b8"]}
          size={4}
          height={320}
        />
        <GColumnChart
          title="Employee Attendance"
          subtitle="Present vs Absent by employee"
          data={employeeAttendanceBar}
          bars={[
            { key: "present", label: "Present", color: "#22c55e" },
            { key: "absent",  label: "Absent",  color: "#f43f5e" },
          ]}
          size={8}
          height={320}

        />
      </Grid>

      {/* ── Team attendance table ─────────────────────────────────────────── */}
      <DataTable
        title="Team Attendance Log"
        columns={COLS}
        rows={attendanceRows}
        userProfile="name"
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="team_attendance"
        filters={[

          { title: "Status", type: "toggle", key: "status", options: ["Present", "Absent", "Leave", "Half Day", "Late"] },
          { title: "Department", type: "select", key: "department", options: ["Engineering", "Design", "QA", "DevOps"] }
        ]}
        date={true}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => {
              const log = attendanceRows.find((r) => r.id === row.id) || row;
              const summary = employeeAttendanceSummary.find((s) => s.name === log.name) || {};
              setSelected({ log, summary });
              openModal("mtl-hrm-att-view");
            },
          },
        ]}
      />

      {/* ── Employee Attendance Summary ────────────────────────────────────── */}
      <DataTable
        title="Employee Attendance Summary"
        columns={SUMMARY_COLS}
        rows={summaryRowsWithBadges}
        userProfile="name"
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="attendance_summary"
        filters={[
          { title: "Department", type: "select", key: "department", options: ["Engineering", "Design", "QA", "DevOps"] },
          { title: "Attendance %", type: "select", key: "percentage", options: ["Above 90%", "70% - 90%", "Below 70%"], fn: (row, value) => {
              const p = row.rawPercentage;
              if (value === "Above 90%") return p >= 90;
              if (value === "70% - 90%") return p >= 70 && p < 90;
              if (value === "Below 70%") return p < 70;
              return true;
            } 
          },
          { title: "Leave Count", type: "select", key: "leaves", options: ["0", "1", "2", "3", "4+"], fn: (row, value) => {
              if (value === "4+") return row.leaves >= 4;
              return row.leaves === Number(value);
            }
          }

        ]}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => {
              const summary = row;
              const log = attendanceRows.find((r) => r.name === summary.name) || {};
              setSelected({ log, summary });
              openModal("mtl-hrm-att-view");
            },
          },
        ]}
      />



      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="mtl-hrm-att-view" title="Attendance Details" size="md">
        {selected && selected.log && selected.summary && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.log.name || selected.summary.name}
              subtitle={`${selected.log.role || "Role N/A"} · ${selected.summary.department || selected.log.department || "Dept N/A"}`}
              meta={`Emp ID: ${selected.log.employeeId || "N/A"}`}
            />

            <ModalGrid title="Daily Log" cols={2}>
              <ModalData label="Date" value={selected.log.date || "N/A"} />
              <ModalData label="Status" value={selected.log.status || "N/A"} />
              <div className="col-span-2">
                <ModalData 
                  label="Total Hours" 
                  value={(selected.log.clockIn && selected.log.clockIn !== "—" && selected.log.clockOut && selected.log.clockOut !== "—") 
                    ? `${formatTime(selected.log.clockIn)} - ${formatTime(selected.log.clockOut)} • ${selected.log.hours}` 
                    : selected.log.hours || "N/A"} 
                />
              </div>
            </ModalGrid>

            <ModalGrid title="Monthly Summary" cols={2}>
              <ModalData label="Working Days" value={selected.summary.workingDays ?? "0"} />
              <ModalData label="Attendance %" value={selected.summary.rawPercentage ? `${selected.summary.rawPercentage}%` : "0%"} />
              <ModalData label="Present Days" value={selected.summary.present ?? "0"} />
              <ModalData label="Absent Days" value={selected.summary.absent ?? "0"} />
              <ModalData label="Leave Count" value={selected.summary.leaves ?? "0"} />

            </ModalGrid>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mtl-hrm-att-view")} />
            </div>
          </div>
        )}
      </Modal>


      {/* ── Add Attendance Modal ───────────────────────────────────────────── */}
      <Modal id="mtl-hrm-add-attendance" title="Add Attendance" size="md">
        <div className="flex flex-col gap-4">
          <SelectField 
            label="Employee" 
            id="add-att-emp" 
            placeholder="Select Employee"
            value={addAttEmp}
            onChange={(e) => setAddAttEmp(e.target.value)}
          >
            {attendanceRows.map((r) => <Option key={r.id} value={r.id} label={r.name} />)}
          </SelectField>
          <DataField 
            label="Date" 
            id="add-att-date" 
            type="date" 
            value={addAttDate}
            onChange={(e) => setAddAttDate(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <DataField 
              label="Clock In" 
              id="add-att-in" 
              type="time" 
              size={12} 
              value={addAttIn}
              onChange={(e) => setAddAttIn(e.target.value)}
            />
            <DataField 
              label="Clock Out" 
              id="add-att-out" 
              type="time" 
              size={12} 
              value={addAttOut}
              onChange={(e) => setAddAttOut(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Notes / Remarks
            </label>
            <textarea
              placeholder="Add optional remarks for manual attendance..."
              value={addAttNotes}
              onChange={(e) => setAddAttNotes(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 resize-none transition duration-200"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("mtl-hrm-add-attendance")} />
            <Button text="Save" variant="primary" size={3} onClick={() => { closeModal("mtl-hrm-add-attendance"); alert("Attendance added"); }} />
          </div>
        </div>
      </Modal>



      {/* ── View Employee History Modal ───────────────────────────────────────────── */}
      <Modal id="mtl-hrm-emp-history" title="Employee History" size="md">
        <div className="flex flex-col gap-4">
          {!showHistory ? (
            <>
              <SelectField 
                label="Select Employee" 
                id="emp-history-emp" 
                placeholder="Select Employee"
                value={historyEmp}
                onChange={(e) => setHistoryEmp(e.target.value)}
              >
                {attendanceRows.map((r) => <Option key={r.id} value={r.id} label={r.name} />)}
              </SelectField>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
                <Button text="Cancel" variant="ghost" size={3} onClick={() => closeModal("mtl-hrm-emp-history")} />
                <Button 
                  text="View History" 
                  variant="primary" 
                  size={4} 
                  disabled={!historyEmp}
                  onClick={() => setShowHistory(true)} 
                />
              </div>
            </>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              {historyEmp && (
                <div className="mb-4">
                  <ModalProfile
                    name={attendanceRows.find(r => r.id === historyEmp)?.name}
                    subtitle={attendanceRows.find(r => r.id === historyEmp)?.role}
                    meta="Attendance History - Last 30 Days"
                  />
                </div>
              )}
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {myTimingLogs.map((log) => (
                  <div key={log.id} className="mb-3 p-3 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-500">{log.date}</p>
                      <p className="text-sm font-semibold text-slate-800">{log.clockIn} - {log.clockOut} • {log.hours}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500">Status</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${log.late === "Yes" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {log.late === "Yes" ? "Late" : "On Time"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
                <Button text="← Back" variant="ghost" size={3} onClick={() => setShowHistory(false)} />
                <Button text="Close" variant="primary" size={3} onClick={() => { setShowHistory(false); closeModal("mtl-hrm-emp-history"); }} />
              </div>
            </div>
          )}
        </div>
      </Modal>


    </div>
  );
}
