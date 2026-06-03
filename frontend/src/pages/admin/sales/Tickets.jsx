import { useState, useMemo } from "react";
import {
  Ticket,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  Eye,
  UserCog,
  X,
  Paperclip,
  MessageSquare,
  Zap,
  Filter,
} from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard,
  DataTable,
  PanelModal as Modal,
  openModal,
  closeModal,
  DataField,
  SelectField,
  Option,
  Grid,
} from "../../../components/shared/Common_Components";

// ── Mock tickets ──
const mockTickets = [
  { id: "TKT-001", subject: "Payment not reflecting in wallet", customer: "Arun Kapoor", priority: "High", status: "Open", assignee: "Rahul S.", created: "Apr 21, 2026", lastUpdate: "2 hr ago", avatar: "AK" },
  { id: "TKT-002", subject: "Unable to access executive dashboard", customer: "Priya Mehta", priority: "Urgent", status: "In Progress", assignee: "Neha S.", created: "Apr 20, 2026", lastUpdate: "4 hr ago", avatar: "PM" },
  { id: "TKT-003", subject: "Feature request: batch export to PDF", customer: "Vikash Sharma", priority: "Low", status: "Open", assignee: "Deepika N.", created: "Apr 19, 2026", lastUpdate: "1 day ago", avatar: "VS" },
  { id: "TKT-004", subject: "Data discrepancy in regional report", customer: "Ritu Desai", priority: "Medium", status: "In Progress", assignee: "Anita B.", created: "Apr 18, 2026", lastUpdate: "3 hr ago", avatar: "RD" },
  { id: "TKT-005", subject: "Login issues on mobile (Android)", customer: "Rohan Gupta", priority: "High", status: "Resolved", assignee: "Rahul S.", created: "Apr 17, 2026", lastUpdate: "Today", avatar: "RG" },
  { id: "TKT-006", subject: "Billing cycle query on subscription", customer: "Sanya Patel", priority: "Low", status: "Open", assignee: "Neha S.", created: "Apr 16, 2026", lastUpdate: "2 days ago", avatar: "SP" },
  { id: "TKT-007", subject: "CRITICAL: API rate limit exceeded", customer: "Deepak Rao", priority: "Urgent", status: "In Progress", assignee: "Deepika N.", created: "Apr 15, 2026", lastUpdate: "1 hr ago", avatar: "DR" },
  { id: "TKT-008", subject: "Onboarding assistance for team", customer: "Ananya Nair", priority: "Medium", status: "Resolved", assignee: "Anita B.", created: "Apr 14, 2026", lastUpdate: "Yesterday", avatar: "AN" },
];

const priorityColors = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-amber-100 text-amber-700",
  Urgent: "bg-rose-100 text-rose-700",
};

const statusColors = {
  Open: "bg-blue-50 text-blue-600 border border-blue-100",
  "In Progress": "bg-amber-50 text-amber-600 border border-amber-100",
  Resolved: "bg-emerald-50 text-emerald-600 border border-emerald-100",
};

const priorityFilters = ["All", "Low", "Medium", "High", "Urgent"];

// ── Mock conversation thread ──
const mockThread = [
  { id: 1, author: "Customer", message: "I've been trying to access my dashboard but keep getting a 403 error. Can you help?", time: "Apr 20, 2:30 PM", isInternal: false },
  { id: 2, author: "Neha S.", message: "I've checked your account permissions. It seems your session expired. I've reset your access tokens.", time: "Apr 20, 3:15 PM", isInternal: false },
  { id: 3, author: "Neha S.", message: "Internal note: Customer's account had stale JWT token. Cleared cache and regenerated.", time: "Apr 20, 3:16 PM", isInternal: true },
  { id: 4, author: "Customer", message: "Still getting the same error. I've cleared my browser cache too.", time: "Apr 20, 4:00 PM", isInternal: false },
];

