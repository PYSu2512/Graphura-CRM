import { CheckCircle2, Clock, Eye, MessageSquare, Ticket, Shield, AlertTriangle } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import {
    Button,
    closeModal,
    DashGrid,
    DataField,
    DataTable,
    EnhancedDashCard,
    Grid,
    Heading,
    Modal,
    openModal,
    Option,
    SelectField,
    UserChat,
} from "../../../../components/shared/Common_Components.jsx";
import {
  createTicket, getMyRaisedTickets,
  getTicketById, addReply, mapTicket,
} from "../../../../services/ticketService";

const ticketCols = [
  { key: "title", label: "Subject" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "createdDate", label: "Created Date" },
];

const blankForm = { title: "", category: "", priority: "Medium", description: "", targetHierarchy: "ALL" };

export default function AllTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats,   setStats]   = useState({ total: 0, inProgress: 0, open: 0, resolved: 0 });
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [formErr, setFormErr] = useState({});
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyRaisedTickets({ limit: 100 });
      const mapped = (res.tickets || []).map(mapTicket);
      setTickets(mapped);
      
      setStats({
        total:      mapped.length,
        inProgress: mapped.filter(t => t.status === 'In Progress').length,
        open:       mapped.filter(t => t.status === 'Open').length,
        resolved:   mapped.filter(t => t.status === 'Resolved' || t.status === 'Closed').length,
      });
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErr[key]) {
      setFormErr((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const openView = async (row) => {
    try { setSelected(mapTicket(await getTicketById(row._id))); }
    catch { setSelected(row); }
    openModal("me-ticket-view-modal");
  };

  const handleCreateSubmit = async () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Subject is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (Object.keys(errs).length) {
      setFormErr(errs);
      return;
    }

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
      closeModal("me-create-ticket-modal");
      await fetchData();
    } catch (err) {
      setFormErr({ submit: err?.message || 'Failed to create ticket.' });
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

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Support Tickets" secondaryText="My Tickets" size={12} />

      <DashGrid cols={12} gap={4}>
        {[
          { title: "Total Tickets", value: String(stats.total), icon: Ticket, color: "#3b82f6" },
          { title: "In Progress", value: String(stats.inProgress), icon: Clock, color: "#f59e0b" },
          { title: "Open", value: String(stats.open), icon: MessageSquare, color: "#8b5cf6" },
          { title: "Resolved", value: String(stats.resolved), icon: CheckCircle2, color: "#22c55e" },
        ].map((stat) => (
          <EnhancedDashCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={<stat.icon size={22} />}
            accentColor={stat.color}
            size={3}
          />
        ))}
      </DashGrid>

      <div className="flex justify-end">
        <Button text="+ Create Ticket" variant="primary" size={3} onClick={() => openModal("me-create-ticket-modal")} />
      </div>

      <DataTable
        title="My Tickets"
        columns={ticketCols}
        rows={tickets}
        actions={[
          {
            icon: <Eye size={15} />,
            tooltip: "View",
            variant: "ghost",
            onClick: openView,
          },
        ]}
        size={12}
        pageSize={10}
        searchable
        loading={loading}
        exportable
        exportFileName="my_tickets"
        defaultSortKey={null}
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
          { title: "Status", type: "toggle", key: "status", options: ["Open", "In Progress", "Resolved", "Escalated"] },
        ]}
      />

      <Modal id="me-create-ticket-modal" title="Create Ticket" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <DataField
                label="Subject *"
                id="me-ticket-title"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Briefly describe the issue"
              />
              {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
            </div>
            <div className="col-span-12">
              <SelectField
                label="Raise To"
                id="me-ticket-target"
                value={form.targetHierarchy}
                onChange={(e) => setField("targetHierarchy", e.target.value)}
                placeholder="Select an option (Default: All)"
              >
                <Option value="ALL" label="All" />
                <Option value="TL" label="Team Lead" />
                <Option value="MANAGER" label="Manager" />
              </SelectField>
            </div>
            <div className="col-span-6">
              <SelectField
                label="Category"
                id="me-ticket-category"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                <Option value="SYSTEM" label="System Issue" />
                <Option value="CLIENT_DATA" label="Client Data" />
                <Option value="MANAGEMENT" label="Management Issue" />
              </SelectField>
            </div>
            <div className="col-span-6">
              <SelectField
                label="Priority"
                id="me-ticket-priority"
                value={form.priority}
                onChange={(e) => setField("priority", e.target.value)}
              >
                <Option value="Low" label="Low" />
                <Option value="Medium" label="Medium" />
                <Option value="High" label="High" />
              </SelectField>
            </div>
            <div className="col-span-12">
              <DataField
                label="Description *"
                id="me-ticket-desc"
                type="textarea"
                rows={4}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Provide detailed information about the issue..."
              />
              {formErr.description && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.description}</p>}
            </div>
            {formErr.submit && <div className="col-span-12"><p className="text-xs text-rose-600 px-1">{formErr.submit}</p></div>}
          </Grid>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button text="Cancel" variant="secondary" size={3} onClick={() => { setForm(blankForm); setFormErr({}); closeModal("me-create-ticket-modal"); }} />
            <Button text="Submit Ticket" variant="primary" size={3} onClick={handleCreateSubmit} />
          </div>
        </div>
      </Modal>

      <Modal id="me-ticket-view-modal" title="Ticket Details" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Raised By", value: "Me" },
                { label: "Priority", value: selected.priority },
                { label: "Status", value: selected.status },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="text-xs font-bold text-[#2a465a]">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Title</p>
              <p className="text-xs font-bold text-[#2a465a]">{selected.title}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conversation</p>
              <UserChat messages={selected.conversation} onSend={handleReply} currentUser="Me" maxHeight="max-h-72" loading={replyLoading} />
            </div>
            <div className="flex justify-end items-center pt-3 border-t border-slate-100">
                <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("me-ticket-view-modal")} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
