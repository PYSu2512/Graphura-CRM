import React, { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable, Grid, DataField, Select, Option,
  openModal, Modal, ModalData, ModalProfile,
} from "../../../../components/shared/Common_Components";
import { kpiLogs, loginLogRows } from "./LogsStore";
import { LogIn, Users, AlertTriangle, ShieldAlert } from "lucide-react";

const kpiIcons  = [<LogIn size={22}/>, <Users size={22}/>, <AlertTriangle size={22}/>, <ShieldAlert size={22}/>];
const kpiAccents = ["#3b82f6","#22c55e","#f59e0b","#f43f5e"];

const logCols = [
  { key: "name",     label: "User Name" },
  { key: "email",    label: "Email" },
  { key: "role",     label: "Role" },
  { key: "date",     label: "Login Date" },
  { key: "time",     label: "Login Time" },
  { key: "ip",       label: "IP Address" },
  { key: "location", label: "Location" },
  { key: "status",   label: "Status" },
];

export default function LoginLogs() {
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ role: "", date: "", status: "" });
  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const actions = [
    { label: "View Details", variant: "ghost", onClick: (row) => { setSelected(row); openModal("log-view-modal"); } },
  ];

  return (
    <div>
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Login" secondaryText="Logs" size={12} />
        {kpiLogs.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={k.value}
            icon={kpiIcons[i]} accentColor={kpiAccents[i]} size={3} />
        ))}
      </DashGrid>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Filters</p>
        <Grid cols={12} gap={4}>
          <div className="col-span-12 sm:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Role</label>
            <Select value={filters.role} onChange={(e) => set("role", e.target.value)} placeholder="All Roles" size={12}>
              <Option value="Executive"    label="Executive" />
              <Option value="Team Leader"  label="Team Leader" />
              <Option value="Sales Manager"label="Sales Manager" />
            </Select>
          </div>
          <DataField label="Date" id="logDate" type="date" size={4}
            value={filters.date} onChange={(e) => set("date", e.target.value)} />
          <div className="col-span-12 sm:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Status</label>
            <Select value={filters.status} onChange={(e) => set("status", e.target.value)} placeholder="All Statuses" size={12}>
              <Option value="Active"   label="Success" />
              <Option value="Rejected" label="Failed" />
              <Option value="Pending"  label="Suspicious" />
            </Select>
          </div>
        </Grid>
      </div>

      <DataTable
        title="Login Log Records"
        columns={logCols}
        rows={loginLogRows}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        filters={[
          { title: "Role",   type: "toggle", key: "role",   options: ["Executive","Team Leader"] },
          { title: "Status", type: "toggle", key: "status", options: ["Active","Rejected","Pending"] },
        ]}
      />

      <Modal id="log-view-modal" title="Login Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile name={selected.name} subtitle={`${selected.role} · ${selected.location}`} meta={`${selected.date} at ${selected.time}`} />
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Email"        value={selected.email} />
              <ModalData label="Role"         value={selected.role} />
              <ModalData label="Login Date"   value={selected.date} />
              <ModalData label="Login Time"   value={selected.time} />
              <ModalData label="IP Address"   value={selected.ip} />
              <ModalData label="Location"     value={selected.location} />
              <ModalData label="Status"       value={selected.status} />
              <ModalData label="Device Info"  value={selected.device} />
              <ModalData label="Latitude"     value="19.0760° N" />
              <ModalData label="Longitude"    value="72.8777° E" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}