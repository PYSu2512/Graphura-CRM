import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  ShieldCheck,
  Ticket,
  UserCheck,
} from "lucide-react";

import {
  Button,
  DashCard,
  DataField,
  DataTable,
  Grid,
  Heading,
  Modal,
  ModalData,
  Option,
  P,
  SelectField,
  closeModal,
  openModal,
} from "../../../components/shared/Common_Components";

const initialTickets = [
  {
    ticketId: "SUP-1001",
    requester: "Aarav Mehta",
    subject: "Unable to access sales pipeline",
    priority: "High",
    assignedTo: "Admin Team",
    status: "In Progress",
    createdAt: "29 Apr 2026",
    category: "Access",
    lastUpdate: "10 min ago",
    description:
      "Requester can sign in but cannot open the sales pipeline module from the CRM sidebar.",
  },
  {
    ticketId: "SUP-1002",
    requester: "Neha Singh",
    subject: "Invoice export is missing GST column",
    priority: "Medium",
    assignedTo: "Finance Admin",
    status: "Pending",
    createdAt: "28 Apr 2026",
    category: "Billing",
    lastUpdate: "1 hr ago",
    description:
      "The exported invoice report does not include GST details required by the finance team.",
  },
  {
    ticketId: "SUP-1003",
    requester: "Rohan Iyer",
    subject: "Lead assignment rule needs approval",
    priority: "Low",
    assignedTo: "CRM Admin",
    status: "Completed",
    createdAt: "27 Apr 2026",
    category: "Workflow",
    lastUpdate: "Yesterday",
    description:
      "New territory-based lead assignment rule was reviewed and enabled for the west region.",
  },
  {
    ticketId: "SUP-1004",
    requester: "Priya Nair",
    subject: "Customer profile duplicate merge request",
    priority: "High",
    assignedTo: "Admin Team",
    status: "Pending",
    createdAt: "26 Apr 2026",
    category: "Customer Data",
    lastUpdate: "2 days ago",
    description:
      "Two customer profiles need to be reviewed and merged after admin verification.",
  },
];

