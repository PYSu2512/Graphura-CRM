import { useState, useMemo, useEffect } from "react";
import {
  LogIn,
  AlertTriangle,
  Users,
  Wifi,
  Download,
  Calendar,
  MapPin,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard,
  DataTable,
} from "../../../components/shared/Common_Components";

// ── Mock login logs with required fields ──
const mockLoginLogs = [
  { id: 1, username: "Rahul Sharma", role: "Sales Manager", dateTime: "2026-05-09 10:23:45", ip: "192.168.1.101", latitude: "19.0760", longitude: "72.8777" },
  { id: 2, username: "Neha Singh", role: "Team Leader", dateTime: "2026-05-09 09:45:12", ip: "192.168.1.102", latitude: "28.7041", longitude: "77.1025" },
  { id: 3, username: "Deepika Nair", role: "Sales Executive", dateTime: "2026-05-09 09:30:08", ip: "103.21.58.193", latitude: "13.0827", longitude: "80.2707" },
  { id: 4, username: "Anita Bose", role: "Sales Executive", dateTime: "2026-05-09 08:55:33", ip: "49.36.128.74", latitude: "22.5726", longitude: "88.3639" },
  { id: 5, username: "Vikram Desai", role: "Team Leader", dateTime: "2026-05-08 18:12:01", ip: "103.87.65.12", latitude: "17.3850", longitude: "78.4867" },
  { id: 6, username: "Admin User", role: "Admin", dateTime: "2026-05-08 17:40:22", ip: "192.168.1.1", latitude: "19.0760", longitude: "72.8777" },
  { id: 7, username: "Priya Mehta", role: "Finance Manager", dateTime: "2026-05-08 16:20:55", ip: "49.36.200.18", latitude: "23.0225", longitude: "72.5714" },
  { id: 8, username: "Kabir Singh", role: "Sales Executive", dateTime: "2026-05-08 15:05:10", ip: "103.21.58.200", latitude: "26.9124", longitude: "75.7873" },
  { id: 9, username: "Meera Joshi", role: "HR Manager", dateTime: "2026-05-08 14:30:44", ip: "192.168.1.105", latitude: "18.5204", longitude: "73.8567" },
  { id: 10, username: "Tarun Bhat", role: "Sales Manager", dateTime: "2026-05-07 11:15:30", ip: "49.36.128.90", latitude: "12.9716", longitude: "77.5946" },
  { id: 11, username: "Rahul Sharma", role: "Sales Manager", dateTime: "2026-05-07 09:10:05", ip: "192.168.1.101", latitude: "19.0760", longitude: "72.8777" },
  { id: 12, username: "Neha Singh", role: "Team Leader", dateTime: "2026-05-07 08:45:18", ip: "103.87.65.55", latitude: "28.7041", longitude: "77.1025" },
];

const roleOptions = ["All Roles", "Admin", "Sales Manager", "Team Leader", "Sales Executive", "Finance Manager", "HR Manager"];

export default function LoginLogs() {
  const [logs, setLogs] = useState(mockLoginLogs);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with real API call when backend endpoint is ready
  // useEffect(() => {
  //   const fetchLogs = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await loginService.getLogs();
  //       setLogs(response.data.logs);
  //     } catch (error) {
  //       console.error("Failed to fetch login logs:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchLogs();
  // }, []);

  // ── Stats ──
  const totalLogins = logs.length;
  const uniqueUsers = new Set(logs.map((l) => l.username)).size;
  const todayLogins = logs.filter((l) => l.dateTime.startsWith("2026-05-09")).length;
  const uniqueIPs = new Set(logs.map((l) => l.ip)).size;

  // ── Table columns — Username, Role, Date & Time, IP Address, Latitude, Longitude ──
  const columns = [
    { key: "username", label: "Username" },
    { key: "role", label: "Role" },
    { key: "dateTime", label: "Date & Time" },
    { key: "ip", label: "IP Address" },
    { key: "latitude", label: "Latitude" },
    { key: "longitude", label: "Longitude" },
  ];

  // ── Export ──
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Username,Role,Date & Time,IP Address,Latitude,Longitude\n" +
      logs.map(l => `${l.username},${l.role},${l.dateTime},${l.ip},${l.latitude},${l.longitude}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "login_logs_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">Login Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor all login activity with location tracking
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95 w-fit"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard
          title="Total Logins"
          value={String(totalLogins)}
          icon={<LogIn size={22} />}
          accentColor="#38bdf8"
          size={3}
        />
        <EnhancedDashCard
          title="Today's Logins"
          value={String(todayLogins)}
          icon={<Calendar size={22} />}
          accentColor="#3b82f6"
          size={3}
        />
        <EnhancedDashCard
          title="Unique Users"
          value={String(uniqueUsers)}
          icon={<Users size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <EnhancedDashCard
          title="Unique IPs"
          value={String(uniqueIPs)}
          icon={<MapPin size={22} />}
          accentColor="#f59e0b"
          size={3}
        />
      </DashGrid>

      {/* ── Data Table ── */}
      <DataTable
        title="Login Activity Records"
        columns={columns}
        rows={logs}
        pageSize={10}
        searchable
        size={12}
        filters={[
          { title: "Role", type: "select", key: "role", options: ["Admin", "Sales Manager", "Team Leader", "Sales Executive", "Finance Manager", "HR Manager"] },
        ]}
      />
    </div>
  );
}
