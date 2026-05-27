import { useState, useEffect } from "react";
import {
  Heading, DashGrid, EnhancedDashCard, DataTable,
  openModal, closeModal, Modal, ModalData, ModalProfile, ModalGrid, Button,
} from "../../components/shared/Common_Components";
import { LogIn, UserCheck, Users, Eye, Loader2 } from "lucide-react";
import logService from "../../services/logService";
import { toast } from "react-hot-toast";

const COLS = [
  { key: "name",      label: "User Name"   },
  { key: "email",     label: "Email"       },
  { key: "role",      label: "Role"        },
  { key: "date",      label: "Login Date"  },
  { key: "time",      label: "Login Time"  },
  { key: "ip",        label: "IP Address"  },
  { key: "latitude",  label: "Latitude"    },
  { key: "longitude", label: "Longitude"   },
];

export default function FinanceLoginLogs() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
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
        setLogs(res.data.myLogs || []);
        if (res.data.kpiStats) {
          setStats(res.data.kpiStats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch login logs:", err);
      toast.error("Failed to load login logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const kpi = [
    { title: "My Logins (Today)",   value: String(stats.myLoginsToday), accent: "#3b82f6", icon: <LogIn size={22}/> },
    { title: "My Total Logins",     value: String(stats.myTotalLogins), accent: "#8b5cf6", icon: <UserCheck size={22}/> },
    { title: "Team Logins Today",   value: String(stats.teamLoginsToday), accent: "#22c55e", icon: <Users size={22}/> },
    { title: "Team Total Logins",   value: String(stats.teamTotalLogins), accent: "#f43f5e", icon: <Users size={22}/> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Login Logs" size={12} />
        {kpi.map((k) => (
          <EnhancedDashCard key={k.title} title={k.title} value={k.value}
            icon={k.icon} accentColor={k.accent} size={3} />
        ))}
      </DashGrid>

      <DataTable
        title="My Logs"
        columns={COLS}
        rows={logs}
        loading={loading}
        actions={[{
          icon: <Eye size={15}/>, tooltip: "View Details",
          variant: "ghost",
          onClick: (row) => { setSelected(row); openModal("fin-log-view"); },
        }]}
        size={12} pageSize={10} searchable date exportable exportFileName="finance-login-logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Active", "Rejected"] },
        ]}
      />

      <Modal id="fin-log-view" title="Login Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selected.name}
              subtitle={selected.role}
              meta={`${selected.date} at ${selected.time}`}
            />
            <ModalGrid title="Login Info" cols={2}>
              <ModalData label="Email"       value={selected.email}     />
              <ModalData label="Role"        value={selected.role}      />
              <ModalData label="Login Date"  value={selected.date}      />
              <ModalData label="Login Time"  value={selected.time}      />
              <ModalData label="IP Address"  value={selected.ip}        />
              <ModalData label="Status"      value={selected.status}    />
              <ModalData label="Latitude"    value={selected.latitude}  />
              <ModalData label="Longitude"   value={selected.longitude} />
             <ModalData label="Device"      value={selected.device}    /> 
            </ModalGrid>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("fin-log-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
