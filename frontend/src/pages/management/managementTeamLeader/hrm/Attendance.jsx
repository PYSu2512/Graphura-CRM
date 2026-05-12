import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable, Grid,
  GColumnChart, GDoughnutChart,
  Modal, ModalGrid, ModalData, ModalProfile, Button,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components";
import SessionTimer from "../../../../components/shared/SessionTimer";
import { useAttendance } from "../../../../context/AttendanceContext";
import { Users, UserCheck, UserX, CalendarClock, Eye, Clock, TrendingUp } from "lucide-react";
import {
  kpiAttendance, attendanceRows, ATTENDANCE_STATUS, currentTL,
  weeklyAttendance, attendanceDistribution,
} from "./hrmStore";

const KPI_ICONS   = [<Users size={20} />, <UserCheck size={20} />, <UserX size={20} />, <CalendarClock size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f43f5e", "#f59e0b"];

const COLS = [
  { key: "employeeId", label: "Emp ID"       },
  { key: "name",       label: "Member"       },
  { key: "role",       label: "Role"         },
  { key: "department", label: "Department"   },
  { key: "date",       label: "Date"         },
  { key: "clockIn",    label: "Clock In"     },
  { key: "clockOut",   label: "Clock Out"    },
  { key: "hours",      label: "Total Hours"  },
  { key: "status",     label: "Status"       },
];

// ── Bridge: SessionTimer ← AttendanceContext ──────────────────────────────────
function MyAttendanceWidget() {
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

export default function Attendance() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* ── Section heading + KPI cards ──────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <Heading
          primaryText="Attendance"
          secondaryText={`${currentTL.team} · Today's Overview`}
          size={12}
        />
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

      {/* ── Charts row ───────────────────────────────────────────────────── */}
      <Grid cols={12} gap={4}>
        <GColumnChart
          title="Weekly Attendance"
          subtitle="Present vs Absent vs Late — this week"
          data={weeklyAttendance}
          bars={[
            { key: "present", label: "Present", color: "#22c55e" },
            { key: "absent",  label: "Absent",  color: "#f43f5e" },
            { key: "late",    label: "Late",     color: "#f59e0b" },
          ]}
          size={8}
          height={260}
        />
        <GDoughnutChart
          title="Today's Status"
          subtitle="Attendance distribution"
          data={attendanceDistribution}
          colors={["#22c55e", "#f43f5e", "#f59e0b", "#3b82f6", "#94a3b8"]}
          size={4}
          height={260}
          innerRadius={60}
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
        date
        exportable
        exportFileName="team_attendance"
        filters={[
          { title: "Attendance Status", type: "toggle", key: "status",     options: ["Present", "Absent", "Late", "Half Day", "Leave"] },
          { title: "Department",        type: "select", key: "department", options: ["Engineering", "Design", "QA", "DevOps"] },
          { title: "Role",              type: "toggle", key: "role",       options: ["Frontend", "Backend", "Designer", "QA", "DevOps"] },
        ]}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => {
              setSelected(attendanceRows.find((r) => r.id === row.id) ?? row);
              openModal("mtl-hrm-att-view");
            },
          },
        ]}
      />

      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="mtl-hrm-att-view" title="Attendance Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.name}
              subtitle={`${selected.role} · ${selected.status}`}
              meta={`Date: ${selected.date}`}
            />

            {/* Clock in/out visual strip */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">Clock In</p>
                  <p className="text-sm font-black text-emerald-700">{selected.clockIn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-rose-600" />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-rose-500">Clock Out</p>
                  <p className="text-sm font-black text-rose-700">{selected.clockOut}</p>
                </div>
              </div>
            </div>

            <ModalGrid title="Summary" cols={2}>
              <ModalData label="Total Hours" value={selected.hours} />
              <ModalData label="Status"      value={selected.status} />
              <ModalData label="Role"        value={selected.role} />
              <ModalData label="Date"        value={selected.date} />
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
