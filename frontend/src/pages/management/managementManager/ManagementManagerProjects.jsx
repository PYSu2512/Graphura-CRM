import { useCallback, useEffect, useState } from "react";
import { FolderOpen, Activity, AlertTriangle, Link2, Loader2 } from "lucide-react";
import {
  Heading, DashGrid, EnhancedDashCard,
} from "../../../components/shared/Common_Components.jsx";
import AllProjects from "./projects/AllProjects.jsx";
import apiClient from "../../../services/apiClient.js";
import toast from "react-hot-toast";

const KPI_ICONS   = [<FolderOpen size={20}/>, <Activity size={20}/>, <AlertTriangle size={20}/>, <Link2 size={20}/>];
const KPI_ACCENTS = ["#3b82f6", "#14b8a6", "#f43f5e", "#f59e0b"];

export default function ManagementManagerProjects() {
  const [projects,  setProjects]  = useState([]);
  const [stats,     setStats]     = useState({ total: 0, active: 0, delayed: 0, pendingHandoverLink: 0 });
  const [formData,  setFormData]  = useState({ clients: [], leaders: [], workOrders: [] });
  const [loading,   setLoading]   = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, formRes] = await Promise.all([
        apiClient.get("/management/projects"),
        apiClient.get("/management/projects/form-data"),
      ]);
      setProjects(projRes?.data?.data?.projects || []);
      setStats(projRes?.data?.data?.stats || {});
      setFormData(formRes?.data?.data || { clients: [], leaders: [], workOrders: [] });
    } catch (err) {
      toast.error(err?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const kpis = [
    { title: "Total Projects",         value: stats.total               ?? 0 },
    { title: "Active",                 value: stats.active              ?? 0 },
    { title: "Delayed",                value: stats.delayed             ?? 0 },
    { title: "Pending Handover Links", value: stats.pendingHandoverLink ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Project" secondaryText="Management" size={12} />

      <DashGrid cols={12} gap={4}>
        {kpis.map((k, i) => (
          <EnhancedDashCard key={k.title} title={k.title} value={String(k.value)}
            icon={KPI_ICONS[i]} accentColor={KPI_ACCENTS[i]} size={3} />
        ))}
      </DashGrid>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
          <Loader2 size={18} className="animate-spin" /> Loading projects…
        </div>
      )}

      {!loading && (
        <AllProjects
          projects={projects}
          formData={formData}
          onRefresh={loadAll}
        />
      )}
    </div>
  );
}
