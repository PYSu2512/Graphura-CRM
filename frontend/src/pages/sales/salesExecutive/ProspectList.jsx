import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit, Loader2, Users, Target, Activity, CheckCircle2,
  Trash2, XCircle, TrendingUp, Search, Phone, Mail,
  Building, MapPin, IndianRupee, Calendar, Clock, Bell,
  PhoneCall, MessageCircle, RefreshCw, FileText, AlertCircle, Eye,
} from "lucide-react";
import {
  Heading, Modal, ModalData, ModalGrid, openModal, closeModal, Button,
  EnhancedDashCard, DashGrid, DataTable,
} from "../../../components/shared/Common_Components";

const MOCK_PROSPECTS = [
  {
    id: "1", name: "Ravi Sharma", phone: "9876543210", email: "ravi.sharma@example.com",
    company: "Tech Corp India", city: "Mumbai", source: "Website", status: "Interested",
    priority: "High", dealValue: "50,000", followUpDate: "2026-05-02", followUpTime: "14:30",
    assignedTo: "John Doe (You)",
    activities: [
      { id: 1, icon: "target",   color: "text-purple-600",  bg: "bg-purple-100",  title: "Status changed to Interested", desc: "Lead showed positive response to initial pitch.",      date: "Today, 10:45 AM"      },
      { id: 2, icon: "phone",    color: "text-emerald-600", bg: "bg-emerald-100", title: "Outbound Call",                 desc: "Spoke for 5 mins. Clarified pricing model.",           date: "Yesterday, 04:30 PM"  },
      { id: 3, icon: "file",     color: "text-blue-600",    bg: "bg-blue-100",    title: "Note Added",                    desc: "Client is looking for a comprehensive package.",       date: "Yesterday, 10:00 AM"  },
      { id: 4, icon: "calendar", color: "text-amber-600",   bg: "bg-amber-100",   title: "Follow-up Scheduled",           desc: "Follow-up set for May 02, 2026 at 14:30.",            date: "2 days ago, 09:00 AM" },
      { id: 5, icon: "check",    color: "text-slate-500",   bg: "bg-slate-200",   title: "Lead Created",                  desc: "Lead acquired from Website form submission.",          date: "3 days ago, 09:15 AM" },
    ],
  },
  {
    id: "2", name: "Priya Singh", phone: "9123456789", email: "priya.s@example.com",
    company: "Global Trade LLC", city: "Delhi", source: "Referral", status: "Not Talk (Untouched)",
    priority: "Medium", dealValue: "0", followUpDate: "2026-05-05", followUpTime: "10:00",
    assignedTo: "John Doe (You)",
    activities: [
      { id: 1, icon: "check", color: "text-slate-500", bg: "bg-slate-200", title: "Lead Created", desc: "Lead acquired via Referral.", date: "Yesterday, 11:00 AM" },
    ],
  },
  {
    id: "3", name: "Amit Patel", phone: "9812345670", email: "amit.p@example.com",
    company: "Retail Chain Pvt", city: "Ahmedabad", source: "Facebook", status: "Talk",
    priority: "Low", dealValue: "30,000", followUpDate: "2026-05-03", followUpTime: "11:30",
    assignedTo: "John Doe (You)",
    activities: [
      { id: 1, icon: "phone", color: "text-emerald-600", bg: "bg-emerald-100", title: "Outbound Call", desc: "Initial contact made. Prospect showed mild interest.", date: "Today, 09:00 AM"     },
      { id: 2, icon: "check", color: "text-slate-500",   bg: "bg-slate-200",   title: "Lead Created",  desc: "Lead acquired from Facebook ad.",                    date: "Yesterday, 03:00 PM" },
    ],
  },
  {
    id: "4", name: "Neha Gupta", phone: "9988776655", email: "neha.g@example.com",
    company: "Service Hub", city: "Bangalore", source: "Referral", status: "Not Interested",
    priority: "Low", dealValue: "85,000", followUpDate: "2026-05-10", followUpTime: "15:00",
    assignedTo: "John Doe (You)",
    activities: [
      { id: 1, icon: "alert", color: "text-rose-600",    bg: "bg-rose-100",    title: "Marked Not Interested", desc: "Prospect declined after pricing discussion.", date: "Today, 02:00 PM"      },
      { id: 2, icon: "phone", color: "text-emerald-600", bg: "bg-emerald-100", title: "Outbound Call",         desc: "Discussed pricing. Prospect hesitant.",       date: "Yesterday, 01:00 PM"  },
      { id: 3, icon: "check", color: "text-slate-500",   bg: "bg-slate-200",   title: "Lead Created",          desc: "Lead acquired via Referral.",                 date: "2 days ago, 10:00 AM" },
    ],
  },
  {
    id: "5", name: "Vikram Malhotra", phone: "9876501234", email: "vikram.m@example.com",
    company: "Malhotra Industries", city: "Pune", source: "Website", status: "Talk",
    priority: "High", dealValue: "2,50,000", followUpDate: "2026-05-12", followUpTime: "16:00",
    assignedTo: "John Doe (You)",
    activities: [
      { id: 1, icon: "phone", color: "text-emerald-600", bg: "bg-emerald-100", title: "Outbound Call", desc: "Long discussion about enterprise package.", date: "Today, 11:30 AM"     },
      { id: 2, icon: "check", color: "text-slate-500",   bg: "bg-slate-200",   title: "Lead Created",  desc: "Lead acquired from Website form.",          date: "Yesterday, 08:00 AM" },
    ],
  },
  {
    id: "6", name: "Sunita Rao", phone: "9876511111", email: "sunita.r@example.com",
    company: "Rao Enterprises", city: "Chennai", source: "Referral", status: "Interested",
    priority: "High", dealValue: "5,00,000", followUpDate: "2026-05-01", followUpTime: "10:00",
    assignedTo: "John Doe (You)",
    activities: [
      { id: 1, icon: "target", color: "text-purple-600", bg: "bg-purple-100", title: "Status changed to Interested", desc: "Client showed strong interest after demo.", date: "Today, 10:00 AM" }
    ],
  },
  {
    id: "7", name: "Rahul Verma", phone: "9876522222", email: "rahul.v@example.com",
    company: "Verma Logistics", city: "Kolkata", source: "Website", status: "Not Interested",
    priority: "Medium", dealValue: "75,000", followUpDate: "2026-04-28", followUpTime: "14:00",
    assignedTo: "John Doe (You)",
    activities: [
      { id: 1, icon: "alert", color: "text-rose-600", bg: "bg-rose-100", title: "Marked Not Interested", desc: "Prospect declined after pricing discussion.", date: "2 days ago" }
    ],
  }
];

