/**
 * Sales Team Leader — Tickets Page
 * My Tickets: tickets TL raised (go to Sales Manager)
 * Team Tickets: tickets executives raised TO the TL (TL replies)
 */
import { useState, useEffect, useCallback } from "react";
import {
  DashGrid, EnhancedDashCard, DataTable, Grid, DataField,
  openModal, closeModal, Modal, Select, Option,
  Heading, Button, UserChat,
} from "../../../../components/shared/Common_Components";
import {
  createTicket, getMyRaisedTickets, getAssignedTickets,
  getTicketById, addReply, escalateTicket, resolveTicket, mapTicket,
} from "../../../../services/ticketService";
import { Ticket, CheckCircle, AlertCircle, Clock, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";

const kpiIcons   = [<Ticket size={22}/>, <AlertCircle size={22}/>, <Clock size={22}/>, <CheckCircle size={22}/>];
const kpiAccents = ['#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e'];
const kpiLabels  = ['Total Tickets', 'In Progress', 'Replied', 'Resolved'];

const teamCols = [
  { key: 'id',          label: 'Ticket ID'    },
  { key: 'title',       label: 'Title'        },
  { key: 'raisedBy',    label: 'Raised By'    },
  { key: 'role',        label: 'Role'         },
  { key: 'priority',    label: 'Priority'     },
  { key: 'status',      label: 'Status'       },
  { key: 'createdDate', label: 'Created Date' },
];

const myCols = [
  { key: 'id',          label: 'Ticket ID'  },
  { key: 'title',       label: 'Title'      },
  { key: 'priority',    label: 'Priority'   },
  { key: 'status',      label: 'Status'     },
  { key: 'createdDate', label: 'Created'    },
  { key: 'lastReply',   label: 'Last Reply' },
];

const blankForm = { title: '', category: '', priority: '', description: '' };

export default function AllTickets() {
  const [teamTickets,  setTeamTickets]  = useState([]);
  const [myTickets,    setMyTickets]    = useState([]);
  const [stats,        setStats]        = useState([0, 0, 0, 0]);
  const [selected,     setSelected]     = useState(null);
  const [mySelected,   setMySelected]   = useState(null);
  const [form,         setForm]         = useState(blankForm);
  const [formErr,      setFormErr]      = useState({});
  const [loading,      setLoading]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignedData, raisedData] = await Promise.all([
        getAssignedTickets({ limit: 100 }),
        getMyRaisedTickets({ limit: 100 }),
      ]);
      const team = (assignedData.tickets || []).map(mapTicket);
      const mine = (raisedData.tickets  || []).map(mapTicket)
        .filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
      setTeamTickets(team);
      setMyTickets(mine);

      const all = [...team, ...mine];
      setStats([
        all.length,
        all.filter(t => t.status === 'In Progress').length,
        all.filter(t => t.status === 'In Progress').length,
        all.filter(t => t.status === 'Resolved').length,
      ]);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (formErr[k]) setFormErr(e => ({ ...e, [k]: '' }));
  };

  const openTeamView = async (row) => {
    try { setSelected(mapTicket(await getTicketById(row._id))); }
    catch { setSelected(row); }
    openModal('tl-team-ticket-view');
  };

  const openMyView = async (row) => {
    try { setMySelected(mapTicket(await getTicketById(row._id))); }
    catch { setMySelected(row); }
    openModal('tl-my-ticket-view');
  };

  const sendTeamReply = async (msg) => {
    if (!selected) return;
    setReplyLoading(true);
    try {
      const updated = mapTicket(await addReply(selected._id, msg.text));
      setTeamTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
      setSelected(updated);
    } catch (err) { alert(err?.message || 'Failed to send reply'); }
    finally { setReplyLoading(false); }
  };

  const handleEscalate = async (row) => {
    try {
      await escalateTicket(row._id, 'Escalated by Team Leader to Sales Manager');
      await fetchData();
    } catch (err) { alert(err?.message || 'Could not escalate'); }
  };

  const handleResolveTeamTicket = async (row) => {
    try {
      await resolveTicket(row._id);
      await fetchData();
    } catch (err) { alert(err?.message || 'Could not resolve ticket'); }
  };

  const handleCreateSubmit = async () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = 'Title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    setSubmitting(true);
    try {
      await createTicket({
        subject:  form.title.trim(),
        message:  form.description.trim(),
        priority: form.priority || 'Medium',
        category: form.category || null,
      });
      setForm(blankForm);
      setFormErr({});
      closeModal('tl-ticket-create');
      await fetchData();
    } catch (err) {
      setFormErr({ submit: err?.message || err?.data?.message || 'Failed to create ticket.' });
    } finally { setSubmitting(false); }
  };

  const teamActions = [
    { icon: <MessageSquare size={15}/>, tooltip: 'View & Reply',        variant: 'primary', onClick: openTeamView },
    { icon: <CheckCircle2  size={15}/>, tooltip: 'Mark Resolved',        variant: 'success', onClick: handleResolveTeamTicket },
    { icon: <AlertTriangle size={15}/>, tooltip: 'Escalate to Manager',  variant: 'danger',  onClick: handleEscalate },
  ];
  const myActions = [
    { icon: <MessageSquare size={15}/>, tooltip: 'View', variant: 'primary', onClick: openMyView },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Support Ticket" secondaryText="Management" size={12} />
        {kpiLabels.map((label, i) => (
          <EnhancedDashCard key={label} title={label} value={String(stats[i])}
            icon={kpiIcons[i]} accentColor={kpiAccents[i]} size={3} />
        ))}
      </DashGrid>

      <div className="flex justify-end">
        <Button text="+ Create Ticket" variant="primary" size={3}
          onClick={() => openModal('tl-ticket-create')} />
      </div>

      <DataTable title="My Tickets" columns={myCols} rows={myTickets} actions={myActions}
        size={12} pageSize={5} searchable loading={loading}
        filters={[
          { title: 'Priority', type: 'toggle', key: 'priority', options: ['Low', 'Medium', 'High'] },
          { title: 'Status',   type: 'toggle', key: 'status',   options: ['Open', 'In Progress', 'Resolved', 'Escalated'] },
        ]} />

      <DataTable title="Team Tickets" columns={teamCols} rows={teamTickets} actions={teamActions}
        size={12} pageSize={10} searchable loading={loading}
        filters={[
          { title: 'Priority', type: 'toggle', key: 'priority', options: ['Low', 'Medium', 'High'] },
          { title: 'Status',   type: 'toggle', key: 'status',   options: ['Open', 'In Progress', 'Resolved', 'Escalated'] },
        ]} />

      {/* Create Ticket Modal */}
      <Modal id="tl-ticket-create" title="Create New Ticket" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <DataField label="Ticket Title *" id="tl-tkt-title" size={12}
                value={form.title} onChange={e => setField('title', e.target.value)}
                placeholder="Enter a clear, concise ticket title" />
              {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
            </div>
            <div className="col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Category</label>
              <Select value={form.category} onChange={e => setField('category', e.target.value)}
                placeholder="Select category" size={12}>
                <Option value="SYSTEM"        label="System Issue" />
                <Option value="CLIENT_DATA"   label="Client Data" />
                <Option value="SALES_MANAGER" label="Sales Manager" />
              </Select>
            </div>
            <div className="col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Priority</label>
              <Select value={form.priority} onChange={e => setField('priority', e.target.value)}
                placeholder="Select priority" size={12}>
                <Option value="Low"    label="Low" />
                <Option value="Medium" label="Medium" />
                <Option value="High"   label="High" />
              </Select>
            </div>
            <div className="col-span-12">
              <DataField label="Description *" id="tl-tkt-desc" type="textarea" rows={4} size={12}
                value={form.description} onChange={e => setField('description', e.target.value)}
                placeholder="Describe the issue in detail..." />
              {formErr.description && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.description}</p>}
            </div>
            {formErr.submit && <div className="col-span-12"><p className="text-xs text-rose-600 px-1">{formErr.submit}</p></div>}
          </Grid>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button text="Cancel" variant="secondary" size={3}
              onClick={() => { setForm(blankForm); setFormErr({}); closeModal('tl-ticket-create'); }} />
            <Button text={submitting ? 'Submitting…' : 'Submit Ticket'} variant="primary" size={3}
              onClick={handleCreateSubmit} disabled={submitting} />
          </div>
        </div>
      </Modal>

      {/* Team Ticket View/Reply Modal */}
      <Modal id="tl-team-ticket-view" title="Ticket Details" size="lg">
        {selected && (
          <ReplyTicketContent selected={selected} onSendMsg={sendTeamReply}
            onClose={() => closeModal('tl-team-ticket-view')}
            loading={replyLoading} currentUser="Sales Team Leader" />
        )}
      </Modal>

      {/* My Ticket View Modal (read-only) */}
      <Modal id="tl-my-ticket-view" title="My Ticket Details" size="lg">
        {mySelected && (
          <ReadOnlyTicketContent selected={mySelected}
            onClose={() => closeModal('tl-my-ticket-view')} currentUser="Sales Team Leader" />
        )}
      </Modal>
    </div>
  );
}

