import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2, Users, Target, TrendingUp, Send, Eye, Phone,
  Building, RefreshCw, AlertCircle,
} from "lucide-react";
import {
  Heading, Modal, ModalData, ModalGrid, openModal, closeModal, Button,
  EnhancedDashCard, DashGrid, DataTable,
} from "../../../components/shared/Common_Components";
import { fetchMyProspects, getErrorMessage } from "./api/prospectsApi";
import { ProspectViewModal } from "./components/ProspectViewModal";

const STATUS_COLORS = {
  Interested: "bg-purple-100 text-purple-700",
  Talk: "bg-blue-100 text-blue-700",
  "Not Talk": "bg-slate-100 text-slate-600",
  Untouched: "bg-slate-100 text-slate-500",
  Converted: "bg-emerald-100 text-emerald-700",
  Dumped: "bg-rose-100 text-rose-700",
};

const PRIORITY_DOT = {
  High: "bg-rose-500",
  Medium: "bg-amber-400",
  Low: "bg-slate-400",
};

const STATUS_CARD_CFG = {
  Interested: { strip: "bg-purple-500", avatar: "bg-purple-100 text-purple-700", ring: "hover:border-purple-300" },
  Talk: { strip: "bg-blue-500", avatar: "bg-blue-100 text-blue-700", ring: "hover:border-blue-300" },
  Converted: { strip: "bg-emerald-500", avatar: "bg-emerald-100 text-emerald-700", ring: "hover:border-emerald-300" },
  Dumped: { strip: "bg-rose-400", avatar: "bg-rose-100 text-rose-700", ring: "hover:border-rose-300" },
};

// ── Prospect Card ─────────────────────────────────────────────────────────────
const ProspectCard = ({ prospect, onView, index }) => {
  const cfg = STATUS_CARD_CFG[prospect.status] || STATUS_CARD_CFG.Talk;
  return (
    <div
      onClick={() => onView(prospect)}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${cfg.ring} hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden animate-in fade-in slide-in-from-bottom-3`}
    >
      {/* Status colour strip */}
      <div className={`h-1.5 w-full ${cfg.strip}`} />

      <div className="p-4">
        {/* Row 1: Avatar + Name + Status */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${cfg.avatar}`}>
            {prospect.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1a2e3f] truncate">{prospect.name}</p>
            <p className="text-xs text-slate-500 truncate">{prospect.company}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${STATUS_COLORS[prospect.status] || "bg-slate-100 text-slate-600"}`}>
            {prospect.status}
          </span>
        </div>

        {/* Row 2: Info chips */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
            <Phone size={9} /> {prospect.phone}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[prospect.priority] || "bg-slate-400"}`} />
            {prospect.priority}
          </span>
        </div>
        {/* Row 3: Action buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={e => { e.stopPropagation(); onView(prospect); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold transition-colors hover:opacity-90`}
            style={{ background: cfg.strip.includes("purple") ? "#9333ea" : cfg.strip.includes("blue") ? "#2563eb" : cfg.strip.includes("emerald") ? "#059669" : cfg.strip.includes("rose") ? "#e11d48" : cfg.strip.includes("red") ? "#dc2626" : "#475569" }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ProspectList = () => {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [stats, setStats] = useState({
    total: 0,
    interested: 0,
    inProgress: 0,
    sentToFinance: 0,
  });

  const loadProspects = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const data = await fetchMyProspects();
      setProspects(data.prospects || []);
      setStats(data.stats || { total: 0, interested: 0, inProgress: 0, sentToFinance: 0 });
    } catch (err) {
      setLoadError(getErrorMessage(err, "Failed to load prospects"));
      setProspects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const handleView = (row) => {
    const prospect = prospects.find((p) => String(p.id) === String(row._id || row.id)) || row;
    setSelectedProspect(prospect);
    openModal("prospect-view");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <Heading primaryText="Prospect" secondaryText="Management" />

      {loadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-red-800">{loadError}</p>
          <button
            type="button"
            onClick={loadProspects}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="TOTAL PROSPECTS" value={String(stats.total)} icon={<Users size={20} />} accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="INTERESTED" value={String(stats.interested)} icon={<Target size={20} />} accentColor="#a855f7" size={3} />
        <EnhancedDashCard title="IN PROGRESS" value={String(stats.inProgress)} icon={<TrendingUp size={20} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="SENT TO FINANCE" value={String(stats.sentToFinance)} icon={<Send size={20} />} accentColor="#22c55e" size={3} />
      </DashGrid>

      {/* ── Table / Cards toggle ── */}
      <div className="flex items-center justify-end">
        <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm gap-1">
          <button
            onClick={() => setViewMode("table")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              viewMode === "table"
                ? "bg-[#1a2e3f] text-white shadow-sm"
                : "text-slate-500 hover:text-[#1a2e3f]"
            }`}>
            Table
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              viewMode === "cards"
                ? "bg-[#1a2e3f] text-white shadow-sm"
                : "text-slate-500 hover:text-[#1a2e3f]"
            }`}>
            Cards
          </button>
        </div>
      </div>

      {/* ── All Prospects — DataTable with filters ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 size={36} className="animate-spin text-[#2a465a] mb-3" />
          <p className="text-slate-400 font-semibold text-sm">Loading prospects…</p>
        </div>
      ) : viewMode === "table" ? (
        <DataTable
          title="All Prospects"
          columns={[
            { key: "name", label: "Name" },
            { key: "status", label: "Status" },
            { key: "phone", label: "Phone" },
            { key: "company", label: "Company" },
            { key: "priority", label: "Priority" },
          ]}
          rows={prospects.map((p) => ({
            ...p,
            _id: p.id,
            name: p.name,
            company: p.company || "—",
            priority: p.priority || "—",
          }))}
          searchable={true}
          pageSize={10}
          size={12}
          filters={[
            { title: "Status", type: "toggle", key: "status", options: ["Interested", "Talk", "Converted", "Dumped"] },
            { title: "Priority", type: "toggle", key: "priority", options: ["High", "Medium", "Low"] },
          ]}
          exportable
          exportFileName="prospects"
          actions={[
            {
              icon: <Eye size={15} />,
              tooltip: "View Details",
              variant: "ghost",
              onClick: (row) => {
                const prospect = prospects.find(p => String(p.id) === String(row._id));
                if (prospect) { setSelectedProspect(prospect); openModal("prospect-view"); }
              },
            },
          ]}
        />
      ) : (
        /* Cards view */
        prospects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Target size={36} className="text-slate-300 mb-3" />
            <p className="text-slate-400 font-semibold text-sm">No prospects found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {prospects.map((p, i) => (
              <ProspectCard key={p.id} prospect={p} index={i}
                onView={handleView} />
            ))}
          </div>
        )
      )}

      <ProspectViewModal prospect={selectedProspect} />

    </div>
  );
};

export default ProspectList;
