import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Button,
  EnhancedDashCard,
  DashGrid,
  DataField,
  DataTable,
  Grid,
  Heading,
  Modal,
  Option,
  SelectField,
  UserChat,
  closeModal,
  openModal,
} from "../../../../components/shared/Common_Components";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Ticket,
  Shield,
} from "lucide-react";
import {
  createTicket, getMyRaisedTickets, getAssignedTickets,
  getTicketById, addReply, escalateTicket, resolveTicket, closeTicket, mapTicket,
} from "../../../../services/ticketService";

const kpiIcons = [
  <Ticket size={22} />,
  <Clock size={22} />,
  <AlertCircle size={22} />,
  <CheckCircle size={22} />,
];

const kpiAccents = ["#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e"];
const kpiLabels = ["Total Tickets", "In Progress", "Replied", "Resolved"];

const teamCols = [
  { key: "title",       label: "Title"        },
  { key: "raisedBy",    label: "Raised By"    },
  { key: "role",        label: "Role"         },
  { key: "priority",    label: "Priority"     },
  { key: "status",      label: "Status"       },
  { key: "createdDate", label: "Created Date" },
];

const myCols = [
  { key: "title",       label: "Title"        },
  { key: "priority",    label: "Priority"     },
  { key: "status",      label: "Status"       },
  { key: "createdDate", label: "Created Date" },
  { key: "lastReply",   label: "Last Reply"   },
];

const blankForm = {
  title: "",
  category: "",
  priority: "Medium",
  description: "",
  targetHierarchy: "ALL",
};