function ReplyTicketContent({ selected, onSendMsg, onClose, loading, currentUser }) {
  const statusColors = {
    'Open': 'bg-amber-100 text-amber-700', 'In Progress': 'bg-purple-100 text-purple-700',
    'Replied': 'bg-blue-100 text-blue-700', 'Resolved': 'bg-emerald-100 text-emerald-700',
    'Escalated': 'bg-rose-100 text-rose-700', 'Closed': 'bg-slate-100 text-slate-600',
  };
  const conversation = (() => {
    const msgs = selected.conversation || [];
    if (!selected.description?.trim()) return msgs;
    return [{ id: '__initial__', sender: selected.raisedBy || 'Executive',
      time: selected.createdDate ? `${selected.createdDate} 00:00` : '', text: selected.description }, ...msgs];
  })();
  const hasReplied = conversation.some(m => m.sender === currentUser || m.sender === 'Sales Team Leader');

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        {[['Ticket ID', selected.id], ['Raised By', selected.raisedBy],
          ['Priority', selected.priority], ['Status', selected.status]].map(([label, value]) => (
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
        <UserChat messages={conversation} onSend={hasReplied || loading ? null : onSendMsg}
          currentUser={currentUser} maxHeight="max-h-72"
          placeholder="Type your reply… (Enter to send)" readOnly={hasReplied} />
        {hasReplied && <p className="text-[10px] text-slate-400 mt-1 px-1">You have already replied to this ticket.</p>}
      </div>
      <div className="flex justify-end pt-1 border-t border-slate-100">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition active:scale-95">Close</button>
      </div>
    </div>
  );
}

function ReadOnlyTicketContent({ selected, onClose, currentUser }) {
  const statusColors = {
    'Open': 'bg-amber-100 text-amber-700', 'In Progress': 'bg-purple-100 text-purple-700',
    'Replied': 'bg-blue-100 text-blue-700', 'Resolved': 'bg-emerald-100 text-emerald-700',
    'Escalated': 'bg-rose-100 text-rose-700', 'Closed': 'bg-slate-100 text-slate-600',
  };
  const conversation = (() => {
    const msgs = selected.conversation || [];
    if (!selected.description?.trim()) return msgs;
    return [{ id: '__initial__', sender: currentUser,
      time: selected.createdDate ? `${selected.createdDate} 00:00` : '', text: selected.description }, ...msgs];
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        {[['Ticket ID', selected.id], ['Raised By', currentUser],
          ['Priority', selected.priority], ['Status', selected.status]].map(([label, value]) => (
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
        <UserChat messages={conversation} onSend={null} currentUser={currentUser} maxHeight="max-h-72" readOnly />
      </div>
      <div className="flex justify-end pt-1 border-t border-slate-100">
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition active:scale-95">Close</button>
      </div>
    </div>
  );
}
