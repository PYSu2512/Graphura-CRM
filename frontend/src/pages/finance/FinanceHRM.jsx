import { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, ModalGrid, Button,
} from "../../components/shared/Common_Components";
import SessionTimer from "../../components/shared/SessionTimer";
import { useAttendance } from "../../context/AttendanceContext";
import { Users, UserCheck, Umbrella, Clock, Eye, CalendarCheck } from "lucide-react";

const KPI_ICONS = [
  <Users size={22} />,
  <UserCheck size={22} />,
  <Umbrella size={22} />,
  <Clock size={22} />,
  <Eye size={22} />,
];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#f59e0b", "#f43f5e", "#8b5cf6"];

// KPI derivation moved inside component to avoid initialization order issues

const ATT_COLS = [
  { key: "date",    label: "Date"       },
  { key: "clockIn", label: "Clock In"   },
  { key: "clockOut",label: "Clock Out"  },
  { key: "hours",   label: "Hours"      },
  { key: "status",  label: "Status"     },
];

const ATT_ROWS = [
  { date: "2026-05-03", name: "Finance Manager", role: "Finance Manager", clockIn: "09:00", clockOut: "18:00", hours: "9h 00m", status: "Present"  },
  { date: "2026-05-03", name: "Accounts Head",   role: "Accounts",        clockIn: "09:15", clockOut: "18:10", hours: "8h 55m", status: "Present"  },
  { date: "2026-05-03", name: "Finance Exec 1",  role: "Executive",       clockIn: "09:30", clockOut: "—",     hours: "5h 30m", status: "Working"  },
  { date: "2026-05-03", name: "Finance Exec 2",  role: "Executive",       clockIn: "—",     clockOut: "—",     hours: "—",      status: "Absent"   },
  { date: "2026-05-03", name: "Billing Exec",    role: "Executive",       clockIn: "09:45", clockOut: "18:00", hours: "8h 15m", status: "Present"  },
  { date: "2026-05-03", name: "Payroll Exec",    role: "Executive",       clockIn: "—",     clockOut: "—",     hours: "—",      status: "Leave"    },
];

const LEAVE_COLS = [
  { key: "type",   label: "Leave Type" },
  { key: "reason", label: "Reason"     , render: (v) => {
      if (!v) return "—";
      const words = String(v).trim().split(/\s+/);
      return words.length > 4 ? words.slice(0, 4).join(" ") + "…" : v;
    }
  },
  { key: "from",   label: "From"       },
  { key: "to",     label: "To"         },
  { key: "days",   label: "Days"       },
  { key: "status", label: "Status"     },
];

const LEAVE_ROWS = [
  { name: "Finance Exec 2", type: "Sick Leave",   reason: "Fever and medical check-up required", from: "2026-05-03", to: "2026-05-04", days: 2, status: "Approved" },
  { name: "Payroll Exec",   type: "Casual Leave", reason: "Family function in hometown",            from: "2026-05-03", to: "2026-05-03", days: 1, status: "Approved" },
  { name: "Accounts Head",  type: "Earned Leave", reason: "Personal time off for travel and rest",  from: "2026-05-20", to: "2026-05-22", days: 3, status: "Pending"  },
];

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

export default function FinanceHRM() {
  const [attSelected,   setAttSelected]   = useState(null);
  const [leaveSelected, setLeaveSelected] = useState(null);
  const [active, setActive] = useState("Attendance");

  // Show only the current user's attendance in Finance HRM.
  // For demo/mock data we treat "Finance Manager" as self.
  const myAttendanceRows = ATT_ROWS.filter(r => r.role === "Finance Manager");

  // derive KPIs from attendance rows (department-wide)
  const totalRecords = ATT_ROWS.length;
  const presentCount = ATT_ROWS.filter(r => ["Present", "Active", "Working"].includes(r.status)).length;
  const absentCount = ATT_ROWS.filter(r => r.status === "Absent").length;
  const leaveCount = ATT_ROWS.filter(r => r.status === "Leave").length;
  const avgPerf = "92%";

  const kpi = [
    { title: "Present",         value: String(presentCount), accent: KPI_ACCENTS[1], icon: KPI_ICONS[1] },
    { title: "Absent",          value: String(absentCount),  accent: KPI_ACCENTS[3], icon: KPI_ICONS[3] },
    { title: "Total Leave Days",        value: String(leaveCount),   accent: KPI_ACCENTS[2], icon: KPI_ICONS[2] },
    { title: "Avg Performance", value: avgPerf,              accent: KPI_ACCENTS[4], icon: KPI_ICONS[4] },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Finance" secondaryText="HRM" size={12} />
        {kpi.map((k) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={k.icon} accentColor={k.accent} size={3} />
        ))}
      </DashGrid>

      {/* HRM Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {[
          { key: "Attendance", label: "Attendance", icon: CalendarCheck },
          { key: "Leaves", label: "Leaves", icon: Umbrella },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              active === key
                ? "bg-[#2a465a] text-white shadow"
                : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
            }`}
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {active === "Attendance" && (
        <>
          {/* Attendance widget */}
          <AttendanceWidget />

          {/* Attendance table */}
          <DataTable
            title="Attendance Records"
            columns={ATT_COLS}
            rows={myAttendanceRows}
            actions={[{
              icon: <Eye size={15}/>, tooltip: "View",
              variant: "ghost",
              onClick: (row) => { setAttSelected(row); openModal("fin-att-view"); },
            }]}
            size={12} pageSize={5} searchable exportable exportFileName="finance-attendance"
            filters={[
              { title: "Status", type: "toggle", key: "status", options: ["Present","Working","Absent","Leave"] },
            ]}
          />
        </>
      )}

      {active === "Leaves" && (
        <>
          {/* Leave table */}
          <DataTable
            title="Leave Records"
            columns={LEAVE_COLS}
            rows={LEAVE_ROWS}
            actions={[{
              icon: <Eye size={15}/>, tooltip: "View",
              variant: "ghost",
              onClick: (row) => { setLeaveSelected(row); openModal("fin-leave-view"); },
            }]}
            size={12} pageSize={10} searchable exportable exportFileName="finance-leaves"
            filters={[
              { title: "Status", type: "toggle", key: "status", options: ["Approved","Pending","Rejected"] },
            ]}
          />
        </>
      )}

      {/* Attendance modal */}
      <Modal id="fin-att-view" title="Attendance Details" size="md">
        {attSelected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={attSelected.name} subtitle={attSelected.role} meta={`Status: ${attSelected.status}`} />
            <ModalGrid title="Attendance Info" cols={2}>
              <ModalData label="Clock In"  value={attSelected.clockIn}  />
              <ModalData label="Clock Out" value={attSelected.clockOut} />
              <ModalData label="Hours"     value={attSelected.hours}    />
              <ModalData label="Status"    value={attSelected.status}   />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("fin-att-view")} />
            </div>
          </div>
        )}
      </Modal>

      {/* Leave modal */}
      <Modal id="fin-leave-view" title="Leave Details" size="md">
        {leaveSelected && (
          <div className="flex flex-col gap-4">
            <ModalGrid title="Leave Info" cols={2}>
              <ModalData label="Name"       value={leaveSelected.name}   />
              <ModalData label="Leave Type" value={leaveSelected.type}   />
              <ModalData label="From"       value={leaveSelected.from}   />
              <ModalData label="To"         value={leaveSelected.to}     />
              <ModalData label="Days"       value={String(leaveSelected.days)} />
              <ModalData label="Status"     value={leaveSelected.status} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("fin-leave-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