export default function SupportPage() {
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
  const [confirmData, setConfirmData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [assignedData, raisedData] = await Promise.all([
        getAssignedTickets({ limit: 100 }),
        getMyRaisedTickets({ limit: 100 }),
      ]);
      const team = (assignedData.tickets || []).map(mapTicket);
      const mine = (raisedData.tickets   || []).map(mapTicket)
        .filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
      setTeamTickets(team);
      setMyTickets(mine);

      const combined = [...team, ...mine];
      setStats([
        combined.length,
        combined.filter(t => t.status === 'In Progress').length,
        combined.filter(t => t.status === 'In Progress').length,
        combined.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
      ]);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (formErr[field]) setFormErr(prev => ({ ...prev, [field]: "" }));
  };

  const openTeamView = async (row) => {
    try { setSelected(mapTicket(await getTicketById(row._id))); }
    catch { setSelected(row); }
    openModal("mtl-team-ticket-view");
  };

  const openMyView = async (row) => {
    try { setMySelected(mapTicket(await getTicketById(row._id))); }
    catch { setMySelected(row); }
    openModal("mtl-my-ticket-view");
  };

  const handleTeamReply = async (msg) => {
    if (!selected) return;
    setReplyLoading(true);
    try {
      const updated = mapTicket(await addReply(selected._id, msg.text));
      setTeamTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
      setSelected(updated);
    } catch (err) { alert(err?.message || 'Failed to send reply'); }
    finally { setReplyLoading(false); }
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

  const handleEscalate = async (row) => {
    setConfirmData({
      message: "Are you sure you want to escalate this ticket?",
      confirmText: "Escalate",
      confirmVariant: "danger",
      onConfirm: async () => {
        try {
          await escalateTicket(row._id, 'Escalated by Management Team Leader to Manager');
          await fetchData();
        } catch (err) { alert(err?.message || 'Could not escalate'); }
      }
    });
    openModal("confirm-action-modal");
  };

  const handleClose = async (row) => {
    try {
      await closeTicket(row._id, 'Closed by Management Team Leader');
      await fetchData();
    } catch (err) { alert(err?.message || 'Could not close'); }
  };

  const handleCreateSubmit = async () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Issue title is required.";
    if (!form.description.trim()) errors.description = "Description is required.";

    if (Object.keys(errors).length) {
      setFormErr(errors);
      return;
    }

    setSubmitting(true);
    try {
      await createTicket({
        subject:  form.title.trim(),
        message:  form.description.trim(),
        priority: form.priority || 'Medium',
        category: form.category || null,
        targetHierarchy: form.targetHierarchy || "ALL",
      });
      setForm(blankForm);
      setFormErr({});
      closeModal("mtl-support-create-ticket");
      await fetchData();
    } catch (err) {
      setFormErr({ submit: err?.message || 'Failed to create ticket.' });
    } finally { setSubmitting(false); }
  };

  const teamActions = [
    { icon: <MessageSquare size={15} />, tooltip: "View & Reply", variant: "primary", onClick: openTeamView },
    { icon: <CheckCircle2 size={15} />, tooltip: "Mark Resolved", variant: "success", onClick: handleResolve, show: (r) => r.status !== 'Resolved' && r.status !== 'Closed' },
    { icon: <AlertTriangle size={15} />, tooltip: "Escalate", variant: "danger", onClick: handleEscalate, show: (r) => r.status !== 'Escalated' && r.status !== 'Resolved' && r.status !== 'Closed' },
  ];

  const myActions = [
    { icon: <MessageSquare size={15} />, tooltip: "View Ticket", variant: "primary", onClick: openMyView },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Support Ticket" secondaryText="Management" size={12} />
        {kpiLabels.map((label, index) => (
          <EnhancedDashCard
            key={label}
            title={label}
            value={String(stats[index])}
            icon={kpiIcons[index]}
            accentColor={kpiAccents[index]}
            size={3}
          />
        ))}
      </DashGrid>

      <div className="flex justify-end">
        <Button
          text="+ Raise Ticket"
          variant="primary"
          size={3}
          onClick={() => openModal("mtl-support-create-ticket")}
        />
      </div>

      <DataTable
        title="My Tickets"
        columns={myCols}
        rows={myTickets}
        actions={myActions}
        size={12}
        pageSize={5}
        searchable
        loading={loading}
        defaultSortKey={null}
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
          { title: "Status",   type: "toggle", key: "status",   options: ["Open", "In Progress", "Resolved", "Escalated"] },
        ]}
      />

      <DataTable
        title="Employee Tickets"
        columns={teamCols}
        rows={teamTickets}
        actions={teamActions}
        size={12}
        pageSize={8}
        searchable
        loading={loading}
        defaultSortKey={null}
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
          { title: "Status", type: "toggle", key: "status", options: ["Open", "In Progress", "Resolved", "Escalated"] },
        ]}
      />

      <CreateTicketModal
        form={form}
        formErr={formErr}
        onFieldChange={setField}
        onSubmit={handleCreateSubmit}
        submitting={submitting}
        onCancel={() => {
          setForm(blankForm);
          setFormErr({});
          closeModal("mtl-support-create-ticket");
        }}
      />

      <Modal id="mtl-team-ticket-view" title="Ticket Details" size="lg">
        {selected && (
          <TicketConversation
            selected={selected}
            currentUser="Management TL"
            onSend={handleTeamReply}
            loading={replyLoading}
            onClose={() => closeModal("mtl-team-ticket-view")}
          />
        )}
      </Modal>

      <Modal id="mtl-my-ticket-view" title="My Ticket Details" size="lg">
        {mySelected && (
          <TicketConversation
            selected={mySelected}
            currentUser="Management TL"
            readOnly
            onClose={() => closeModal("mtl-my-ticket-view")}
          />
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

function CreateTicketModal({
  form,
  formErr,
  onFieldChange,
  onSubmit,
  submitting,
  onCancel,
}) {
  return (
    <Modal id="mtl-support-create-ticket" title="Raise Support Ticket" size="lg">
      <div className="flex flex-col gap-5">
        <Grid cols={12} gap={4}>
          <div className="col-span-12">
            <DataField
              label="Issue Title *"
              id="mtl-ticket-title"
              size={12}
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              placeholder="Short issue title"
            />
            {formErr.title && <p className="mt-1 px-1 text-xs text-rose-600">{formErr.title}</p>}
          </div>

          <div className="col-span-12 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Raise To</label>
            <SelectField
              id="mtl-ticket-target"
              value={form.targetHierarchy}
              onChange={(event) => onFieldChange("targetHierarchy", event.target.value)}
              placeholder="Select an option (Default: All)"
            >
              <Option value="ALL" label="All" />
              <Option value="ADMIN" label="Admin Only" />
            </SelectField>
          </div>

          <div className="col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Category</label>
            <SelectField
              id="mtl-ticket-category"
              value={form.category}
              onChange={(event) => onFieldChange("category", event.target.value)}
              placeholder="Select category"
            >
              <Option value="SYSTEM" label="System Issue" />
              <Option value="CLIENT_DATA" label="Client Data" />
              <Option value="MANAGEMENT" label="Management Issue" />
            </SelectField>
          </div>

          <div className="col-span-6 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Priority</label>
            <SelectField
              id="mtl-ticket-priority"
              value={form.priority}
              onChange={(event) => onFieldChange("priority", event.target.value)}
            >
              <Option value="Low" label="Low" />
              <Option value="Medium" label="Medium" />
              <Option value="High" label="High" />
            </SelectField>
          </div>

          <div className="col-span-12">
            <DataField
              label="Description *"
              id="mtl-ticket-description"
              type="textarea"
              rows={4}
              size={12}
              value={form.description}
              onChange={(event) => onFieldChange("description", event.target.value)}
              placeholder="Issue summary, blocker, expected support, and impact..."
            />
            {formErr.description && <p className="mt-1 px-1 text-xs text-rose-600">{formErr.description}</p>}
          </div>
          {formErr.submit && <div className="col-span-12"><p className="text-xs text-rose-600 px-1">{formErr.submit}</p></div>}
        </Grid>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button text="Cancel" variant="secondary" size={3} onClick={onCancel} />
          <Button text={submitting ? 'Submitting…' : 'Submit Ticket'} variant="primary" size={3} onClick={onSubmit} disabled={submitting} />
        </div>
      </div>
    </Modal>
  );
}

function TicketConversation({ selected, currentUser, readOnly = false, onSend, loading, onClose }) {
  const statusColors = {
    Open: "bg-amber-100 text-amber-700",
    Pending: "bg-orange-100 text-orange-700",
    "In Progress": "bg-purple-100 text-purple-700",
    Resolved: "bg-emerald-100 text-emerald-700",
    Escalated: "bg-rose-100 text-rose-700",
    Closed: "bg-slate-100 text-slate-600",
  };

  const conversation = selected.conversation || [];
  const hasReplied = conversation.some(m => m.sender === currentUser || m.sender === 'Management Team Leader');
  const targetLabels = { TL: 'Team Lead', MANAGER: 'Manager', ADMIN: 'Admin', ALL: 'All' };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        {[
          ["Raised By", selected.raisedBy],
          ["Raised To", targetLabels[selected.targetHierarchy] || selected.targetHierarchy],
          ["Priority", selected.priority],
          ["Status", selected.status],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            <p
              className={`text-xs font-bold ${
                label === "Status"
                  ? `inline-flex rounded-full px-2 py-0.5 ${statusColors[value] ?? "bg-slate-100 text-slate-600"}`
                  : "text-[#2a465a]"
              }`}
            >
              {value || "—"}
            </p>
          </div>
        ))}
        <div className="col-span-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Issue Title</p>
          <p className="text-xs font-bold text-[#2a465a]">{selected.title}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Conversation</p>
        <UserChat
          messages={conversation}
          onSend={readOnly || hasReplied || loading ? null : onSend}
          currentUser={currentUser}
          maxHeight="max-h-72"
          placeholder="Type your reply... (Enter to send)"
          readOnly={readOnly || hasReplied}
        />
        {hasReplied && !readOnly && <p className="text-[10px] text-slate-400 mt-1 px-1">You have already replied to this ticket.</p>}
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-1">
        <Button text="Close" variant="secondary" size={3} onClick={onClose} />
      </div>
    </div>
  );
}
