import React, { useState } from "react";
import {
  Heading, DashGrid, DataTable,
  openModal, Modal, ModalData, ModalProfile, Button,
} from "../../../../components/shared/Common_Components";
import { approvalRows } from "./HrmStore";

const approvalCols = [
  { key: "name",       label: "Employee Name" },
  { key: "role",       label: "Role" },
  { key: "teamLeader", label: "Team Leader" },
  { key: "type",       label: "Leave Type" },
  { key: "dates",      label: "Requested Dates" },
  { key: "days",       label: "Total Days" },
  { key: "appliedOn",  label: "Applied On" },
  { key: "reason",     label: "Reason" },
  { key: "status",     label: "Status" },
];

export default function Approvals() {
  const [rows, setRows] = useState(approvalRows);
  const [selected, setSelected] = useState(null);

  const changeStatus = (row, newStatus) => {
    setRows((prev) => prev.map((r) => r.name === row.name && r.dates === row.dates
      ? { ...r, status: newStatus } : r
    ));
  };

  const actions = [
    { label: "View",    variant: "ghost",   onClick: (row) => { setSelected(row); openModal("approval-view-modal"); } },
    { label: "Approve", variant: "primary", onClick: (row) => changeStatus(row, "Approved") },
    { label: "Reject",  variant: "danger",  onClick: (row) => changeStatus(row, "Rejected") },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Leave" secondaryText="Approvals" size={12} />
      </DashGrid>

      <DataTable
        title="Pending Leave Requests"
        columns={approvalCols}
        rows={rows}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        filters={[
          { title: "Status",     type: "toggle", key: "status", options: ["Pending","Approved","Rejected"] },
          { title: "Leave Type", type: "toggle", key: "type",   options: ["Sick Leave","Casual Leave","Earned Leave"] },
        ]}
      />

      <Modal id="approval-view-modal" title="Leave Request Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.name} subtitle={`${selected.role} · ${selected.teamLeader}`} meta={`Applied: ${selected.appliedOn}`} />
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Leave Type"       value={selected.type} />
              <ModalData label="Requested Dates"  value={selected.dates} />
              <ModalData label="Total Days"       value={selected.days} />
              <ModalData label="Status"           value={selected.status} />
              <div className="col-span-2">
                <ModalData label="Reason" value={selected.reason} />
              </div>
            </div>
            {selected.status === "Pending" && (
              <div className="flex gap-3 pt-2">
                <Button text="Approve" variant="primary" size={6} onClick={() => { changeStatus(selected, "Approved"); setSelected((s) => ({ ...s, status: "Approved" })); }} />
                <Button text="Reject"  variant="danger"  size={6} onClick={() => { changeStatus(selected, "Rejected"); setSelected((s) => ({ ...s, status: "Rejected" })); }} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}