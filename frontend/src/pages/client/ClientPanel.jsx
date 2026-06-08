import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Download,
  Loader2,
  Phone,
  Mail,
  Calendar,
  Banknote,
  ReceiptText,
  TrendingUp,
  ShieldCheck,
  FolderOpen,
  Search,
  Package,
  Users,
  UserCheck,
} from "lucide-react";

import {
  Heading,
  EnhancedDashCard,
  DashGrid,
  DataTable,
  ModalData,
  ModalGrid,
  ModalProfile,
} from "../../components/shared/Common_Components";



// ── Demo data ─────────────────────────────────────────────────────────────────
const ALL_PROJECTS = [
  {
    id: "PRJ-001",
    name: "Acme Corp Website Redesign",
    startDate: "2026-04-01",
    expectedDelivery: "2026-06-15",
    status: "In Progress",
    progress: 62,
    driveLink: "https://drive.google.com/drive/folders/example",
    handoverLink: null,
    deliveredDate: null,
    totalCost: 85000,
    paidAmount: 50000,
    paymentType: "Partial",
    payments: [
      { date: "2026-04-05", amount: 30000, method: "UPI", status: "Paid", ref: "RZPY001234" },
      { date: "2026-04-22", amount: 20000, method: "Net Banking", status: "Paid", ref: "RZPY005678" },
    ],
    woGenerated: true, woSigned: false, woSignedDate: null, woPdfLink: null,
    // Developer team assigned to this project
    manager: { name: "Ankit Sharma", role: "Management Manager", mobile: "+91 99887 76655", email: "ankit.sharma@graphura.in" },
    teamLeader: { name: "Priya Verma", role: "Management Team Leader", mobile: "+91 88776 65544", email: "priya.verma@graphura.in" },
    updates: [
      { date: "2026-04-01", status: "Not Started", note: "Project kickoff. Brief received and team assigned." },
      { date: "2026-04-12", status: "Work Started", note: "Initial wireframes shared with client for approval." },
      { date: "2026-04-28", status: "In Progress", note: "Homepage and about-us pages completed. Mobile responsive." },
      { date: "2026-05-14", status: "In Progress", note: "Services, blog, and contact pages underway." },
      { date: "2026-05-22", status: "In Progress", note: "Client feedback incorporated. Final revision in progress." },
    ],
  },
  {
    id: "PRJ-002",
    name: "Brand Identity & Logo Package",
    startDate: "2026-01-10",
    expectedDelivery: "2026-02-28",
    status: "Completed",
    progress: 100,
    driveLink: "https://drive.google.com/drive/folders/brand-pkg",
    handoverLink: "https://drive.google.com/drive/folders/final-delivery",
    deliveredDate: "2026-02-25",
    totalCost: 45000,
    paidAmount: 45000,
    paymentType: "Full",
    payments: [
      { date: "2026-01-11", amount: 45000, method: "UPI", status: "Paid", ref: "RZPY009900" },
    ],
    woGenerated: true, woSigned: true, woSignedDate: "2026-01-12", woPdfLink: null,
    manager: { name: "Ankit Sharma", role: "Management Manager", mobile: "+91 99887 76655", email: "ankit.sharma@graphura.in" },
    teamLeader: { name: "Rohit Mehra", role: "Management Team Leader", mobile: "+91 77665 54433", email: "rohit.mehra@graphura.in" },
    updates: [
      { date: "2026-01-10", status: "Not Started", note: "Brief received. Design team allocated." },
      { date: "2026-01-20", status: "Work Started", note: "3 logo concepts presented for review." },
      { date: "2026-02-01", status: "In Progress", note: "Final logo selected. Brand guidelines in progress." },
      { date: "2026-02-18", status: "Finalization", note: "All assets finalized. Preparing handover package." },
      { date: "2026-02-25", status: "Completed", note: "All files delivered via handover link. Project closed." },
    ],
  },
  {
    id: "PRJ-003",
    name: "Social Media Campaign — Q1",
    startDate: "2026-03-01",
    expectedDelivery: "2026-03-31",
    status: "Delayed",
    progress: 45,
    driveLink: "https://drive.google.com/drive/folders/smm-q1",
    handoverLink: null,
    deliveredDate: null,
    totalCost: 32000,
    paidAmount: 16000,
    paymentType: "Partial",
    payments: [
      { date: "2026-03-02", amount: 16000, method: "UPI", status: "Paid", ref: "RZPY007700" },
    ],
    woGenerated: true, woSigned: true, woSignedDate: "2026-03-03", woPdfLink: null,
    manager: { name: "Sneha Kapoor", role: "Management Manager", mobile: "+91 99001 12233", email: "sneha.kapoor@graphura.in" },
    teamLeader: { name: "Priya Verma", role: "Management Team Leader", mobile: "+91 88776 65544", email: "priya.verma@graphura.in" },
    updates: [
      { date: "2026-03-01", status: "Not Started", note: "Campaign brief received." },
      { date: "2026-03-10", status: "Work Started", note: "Content calendar created. Creatives in design." },
      { date: "2026-03-28", status: "Delayed", note: "Client feedback pending for 5 days. Awaiting sign-off." },
    ],
  },
  {
    id: "PRJ-004",
    name: "E-Commerce Store Setup",
    startDate: "2025-10-01",
    expectedDelivery: "2025-12-15",
    status: "Completed",
    progress: 100,
    driveLink: "https://drive.google.com/drive/folders/ecom-store",
    handoverLink: "https://drive.google.com/drive/folders/ecom-handover",
    deliveredDate: "2025-12-10",
    totalCost: 120000,
    paidAmount: 120000,
    paymentType: "Full",
    payments: [
      { date: "2025-10-02", amount: 60000, method: "Net Banking", status: "Paid", ref: "RZPY000111" },
      { date: "2025-11-15", amount: 60000, method: "UPI", status: "Paid", ref: "RZPY000222" },
    ],
    woGenerated: true, woSigned: true, woSignedDate: "2025-10-03", woPdfLink: null,
    manager: { name: "Ankit Sharma", role: "Management Manager", mobile: "+91 99887 76655", email: "ankit.sharma@graphura.in" },
    teamLeader: { name: "Rohit Mehra", role: "Management Team Leader", mobile: "+91 77665 54433", email: "rohit.mehra@graphura.in" },
    updates: [
      { date: "2025-10-01", status: "Not Started", note: "Project started. Server provisioned." },
      { date: "2025-10-20", status: "Work Started", note: "Product catalog structure built." },
      { date: "2025-11-08", status: "In Progress", note: "Payment gateway integrated. Testing in progress." },
      { date: "2025-11-28", status: "Review Stage", note: "UAT completed. Minor fixes applied." },
      { date: "2025-12-10", status: "Completed", note: "Store live. Handover completed." },
    ],
  },
];

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  "Not Started": { color: "#94a3b8", bg: "#f1f5f9" },
  "Work Started": { color: "#3b82f6", bg: "#eff6ff" },
  "In Progress": { color: "#f59e0b", bg: "#fffbeb" },
  "Review Stage": { color: "#8b5cf6", bg: "#f5f3ff" },
  "Finalization": { color: "#14b8a6", bg: "#f0fdfa" },
  "Completed": { color: "#22c55e", bg: "#f0fdf4" },
  "Delayed": { color: "#f43f5e", bg: "#fff1f2" },
};

