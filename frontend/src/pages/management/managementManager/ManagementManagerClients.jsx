import { useCallback, useEffect, useState } from "react";
import { Eye, Users, Briefcase, FolderOpen, FileCheck2, Loader2, Link as LinkIcon, Send } from "lucide-react";
import {
  Heading,
  DashGrid,
  EnhancedDashCard,
  DataTable,
  Modal,
  ModalProfile,
  ModalGrid,
  ModalData,
  Button,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components";
import apiClient from "../../../services/apiClient.js";
import toast from "react-hot-toast";

const KPI_ICONS   = [<Users size={20} />, <Briefcase size={20} />, <FolderOpen size={20} />, <FileCheck2 size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b"];

const statusColor = (s) => {
  if (s === "Completed" || s === "Delivered") return "bg-emerald-100 text-emerald-700";
  if (s === "Delayed")    return "bg-rose-100 text-rose-700";
  if (s === "In Progress" || s === "Work Started") return "bg-blue-100 text-blue-700";
  if (s === "Review Stage" || s === "Finalization") return "bg-violet-100 text-violet-700";
  return "bg-amber-100 text-amber-700";
};

const CLIENT_COLS = [
  { key: "name",         label: "Client Name"  },
  { key: "mobile",       label: "Mobile"       },
  { key: "email",        label: "Email"        },
  { key: "companyName",  label: "Company"      },
  { key: "projectCount", label: "Projects"     },
  { key: "activeCount",  label: "Active"       },
];

const BLANK_STATS = { total: 0, withActive: 0, totalProjects: 0, pendingHandover: 0 };

export default function ManagementManagerClients() {
  const [clients,        setClients]        = useState([]);
  const [stats,          setStats]          = useState(BLANK_STATS);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [sendingLink,    setSendingLink]    = useState(null); // clientId being sent

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/management/clients");
      setClients(res?.data?.data?.clients || []);
      setStats(res?.data?.data?.stats    || BLANK_STATS);
    } catch (err) {
      toast.error(err?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const handleView = (row) => {
    const full = clients.find((c) => c.id === row.id);
    setSelectedClient(full ?? row);
    openModal("mm-client-view");
  };

  const handleSendTrackingLink = async (row) => {
    setSendingLink(row.id);
    try {
      const res = await apiClient.post(`/management/clients/${row.id}/send-tracking-link`);
      const { clientEmail, trackingUrl } = res.data?.data || {};
      toast.success(`Tracking link sent to ${clientEmail}`);
    } catch (err) {
      toast.error(err?.message || "Failed to send tracking link");
    } finally {
      setSendingLink(null);
    }
  };

  const kpis = [
    { title: "Total Clients",     value: String(stats.total          ?? 0) },
    { title: "Active Clients",    value: String(stats.withActive      ?? 0) },
    { title: "Total Projects",    value: String(stats.totalProjects   ?? 0) },
    { title: "Pending Handover",  value: String(stats.pendingHandover ?? 0) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Client" secondaryText="Directory" size={12} />

      <DashGrid cols={12} gap={4}>
        {kpis.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={k.value}
            icon={KPI_ICONS[i]}
            accentColor={KPI_ACCENTS[i]}
            size={3}
          />
        ))}
      </DashGrid>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
          <Loader2 size={18} className="animate-spin" /> Loading clients…
        </div>
      ) : (
        <DataTable
          title="All Clients"
          columns={CLIENT_COLS}
          rows={clients}
          pageSize={10}
          searchable
          exportable
          exportFileName="clients_export"
          actions={[
            {
              icon:    <Eye size={15} />,
              tooltip: "View Projects",
              variant: "ghost",
              onClick: handleView,
            },
            {
              icon:    <Send size={15} />,
              tooltip: "Send Tracking Link",
              variant: "primary",
              onClick: handleSendTrackingLink,
              disabled: (row) => sendingLink === row.id,
            },
          ]}
        />
      )}

      {/* ── Client View Modal ────────────────────────────────────────────── */}
      <Modal id="mm-client-view" title="Client Details" size="lg">
        {selectedClient && (
          <div className="flex flex-col gap-4">
            <ModalProfile
              name={selectedClient.name}
              subtitle={selectedClient.companyName || selectedClient.email || "—"}
              meta={`Mobile · ${selectedClient.mobile}`}
            />

            <ModalGrid title="Contact Information" cols={2}>
              <ModalData label="Mobile"  value={selectedClient.mobile      || "—"} />
              <ModalData label="Email"   value={selectedClient.email       || "—"} />
              <ModalData label="Company" value={selectedClient.companyName || "—"} />
            </ModalGrid>

            {/* ── Associated Projects ──────────────────────────────────── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Projects ({(selectedClient.projects || []).length})
              </p>
              {(selectedClient.projects || []).length === 0 ? (
                <p className="text-slate-500 text-sm">No projects found for this client.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedClient.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="font-semibold text-slate-800">{proj.name}</span>
                          <span className="text-[10px] text-slate-400 ml-2">
                            {proj.projectNumber}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor(proj.status)}`}
                        >
                          {proj.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2a465a] rounded-full"
                            style={{ width: `${proj.progressPercent || 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 w-8 text-right">
                          {proj.progressPercent || 0}%
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs">
                        {proj.deadline && (
                          <span className="text-slate-500">
                            📅 {proj.deadline}
                          </span>
                        )}
                        {proj.driveLink && (
                          <a
                            href={proj.driveLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <LinkIcon size={11} /> Drive
                          </a>
                        )}
                        {proj.handoverLink ? (
                          <a
                            href={proj.handoverLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline"
                          >
                            ✅ Handover
                          </a>
                        ) : (
                          ["Completed", "Delivered"].includes(proj.status) && (
                            <span className="text-amber-500">⚠️ Handover link missing</span>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3}
                onClick={() => closeModal("mm-client-view")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
