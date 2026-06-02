import { useMemo, useState, useEffect } from "react";
import {
  Shield,
  Eye,
  ShieldAlert,
  UserCheck,
  Map as MapIcon,
  Loader2,
} from "lucide-react";

import {
  Grid,
  Heading,
  DashGrid,
  EnhancedDashCard,
  Button,
  DataTable,
  Modal,
  ModalProfile,
  ModalData,
  ModalGrid,
  openModal,
  closeModal,
} from "./../../../components/shared/Common_Components";
import logService from "../../../services/logService";
import { toast } from "react-hot-toast";

const ROLE_DEPT = {
  "Admin": "Administration",
  "User": "General",
};

const ALL_LOGS = [
  {
    id: 1,
    user: "Alice Smith",
    email: "alice@example.com",
    role: "Admin",
    loginAt: "2023-10-27 08:30:00",
    logoutAt: "2023-10-27 17:00:00",
    status: "Success",
    device: "MacBook Pro",
    os: "macOS",
    browser: "Chrome",
    ip: "192.168.1.101",
    city: "New York",
    lat: 40.7128,
    lng: -74.0060,
  },
  {
    id: 2,
    user: "Bob Jones",
    email: "bob@example.com",
    role: "Admin",
    loginAt: "2023-10-27 09:15:00",
    logoutAt: null,
    status: "Pending",
    device: "Dell XPS",
    os: "Windows 11",
    browser: "Edge",
    ip: "192.168.1.102",
    city: "San Francisco",
    lat: 37.7749,
    lng: -122.4194,
  },
  {
    id: 3,
    user: "Charlie Brown",
    email: "charlie@example.com",
    role: "Admin",
    loginAt: "2023-10-27 10:05:00",
    logoutAt: null,
    status: "Failed",
    device: "iPhone 14",
    os: "iOS",
    browser: "Safari",
    ip: "192.168.1.103",
    city: "Chicago",
    lat: 41.8781,
    lng: -87.6298,
  }
];

