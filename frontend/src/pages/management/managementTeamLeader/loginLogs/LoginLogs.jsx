import { useState, useEffect, useCallback } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, Button,
} from "../../../../components/shared/Common_Components";
import logService from "../../../../services/logService";
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
  const [loading, setLoading] = useState(true);
  const [myLogs, setMyLogs] = useState([]);
  const [teamLogs, setTeamLogs] = useState([]);
  const [stats, setStats] = useState({
    myLoginsToday: 0,
    myTotalLogins: 0,
    teamLoginsToday: 0,
    teamTotalLogins: 0
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await logService.getLoginLogs();
      if (res.statusCode === 200) {
        setMyLogs(res.data.myLogs);
        setTeamLogs(res.data.teamLogs);
        setStats(res.data.kpiStats);
      }
    } catch (err) {
      console.error("Failed to fetch login logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const actions = [
    {
      icon: <Eye size={15} />, tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => { setSelected(row); openModal("mtl-log-view"); },
    },
  ];

  const kpiLogs = [
    { title: "My Logins (Today)",    value: String(stats.myLoginsToday),   accent: "#3b82f6" },
    { title: "My Total Logins",      value: String(stats.myTotalLogins),  accent: "#8b5cf6" },
    { title: "Team Logins (Today)",  value: String(stats.teamLoginsToday),  accent: "#22c55e" },
    { title: "Team Total Logins",    value: String(stats.teamTotalLogins), accent: "#f59e0b" },
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
        rows={myLogs}
        userProfile="name"
        actions={actions}
        size={12}
        pageSize={5}
        searchable
        date
        loading={loading}
        exportable
        exportFileName="mtl_my_login_logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Rejected"] },
        ]}
      />

      {/* ── Employee logs ── */}
      <DataTable
        title="Team Login Logs"
        columns={LOG_COLS}
        rows={teamLogs}
        userProfile="name"
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        date
        loading={loading}
        exportable
        exportFileName="mtl_team_login_logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Rejected"] },
        ]}
      />

      {/* ── View modal ── */}
      <Modal id="mtl-log-view" title="Login Details" size="md">
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
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("mtl-log-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
