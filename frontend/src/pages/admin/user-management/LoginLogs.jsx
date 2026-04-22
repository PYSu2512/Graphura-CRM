import { useState, useMemo } from "react";
import {
  LogIn,
  AlertTriangle,
  Users,
  Wifi,
  Download,
  Search,
  Calendar,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard as DashCard,
  EnhancedDataTable as DataTable,
} from "../../../components/shared/Common_Components";

// ── Mock login log data ──
const mockLogs = [
  { id: 1, user: "Rahul Sharma", ip: "192.168.1.45", device: "Chrome / Windows", location: "Mumbai", loginTime: "Apr 21, 2026 10:32 AM", status: "Success", logoutTime: "—" },
  { id: 2, user: "Priya Patel", ip: "10.0.0.12", device: "Safari / macOS", location: "Delhi", loginTime: "Apr 21, 2026 10:15 AM", status: "Success", logoutTime: "Apr 21, 2026 10:45 AM" },
  { id: 3, user: "Unknown", ip: "203.45.67.89", device: "Firefox / Linux", location: "Kolkata", loginTime: "Apr 21, 2026 09:58 AM", status: "Failed", logoutTime: "—" },
  { id: 4, user: "Amit Verma", ip: "172.16.0.8", device: "Chrome / Android", location: "Bangalore", loginTime: "Apr 21, 2026 09:45 AM", status: "Success", logoutTime: "—" },
  { id: 5, user: "Sneha Joshi", ip: "192.168.1.92", device: "Edge / Windows", location: "Pune", loginTime: "Apr 21, 2026 09:30 AM", status: "Success", logoutTime: "Apr 21, 2026 11:00 AM" },
  { id: 6, user: "Unknown", ip: "45.123.45.67", device: "Chrome / Windows", location: "Chennai", loginTime: "Apr 21, 2026 09:20 AM", status: "Failed", logoutTime: "—" },
  { id: 7, user: "Vikram Das", ip: "10.0.0.34", device: "Safari / iOS", location: "Hyderabad", loginTime: "Apr 21, 2026 09:05 AM", status: "Success", logoutTime: "—" },
  { id: 8, user: "Neha Singh", ip: "192.168.1.67", device: "Chrome / Windows", location: "Mumbai", loginTime: "Apr 21, 2026 08:50 AM", status: "Success", logoutTime: "Apr 21, 2026 09:30 AM" },
  { id: 9, user: "Unknown", ip: "78.90.12.34", device: "Firefox / Windows", location: "Jaipur", loginTime: "Apr 21, 2026 08:30 AM", status: "Failed", logoutTime: "—" },
  { id: 10, user: "Arjun Kumar", ip: "192.168.2.11", device: "Chrome / macOS", location: "Delhi", loginTime: "Apr 21, 2026 08:15 AM", status: "Success", logoutTime: "—" },
  { id: 11, user: "Kavita Reddy", ip: "10.0.1.22", device: "Chrome / Windows", location: "Bangalore", loginTime: "Apr 20, 2026 06:45 PM", status: "Success", logoutTime: "Apr 20, 2026 08:00 PM" },
  { id: 12, user: "Ravi Mehta", ip: "172.16.0.45", device: "Safari / macOS", location: "Mumbai", loginTime: "Apr 20, 2026 05:30 PM", status: "Success", logoutTime: "Apr 20, 2026 07:15 PM" },
  { id: 13, user: "Unknown", ip: "112.34.56.78", device: "Tor Browser / Linux", location: "Unknown", loginTime: "Apr 20, 2026 04:00 PM", status: "Failed", logoutTime: "—" },
  { id: 14, user: "Deepika Nair", ip: "192.168.1.88", device: "Chrome / Android", location: "Chennai", loginTime: "Apr 20, 2026 03:15 PM", status: "Success", logoutTime: "Apr 20, 2026 05:00 PM" },
  { id: 15, user: "Suresh Gupta", ip: "10.0.0.5", device: "Chrome / Windows", location: "Delhi", loginTime: "Apr 20, 2026 02:30 PM", status: "Success", logoutTime: "—" },
];

const statusOptions = ["All", "Success", "Failed"];

export default function LoginLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Stats ──
  const totalLogins = mockLogs.length;
  const failedAttempts = mockLogs.filter((l) => l.status === "Failed").length;
  const uniqueUsers = new Set(
    mockLogs.filter((l) => l.user !== "Unknown").map((l) => l.user)
  ).size;
  const activeSessions = mockLogs.filter(
    (l) => l.status === "Success" && l.logoutTime === "—"
  ).length;

  // ── Filtered logs ──
  const filtered = useMemo(() => {
    return mockLogs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        log.user.toLowerCase().includes(q) ||
        log.ip.includes(q) ||
        log.location.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "All" || log.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter]);

  // ── Table columns ──
  const columns = [
    { key: "user", label: "User" },
    { key: "ip", label: "IP Address" },
    { key: "device", label: "Device / Browser" },
    { key: "location", label: "Location" },
    { key: "loginTime", label: "Login Time" },
    { key: "status", label: "Status" },
    { key: "logoutTime", label: "Logout Time" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2a465a]">Login Logs</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor all login activity and security events
          </p>
        </div>
        <button
          onClick={() => alert("Export CSV coming soon")}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:-translate-y-0.5 active:scale-95 w-fit"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <DashGrid cols={12} gap={4}>
        <DashCard
          title="Total Logins (24h)"
          value={String(totalLogins)}
          icon={<LogIn size={22} />}
          accentColor="#38bdf8"
          size={3}
        />
        <DashCard
          title="Failed Attempts"
          value={String(failedAttempts)}
          icon={<AlertTriangle size={22} />}
          accentColor="#f43f5e"
          size={3}
        />
        <DashCard
          title="Unique Users"
          value={String(uniqueUsers)}
          icon={<Users size={22} />}
          accentColor="#3b82f6"
          size={3}
        />
        <DashCard
          title="Active Sessions"
          value={String(activeSessions)}
          icon={<Wifi size={22} />}
          accentColor="#22c55e"
          size={3}
        />
      </DashGrid>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Date range */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400 flex-shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-xs text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
            />
            <span className="text-xs text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 text-xs text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 transition"
            />
          </div>
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Status:
          </span>
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-200 ${
                statusFilter === s
                  ? "bg-[#2a465a] text-white shadow-md"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Data Table ── */}
      <DataTable
        title="Login Log Records"
        columns={columns}
        rows={filtered}
        pageSize={5}
        importantColumnsCount={4}
      />
    </div>
  );
}