const STATUS_COLORS = {
  Interested:             "bg-purple-100 text-purple-700",
  "Not Talk (Untouched)": "bg-slate-100 text-slate-600",
  "Untouched":            "bg-slate-100 text-slate-500",
  Talk:                   "bg-blue-100 text-blue-700",
  "Not Interested":       "bg-rose-100 text-rose-700",
};

const PRIORITY_DOT = {
  High:   "bg-rose-500",
  Medium: "bg-amber-400",
  Low:    "bg-slate-400",
};

const ActivityIcon = ({ type }) => {
  const map = {
    target:   <Target size={12} strokeWidth={2.5} />,
    phone:    <PhoneCall size={12} strokeWidth={2.5} />,
    file:     <FileText size={12} strokeWidth={2.5} />,
    calendar: <Calendar size={12} strokeWidth={2.5} />,
    check:    <CheckCircle2 size={12} strokeWidth={2.5} />,
    alert:    <AlertCircle size={12} strokeWidth={2.5} />,
    refresh:  <RefreshCw size={12} strokeWidth={2.5} />,
  };
  return map[type] || map.check;
};

const fmtTime = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

// ── Untouched Data logic ──────────────────────────────────────────────────────
// A prospect is "Untouched" if their only activity is "Lead Created"
// (no calls, notes, follow-ups, or status changes have been made).
const isUntouched = (prospect) => {
  const acts = prospect.activities || [];
  const realActivity = acts.filter(a =>
    !["check"].includes(a.icon) // "check" = Lead Created only
  );
  return realActivity.length === 0;
};

