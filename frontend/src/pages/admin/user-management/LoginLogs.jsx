/**
 * LoginLogs.jsx — Admin panel
 * Fetches all user login logs for this admin's tenant from the real backend.
 */

import { useState, useEffect, useCallback } from "react";
import { LogIn, Calendar, Users, MapPin, Download, RefreshCw } from "lucide-react";
import {
  DashGrid, EnhancedDashCard, DataTable,
} from "../../../components/shared/Common_Components";
import apiClient from "../../../services/apiClient";

export default function LoginLogs() {
  const [logs,    setLogs]    = useState([]);
  const [stats,   setStats]   = useState({ total: 0, todayLogins: 0, uniqueUsers: 0, uniqueIPs: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/users/login-logs?limit=200");
      setLogs(res.data?.data?.logs   || []);
      setStats(res.data?.data?.stats || { total: 0, todayLogins: 0, uniqueUsers: 0, uniqueIPs: 0 });
    } catch (err) {
      console.error("Failed to fetch login logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExport = () => {
    const csv = "Username,Role,Date & Time,IP Address,Latitude,Longitude,Device\n" +
      logs.map((l) => `${l.username},${l.role},${l.dateTime},${l.ip},${l.latitude},${l.longitude},${l.device}`).join("\n");
    const a = document.createElement("a");
    a.href = encodeURI("data:text/csv;charset=utf-8," + csv);
    a.download = "login_logs.csv"; a.click();
  };

  // Get unique role values from real logs for the filter
  const uniqueRoles = [...new Set(logs.map((l) => l.role).filter(Boolean))].sort();

  const columns = [
    { key: "username", label: "Username"   },
    { key: "role",     label: "Role"       },
    { key: "dateTime", label: "Date & Time"},
    { key: "ip",       label: "IP Address" },
    { key: "latitude", label: "Latitude"   },
    { key: "longitude",label: "Longitude"  },
    {
      key: "isSuccess", label: "Status",
      render: (v) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
          v ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
        }`}>
          {v ? "Success" : "Failed"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">Login Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">Monitor all login activity with location tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLogs}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Logins"   value={loading ? "—" : String(stats.total)}       icon={<LogIn size={22}/>}     accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="Today's Logins" value={loading ? "—" : String(stats.todayLogins)} icon={<Calendar size={22}/>}  accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Unique Users"   value={loading ? "—" : String(stats.uniqueUsers)} icon={<Users size={22}/>}     accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Unique IPs"     value={loading ? "—" : String(stats.uniqueIPs)}   icon={<MapPin size={22}/>}    accentColor="#f59e0b" size={3} />
      </DashGrid>

      <DataTable
        title="Login Activity Records"
        columns={columns}
        rows={logs}
        pageSize={10}
        searchable
        size={12}
        loading={loading}
        filters={uniqueRoles.length > 0 ? [
          { title: "Role", type: "toggle", key: "role", options: uniqueRoles },
          { title: "Status", type: "toggle", key: "isSuccess",
            options: [true, false],
            fn: (row, values) => values.some((v) => String(row.isSuccess) === String(v)),
          },
        ] : []}
        exportable
        exportFileName="login_logs"
      />
    </div>
  );
}