export default function Tickets() {
  const [tickets] = useState(mockTickets);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Stats
  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedToday = tickets.filter((t) => t.status === "Resolved").length;

  // Filtered
  const filtered = useMemo(() => {
    if (priorityFilter === "All") return tickets;
    return tickets.filter((t) => t.priority === priorityFilter);
  }, [tickets, priorityFilter]);

  const columns = [
    { key: "subject", label: "Subject Line" },
    { key: "customer", label: "Requester" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "State" },
    { key: "lastUpdate", label: "Updated" },
  ];

  const tableRows = filtered.map(t => ({
    ...t,
    subject: <span className="font-bold text-[#2a465a] block truncate max-w-[200px]">{t.subject}</span>,
    priority: <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${priorityColors[t.priority]}`}>{t.priority}</span>,
    status: <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColors[t.status]}`}>{t.status}</span>,
    assignee: <div className="flex items-center gap-2 font-bold text-slate-500"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">{t.assignee.charAt(0)}</div>{t.assignee}</div>
  }));

  const actions = [
    {
      label: "View",
      icon: <Eye size={14} />,
      variant: "primary",
      onClick: (row) => {
        setSelectedTicket(row);
        setDrawerOpen(true);
      },
    },
    {
      label: "Escalate",
      icon: <Zap size={14} />,
      variant: "ghost",
      onClick: (row) => alert(`Escalating ${row.id}`),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#2a465a] flex items-center gap-2">
            Support Headquarters <Ticket className="text-[#38bdf8]" size={24} />
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Intelligent ticket lifecycle management and customer success tracking</p>
        </div>
        <button onClick={() => openModal("new-ticket-modal")} className="flex items-center gap-2 rounded-2xl bg-[#2a465a] px-6 py-3.5 text-xs font-black text-white shadow-xl shadow-[#2a465a]/20 hover:bg-gradient-to-r hover:from-[#1e3a52] hover:to-[#2b5a7a] transition active:scale-95 w-fit uppercase tracking-widest shiny-sweep">
          <Plus size={16} strokeWidth={3} /> NEW TICKET
        </button>
      </div>

      {/* Stat Cards */}
      <DashGrid cols={12} gap={4}>
        <EnhancedDashCard title="Open Queue" value={String(openCount)} icon={<AlertCircle size={22} />} accentColor="#3b82f6" size={3} />
        <EnhancedDashCard title="Under Investigation" value={String(inProgressCount)} icon={<Clock size={22} />} accentColor="#f59e0b" size={3} />
        <EnhancedDashCard title="Solutions Found" value={String(resolvedToday)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" size={3} />
        <EnhancedDashCard title="Mean Resolution" value="3.8h" icon={<Zap size={22} />} accentColor="#a855f7" size={3} />
      </DashGrid>

      {/* Interface Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 mr-2 shadow-inner">
             <Filter size={12} className="text-slate-400" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Filter</span>
          </div>
          {priorityFilters.map((p) => {
            const isActive = priorityFilter === p;
            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive
                    ? "bg-[#2a465a] text-white shadow-lg shadow-[#2a465a]/20 scale-105"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-[#2a465a]/30 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <DataTable 
        title="Incident Manifest" 
        columns={columns} 
        rows={tableRows} 
        actions={actions} 
        pageSize={5} 
        searchable 
        size={12}
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High", "Urgent"] },
          { title: "Status", type: "toggle", key: "status", options: ["Open", "In Progress", "Resolved"] },
        ]}
      />

      {/* Ticket Detail Drawer */}
      {drawerOpen && <div className="fixed inset-0 z-[9998] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setDrawerOpen(false)} />}
      <div className={`fixed top-0 right-0 z-[9999] h-full w-full max-w-xl bg-white shadow-2xl transform transition-transform duration-500 ease-out overflow-hidden flex flex-col ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        {selectedTicket && (
          <>
            {/* Drawer Header */}
            <div className="relative px-8 py-7 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${priorityColors[selectedTicket.priority]}`}>{selectedTicket.priority}</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:rotate-90 transition-all duration-300"><X size={24} /></button>
              </div>
              <h3 className="text-2xl font-black text-[#2a465a] leading-tight">{selectedTicket.subject}</h3>
              <div className="flex items-center gap-4 mt-4">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2a465a] text-white flex items-center justify-center font-black text-xs">A</div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Customer</p>
                       <p className="text-xs font-bold text-[#2a465a]">{selectedTicket.customer}</p>
                    </div>
                 </div>
                 <div className="w-px h-8 bg-slate-200" />
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Status</p>
                    <span className={`text-xs font-black uppercase ${selectedTicket.status === "Resolved" ? "text-emerald-500" : "text-amber-500"}`}>{selectedTicket.status}</span>
                 </div>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar">
              {mockThread.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.author === "Customer" ? "items-start" : "items-end"}`}>
                  <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-sm border ${
                    msg.isInternal ? "bg-amber-50 border-amber-100 italic" : 
                    msg.author === "Customer" ? "bg-white border-slate-100 rounded-bl-none" : "bg-[#2a465a] text-white rounded-br-none shadow-[#2a465a]/20"
                  }`}>
                    <div className="flex items-center justify-between mb-3 border-b pb-2 sm:min-w-[200px]" style={{ borderColor: msg.author === "Customer" ? "#f1f5f9" : "#ffffff20" }}>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${msg.author === "Customer" ? "text-slate-400" : "text-[#7AAACE]"}`}>
                        {msg.author} {msg.isInternal && "• INTERNAL"}
                      </span>
                      <span className={`text-[10px] ${msg.author === "Customer" ? "text-slate-400" : "text-white/60"}`}>{msg.time}</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
              
              {/* Timeline Info */}
              <div className="mt-12 pt-8 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Workflow Chronology</h4>
                <div className="space-y-4">
                  {[
                    { label: "Ticket Spawned", time: selectedTicket.created, icon: Plus, color: "text-blue-500" },
                    { label: "Security Handshake", time: "5 min later", icon: UserCog, color: "text-purple-500" },
                    { label: "Investigation Phase", time: selectedTicket.lastUpdate, icon: Clock, color: "text-amber-500" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className={`w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center ${s.color} transition-transform group-hover:scale-110`}>
                        <s.icon size={14} strokeWidth={3} />
                      </div>
                      <div className="flex-1 border-b border-slate-50 pb-2 flex justify-between items-center">
                         <span className="text-xs font-black text-[#2a465a]/60 uppercase tracking-wider">{s.label}</span>
                         <span className="text-[10px] font-bold text-slate-400">{s.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Response Input */}
            <div className="px-8 py-6 border-t border-slate-100 bg-white">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea rows={2} placeholder="Compose strategic response..." className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:border-[#2a465a]/20 focus:bg-white transition-all resize-none shadow-inner" />
                  <div className="absolute right-3 bottom-3 flex gap-1">
                     <button className="p-2 text-slate-400 hover:text-[#2a465a] transition"><Paperclip size={18} /></button>
                     <button className="p-2 text-slate-400 hover:text-[#2a465a] transition"><MessageSquare size={18} /></button>
                  </div>
                </div>
                <button onClick={() => { alert("Response submitted successfully!"); setDrawerOpen(false); }} className="h-[60px] px-8 rounded-2xl bg-[#2a465a] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#2a465a]/20 hover:scale-105 active:scale-95 transition-all shiny-sweep">Send</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Ticket Modal */}
      <Modal id="new-ticket-modal" title="Initialize Support Incident">
        <div className="space-y-6 pt-2">
          <Grid cols={12} gap={4}>
            <DataField label="Subject Description" id="ticket-subject" size={12} placeholder="Clear summary of the issue" />
            <DataField label="Customer Identity" id="ticket-customer" size={6} placeholder="Client name" />
            <SelectField label="Priority Level" id="ticket-priority" size={6} placeholder="Dimension">
              <Option value="low" label="Low Priority" />
              <Option value="medium" label="Medium Range" />
              <Option value="high" label="High Priority" />
              <Option value="urgent" label="Immediate Internal Action" />
            </SelectField>
          </Grid>
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
            <button onClick={() => closeModal("new-ticket-modal")} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">ABORT</button>
            <button onClick={() => { closeModal("new-ticket-modal"); alert("Incident Registered!"); }} className="px-8 py-3 rounded-xl text-sm font-black text-white bg-[#2a465a] shadow-xl shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95 uppercase tracking-wider shiny-sweep">LAUNCH INCIDENT</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

