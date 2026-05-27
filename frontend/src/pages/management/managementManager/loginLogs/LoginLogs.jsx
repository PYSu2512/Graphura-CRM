import { useState } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, Button,
} from "../../../../components/shared/Common_Components";
import { kpiLogs, myLogRows, teamLogRows } from "./logsStore";
import { LogIn, Users, UserCheck, History, Eye } from "lucide-react";

const kpiIcons = [<LogIn size={22} />, <UserCheck size={22} />, <Users size={22} />, <History size={22} />];

const LOG_COLS = [
  { key: "name",      label: "User Name" },
  { key: "email",     label: "Email" },
  { key: "role",      label: "Role" },
  { key: "date",      label: "Login Date" },
  { key: "time",      label: "Login Time" },
  { key: "ip",        label: "IP Address" },
  { key: "latitude",  label: "Latitude" },
  { key: "longitude", label: "Longitude" },
];

export default function LoginLogs() {
  const [selected, setSelected] = useState(null);

  const actions = [
    {
      icon: <Eye size={15} />, tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => { setSelected(row); openModal("mm-log-view"); },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Login" secondaryText="Logs" size={12} />
        {kpiLogs.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={kpiIcons[i]}
            accentColor={k.accent}
            size={3}
          />
        ))}
      </DashGrid>

      {/* ── My logs ── */}
      <DataTable
        title="My Login Logs"
        columns={LOG_COLS}
        rows={myLogRows}
        userProfile="name"
        actions={actions}
        size={12}
        pageSize={5}
        searchable
        date
        exportable
        exportFileName="mm_my_login_logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Rejected", "Pending"] },
        ]}
      />

      {/* ── TL + Employee logs ── */}
      <DataTable
        title="Department Login Logs"
        columns={LOG_COLS}
        rows={teamLogRows}
        userProfile="name"
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        date
        exportable
        exportFileName="mm_dept_login_logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Rejected", "Pending"] },
          { title: "Role",   type: "toggle", key: "role",   options: [...new Set(teamLogRows.map((r) => r.role))] },
        ]}
      />

      {/* ── View modal ── */}
      <Modal id="mm-log-view" title="Login Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.name}
              subtitle={`${selected.role} · ${selected.latitude}, ${selected.longitude}`}
              meta={`${selected.date} at ${selected.time}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Email"       value={selected.email} />
              <ModalData label="Role"        value={selected.role} />
              <ModalData label="Login Date"  value={selected.date} />
              <ModalData label="Login Time"  value={selected.time} />
              <ModalData label="IP Address"  value={selected.ip} />
              <ModalData label="Status"      value={selected.status} />
              <ModalData label="Latitude"    value={selected.latitude} />
              <ModalData label="Longitude"   value={selected.longitude} />
              <ModalData label="Device Info" value={selected.device} />
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mm-log-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
