import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard as DashCard,
  DataTable,
  PanelModal as Modal,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components";
import { userService } from "../../../services/userService";



const filterOptions = ["All", "Pending", "Approved", "Rejected"];

export default function UserApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getUsers();
        // Filter or map users to approval format if needed
        // For now, let's assume we want users with PENDING status
        const mapped = response.data.users
          .filter(u => u.approvalStatus === "PENDING")
          .map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            avatar: u.name.split(" ").map(n => n[0]).join("").toUpperCase(),
            requestedRole: u.role,
            requestedOn: new Date(u.createdAt).toLocaleDateString(),
            source: "Invite", // Placeholder
            status: "Pending"
          }));
        setApprovals(mapped);
      } catch (error) {
        console.error("Failed to fetch approvals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApprovals();
  }, []);

  // ── Stats ──
  const pending = approvals.filter((a) => a.status === "Pending").length;
  const approvedToday = approvals.filter((a) => a.status === "Approved").length;
  const rejectedToday = approvals.filter((a) => a.status === "Rejected").length;

  // ── Filtered list ──
  const filtered = useMemo(() => {
    if (activeFilter === "All") return approvals;
    return approvals.filter((a) => a.status === activeFilter);
  }, [approvals, activeFilter]);

  // ── Show toast ──
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Approve ──
  const handleApprove = (id) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Approved" } : a))
    );
    showToast("User approved successfully!");
  };

  // ── Reject ──
  const handleReject = (id) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Rejected" } : a))
    );
    showToast("User request rejected", "error");
  };

  // ── Table ──
  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "requestedRole", label: "Requested Role" },
    { key: "requestedOn", label: "Requested On" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
  ];

  const actions = [
    {
      icon: <UserCheck size={16} />,
      variant: "primary",
      onClick: (row) => handleApprove(row.id),
    },
    {
      icon: <UserX size={16} />,
      variant: "danger",
      onClick: (row) => handleReject(row.id),
    },
    {
      icon: <Eye size={16} />,
      variant: "ghost",
      onClick: (row) => {
        setSelectedApproval(row);
        openModal("approval-detail-modal");
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#2a465a]">User Approvals</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review and manage user registration requests
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <DashGrid cols={12} gap={4}>
        <DashCard
          title="Pending Requests"
          value={String(pending)}
          icon={<Clock size={22} />}
          accentColor="#38bdf8"
          size={4}
        />
        <DashCard
          title="Approved Today"
          value={String(approvedToday)}
          icon={<CheckCircle2 size={22} />}
          accentColor="#22c55e"
          size={4}
        />
        <DashCard
          title="Rejected Today"
          value={String(rejectedToday)}
          icon={<XCircle size={22} />}
          accentColor="#f43f5e"
          size={4}
        />
      </DashGrid>

      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-1.5">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${
              activeFilter === f
                ? "bg-[#2a465a] text-white shadow-md"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {f}
            {f === "Pending" && pending > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                {pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Data Table ── */}
      <DataTable
        title="Approval Requests"
        columns={columns}
        rows={filtered}
        actions={actions}
        pageSize={5}
        searchable
        size={12}
      />

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[10000] flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-2xl transition-all duration-300 ${
            toast.type === "error" ? "bg-rose-500" : "bg-emerald-500"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {toast.msg}
        </div>
      )}

      {/* ── Detail Modal ── */}
      <Modal id="approval-detail-modal" title="Request Details">
        {selectedApproval && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-[#2a465a] flex items-center justify-center text-white font-black text-xl shadow-lg">
                {selectedApproval.avatar}
              </div>
              <div>
                <p className="text-lg font-black text-[#2a465a]">
                  {selectedApproval.name}
                </p>
                <p className="text-sm font-bold text-slate-500">
                  {selectedApproval.email}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Requested Role
                </span>
                <span className="text-[#2a465a] font-bold bg-white px-4 py-3 rounded-2xl block border border-slate-200/60 shadow-sm">
                  {selectedApproval.requestedRole}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Source Channel
                </span>
                <span className="text-[#2a465a] font-bold bg-white px-4 py-3 rounded-2xl block border border-slate-200/60 shadow-sm">
                  {selectedApproval.source}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Request Date
                </span>
                <span className="text-[#2a465a] font-bold bg-white px-4 py-3 rounded-2xl block border border-slate-200/60 shadow-sm">
                  {selectedApproval.requestedOn}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 ml-1">
                  Current Status
                </span>
                <span
                  className={`font-black text-sm bg-white px-4 py-3 rounded-2xl block border border-slate-200/60 shadow-sm ${
                    selectedApproval.status === "Approved"
                      ? "text-emerald-600"
                      : selectedApproval.status === "Rejected"
                      ? "text-rose-600"
                      : "text-amber-600"
                  }`}
                >
                  {selectedApproval.status}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
              <button
                onClick={() => closeModal("approval-detail-modal")}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition"
              >
                Close
              </button>
              {selectedApproval.status === "Pending" && (
                <>
                  <button
                    onClick={() => {
                      handleReject(selectedApproval.id);
                      closeModal("approval-detail-modal");
                    }}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition active:scale-95 shadow-lg shadow-rose-500/20"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedApproval.id);
                      closeModal("approval-detail-modal");
                    }}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2a465a] hover:bg-[#1e3a52] transition active:scale-95 shadow-lg shadow-[#2a465a]/20"
                  >
                    Approve Access
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

