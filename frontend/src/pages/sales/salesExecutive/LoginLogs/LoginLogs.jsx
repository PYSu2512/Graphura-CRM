import { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, Button,
} from "../../../../components/shared/Common_Components";
import { kpiLogs, myLogRows } from "./LogsStore";
import { LogIn, UserCheck, Eye, MapPin, Shield } from "lucide-react";

const kpiIcons   = [<LogIn size={22}/>, <UserCheck size={22}/>, <Shield size={22}/>, <MapPin size={22}/>];
const kpiAccents = ["#3b82f6", "#8b5cf6", "#22c55e", "#f43f5e"];

const logCols = [
  { key: "name",      label: "User Name"   },
  { key: "email",     label: "Email"       },
  { key: "role",      label: "Role"        },
  { key: "date",      label: "Login Date"  },
  { key: "time",      label: "Login Time"  },
  { key: "ip",        label: "IP Address"  },
  { key: "latitude",  label: "Latitude"    },
  { key: "longitude", label: "Longitude"   },
];

export default function LoginLogs() {
  const [selected, setSelected] = useState(null);

  const actions = [
    {
      icon: <Eye size={15} />, tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => { setSelected(row); openModal("log-view-modal"); },
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="My Login" secondaryText="Logs" size={12} />
        {kpiLogs.map((k, i) => (
          <DashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={kpiIcons[i]}
            accentColor={kpiAccents[i]}
            size={3}
          />
        ))}
      </DashGrid>

      {/* ── My Logs Table ── */}
      <DataTable
        title="My Login History"
        columns={logCols}
        rows={myLogRows}
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        date
        exportable
        exportFileName="my-login-logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Rejected", "Pending"] },
        ]}
      />

      {/* ── View Modal ── */}
      <Modal id="log-view-modal" title="Login Details" size="md">
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
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("log-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
