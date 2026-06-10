import { useState, useEffect, useCallback } from "react";
import {
  DashGrid,
  EnhancedDashCard,
  DataTable,
} from "../../../../components/shared/Common_Components";
import { Users, UserCheck, Loader2, AlertTriangle } from "lucide-react";
import apiClient from "../../../../services/apiClient";
import toast from "react-hot-toast";

// ── helpers ──────────────────────────────────────────────────────────────────
const getAvatarColor = (name = "") => {
  const colors = [
    "#6366f1", "#3b82f6", "#22c55e", "#f97316",
    "#ec4899", "#14b8a6", "#a855f7", "#eab308",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const statusBadge = (v) => {
  const map = {
    Active:     "bg-emerald-100 text-emerald-700",
    "On Leave": "bg-amber-100 text-amber-700",
    Inactive:   "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[v] || "bg-slate-100 text-slate-600"}`}>
      {v}
    </span>
  );
};

const countBadge = (v, classes) => (
  <span className={`inline-flex min-w-[1.75rem] justify-center px-2 py-0.5 rounded-full text-xs font-bold ${classes}`}>
    {v}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function TeamMembersTable() {
  const [members, setMembers] = useState([]);
  const [stats,   setStats]   = useState({ total: 0, active: 0, onLeave: 0, delayed: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [membersRes, overviewRes] = await Promise.all([
        apiClient.get("/management-tl/teams/members"),
        apiClient.get("/management-tl/teams/overview"),
      ]);

      const memberData = membersRes?.data?.data?.members || [];
      const overviewData = overviewRes?.data?.data || {};

      setMembers(memberData);
      setStats({
        total:   overviewData.totalMembers  ?? memberData.length,
        active:  overviewData.activeMembers ?? memberData.filter((m) => m.status === "Active").length,
        onLeave: overviewData.onLeave       ?? memberData.filter((m) => m.status === "On Leave").length,
        delayed: overviewData.delayedTasks  ?? memberData.reduce((s, m) => s + (m.delayed || 0), 0),
      });
    } catch (err) {
      toast.error(err?.message || "Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const cols = [
    {
      key: "name",
      label: "Member",
      render: (v) => (
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0"
            style={{ background: getAvatarColor(v) }}
          >
            {getInitials(v)}
          </div>
          <span className="font-semibold text-slate-800 text-sm">{v}</span>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (v) => (
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {v ? v.replace(/_/g, " ") : "—"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (v) => <span className="text-sm text-slate-600">{v || "—"}</span>,
    },
    {
      key: "assigned",
      label: "Assigned",
      render: (v) => countBadge(v, "bg-slate-100 text-slate-600"),
    },
    {
      key: "inProgress",
      label: "In Progress",
      render: (v) => countBadge(v, "bg-blue-100 text-blue-700"),
    },
    {
      key: "completed",
      label: "Completed",
      render: (v) => countBadge(v, "bg-emerald-100 text-emerald-700"),
    },
    {
      key: "delayed",
      label: "Delayed",
      render: (v) =>
        countBadge(v, v > 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"),
    },
    {
      key: "status",
      label: "Status",
      render: statusBadge,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard
          title="Total Members"
          value={loading ? "—" : String(stats.total)}
          icon={<Users size={22} />}
          accentColor="#3b82f6"
          size={3}
        />
        <EnhancedDashCard
          title="Active"
          value={loading ? "—" : String(stats.active)}
          icon={<UserCheck size={22} />}
          accentColor="#22c55e"
          size={3}
        />
        <EnhancedDashCard
          title="On Leave"
          value={loading ? "—" : String(stats.onLeave)}
          icon={<Loader2 size={22} />}
          accentColor="#f97316"
          size={3}
        />
        <EnhancedDashCard
          title="Delayed Tasks"
          value={loading ? "—" : String(stats.delayed)}
          icon={<AlertTriangle size={22} />}
          accentColor="#ef4444"
          size={3}
        />
      </DashGrid>

      <DataTable
        title="Team Members"
        columns={cols}
        rows={members}
        pageSize={10}
        searchable
        exportable
        exportFileName="team_members"
        loading={loading}
        filters={[
          {
            title: "Status",
            key: "status",
            type: "toggle",
            options: ["Active", "On Leave", "Inactive"],
          },
        ]}
      />
    </div>
  );
}