const ticketColumns = [
  { key: "ticketId", label: "Ticket ID" },
  { key: "requester", label: "Requester" },
  { key: "subject", label: "Subject" },
  { key: "priority", label: "Priority" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" },
];

const emptyForm = {
  requester: "",
  subject: "",
  category: "",
  priority: "Medium",
  assignedTo: "Admin Team",
};

export default function Support() {
  const [tickets, setTickets] = useState(initialTickets);
  const [form, setForm] = useState(emptyForm);
  const [selectedTicket, setSelectedTicket] = useState(initialTickets[0]);

  const stats = useMemo(() => {
    const openTickets = tickets.filter((ticket) => ticket.status !== "Completed");
    const highPriority = tickets.filter((ticket) => ticket.priority === "High");
    const completed = tickets.filter((ticket) => ticket.status === "Completed");

    return {
      total: tickets.length,
      open: openTickets.length,
      high: highPriority.length,
      completed: completed.length,
    };
  }, [tickets]);

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleCreateTicket = (event) => {
    event.preventDefault();

    const newTicket = {
      ticketId: `SUP-${1000 + tickets.length + 1}`,
      requester: form.requester || "Admin User",
      subject: form.subject || "New support ticket",
      priority: form.priority,
      assignedTo: form.assignedTo,
      status: "Pending",
      createdAt: "29 Apr 2026",
      category: form.category || "General",
      lastUpdate: "Just now",
      description:
        "Created by admin from the support ticket management screen. Review and assign next action.",
    };

    setTickets((current) => [newTicket, ...current]);
    setForm(emptyForm);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    openModal("support-ticket-details");
  };

  const handleAssignTicket = (ticket) => {
    setTickets((current) =>
      current.map((item) =>
        item.ticketId === ticket.ticketId
          ? { ...item, assignedTo: "Admin Team", status: "In Progress", lastUpdate: "Just now" }
          : item,
      ),
    );
  };

  const handleCloseTicket = (ticket) => {
    setTickets((current) =>
      current.map((item) =>
        item.ticketId === ticket.ticketId
          ? { ...item, status: "Completed", lastUpdate: "Just now" }
          : item,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <Grid cols={12} gap={5}>
        <div className="col-span-12 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <Heading
              primaryText="Support Ticket"
              secondaryText="Management"
              size={12}
            />
            <P text="Admin-only workspace for reviewing, assigning, and closing CRM support tickets." />
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 md:self-center">
            <ShieldCheck size={18} />
            Only Admin
          </div>
        </div>

        <DashCard
          title="Total Tickets"
          value={stats.total}
          icon={<Ticket size={22} />}
          accentColor="#2563eb"
          size={3}
        />
        <DashCard
          title="Open Tickets"
          value={stats.open}
          icon={<Clock3 size={22} />}
          accentColor="#f59e0b"
          size={3}
        />
        <DashCard
          title="High Priority"
          value={stats.high}
          icon={<AlertTriangle size={22} />}
          accentColor="#e11d48"
          size={3}
        />
        <DashCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 size={22} />}
          accentColor="#16a34a"
          size={3}
        />

        <form
          onSubmit={handleCreateTicket}
          className="col-span-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <Grid cols={12} gap={4}>
            <Heading
              primaryText="Create"
              secondaryText="Admin Ticket"
              size={12}
            />
            <DataField
              label="Requester"
              id="requester"
              placeholder="Customer or employee name"
              size={4}
              value={form.requester}
              onChange={updateForm("requester")}
            />
            <DataField
              label="Subject"
              id="subject"
              placeholder="Ticket subject"
              size={4}
              value={form.subject}
              onChange={updateForm("subject")}
            />
            <DataField
              label="Category"
              id="category"
              placeholder="Access, billing, workflow..."
              size={4}
              value={form.category}
              onChange={updateForm("category")}
            />
            <SelectField
              label="Priority"
              id="priority"
              size={4}
              value={form.priority}
              onChange={updateForm("priority")}
            >
              <Option value="Low" label="Low" />
              <Option value="Medium" label="Medium" />
              <Option value="High" label="High" />
            </SelectField>
            <SelectField
              label="Assign To"
              id="assignedTo"
              size={4}
              value={form.assignedTo}
              onChange={updateForm("assignedTo")}
            >
              <Option value="Admin Team" label="Admin Team" />
              <Option value="CRM Admin" label="CRM Admin" />
              <Option value="Finance Admin" label="Finance Admin" />
            </SelectField>
            <div className="col-span-12 flex items-end md:col-span-4">
              <Button text="Create Ticket" type="submit" variant="primary" />
            </div>
          </Grid>
        </form>

        <DataTable
          title="Admin Support Tickets"
          columns={ticketColumns}
          rows={tickets}
          pageSize={5}
          actions={[
            {
              label: "View",
              icon: <Eye size={14} />,
              variant: "ghost",
              onClick: handleViewTicket,
            },
            {
              label: "Assign",
              icon: <UserCheck size={14} />,
              variant: "primary",
              onClick: handleAssignTicket,
            },
            {
              label: "Close",
              icon: <CheckCircle2 size={14} />,
              variant: "danger",
              onClick: handleCloseTicket,
            },
          ]}
        />
      </Grid>

      <Modal id="support-ticket-details" title="Support Ticket Details">
        {selectedTicket && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ModalData label="Ticket ID" value={selectedTicket.ticketId} />
              <ModalData label="Status" value={selectedTicket.status} />
              <ModalData label="Requester" value={selectedTicket.requester} />
              <ModalData label="Priority" value={selectedTicket.priority} />
              <ModalData label="Assigned To" value={selectedTicket.assignedTo} />
              <ModalData label="Last Update" value={selectedTicket.lastUpdate} />
            </div>
            <ModalData label="Subject" value={selectedTicket.subject} />
            <div>
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Description
              </span>
              <p className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium leading-6 text-[#2a465a]">
                {selectedTicket.description}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                text="Close"
                variant="ghost"
                onClick={() => closeModal("support-ticket-details")}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
