import { useState } from "react";
import {
  DashGrid, DashCard, DataTable, Modal, ModalProfile, ModalGrid, ModalData, Button,
  openModal, closeModal,
} from "../../../../components/shared/Common_Components.jsx";
import {
  CheckCircle2, XCircle, Clock, Palmtree, Eye, Users,
} from "lucide-react";
import { attendanceRecords, todayAttendance, ATTENDANCE_STATUS } from "./teamStore";

const COLS = [
  { key: "name",     label: "Executive" },
  { key: "date",     label: "Date" },
  { key: "clockIn",  label: "Clock In" },
  { key: "clockOut", label: "Clock Out" },
  { key: "hours",    label: "Hours" },
  { key: "status",   label: "Status" }, // auto-renders as colored badge
];

export default function Attendance() {
  const [viewRow, setViewRow] = useState(null);

  const present = todayAttendance.filter((r) => r.status === "Present").length;
  const late    = todayAttendance.filter((r) => r.status === "Late").length;
  const absent  = todayAttendance.filter((r) => r.status === "Absent").length;
  const leave   = todayAttendance.filter((r) => r.status === "Leave").length;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Today's KPIs ─────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <DashCard title="Present Today" value={String(present)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" size={3} />
        <DashCard title="Late Today"    value={String(late)}    icon={<Clock        size={22} />} accentColor="#f59e0b" size={3} />
        <DashCard title="Absent Today"  value={String(absent)}  icon={<XCircle      size={22} />} accentColor="#f43f5e" size={3} />
        <DashCard title="On Leave"      value={String(leave)}   icon={<Palmtree     size={22} />} accentColor="#8b5cf6" size={3} />
      </DashGrid>

      <p className="text-xs text-slate-500 -mt-2 flex items-center gap-1.5">
        <Users size={13} className="text-slate-400" />
        Showing attendance for the last {new Set(attendanceRecords.map((r) => r.date)).size} working days
      </p>

      {/* ── Attendance log ───────────────────────────────────────────────── */}
      <DataTable
        title="Team Attendance"
        columns={COLS}
        rows={attendanceRecords}
        size={12}
        pageSize={12}
        searchable
        exportable
        exportFileName="team_attendance"
        filters={[
          { title: "Status",    type: "toggle", key: "status", options: ATTENDANCE_STATUS },
          { title: "Executive", type: "select", key: "name",   options: [...new Set(attendanceRecords.map((r) => r.name))] },
        ]}
        actions={[
          {
            icon: <Eye size={15} />, tooltip: "View", variant: "ghost",
            onClick: (row) => { setViewRow(attendanceRecords.find((r) => r.id === row.id)); openModal("tl-att-view"); },
          },
        ]}
      />

      {/* ── View modal ───────────────────────────────────────────────────── */}
      <Modal id="tl-att-view" title="Attendance Detail" size="sm">
        {viewRow && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={viewRow.name}
              subtitle={`${viewRow.role} · ${viewRow.status}`}
              meta={`Date: ${viewRow.date}`}
            />
            <ModalGrid title="Clock" cols={2}>
              <ModalData label="Clock In"  value={viewRow.clockIn} />
              <ModalData label="Clock Out" value={viewRow.clockOut} />
              <ModalData label="Hours"     value={viewRow.hours} />
              <ModalData label="Status"    value={viewRow.status} />
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="primary" size={3} onClick={() => closeModal("tl-att-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
