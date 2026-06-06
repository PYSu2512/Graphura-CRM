/**
 * Sales Executive — Support Tickets Page
 * - Raises tickets (auto-routes to Sales Team Leader)
 * - Views tickets and STL replies (read-only chat)
 * - No attachment field
 */
import { useState, useEffect, useCallback } from "react";
import { MessageSquare } from "lucide-react";
import {
  DashGrid, EnhancedDashCard, DataTable, Grid, DataField,
  openModal, closeModal, Modal, Select, Option,
  Button, UserChat, Heading,
} from "../../../../components/shared/Common_Components";
import {
  createTicket,
  getMyRaisedTickets,
  getTicketStats,
  getTicketById,
  addReply,
  mapTicket,
} from "../../../../services/ticketService";
import { Ticket, Clock, MessageSquare as MsgIcon, CheckCircle2 as CheckIcon, Shield, AlertTriangle } from "lucide-react";

const ticketCols = [
  { key: "title",       label: "Subject"      },
  { key: "priority",    label: "Priority"     },
  { key: "status",      label: "Status"       },
  { key: "createdDate", label: "Created Date" },
  { key: "lastReply",   label: "Last Updated" },
];

const blankForm = { title: "", category: "", priority: "Medium", description: "", targetHierarchy: "ALL" };

export default function Support() {
  const [tickets,    setTickets]    = useState([]);
  const [stats,      setStats]      = useState({ total: 0, inProgress: 0, replied: 0, resolved: 0 });
  const [selected,   setSelected]   = useState(null);
  const [form,       setForm]       = useState(blankForm);
  const [formErr,    setFormErr]    = useState({});
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [error,      setError]      = useState(null);

  // ── Fetch tickets raised by this SE ──────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ticketData = await getMyRaisedTickets({ limit: 100 });
      const mapped = (ticketData.tickets || []).map(mapTicket);
      setTickets(mapped);

      // Compute stats from fetched tickets
      const total      = mapped.length;
      const inProgress = mapped.filter(t => t.status === 'In Progress').length;
      const replied    = mapped.filter(t => t.status === 'In Progress').length;
      const resolved   = mapped.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
      setStats({ total, inProgress, replied, resolved });
    } catch (err) {
      setError(err?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (formErr[k]) setFormErr(e => ({ ...e, [k]: '' }));
  };

  // ── Open view modal ───────────────────────────────────────────────────────
  const openView = async (row) => {
    try {
      const fresh = await getTicketById(row._id);
      setSelected(mapTicket(fresh));
    } catch {
      setSelected(row);
    }
    openModal('se-ticket-view-modal');
  };

  // ── Create ticket ─────────────────────────────────────────────────────────
  const handleCreateSubmit = async () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = 'Subject is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    setSubmitting(true);
    try {
      await createTicket({
        subject:  form.title.trim(),
        message:  form.description.trim(),
        priority: form.priority,
        category: form.category || null,
        targetHierarchy: form.targetHierarchy || "ALL",
      });
      setForm(blankForm);
      setFormErr({});
      closeModal('se-create-ticket-modal');
      await fetchData();
    } catch (err) {
      const msg = err?.message || err?.data?.message || 'Failed to create ticket.';
      setFormErr({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (msg) => {
    if (!selected) return;
    setReplyLoading(true);
    try {
      const updated = mapTicket(await addReply(selected._id, msg.text));
      setTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
      setSelected(updated);
    } catch (err) { alert(err?.message || 'Failed to send reply'); }
    finally { setReplyLoading(false); }
  };

  const statCards = [
    { title: 'Total Tickets', value: String(stats.total),      color: '#3b82f6', icon: Ticket    },
    { title: 'In Progress',   value: String(stats.inProgress), color: '#f59e0b', icon: Clock     },
    { title: 'Replied',       value: String(stats.replied),    color: '#8b5cf6', icon: MsgIcon   },
    { title: 'Resolved',      value: String(stats.resolved),   color: '#22c55e', icon: CheckIcon },
  ];

  const actions = [
    { icon: <MessageSquare size={15} />, tooltip: 'View & Reply', variant: 'primary', onClick: openView },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Support Tickets" secondaryText="View and manage your support requests" />

      <DashGrid cols={12} gap={4}>
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <EnhancedDashCard
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={<Icon size={22} />}
              accentColor={stat.color}
              size={3}
            />
          );
        })}
      </DashGrid>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">
          {error} — <button className="underline" onClick={fetchData}>Retry</button>
        </div>
      )}

      <div className="flex justify-end">
        <Button text="+ Raise Support Ticket" variant="primary" size={3}
          onClick={() => openModal('se-create-ticket-modal')} />
      </div>

      <DataTable
        title="My Support Tickets"
        columns={ticketCols}
        rows={tickets}
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        loading={loading}
        defaultSortKey={null}
        filters={[
          { title: 'Priority', type: 'toggle', key: 'priority', options: ['Low', 'Medium', 'High'] },
          { title: 'Status',   type: 'toggle', key: 'status',   options: ['Open', 'In Progress', 'Resolved', 'Escalated', 'Closed'] },
        ]}
      />

      {/* ── Create Ticket Modal ── */}
      <Modal id="se-create-ticket-modal" title="Raise New Ticket" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <DataField label="Subject *" id="se-tkt-title" size={12}
                value={form.title} onChange={e => setField('title', e.target.value)}
                placeholder="Briefly describe the issue" />
              {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
            </div>

            <div className="col-span-12 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Raise To</label>
              <Select value={form.targetHierarchy} onChange={e => setField('targetHierarchy', e.target.value)} 
                placeholder="Select an option (Default: All)" size={12}>
                <Option value="ALL"     label="All" />
                <Option value="TL"      label="Team Lead" />
                <Option value="MANAGER" label="Manager" />
              </Select>
            </div>

            <div className="col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Category</label>
              <Select value={form.category} onChange={e => setField('category', e.target.value)}
                placeholder="Select category" size={12}>
                <Option value="CLIENT_DATA" label="Client Data" />
                <Option value="SYSTEM"      label="System Issue" />
                <Option value="SALES_TL"    label="Sales Team Lead" />
              </Select>
            </div>

            <div className="col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Priority</label>
              <Select value={form.priority} onChange={e => setField('priority', e.target.value)} size={12}>
                <Option value="Low"    label="Low" />
                <Option value="Medium" label="Medium" />
                <Option value="High"   label="High" />
              </Select>
            </div>

            <div className="col-span-12">
              <DataField label="Description *" id="se-tkt-desc" type="textarea" rows={4} size={12}
                value={form.description} onChange={e => setField('description', e.target.value)}
                placeholder="Provide detailed information about the issue..." />
              {formErr.description && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.description}</p>}
            </div>

            {formErr.submit && (
              <div className="col-span-12">
                <p className="text-xs text-rose-600 px-1">{formErr.submit}</p>
              </div>
            )}
          </Grid>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button text="Cancel" variant="secondary" size={3}
              onClick={() => { setForm(blankForm); setFormErr({}); closeModal('se-create-ticket-modal'); }} />
            <Button text={submitting ? 'Submitting…' : 'Raise Ticket'} variant="primary" size={3}
              onClick={handleCreateSubmit} disabled={submitting} />
          </div>
        </div>
      </Modal>

      {/* ── View Modal ── */}
      <Modal id="se-ticket-view-modal" title="My Ticket Details" size="lg">
        {selected && (
          <SETicketDetail 
            selected={selected} 
            onSend={handleReply} 
            loading={replyLoading}
            onClose={() => closeModal('se-ticket-view-modal')} />
        )}
      </Modal>
    </div>
  );
}

