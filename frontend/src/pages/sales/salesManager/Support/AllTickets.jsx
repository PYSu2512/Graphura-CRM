/**
 * Sales Manager — Support Tickets Page
 * My Tickets: tickets SM raised (go to Admin)
 * All Tickets: tickets from Team Leaders assigned to SM (SM replies)
 */
import { useState, useEffect, useCallback } from "react";
import {
  DashGrid, EnhancedDashCard, DataTable, Grid, DataField,
  openModal, closeModal, Modal, Select, Option,
  Heading, Button, UserChat,
} from "../../../../components/shared/Common_Components";
import {
  createTicket, getMyRaisedTickets, getAssignedTickets,
  getTicketById, addReply, escalateTicket, resolveTicket, closeTicket, mapTicket,
} from "../../../../services/ticketService";
import { Ticket, CheckCircle, AlertCircle, Clock, MessageSquare, AlertTriangle, CheckCircle2, Shield } from "lucide-react";

const kpiIcons   = [<Ticket size={22}/>, <AlertCircle size={22}/>, <Clock size={22}/>, <CheckCircle size={22}/>];
const kpiAccents = ['#3b82f6', '#f59e0b', '#8b5cf6', '#22c55e'];
const kpiLabels  = ['Total Tickets', 'In Progress', 'Replied', 'Resolved'];

const allCols = [
  { key: 'title',       label: 'Title'        },
  { key: 'raisedBy',    label: 'Raised By'    },
  { key: 'role',        label: 'Role'         },
  { key: 'priority',    label: 'Priority'     },
  { key: 'status',      label: 'Status'       },
  { key: 'createdDate', label: 'Created Date' },
];

const myCols = [
  { key: 'title',       label: 'Title'      },
  { key: 'priority',    label: 'Priority'   },
  { key: 'status',      label: 'Status'     },
  { key: 'createdDate', label: 'Created'    },
  { key: 'lastReply',   label: 'Last Reply' },
];

const blankForm = { title: '', category: '', priority: '', description: '' };

