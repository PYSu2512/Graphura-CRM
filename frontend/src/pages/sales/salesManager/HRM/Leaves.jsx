import React, { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable,
  openModal, Modal, ModalData, ModalProfile,
} from "../../../../components/shared/Common_Components";
import { kpiLeaves, leaveRows } from "./HrmStore";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

const kpiIcons = [<Calendar size={22} />, <CheckCircle size={22} />, <Clock size={22} />, <XCircle size={22} />];
const kpiAccents = ["#3b82f6","#22c55e","#f59e0b","#f43f5e"];

const leaveCols = [
  { key: "name",       label: "Employee Name" },
  { key: "role",       label: "Role" },
  { key: "teamLeader", label: "Team Leader" },
  { key: "type",       label: "Leave Type" },
  { key: "from",       label: "From Date" },
  { key: "to",         label: "To Date" },
  { key: "days",       label: "Total Days" },
  { key: "reason",     label: "Reason" },
  { key: "status",     label: "Status" },
];

export default function Leaves() {
  const [selected, setSelected] = useState(null);

  const actions = [
    { label: "View",   variant: "ghost",   onClick: (row) => { setSelected(row); openModal("leave-view-modal"); } },
    { label: "Export", variant: "primary", onClick: () => alert("Export triggered (UI only)") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="HRM" secondaryText="Leave Records" size={12} />
        {kpiLeaves.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={kpiIcons[i]} accentColor={kpiAccents[i]} size={3} />
        ))}
      </DashGrid>

      <DataTable
        title="Leave History"
        columns={leaveCols}
        rows={leaveRows}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        exportable
        exportFileName="leave-report"
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Approved","Pending","Rejected"] },
          { title: "Leave Type", type: "toggle", key: "type",   options: ["Sick Leave","Casual Leave","Earned Leave"] },
        ]}
      />

      <Modal id="leave-view-modal" title="Leave Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.name} subtitle={`${selected.role} · ${selected.teamLeader}`} />
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Leave Type"  value={selected.type} />
              <ModalData label="From Date"   value={selected.from} />
              <ModalData label="To Date"     value={selected.to} />
              <ModalData label="Total Days"  value={selected.days} />
              <ModalData label="Reason"      value={selected.reason} />
              <ModalData label="Status"      value={selected.status} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}