const MILESTONES = ["Not Started", "Work Started", "In Progress", "Review Stage", "Finalization", "Completed"];
const ACTIVE_STATUSES = ["Not Started", "Work Started", "In Progress", "Review Stage", "Finalization", "Delayed"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatINR = (n) => typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "—";

const payStatBadge = (p) => {
  if (!p.totalCost) return { label: "Pending", color: "#94a3b8" };
  if (p.paidAmount >= p.totalCost) return { label: "Paid", color: "#22c55e" };
  if (p.paidAmount > 0) return { label: "Partially Paid", color: "#f59e0b" };
  return { label: "Pending", color: "#f43f5e" };
};

const milestoneIdx = (status) => Math.max(0, MILESTONES.findIndex((m) => m === status));

// ── Small status badge (used in list + table cells) ──────────────────────────
function StatusPill({ status, cfgMap = STATUS_CFG }) {
  const cfg = cfgMap[status] ?? { color: "#94a3b8", bg: "#f1f5f9" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {status}
    </span>
  );
}

// ── Milestone tracker (custom — no equiv in Common_Components) ────────────────
function MilestoneTrack({ status }) {
  const cur = milestoneIdx(status);
  return (
    <div className="overflow-x-auto">
      <div className="flex items-start min-w-[400px]">
        {MILESTONES.map((m, i) => {
          const done = i < cur;
          const active = i === cur;
          const cfg = STATUS_CFG[m];
          return (
            <div key={m} className="flex-1 flex flex-col items-center">
              <div className="relative w-full flex items-center">
                {i > 0 && (
                  <div className="flex-1 h-0.5" style={{ backgroundColor: done || active ? "#2a465a" : "#e2e8f0" }} />
                )}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300"
                  style={{
                    backgroundColor: done ? "#2a465a" : active ? cfg.bg : "#f8fafc",
                    borderColor: done ? "#2a465a" : active ? cfg.color : "#e2e8f0",
                    boxShadow: active ? `0 0 0 4px ${cfg.color}25` : "none",
                  }}
                >
                  {done ? <CheckCircle2 size={14} className="text-white" />
                    : active ? <Loader2 size={14} style={{ color: cfg.color }} className="animate-spin" />
                      : <span className="w-2 h-2 rounded-full bg-slate-300" />}
                </div>
                {i < MILESTONES.length - 1 && (
                  <div className="flex-1 h-0.5" style={{ backgroundColor: done ? "#2a465a" : "#e2e8f0" }} />
                )}
              </div>
              <p className="mt-2 text-center text-[10px] font-bold leading-tight px-1"
                style={{ color: done ? "#2a465a" : active ? cfg.color : "#94a3b8" }}>
                {m}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Section wrapper (collapsible) ─────────────────────────────────────────────
// Note: Common_Components has no collapsible card, so we keep a minimal one here.
function Section({ title, icon: Icon, children, open: defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2a465a]/10 flex items-center justify-center">
            <Icon size={16} className="text-[#2a465a]" />
          </div>
          <span className="text-sm font-bold text-[#1e293b]">{title}</span>
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-slate-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="px-6 pb-6 border-t border-slate-100">{children}</div>}
    </div>
  );
}


// ── PROJECT LIST ──────────────────────────────────────────────────────────────
function ProjectList({ onSelect }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const counts = {
    all: ALL_PROJECTS.length,
    active: ALL_PROJECTS.filter((p) => ACTIVE_STATUSES.includes(p.status)).length,
    delivered: ALL_PROJECTS.filter((p) => p.status === "Completed").length,
  };

  const filtered = ALL_PROJECTS.filter((p) => {
    const ok =
      filter === "active" ? ACTIVE_STATUSES.includes(p.status) :
        filter === "delivered" ? p.status === "Completed" : true;
    const q = search.toLowerCase();
    return ok && (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
  });

  // Payment history table columns for the modal
  const payColumns = [
    { key: "date", label: "Date" },
    { key: "method", label: "Method" },
    { key: "amount", label: "Amount" },
    { key: "ref", label: "Reference" },
    { key: "status", label: "Status" },
  ];

  return (
    <main className="flex flex-col gap-6">

      {/* Heading banner */}
      <Heading
        primaryText="Your"
        secondaryText="Projects"
        size={12}
        fontSize="2xl"
      />

      {/* Summary DashCards */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Total Projects" value={String(counts.all)} icon={<Package size={22} />} accentColor="#2a465a" size={4} />
        <EnhancedDashCard title="Active" value={String(counts.active)} icon={<TrendingUp size={22} />} accentColor="#f59e0b" size={4} />
        <EnhancedDashCard title="Delivered" value={String(counts.delivered)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" size={4} />
      </DashGrid>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
          {[
            { key: "all", label: `All (${counts.all})` },
            { key: "active", label: `Active (${counts.active})` },
            { key: "delivered", label: `Delivered (${counts.delivered})` },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${filter === t.key ? "bg-[#2a465a] text-white shadow" : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-56">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20"
          />
        </div>
      </div>

      {/* Project cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <FolderOpen size={40} className="mb-3 opacity-40" />
          <p className="text-sm font-bold">No projects found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const cfg = STATUS_CFG[p.status] ?? STATUS_CFG["Not Started"];
            const pay = payStatBadge(p);
            const remaining = Math.max(0, (p.totalCost ?? 0) - (p.paidAmount ?? 0));
            const delivered = p.status === "Completed";

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p.id)}
                className="w-full text-left rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-[#2a465a]/30 transition-all duration-200 overflow-hidden group"
              >
                {delivered && <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />}
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.id}</span>
                        <StatusPill status={p.status} />
                        {delivered && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Delivered {p.deliveredDate}
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-black text-[#1e293b] truncate group-hover:text-[#2a465a] transition-colors">{p.name}</h2>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400"><Calendar size={11} /> {p.startDate}</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400"><Clock size={11} /> Due {p.expectedDelivery}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400">Progress</p>
                        <p className="text-2xl font-black" style={{ color: delivered ? "#22c55e" : cfg.color }}>{p.progress}%</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-[#2a465a] transition-colors" />
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${p.progress}%`,
                        background: delivered
                          ? "linear-gradient(90deg,#34d399,#059669)"
                          : `linear-gradient(90deg,${cfg.color}99,${cfg.color})`,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold" style={{ color: pay.color }}>{pay.label}</span>
                    <span className="text-[11px] text-slate-400">{formatINR(p.paidAmount)} paid of {formatINR(p.totalCost)}</span>
                    {remaining > 0 && <span className="text-[11px] font-bold text-rose-500">· {formatINR(remaining)} remaining</span>}
                    <span className="ml-auto text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.updates.length} updates</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}


    </main>
  );
}

// ── PROJECT DETAIL ────────────────────────────────────────────────────────────
function ProjectDetail({ project: p, onBack }) {
  const pay = payStatBadge(p);
  const remaining = Math.max(0, (p.totalCost ?? 0) - (p.paidAmount ?? 0));
  const [showAll, setShowAll] = useState(false);
  const updates = showAll ? [...p.updates].reverse() : [...p.updates].reverse().slice(0, 3);

  // Payment history rows for DataTable
  const payRows = p.payments.map((pay, i) => ({
    id: i,
    date: pay.date,
    method: pay.method,
    amount: formatINR(pay.amount),
    ref: pay.ref,
    status: pay.status,
  }));

  return (
    <main className="flex flex-col gap-6">

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-[#2a465a] hover:text-[#1a2e3f] transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        All Projects
      </button>

      {/* Heading */}
      <Heading primaryText={p.name} secondaryText={p.id} size={12} fontSize="xl" />

      {/* Hero progress card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1a2e3f] to-[#2a465a] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <StatusPill status={p.status} />
              {p.status === "Completed" && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full">
                  ✓ Delivered {p.deliveredDate}
                </span>
              )}
            </div>
            <p className="text-sm text-white/60">
              <Users size={12} className="inline mr-1" />
              {p.teamLeader?.name ?? "Team not assigned"} · {p.teamLeader?.role ?? ""}
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">Progress</p>
            <p className="text-4xl font-black text-white">{p.progress}%</p>
          </div>
        </div>
        <div className="mt-6 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${p.progress}%`,
              background: p.status === "Completed"
                ? "linear-gradient(90deg,#34d399,#059669)"
                : "linear-gradient(90deg,#38bdf8,#818cf8)",
            }}
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
            <Calendar size={13} />
            <span>Started: <span className="text-white font-bold">{p.startDate}</span></span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
            <Clock size={13} />
            <span>Due: <span className="text-white font-bold">{p.expectedDelivery}</span></span>
          </div>
        </div>
      </div>

      {/* EnhancedDashCards — payment summary */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Project Cost" value={formatINR(p.totalCost)} icon={<Banknote size={22} />} accentColor="#2a465a" size={3} />
        <EnhancedDashCard title="Amount Paid" value={formatINR(p.paidAmount)} icon={<CreditCard size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Remaining" value={formatINR(remaining)} icon={<ReceiptText size={22} />} accentColor={remaining > 0 ? "#f43f5e" : "#22c55e"} size={3} />
        <EnhancedDashCard title="Payment Status" value={pay.label} icon={<ShieldCheck size={22} />} accentColor={pay.color} size={3} />
      </DashGrid>

      {/* Milestones */}
      <Section title="Project Milestones" icon={TrendingUp}>
        <div className="mt-4">
          <MilestoneTrack status={p.status} />
        </div>
      </Section>

      {/* Updates */}
      <Section title="Project Updates" icon={FileText}>
        <div className="mt-4 space-y-3">
          {updates.map((u, i) => {
            const cfg = STATUS_CFG[u.status] ?? STATUS_CFG["Not Started"];
            return (
              <div key={i} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cfg.color}15` }}>
                    <CheckCircle2 size={13} style={{ color: cfg.color }} />
                  </div>
                  {i < updates.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-2" />}
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <StatusPill status={u.status} />
                    <span className="text-[11px] text-slate-400 font-medium">{u.date}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{u.note}</p>
                </div>
              </div>
            );
          })}
          {p.updates.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="w-full text-center text-xs font-bold text-[#2a465a] py-2 hover:text-[#1a2e3f] transition-colors"
            >
              {showAll ? "Show Less ▲" : `Show All ${p.updates.length} Updates ▼`}
            </button>
          )}
        </div>
      </Section>

      {/* Payment Details — DataTable for history */}
      <Section title="Payment Details" icon={CreditCard}>
        <div className="mt-4 space-y-4">
          {/* Summary grid using ModalGrid+ModalData */}
          <ModalGrid title="Summary" cols={2}>
            <ModalData label="Total Cost" value={formatINR(p.totalCost)} />
            <ModalData label="Amount Paid" value={formatINR(p.paidAmount)} />
            <ModalData label="Remaining" value={formatINR(remaining)} />
            <ModalData label="Payment Type" value={p.paymentType} />
          </ModalGrid>

          {/* Payment history as DataTable */}
          {payRows.length > 0 && (
            <DataTable
              title="Payment History"
              columns={[
                { key: "date", label: "Date" },
                { key: "method", label: "Method" },
                { key: "amount", label: "Amount" },
                { key: "ref", label: "Reference" },
                { key: "status", label: "Status" },
              ]}
              rows={payRows}
              size={12}
              pageSize={5}
              searchable={false}
            />
          )}
        </div>
      </Section>

      {/* Work Order */}
      <Section title="Work Order" icon={FileText} open={false}>
        <div className="mt-4 space-y-4">
          <ModalGrid title="Work Order Info" cols={3}>
            <ModalData label="Generated" value={p.woGenerated ? "Yes ✓" : "Pending"} />
            <ModalData label="Signed" value={p.woSigned ? "Yes ✓" : "Pending — Awaiting Signature"} />
            <ModalData label="Signed Date" value={p.woSignedDate ?? "—"} />
          </ModalGrid>

          <div className="flex flex-wrap gap-3 pt-1">
            {p.woPdfLink ? (
              <a
                href={p.woPdfLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2a465a] text-white text-xs font-bold hover:bg-[#1a2e3f] transition-colors"
              >
                <Download size={13} /> Download WO PDF
              </a>
            ) : (
              <button disabled className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed">
                <Download size={13} /> WO Not Yet Generated
              </button>
            )}
            {p.woGenerated && !p.woSigned && (
              <button
                onClick={() => alert("Work Order signing will be implemented with backend integration.")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                <FileText size={13} /> Sign Work Order
              </button>
            )}
          </div>
        </div>
      </Section>

      {/* Project Resources */}
      <Section title="Project Resources" icon={Package} open={false}>
        <div className="mt-4 space-y-3">
          {[
            { label: "Project Drive Folder", link: p.driveLink },
            { label: "Final Handover Link", link: p.handoverLink },
          ].map(({ label, link }) => (
            <div key={label} className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#2a465a]/10 flex items-center justify-center flex-shrink-0">
                  <ExternalLink size={14} className="text-[#2a465a]" />
                </div>
                <p className="text-xs font-bold text-[#1e293b] truncate">{label}</p>
              </div>
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a465a] text-white text-[11px] font-bold hover:bg-[#1a2e3f] transition-colors"
                >
                  Open <ChevronRight size={11} />
                </a>
              ) : (
                <span className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-[11px] font-bold">Not Available</span>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Your Project Team */}
      <Section title="Your Project Team" icon={Users} open={true}>
        <div className="mt-4 space-y-4">
          {/* Manager Card */}
          {p.manager && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2a465a] to-[#1a2e3f] flex items-center justify-center flex-shrink-0 shadow-md">
                  <UserCheck size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#1e293b]">{p.manager.name}</p>
                  <p className="text-[11px] font-bold text-[#2a465a] bg-[#2a465a]/10 px-2 py-0.5 rounded-full inline-block mt-0.5">{p.manager.role}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500"><Phone size={11} /> {p.manager.mobile}</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500"><Mail size={11} /> {p.manager.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 ml-[3.75rem]">
                <a href={`tel:${p.manager.mobile}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2a465a] text-white text-[11px] font-bold hover:bg-[#1a2e3f] transition-colors">
                  <Phone size={11} /> Call
                </a>
                <a href={`mailto:${p.manager.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[#2a465a] text-[11px] font-bold hover:bg-slate-100 transition-colors">
                  <Mail size={11} /> Email
                </a>
              </div>
            </div>
          )}

          {/* Team Leader Card */}
          {p.teamLeader && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Users size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-[#1e293b]">{p.teamLeader.name}</p>
                  <p className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full inline-block mt-0.5">{p.teamLeader.role}</p>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500"><Phone size={11} /> {p.teamLeader.mobile}</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500"><Mail size={11} /> {p.teamLeader.email}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 ml-[3.75rem]">
                <a href={`tel:${p.teamLeader.mobile}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-white text-[11px] font-bold hover:bg-sky-600 transition-colors">
                  <Phone size={11} /> Call
                </a>
                <a href={`mailto:${p.teamLeader.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sky-600 text-[11px] font-bold hover:bg-sky-50 transition-colors">
                  <Mail size={11} /> Email
                </a>
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-2">
            For general inquiries write to{" "}
            <a href="mailto:support@graphura.in" className="text-[#2a465a] font-bold underline">
              support@graphura.in
            </a>
          </p>
        </div>
      </Section>


    </main>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function ClientPanel() {
  const [selectedId, setSelectedId] = useState(null);
  const project = ALL_PROJECTS.find((p) => p.id === selectedId) ?? null;

  // Default: projects view (also used for dashboard)
  if (project) {
    return <ProjectDetail project={project} onBack={() => setSelectedId(null)} />;
  }

  return <ProjectList onSelect={setSelectedId} />;
}