const exportCSV = (data) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(row => Object.values(row).map(val => `"${val}"`).join(","));
  const csv = [headers, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "admin_logs.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const LoginLogs = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await logService.getAdminLoginLogs();
      if (res.success && res.data && res.data.logs) {
        const mapped = res.data.logs.map((l) => {
          const d = new Date(l.loginAt);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const dateVal = String(d.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${dateVal}`;
          const timeStr = d.toTimeString().split(' ')[0];

          return {
            id: l._id,
            user: l.admin?.name || 'Unknown',
            company: l.admin?.company?.name || '—',
            email: l.email || '—',
            role: l.role === 'ADMIN' ? 'Admin' : l.role,
            loginAt: `${dateStr} ${timeStr}`,
            logoutAt: null,
            status: l.isSuccess ? 'Success' : 'Failed',
            device: l.device || 'Unknown',
            os: '—',
            browser: '—',
            ip: l.ipAddress || '—',
            city: '—',
            lat: l.latitude || 0,
            lng: l.longitude || 0,
          };
        });

        // Make the order in latest to old logins
        mapped.sort((a, b) => new Date(b.loginAt) - new Date(a.loginAt));

        setLogs(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch admin login logs:", err);
      toast.error("Failed to load admin login logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // ── Admin-only logs (this page audits admin activity) ──
  const adminLogs = useMemo(
    () => logs.filter((log) => log.role === "Admin"),
    [logs],
  );

  // ── Stat cards ──
  const totalAdminLogins = adminLogs.length;
  const failedAttempts   = adminLogs.filter((l) => l.status === "Failed").length;
  const activeAdmins     = new Set(adminLogs.map((l) => l.email)).size;

  // ── Table rows + columns ──
  const tableRows = adminLogs.map((log) => ({
    ...log,
    department: ROLE_DEPT[log.role] ?? "—",
    date: log.loginAt.split(" ")[0],
    loginDate: log.loginAt.split(" ")[0],
    loginTime: log.loginAt.split(" ")[1],
  }));

  const columns = [
    { key: "user",      label: "Admin Name"  },
    { key: "email",     label: "Email"       },
    { key: "role",      label: "Role"        },
    { key: "loginDate", label: "Login Date"  },
    { key: "loginTime", label: "Login Time"  },
    { key: "ip",        label: "IP Address"  },
    { key: "city",      label: "City"        },
    { key: "status",    label: "Status"      },
  ];

  // ── DataTable filter modal: just Status (table is already admin-only) ──
  const tableFilters = [
    { title: "Status", key: "status", type: "select", options: ["Success", "Failed", "Pending"] },
  ];

  // ── Row actions (icon-only — tooltip shows on hover) ──
  const tableActions = [
    {
      icon: <Eye size={14} />,
      tooltip: "View full login details",
      variant: "primary",
      onClick: (row) => {
        setSelectedRow(row);
        openModal("login-detail-modal");
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#2a465a]" />
          <p className="text-sm font-semibold text-slate-500">Loading admin login logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADING */}
      <Grid cols={12} gap={5}>
        <Heading
          primaryText="Admin"
          secondaryText="Login Logs"
          size={12}
          fontSize="3xl"
          showAnimation={true}
        />
      </Grid>

      {/* STAT CARDS — match Data Management style */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard
          title="Total Admin Logins"
          value={String(totalAdminLogins)}
          icon={<Shield size={22} />}
          accentColor="#2a465a"
          size={4}
        />
        <EnhancedDashCard
          title="Failed Attempts"
          value={String(failedAttempts)}
          icon={<ShieldAlert size={22} />}
          accentColor="#f59e0b"
          size={4}
        />
        <EnhancedDashCard
          title="Active Admins"
          value={String(activeAdmins)}
          icon={<UserCheck size={22} />}
          accentColor="#10b981"
          size={4}
        />
      </DashGrid>

      {/* DATA TABLE */}
      <Grid cols={12} gap={4}>
        <DataTable
          columns={columns}
          rows={tableRows}
          filters={tableFilters}
          actions={tableActions}
          exportable={true}
          exportFileName="admin-logs"
          date={true}
          size={12}
          pageSize={5}
          searchable={true}
          title="Admin Records"
          defaultSortKey="loginAt"
          defaultSortDir="desc"
        />
      </Grid>

      {/* DETAIL MODAL */}
      <Modal id="login-detail-modal" title="Admin Login Record" size="lg">
        {selectedRow && (
          <div className="space-y-4">
            <ModalProfile
              name={selectedRow.user}
              subtitle={`${selectedRow.role} · ${selectedRow.department}`}
              meta={selectedRow.email}
            />

            <ModalGrid title="Session" cols={2}>
              <ModalData label="Login Date & Time" value={selectedRow.loginAt} />
              <ModalData
                label="Logout Time"
                value={selectedRow.logoutAt ?? "Active session"}
              />
              <ModalData label="Status"            value={selectedRow.status} />
              <ModalData label="Email"             value={selectedRow.email} />
            </ModalGrid>

            <ModalGrid title="Device" cols={2}>
              <ModalData label="Device"   value={selectedRow.device} />
              <ModalData label="OS"       value={selectedRow.os ?? "—"} />
              <ModalData label="Browser"  value={selectedRow.browser ?? "—"} />
              <ModalData label="IP"       value={selectedRow.ip} />
            </ModalGrid>

            <ModalGrid title="Location" cols={2}>
              <ModalData label="City"      value={selectedRow.city} />
              <ModalData label="Latitude"  value={selectedRow.lat} />
              <ModalData label="Longitude" value={selectedRow.lng} />
              <ModalData
                label="Map"
                value={
                  <a
                    href={`https://www.google.com/maps?q=${selectedRow.lat},${selectedRow.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#2a465a] font-semibold underline-offset-2 hover:underline"
                  >
                    <MapIcon size={14} /> View on map
                  </a>
                }
              />
            </ModalGrid>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                text="Close"
                size={3}
                onClick={() => closeModal("login-detail-modal")}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge — colored pill for the Status column (with hover tooltip)
// ─────────────────────────────────────────────────────────────────────────────
const STATUS_TONES = {
  Success: "bg-emerald-50  text-emerald-700  border-emerald-200",
  Failed:  "bg-rose-50     text-rose-700     border-rose-200",
  Pending: "bg-amber-50    text-amber-700    border-amber-200",
};
const STATUS_DESCRIPTIONS = {
  Success: "Login completed successfully",
  Failed:  "Authentication failed — invalid credentials or blocked",
  Pending: "Awaiting MFA verification or admin approval",
};
const StatusBadge = ({ status }) => (
  <span className="relative inline-block group/tip">
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-bold cursor-help ${
        STATUS_TONES[status] ?? "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Success" ? "bg-emerald-500" : status === "Failed" ? "bg-rose-500" : "bg-amber-500"
        }`}
      />
      {status}
    </span>

    {/* Tooltip — appears on hover, centered above the pill */}
    {STATUS_DESCRIPTIONS[status] && (
      <span
        className="
          pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
          opacity-0 group-hover/tip:opacity-100
          translate-y-1 group-hover/tip:translate-y-0
          transition-all duration-150 ease-out
          z-50 whitespace-nowrap
        "
      >
        <span className="block bg-[#1e293b] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-lg">
          {STATUS_DESCRIPTIONS[status]}
        </span>
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e293b]" />
      </span>
    )}
  </span>
);

export default LoginLogs;
