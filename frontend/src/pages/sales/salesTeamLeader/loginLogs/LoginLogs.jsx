import { useState, useEffect } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, Button,
} from "../../../../components/shared/Common_Components";
import logService from "../../../../services/logService";
import { LogIn, Users, UserCheck, History, Eye } from "lucide-react";

const kpiIcons   = [<LogIn size={22}/>, <UserCheck size={22}/>, <Users size={22}/>, <History size={22}/>];

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
  const [kpiStats, setKpiStats] = useState({
    myLoginsToday: 0,
    myTotalLogins: 0,
    teamLoginsToday: 0,
    teamTotalLogins: 0
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await logService.getLoginLogs();
      if (res.success && res.data) {
        setMyLogs(res.data.myLogs || []);
        setTeamLogs(res.data.teamLogs || []);
        if (res.data.kpiStats) {
          setKpiStats(res.data.kpiStats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch login logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actions = [
    {
      icon: <Eye size={15} />, tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => { setSelected(row); openModal("tl-log-view"); },
    },
  ];

  const kpiLogs = [
    { title: "My Logins (Today)",   value: String(kpiStats.myLoginsToday), accent: "#3b82f6" },
    { title: "My Total Logins",     value: String(kpiStats.myTotalLogins), accent: "#8b5cf6" },
    { title: "Team Logins Today",   value: String(kpiStats.teamLoginsToday), accent: "#22c55e" },
    { title: "Team Total Logins",   value: String(kpiStats.teamTotalLogins), accent: "#c52222ff" },
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
        loading={loading}
        size={12}
        pageSize={5}
        searchable
        date
        exportable
        exportFileName="my_login_logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Rejected"] },
        ]}
      />

      {/* ── Team executives' logs ── */}
      <DataTable
        title="Team Login Logs"
        columns={LOG_COLS}
        rows={teamLogs}
        userProfile="name"
        actions={actions}
        loading={loading}
        size={12}
        pageSize={10}
        searchable
        date
        exportable
        exportFileName="team_login_logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Rejected"] },
        ]}
      />

      {/* ── View modal ── */}
      <Modal id="tl-log-view" title="Login Details" size="md">
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
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("tl-log-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