function SETicketDetail({ selected, onSend, loading, onClose }) {
  const statusColors = {
    'Open':        'bg-amber-100 text-amber-700',
    'In Progress': 'bg-purple-100 text-purple-700',
    'Replied':     'bg-blue-100 text-blue-700',
    'Resolved':    'bg-emerald-100 text-emerald-700',
    'Escalated':   'bg-rose-100 text-rose-700',
    'Closed':      'bg-slate-100 text-slate-600',
  };

  const targetLabels = { TL: 'Team Lead', MANAGER: 'Manager', ADMIN: 'Admin', ALL: 'All' };

  const conversation = (() => {
    const msgs = selected.conversation || [];
    if (!selected.description?.trim()) return msgs;
    return [
      { id: '__initial__', sender: 'Sales Executive',
        time: selected.createdDate ? `${selected.createdDate} 00:00` : '',
        text: selected.description },
      ...msgs,
    ];
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: 'Raised By', value: 'Sales Executive' },
          { label: 'Raised To', value: targetLabels[selected.targetHierarchy] || selected.targetHierarchy },
          { label: 'Priority',  value: selected.priority },
          { label: 'Status',    value: selected.status },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-xs font-bold ${label === 'Status'
              ? `inline-flex px-2 py-0.5 rounded-full ${statusColors[value] ?? 'bg-slate-100 text-slate-600'}`
              : 'text-[#2a465a]'}`}>{value}</p>
          </div>
        ))}
        <div className="col-span-2 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Title</p>
          <p className="text-xs font-bold text-[#2a465a]">{selected.title}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conversation</p>
        <UserChat messages={conversation} onSend={onSend} currentUser="Sales Executive"
          maxHeight="max-h-72" loading={loading} />
      </div>

      <div className="flex justify-end pt-1 border-t border-slate-100">
        <button onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition active:scale-95">
          Close
        </button>
      </div>
    </div>
  );
}