// Apply untouched logic to mock data
const applyUntouchedLogic = (prospects) =>
  prospects.map(p => {
    if (isUntouched(p) && !["Interested", "Not Interested"].includes(p.status)) {
      return { ...p, status: "Untouched" };
    }
    return p;
  });
const STATUS_CARD_CFG = {
  Interested:             { strip: "bg-purple-500",  avatar: "bg-purple-100 text-purple-700",  ring: "hover:border-purple-300" },
  Talk:                   { strip: "bg-blue-500",    avatar: "bg-blue-100 text-blue-700",      ring: "hover:border-blue-300"   },
  "Not Interested":       { strip: "bg-rose-400",    avatar: "bg-rose-100 text-rose-700",      ring: "hover:border-rose-300"   },
  "Not Talk (Untouched)": { strip: "bg-slate-400",   avatar: "bg-slate-100 text-slate-600",    ring: "hover:border-slate-300"  },
  "Untouched":            { strip: "bg-slate-400",   avatar: "bg-slate-100 text-slate-500",    ring: "hover:border-slate-300"  },
};

// ── Prospect Card ─────────────────────────────────────────────────────────────
const ProspectCard = ({ prospect, onView, onEdit, index }) => {
  const cfg = STATUS_CARD_CFG[prospect.status] || STATUS_CARD_CFG["Not Talk (Untouched)"];
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
            <MapPin size={9} /> {prospect.city}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
            <Phone size={9} /> {prospect.phone}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[prospect.priority] || "bg-slate-400"}`} />
            {prospect.priority}
          </span>
        </div>

        {/* Row 3: Deal value + Follow-up */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Deal Value</p>
            <p className="text-sm font-black text-[#1a2e3f]">{prospect.dealValue && prospect.dealValue !== "0" ? `₹ ${prospect.dealValue}` : "-"}</p>
          </div>
          {prospect.status !== "Untouched" && (
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Follow-up</p>
              <p className="text-xs font-semibold text-amber-600">{prospect.followUpDate}</p>
            </div>
          )}
        </div>

        {/* Row 4: Action buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={e => { e.stopPropagation(); onView(prospect); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold transition-colors hover:opacity-90`}
            style={{ background: cfg.strip.includes("purple") ? "#9333ea" : cfg.strip.includes("blue") ? "#2563eb" : cfg.strip.includes("emerald") ? "#059669" : cfg.strip.includes("rose") ? "#e11d48" : cfg.strip.includes("red") ? "#dc2626" : "#475569" }}
          >
            View Details
          </button>
          {prospect.status !== "Untouched" && (
            <button
              onClick={e => { e.stopPropagation(); onEdit(prospect); }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              <Edit size={13} /> Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ProspectList = () => {
  const navigate = useNavigate();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // "table" | "cards"

  useEffect(() => {
    setTimeout(() => {
      // Apply untouched logic: leads with only "Lead Created" activity → "Untouched Data"
      setProspects(applyUntouchedLogic(MOCK_PROSPECTS));
      setLoading(false);
    }, 300);
  }, []);

  // Fix: always look up by id from state to get the correct, latest record
  const handleView = (row) => {
    const prospect = prospects.find(p => p.id === row.id) || row;
    setSelectedProspect(prospect);
    openModal("prospect-view");
  };
  const handleDump = (prospect) => {
    if (window.confirm(`Move "${prospect.name}" to Dump Data?`)) {
      setProspects(prev => prev.filter(p => p.id !== prospect.id));
      closeModal("prospect-view");
    }
  };

  // Summary counts
  const total         = prospects.length;
  const inProgress    = prospects.filter(p => ["Talk", "Interested"].includes(p.status)).length;
  const notInterested = prospects.filter(p => p.status === "Not Interested").length;
  const untouched     = prospects.filter(p => p.status === "Untouched").length;

  const STATUS_TABS = ["All", "Talk", "Not Talk (Untouched)", "Interested", "Not Interested"];
  const filtered = prospects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.company.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || p.status === statusFilter || (!STATUS_TABS.includes(p.status) && statusFilter === "All");
    return matchSearch && matchStatus;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <Heading primaryText="Prospect Management" />

      {/* ── Summary Cards — EnhancedDashCard with wave animation ── */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="TOTAL PROSPECTS" value={String(total)}         icon={<Users size={20} />}        accentColor="#38bdf8" size={3} />
        <EnhancedDashCard title="IN PROGRESS"     value={String(inProgress)}    icon={<TrendingUp size={20} />}   accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="UNTOUCHED"        value={String(untouched)}     icon={<XCircle size={20} />}      accentColor="#94a3b8" size={3} />
        <EnhancedDashCard title="NOT INTERESTED"  value={String(notInterested)} icon={<AlertCircle size={20} />} accentColor="#f43f5e" size={3} />
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
            { key: "name",    label: "Name"   },
            { key: "status",  label: "Status" },
            { key: "phone",   label: "Phone"  },
            { key: "city",    label: "City"   },
            { key: "dealValue",    label: "Deal Value"  },
            { key: "followUpDate", label: "Follow-up"   },
          ]}
          rows={prospects.map(p => ({
            ...p,
            _id:     p.id,      // dedicated lookup key — never overwritten
            _status: p.status,  // dedicated status key for action.show
            name:         p.name,
            dealValue:    p.dealValue && p.dealValue !== "0" ? `₹ ${p.dealValue}` : "—",
            followUpDate: p.status === "Untouched" ? "—" : (p.followUpDate || "—"),
          }))}
          searchable={true}
          pageSize={10}
          size={12}
          filters={[
            { title: "Status",   type: "toggle", key: "status",   options: ["Talk", "Untouched", "Interested", "Not Interested"] },
            { title: "Priority", type: "toggle", key: "priority", options: ["High", "Medium", "Low"] },
            { title: "Source",   type: "select", key: "source",   options: ["Website", "Facebook", "Referral", "LinkedIn", "Other"] },
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
            {
              icon: <Edit size={15} />,
              tooltip: "Edit Prospect",
              variant: "ghost",
              show: (row) => row._status !== "Untouched",
              onClick: (row) => {
                const prospect = prospects.find(p => String(p.id) === String(row._id));
                if (prospect) navigate(`/sales-executive/edit-prospect/${prospect.id}`);
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
                onView={handleView}
                onEdit={(p) => navigate(`/sales-executive/edit-prospect/${p.id}`)} />
            ))}
          </div>
        )
      )}

      {/* ── View Prospect Modal ── */}
      <Modal id="prospect-view" title="Prospect Details" size="lg">
        {selectedProspect && (
          <div className="flex flex-col gap-0 -mx-6 -mt-6">
            {/* Hero */}
            <div className="relative bg-gradient-to-br from-[#1a2e3f] via-[#2a465a] to-[#355872] px-6 pt-6 pb-7 rounded-t-2xl overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute top-4 right-16 w-16 h-16 rounded-full bg-white/5" />
              <div className="relative flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 border-2 border-white/20 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                  {selectedProspect.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h2 className="text-lg font-black text-white leading-tight">{selectedProspect.name}</h2>
                  <p className="text-sm text-white/70 mt-0.5 flex items-center gap-1.5">
                    <Building size={12} className="flex-shrink-0" />{selectedProspect.company}
                    <span className="text-white/30">·</span>
                    <MapPin size={12} className="flex-shrink-0" />{selectedProspect.city}
                  </p>
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[selectedProspect.status] || "bg-white/10 text-white"}`}>{selectedProspect.status}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white">{selectedProspect.priority} Priority</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-white/80">via {selectedProspect.source}</span>
                  </div>
                </div>
              </div>
              <div className="relative mt-4 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Deal Value</p>
                  <p className="text-xl font-black text-white mt-0.5">{selectedProspect.dealValue && selectedProspect.dealValue !== "0" ? `₹ ${selectedProspect.dealValue}` : "-"}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <IndianRupee size={18} className="text-white/80" />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pt-5 pb-4 flex flex-col gap-4">
              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <a href={`tel:+91${selectedProspect.phone.replace(/\D/g,"")}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-[#2a465a]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Phone size={14} className="text-[#2a465a] group-hover:text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                    <p className="text-xs font-bold text-[#2a465a] truncate">{selectedProspect.phone}</p>
                  </div>
                </a>
                <a href={`mailto:${selectedProspect.email}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:border-purple-200 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-[#2a465a]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                    <Mail size={14} className="text-[#2a465a] group-hover:text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                    <p className="text-xs font-bold text-[#2a465a] truncate">{selectedProspect.email}</p>
                  </div>
                </a>
              </div>

              {/* Lead details */}
              <ModalGrid title="Lead Details" cols={2}>
                <ModalData label="Source"      value={selectedProspect.source} />
                <ModalData label="Priority"    value={selectedProspect.priority} />
                <ModalData label="Company"     value={selectedProspect.company} />
                <ModalData label="City"        value={selectedProspect.city} />
                <ModalData label="Assigned To" value={selectedProspect.assignedTo} />
                <ModalData label="Deal Value"  value={selectedProspect.dealValue && selectedProspect.dealValue !== "0" ? `₹ ${selectedProspect.dealValue}` : "-"} />
              </ModalGrid>

              {/* Follow-up — hidden for Untouch records */}
              {selectedProspect.status !== "Untouched" && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">Next Follow-up</p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-amber-800">{selectedProspect.followUpDate}</span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <Clock size={11} /> {fmtTime(selectedProspect.followUpTime)}
                    </span>
                  </div>
                </div>
                <Bell size={16} className="text-amber-400 animate-pulse flex-shrink-0" />
              </div>
              )}

              {/* Activity Timeline */}
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#2a465a]/5 border-b border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3e8ca7] flex-shrink-0" />
                  <p className="text-xs font-black text-[#2a465a] uppercase tracking-[0.18em]">Activity Timeline</p>
                </div>
                <div className="p-4 max-h-52 overflow-y-auto">
                  {(selectedProspect.activities || []).map((act, idx) => {
                    const isLast = idx === selectedProspect.activities.length - 1;
                    return (
                      <div key={act.id} className="flex gap-3">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${act.bg} ${act.color} flex-shrink-0`}>
                            <ActivityIcon type={act.icon} />
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-slate-200 my-1 min-h-[8px]" />}
                        </div>
                        <div className="pb-3 flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-[#2a465a] leading-snug">{act.title}</p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">{act.date}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{act.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => window.open(`https://wa.me/91${selectedProspect.phone.replace(/\D/g,"")}`, "_blank")}
                  className="col-span-2 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1DA851] transition-all active:scale-95 shadow-sm">
                  <MessageCircle size={16} /> WhatsApp
                </button>
                <button onClick={() => { closeModal("prospect-view"); navigate(`/sales-executive/edit-prospect/${selectedProspect.id}`); }}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95
                    ${selectedProspect.status === "Untouched"
                      ? "bg-slate-50 border border-slate-200 text-slate-300 cursor-not-allowed"
                      : "bg-white border border-slate-200 text-[#2a465a] hover:bg-slate-50"}`}
                  disabled={selectedProspect.status === "Untouch"}>
                  <Edit size={16} /> Edit
                </button>
                <button onClick={() => handleDump(selectedProspect)}
                  className="flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 py-3 rounded-xl font-bold text-sm hover:bg-rose-100 transition-all active:scale-95">
                  <Trash2 size={16} /> Dump Data
                </button>
              </div>

              <div className="flex justify-end pt-1 border-t border-slate-100">
                <Button text="Close" variant="ghost" onClick={() => closeModal("prospect-view")} />
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default ProspectList;
