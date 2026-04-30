import React, { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable,
  Grid, DataField, Select, Option,
  openModal, Modal, ModalData, ModalProfile,
} from "../../../../components/shared/Common_Components";
import { kpiAttendance, attendanceRows } from "./HrmStore";
import { Users, UserCheck, UserX, Clock, Calendar } from "lucide-react";

const kpiIcons = [
  <Users size={22} />, <UserCheck size={22} />, <UserX size={22} />,
  <Calendar size={22} />, <Clock size={22} />,
];
const kpiAccents = ["#3b82f6","#22c55e","#f43f5e","#f59e0b","#8b5cf6"];

const attCols = [
  { key: "name",      label: "Employee Name" },
  { key: "role",      label: "Role" },
  { key: "teamLeader",label: "Team Leader" },
  { key: "date",      label: "Date" },
  { key: "clockIn",   label: "Clock In" },
  { key: "clockOut",  label: "Clock Out" },
  { key: "hours",     label: "Working Hours" },
  { key: "status",    label: "Status" },
];

export default function Attendance() {
  const [selected, setSelected] = useState(null);

  const actions = [
    { label: "View",   variant: "ghost",   onClick: (row) => { setSelected(row); openModal("att-view-modal"); } },
    { label: "Export", variant: "primary", onClick: () => alert("Export triggered (UI only)") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Attendance" size={12} />
        {kpiAttendance.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={kpiIcons[i]} accentColor={kpiAccents[i]} size={2} />
        ))}
      </DashGrid>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Filters</p>
        <Grid cols={12} gap={4}>
          <DataField label="Date" id="attDate" type="date" size={3} />
          <div className="col-span-12 sm:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Team Leader</label>
            <Select placeholder="All Team Leaders" size={12} value="" onChange={() => {}}>
              <Option value="Ankit Verma" label="Ankit Verma" />
              <Option value="Sonal Gupta" label="Sonal Gupta" />
              <Option value="Nisha Patel" label="Nisha Patel" />
            </Select>
          </div>
          <div className="col-span-12 sm:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Role</label>
            <Select placeholder="All Roles" size={12} value="" onChange={() => {}}>
              <Option value="Executive"   label="Executive" />
              <Option value="Team Leader" label="Team Leader" />
            </Select>
          </div>
          <div className="col-span-12 sm:col-span-3 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Status</label>
            <Select placeholder="All Statuses" size={12} value="" onChange={() => {}}>
              <Option value="Active"   label="Present" />
              <Option value="Rejected" label="Absent" />
              <Option value="Pending"  label="Late" />
            </Select>
          </div>
        </Grid>
      </div>

      <DataTable
        title="Attendance Records"
        columns={attCols}
        rows={attendanceRows}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        exportable
        exportFileName="attendance-report"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Pending", "Rejected"] },
          { title: "Role",   type: "toggle", key: "role",   options: ["Executive", "Team Leader"] },
        ]}
      />

      <Modal id="att-view-modal" title="Attendance Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.name} subtitle={`${selected.role} · ${selected.teamLeader}`} />
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Date"          value={selected.date} />
              <ModalData label="Clock In"      value={selected.clockIn} />
              <ModalData label="Clock Out"     value={selected.clockOut} />
              <ModalData label="Working Hours" value={selected.hours} />
              <ModalData label="Status"        value={selected.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}