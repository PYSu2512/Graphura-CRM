import { useState, useMemo, useEffect } from "react";
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

const statusOptions = ["All", "Success", "Failed"];

export default function LoginLogs() {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        // Placeholder until actual backend logs are implemented
        setLogs([]);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // ── Stats ──
  const totalLogins = logs.length;
  const failedAttempts = logs.filter((l) => l.status === "Failed").length;
  const uniqueUsers = new Set(
    logs.filter((l) => l.user !== "Unknown").map((l) => l.user)
  ).size;
  const activeSessions = logs.filter(
    (l) => l.status === "Success"
  ).length;

  // ── Filter Logic ──
  const filtered = useMemo(() => {
    return logs.filter((log) => {
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

