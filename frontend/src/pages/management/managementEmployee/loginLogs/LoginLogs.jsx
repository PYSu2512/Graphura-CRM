import { Eye, LogIn, MapPin, Shield, UserCheck } from "lucide-react";
import { useState } from "react";
import {
    Button,
    closeModal,
    DashGrid,
    DataTable,
    EnhancedDashCard,
    Heading,
    Modal,
    ModalData,
    ModalProfile,
    openModal,
} from "../../../../components/shared/Common_Components.jsx";
import { loginKpiStats, loginLogs } from "./loginLogsStore";

const KPIS = [
  { title: "My Logins (Today)", key: "myLoginsToday" },
  { title: "My Total Logins", key: "myTotalLogins" },
  { title: "Active Sessions", value: "1" },
  { title: "Organization Logins", key: "myTotalLogins" },
];

const COLS = [
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "ip", label: "IP Address" },
  { key: "latitude", label: "Latitude" },
  { key: "longitude", label: "Longitude" },
  { key: "role", label: "User Role" },
];

export default function LoginLogs() {
  const [selected, setSelected] = useState(null);

  const kpiCards = [
    { title: "My Logins (Today)", value: String(loginKpiStats.myLoginsToday) },
    { title: "My Total Logins", value: String(loginKpiStats.myTotalLogins) },
    { title: "Active Sessions", value: "1" },
    { title: "Organization Logins", value: String(loginKpiStats.myTotalLogins) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="My Login Logs" secondaryText="Self only" size={12} />
        {kpiCards.map((stat, idx) => {
          const icons = [<LogIn size={22} />, <UserCheck size={22} />, <Shield size={22} />, <MapPin size={22} />];
          const accents = ["#3b82f6", "#8b5cf6", "#22c55e", "#f43f5e"];
          return (
            <EnhancedDashCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={icons[idx]}
              accentColor={accents[idx]}
              size={3}
            />
          );
        })}
      </DashGrid>

      <DataTable
        title="My Login History"
        columns={COLS}
        rows={loginLogs}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View Details",
            variant: "ghost",
            onClick: (row) => {
              setSelected(row);
              openModal("me-log-view-modal");
            },
          },
        ]}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="my_login_logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Rejected"] },
        ]}
      />

      <Modal id="me-log-view-modal" title="Login Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.name}
              subtitle={`${selected.role} · ${selected.latitude}, ${selected.longitude}`}
              meta={`${selected.date} at ${selected.time}`}
            />
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Email" value={selected.email} />
              <ModalData label="Role" value={selected.role} />
              <ModalData label="Login Date" value={selected.date} />
              <ModalData label="Login Time" value={selected.time} />
              <ModalData label="IP Address" value={selected.ip} />
              <ModalData label="Status" value={selected.status} />
              <ModalData label="Latitude" value={selected.latitude} />
              <ModalData label="Longitude" value={selected.longitude} />
              <ModalData label="Device Info" value={selected.device} />
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("me-log-view-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
