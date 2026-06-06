import { useState, useMemo, useEffect } from "react";
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
import { getMyTickets, resolveTicket, escalateTicket, closeTicket, createTicket, addReply, getTicketById } from "../../../services/ticketService";

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
  Closed: "bg-slate-50 text-slate-600 border border-slate-100",
  Escalated: "bg-rose-50 text-rose-600 border border-rose-100",
};

const priorityFilters = ["All", "Low", "Medium", "High", "Urgent"];

const mapBackendTicket = (t) => {
  const priorityMap = {
    LOW: "Low",
    NORMAL: "Medium",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  };
  const statusMap = {
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    ESCALATED: "Escalated",
  };
  return {
    _id: t._id,
    id: t._id.slice(-6).toUpperCase(),
    subject: t.subject || "",
    customer: t.raisedBy?.name || "Unknown",
    priority: priorityMap[t.priority] || "Medium",
    status: statusMap[t.status] || "Open",
    assignee: t.assignedTo?.name || "Unassigned",
    created: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "",
    lastUpdate: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "",
    avatar: (t.raisedBy?.name || "U").slice(0, 2).toUpperCase(),
    message: t.message || "",
    conversation: t.conversation || [],
  };
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // New ticket form state
  const [subject, setSubject] = useState("");
  const [customer, setCustomer] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getMyTickets({ limit: 100 });
      const mapped = (res.tickets || []).map(mapBackendTicket);
      setTickets(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticket) => {
    try {
      const fullTicket = await getTicketById(ticket._id);
      setSelectedTicket(mapBackendTicket(fullTicket));
    } catch (err) {
      setSelectedTicket(ticket);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Stats
  const openCount = tickets.filter((t) => t.status === "Open" || t.status === "In Progress" || t.status === "Escalated").length;
  const inProgressCount = tickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

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
    priority: <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${priorityColors[t.priority] || "bg-slate-100"}`}>{t.priority}</span>,
    status: <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColors[t.status] || "bg-slate-100"}`}>{t.status}</span>,
    assignee: <div className="flex items-center gap-2 font-bold text-slate-500"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">{t.assignee.charAt(0)}</div>{t.assignee}</div>
  }));

  const actions = [
    {
      label: "View",
      icon: <Eye size={14} />,
      variant: "primary",
      onClick: async (row) => {
        setReplyText("");
        setDrawerOpen(true);
        await fetchTicketDetails(row);
      },
    },
    {
      label: "Escalate",
      icon: <Zap size={14} />,
      variant: "ghost",
      show: (row) => row.status !== "Resolved" && row.status !== "Closed" && row.status !== "Escalated",
      onClick: async (row) => {
        try {
          await escalateTicket(row._id, "Escalated by Admin");
          await fetchTickets();
        } catch (err) {
          alert(err.message || "Failed to escalate");
        }
      },
    },
  ];

  const handleLaunchIncident = async () => {
    if (!subject.trim() || !customer.trim()) return;
    setSubmitting(true);
    try {
      await createTicket({
        subject: subject.trim(),
        message: customer.trim(),
        priority: priority,
        category: "SYSTEM",
      });
      setSubject("");
      setCustomer("");
      setPriority("Medium");
      closeModal("new-ticket-modal");
      await fetchTickets();
    } catch (err) {
      alert(err.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      await addReply(selectedTicket._id, replyText);
      setReplyText("");
      await fetchTicketDetails(selectedTicket);
      await fetchTickets();
    } catch (err) {
      alert(err.message || "Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  // Convert conversation to display format
  const thread = useMemo(() => {
    if (!selectedTicket) return [];
    const conversation = selectedTicket.conversation || [];
    return [
      {
        id: selectedTicket._id,
        author: selectedTicket.customer,
        message: selectedTicket.message,
        time: selectedTicket.created,
        isInternal: false,
      },
      ...conversation.map((c, idx) => ({
        id: idx,
        author: c.senderName || c.senderRole || "System",
        message: c.message,
        time: c.repliedAt ? new Date(c.repliedAt).toLocaleString() : "",
        isInternal: false,
      }))
    ];
  }, [selectedTicket]);

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
        <EnhancedDashCard title="Solutions Found" value={String(resolvedCount)} icon={<CheckCircle2 size={22} />} accentColor="#22c55e" size={3} />
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
        defaultSortKey={null}
        loading={loading}
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High", "Urgent"] },
          { title: "Status", type: "toggle", key: "status", options: ["Open", "In Progress", "Resolved", "Closed", "Escalated"] },
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
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${priorityColors[selectedTicket.priority] || "bg-slate-100"}`}>{selectedTicket.priority}</span>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:rotate-90 transition-all duration-300"><X size={24} /></button>
              </div>
              <h3 className="text-2xl font-black text-[#2a465a] leading-tight">{selectedTicket.subject}</h3>
              <div className="flex items-center gap-4 mt-4">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2a465a] text-white flex items-center justify-center font-black text-xs">{selectedTicket.avatar}</div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Customer</p>
                       <p className="text-xs font-bold text-[#2a465a]">{selectedTicket.customer}</p>
                    </div>
                 </div>
                 <div className="w-px h-8 bg-slate-200" />
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Current Status</p>
                    <span className={`text-xs font-black uppercase ${selectedTicket.status === "Resolved" || selectedTicket.status === "Closed" ? "text-emerald-500" : "text-amber-500"}`}>{selectedTicket.status}</span>
                 </div>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar">
              {thread.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.author === selectedTicket.customer ? "items-start" : "items-end"}`}>
                  <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-sm border ${
                    msg.isInternal ? "bg-amber-50 border-amber-100 italic" : 
                    msg.author === selectedTicket.customer ? "bg-white border-slate-100 rounded-bl-none" : "bg-[#2a465a] text-white rounded-br-none shadow-[#2a465a]/20"
                  }`}>
                    <div className="flex items-center justify-between mb-3 border-b pb-2 sm:min-w-[200px]" style={{ borderColor: msg.author === selectedTicket.customer ? "#f1f5f9" : "#ffffff20" }}>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${msg.author === selectedTicket.customer ? "text-slate-400" : "text-[#7AAACE]"}`}>
                        {msg.author}
                      </span>
                      <span className={`text-[10px] ${msg.author === selectedTicket.customer ? "text-slate-400" : "text-white/60"}`}>{msg.time}</span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Response Input */}
            <div className="px-8 py-6 border-t border-slate-100 bg-white">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea rows={2} placeholder="Compose strategic response..." value={replyText} onChange={e => setReplyText(e.target.value)} disabled={replying} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:border-[#2a465a]/20 focus:bg-white transition-all resize-none shadow-inner" />
                  <div className="absolute right-3 bottom-3 flex gap-1">
                     <button className="p-2 text-slate-400 hover:text-[#2a465a] transition"><Paperclip size={18} /></button>
                     <button className="p-2 text-slate-400 hover:text-[#2a465a] transition"><MessageSquare size={18} /></button>
                  </div>
                </div>
                <button onClick={handleSendReply} disabled={replying || !replyText.trim()} className="h-[60px] px-8 rounded-2xl bg-[#2a465a] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#2a465a]/20 hover:scale-105 active:scale-95 transition-all shiny-sweep disabled:opacity-50">
                  {replying ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* New Ticket Modal */}
      <Modal id="new-ticket-modal" title="Initialize Support Incident">
        <div className="space-y-6 pt-2">
          <Grid cols={12} gap={4}>
            <DataField label="Subject Description" id="ticket-subject" size={12} placeholder="Clear summary of the issue" value={subject} onChange={e => setSubject(e.target.value)} />
            <DataField label="Customer Identity / Message" id="ticket-customer" size={12} placeholder="Client name / Message content" value={customer} onChange={e => setCustomer(e.target.value)} />
            <SelectField label="Priority Level" id="ticket-priority" size={12} placeholder="Dimension" value={priority} onChange={e => setPriority(e.target.value)}>
              <Option value="Low" label="Low Priority" />
              <Option value="Medium" label="Medium Range" />
              <Option value="High" label="High Priority" />
            </SelectField>
          </Grid>
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100">
            <button onClick={() => closeModal("new-ticket-modal")} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition">ABORT</button>
            <button onClick={handleLaunchIncident} disabled={submitting || !subject.trim() || !customer.trim()} className="px-8 py-3 rounded-xl text-sm font-black text-white bg-[#2a465a] shadow-xl shadow-[#2a465a]/20 hover:bg-[#1e3a52] transition active:scale-95 uppercase tracking-wider shiny-sweep disabled:opacity-50">
              {submitting ? "LAUNCHING..." : "LAUNCH INCIDENT"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
