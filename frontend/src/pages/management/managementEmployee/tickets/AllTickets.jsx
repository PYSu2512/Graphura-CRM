import { CheckCircle2, Clock, Eye, MessageSquare, Ticket } from "lucide-react";
import { useMemo, useState } from "react";
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
import { kpiTickets, TICKET_ROLES, ticketCategories } from "./ticketsStore";

const ticketCols = [
  { key: "id", label: "Ticket ID" },
  { key: "title", label: "Subject" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "createdDate", label: "Created Date" },
  { key: "raisedTo", label: "Raised To" },
];

const blankForm = { title: "", category: "", priority: "Medium", description: "" };

export default function AllTickets({ tickets, setTickets }) {
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [formErr, setFormErr] = useState({});

  const stats = useMemo(() => kpiTickets(tickets), [tickets]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (formErr[key]) {
      setFormErr((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const openView = (row) => {
    setSelected(row);
    openModal("me-ticket-view-modal");
  };

  const handleCreateSubmit = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Subject is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (Object.keys(errs).length) {
      setFormErr(errs);
      return;
    }

    const newTicket = {
      id: `TKT-${Date.now()}`,
      title: form.title.trim(),
      category: form.category || "Other",
      priority: form.priority,
      status: "Open",
      createdDate: new Date().toISOString().slice(0, 10),
      lastReply: new Date().toISOString().slice(0, 10),
      raisedTo: TICKET_ROLES.defaultSendTo,
      description: form.description.trim(),
      conversation: [
        { id: `${Date.now()}-m`, sender: TICKET_ROLES.currentUser, time: `${new Date().toISOString().slice(0, 10)} 09:00`, text: form.description.trim() },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    setForm(blankForm);
    setFormErr({});
    closeModal("me-create-ticket-modal");
  };

  const handleEscalate = () => {
    if (!selected) return;
    const updated = { ...selected, raisedTo: TICKET_ROLES.escalateTo, status: "Escalated", lastReply: new Date().toISOString().slice(0, 10), conversation: [
      ...selected.conversation,
      { id: `${Date.now()}-escalate`, sender: selected.raisedTo, time: `${new Date().toISOString().slice(0, 10)} 11:00`, text: "Escalated to Management Manager." },
    ] };
    setTickets((prev) => prev.map((ticket) => (ticket.id === updated.id ? updated : ticket)));
    setSelected(updated);
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
        exportable
        exportFileName="my_tickets"
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
            <div className="col-span-6">
              <SelectField
                label="Category"
                id="me-ticket-category"
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                <Option value="" label="Select category" />
                {ticketCategories.map((option) => (
                  <Option key={option.value} value={option.value} label={option.label} />
                ))}
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
                { label: "Ticket ID", value: selected.id },
                { label: "Raised By", value: TICKET_ROLES.currentUser },
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
              <UserChat messages={selected.conversation} onSend={null} currentUser={TICKET_ROLES.currentUser} maxHeight="max-h-72" readOnly />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <div className="text-sm text-slate-500">Raised To: {selected.raisedTo}</div>
              <div className="flex gap-3">
                {selected.raisedTo !== TICKET_ROLES.escalateTo && (
                  <Button text="Escalate to Management Manager" variant="secondary" size={3} onClick={handleEscalate} />
                )}
                <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("me-ticket-view-modal")} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