export default function AllTickets() {
  const [allTickets,   setAllTickets]   = useState([]);
  const [myTickets,    setMyTickets]    = useState([]);
  const [stats,        setStats]        = useState([0, 0, 0, 0]);
  const [selected,     setSelected]     = useState(null);
  const [mySelected,   setMySelected]   = useState(null);
  const [form,         setForm]         = useState(blankForm);
  const [formErr,      setFormErr]      = useState({});
  const [loading,      setLoading]      = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignedData, raisedData] = await Promise.all([
        getAssignedTickets({ limit: 100 }),
        getMyRaisedTickets({ limit: 100 }),
      ]);
      const all  = (assignedData.tickets || []).map(mapTicket);
      const mine = (raisedData.tickets   || []).map(mapTicket)
        .filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
      setAllTickets(all);
      setMyTickets(mine);

      const combined = [...all, ...mine];
      setStats([
        combined.length,
        combined.filter(t => t.status === 'In Progress').length,
        combined.filter(t => t.status === 'In Progress').length,
        combined.filter(t => t.status === 'Resolved').length,
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

  const openAllView = async (row) => {
    try { setSelected(mapTicket(await getTicketById(row._id))); }
    catch { setSelected(row); }
    openModal('sm-all-ticket-view');
  };

  const openMyView = async (row) => {
    try { setMySelected(mapTicket(await getTicketById(row._id))); }
    catch { setMySelected(row); }
    openModal('sm-my-ticket-view');
  };

  const sendAllReply = async (msg) => {
    if (!selected) return;
    setReplyLoading(true);
    try {
      const updated = mapTicket(await addReply(selected._id, msg.text));
      setAllTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
      setSelected(updated);
    } catch (err) { alert(err?.message || 'Failed to send reply'); }
    finally { setReplyLoading(false); }
  };

  const handleEscalate = async (row) => {
    setConfirmData({
      message: "Are you sure you want to escalate this ticket?",
      confirmText: "Escalate",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await escalateTicket(row._id, 'Escalated by Sales Manager to Admin');
          await fetchData();
        } catch (err) { alert(err?.message || 'Could not escalate'); }
      }
    });
    openModal("confirm-action-modal");
  };

  const handleResolve = async (row) => {
    setConfirmData({
      message: "Are you sure you want to resolve this ticket?",
      confirmText: "Resolve",
      confirmVariant: "success",
      onConfirm: async () => {
        try {
          await resolveTicket(row._id);
          await fetchData();
        } catch (err) { alert(err?.message || 'Could not resolve'); }
      }
    });
    openModal("confirm-action-modal");
  };

  const handleClose = async (row) => {
    try {
      await closeTicket(row._id, 'Closed by Sales Manager');
      await fetchData();
    } catch (err) { alert(err?.message || 'Could not close'); }
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
      closeModal('sm-create-ticket-modal');
      await fetchData();
    } catch (err) {
      setFormErr({ submit: err?.message || err?.data?.message || 'Failed to create ticket.' });
    } finally { setSubmitting(false); }
  };

  const allActions = [
    { icon: <MessageSquare size={15}/>, tooltip: 'View & Reply',    variant: 'primary', onClick: openAllView },
    { icon: <CheckCircle2  size={15}/>, tooltip: 'Mark Resolved',   variant: 'success', onClick: handleResolve, show: (r) => r.status !== 'Resolved' && r.status !== 'Closed' },
    { icon: <AlertTriangle size={15}/>, tooltip: 'Escalate to Admin', variant: 'danger',  onClick: handleEscalate, show: (r) => r.status !== 'Escalated' && r.status !== 'Resolved' && r.status !== 'Closed' },
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
          onClick={() => openModal('sm-create-ticket-modal')} />
      </div>

      <DataTable title="My Tickets" columns={myCols} rows={myTickets} actions={myActions}
        size={12} pageSize={5} searchable loading={loading} defaultSortKey={null}
        filters={[
          { title: 'Priority', type: 'toggle', key: 'priority', options: ['Low', 'Medium', 'High'] },
          { title: 'Status',   type: 'toggle', key: 'status',   options: ['Open', 'In Progress', 'Resolved', 'Escalated'] },
        ]} />

      <DataTable title="All Tickets" columns={allCols} rows={allTickets} actions={allActions}
        size={12} pageSize={10} searchable loading={loading} defaultSortKey={null}
        filters={[
          { title: 'Priority', type: 'toggle', key: 'priority', options: ['Low', 'Medium', 'High'] },
          { title: 'Status',   type: 'toggle', key: 'status',   options: ['Open', 'In Progress', 'Resolved', 'Escalated'] },
        ]} />

      {/* Create Ticket Modal */}
      <Modal id="sm-create-ticket-modal" title="Create New Ticket" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <DataField label="Ticket Title *" id="sm-tkt-title" size={12}
                value={form.title} onChange={e => setField('title', e.target.value)}
                placeholder="Enter a clear, concise ticket title" />
              {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
            </div>
            <div className="col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Category</label>
              <Select value={form.category} onChange={e => setField('category', e.target.value)}
                placeholder="Select category" size={12}>
                <Option value="SYSTEM"      label="System Issue" />
                <Option value="CLIENT_DATA" label="Client Data" />
                <Option value="EXECUTIVE"   label="Executive Issue" />
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
              <DataField label="Description *" id="sm-tkt-desc" type="textarea" rows={4} size={12}
                value={form.description} onChange={e => setField('description', e.target.value)}
                placeholder="Describe the issue in detail..." />
              {formErr.description && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.description}</p>}
            </div>
            {formErr.submit && <div className="col-span-12"><p className="text-xs text-rose-600 px-1">{formErr.submit}</p></div>}
          </Grid>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button text="Cancel" variant="secondary" size={3}
              onClick={() => { setForm(blankForm); setFormErr({}); closeModal('sm-create-ticket-modal'); }} />
            <Button text={submitting ? 'Submitting…' : 'Submit Ticket'} variant="primary" size={3}
              onClick={handleCreateSubmit} disabled={submitting} />
          </div>
        </div>
      </Modal>

      {/* All Ticket View/Reply Modal */}
      <Modal id="sm-all-ticket-view" title="Ticket Details" size="lg">
        {selected && (
          <ReplyTicketContent selected={selected} onSendMsg={sendAllReply}
            onClose={() => closeModal('sm-all-ticket-view')}
            loading={replyLoading} currentUser="Sales Manager" />
        )}
      </Modal>

      {/* My Ticket View Modal (read-only) */}
      <Modal id="sm-my-ticket-view" title="My Ticket Details" size="lg">
        {mySelected && (
          <ReadOnlyTicketContent selected={mySelected}
            onClose={() => closeModal('sm-my-ticket-view')} currentUser="Sales Manager" />
        )}
      </Modal>

      {/* ══ CONFIRM ACTION MODAL ═════════════════════════════════════════════ */}
      <Modal id="confirm-action-modal" title="Confirm Action" size="md">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600 font-medium">
            {confirmData?.message || "Are you sure you want to perform this action?"}
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button text="Cancel" variant="secondary" size={3} onClick={() => {
              closeModal("confirm-action-modal");
              setConfirmData(null);
            }} />
            <Button text={confirmData?.confirmText || "Confirm"} variant={confirmData?.confirmVariant || "primary"} size={3} onClick={async () => {
              if (confirmData?.onConfirm) {
                await confirmData.onConfirm();
              }
              closeModal("confirm-action-modal");
              setConfirmData(null);
            }} />
          </div>
        </div>
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
    return [{ id: '__initial__', sender: selected.raisedBy || 'Team Leader',
      time: selected.createdDate ? `${selected.createdDate} 00:00` : '', text: selected.description }, ...msgs];
  })();
  const hasReplied = conversation.some(m => m.sender === currentUser || m.sender === 'Sales Manager');

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        {[['Raised By', selected.raisedBy],
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
        {[['Raised By', currentUser],
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
