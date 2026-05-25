import { useMemo, useState } from "react";
import {
  Button,
  DashCard,
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
} from "lucide-react";
import {
  assignedToByIssueType,
  issueTypesByTicketType,
  myRaisedTickets,
  ticketTypeOptions,
  tickets,
} from "./supportData";

const kpiIcons = [
  <Ticket size={22} />,
  <Clock size={22} />,
  <AlertCircle size={22} />,
  <CheckCircle size={22} />,
];

const kpiAccents = ["#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e"];
const kpiLabels = ["Team Issues", "Active Issues", "Escalated to Manager", "Resolved"];

const teamColumns = [
  { key: "id", label: "Ticket ID" },
  { key: "title", label: "Issue Title" },
  { key: "raisedBy", label: "Raised By" },
  { key: "role", label: "Role" },
  { key: "project", label: "Project" },
  { key: "ticketType", label: "Ticket Type" },
  { key: "issueType", label: "Issue Type" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "createdDate", label: "Created Date" },
];

const myColumns = [
  { key: "id", label: "Ticket ID" },
  { key: "title", label: "Issue Title" },
  { key: "project", label: "Project" },
  { key: "ticketType", label: "Ticket Type" },
  { key: "issueType", label: "Issue Type" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "lastReply", label: "Last Reply" },
];

const blankForm = {
  title: "",
  project: "",
  ticketType: "",
  issueType: "",
  priority: "",
  description: "",
};

const today = () => new Date().toISOString().slice(0, 10);

export default function SupportPage() {
  const [teamTickets, setTeamTickets] = useState(tickets);
  const [myTickets, setMyTickets] = useState(myRaisedTickets);
  const [selectedTeamTicket, setSelectedTeamTicket] = useState(null);
  const [selectedMyTicket, setSelectedMyTicket] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [formErr, setFormErr] = useState({});

  const issueTypeOptions = useMemo(
    () => issueTypesByTicketType[form.ticketType] || [],
    [form.ticketType],
  );

  const assignedTo = assignedToByIssueType[form.issueType] || "";

  const stats = useMemo(() => {
    return [
      teamTickets.length,
      teamTickets.filter((ticket) => ["Open", "Pending", "In Progress"].includes(ticket.status)).length,
      teamTickets.filter((ticket) => ticket.status === "Escalated").length,
      teamTickets.filter((ticket) => ticket.status === "Resolved").length,
    ];
  }, [teamTickets]);

  const setField = (field, value) => {
    setForm((current) => {
      if (field === "ticketType") {
        return { ...current, ticketType: value, issueType: "" };
      }

      return { ...current, [field]: value };
    });

    if (formErr[field]) {
      setFormErr((current) => ({ ...current, [field]: "" }));
    }
  };

  const openTeamView = (ticket) => {
    setSelectedTeamTicket(ticket);
    openModal("mtl-team-ticket-view");
  };

  const openMyView = (ticket) => {
    setSelectedMyTicket(ticket);
    openModal("mtl-my-ticket-view");
  };

  const handleTeamReply = (message) => {
    if (!selectedTeamTicket) return;

    const updatedTicket = {
      ...selectedTeamTicket,
      status: selectedTeamTicket.status === "Resolved" ? "Resolved" : "In Progress",
      conversation: [
        ...(selectedTeamTicket.conversation || []),
        {
          id: Date.now(),
          sender: "Management TL",
          time: new Date().toLocaleString("en-IN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          text: message.text,
        },
      ],
    };

    setTeamTickets((current) =>
      current.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)),
    );
    setSelectedTeamTicket(updatedTicket);
  };

  const handleResolve = (ticket) => {
    setTeamTickets((current) =>
      current.map((item) =>
        item.id === ticket.id
          ? {
              ...item,
              status: "Resolved",
              conversation: [
                ...(item.conversation || []),
                {
                  id: Date.now(),
                  sender: "Management TL",
                  time: new Date().toLocaleString("en-IN"),
                  text: "Issue resolved at team level.",
                },
              ],
            }
          : item,
      ),
    );
  };

  const handleEscalate = (ticket) => {
    setTeamTickets((current) =>
      current.map((item) =>
        item.id === ticket.id
          ? {
              ...item,
              status: "Escalated",
              assignedTo: "Management Manager",
              conversation: [
                ...(item.conversation || []),
                {
                  id: Date.now(),
                  sender: "Management TL",
                  time: new Date().toLocaleString("en-IN"),
                  text: "Escalated to Management Manager for approval/support.",
                },
              ],
            }
          : item,
      ),
    );
  };

  const handleCreateSubmit = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Issue title is required.";
    if (!form.ticketType) errors.ticketType = "Ticket type is required.";
    if (!form.issueType) errors.issueType = "Issue type is required.";
    if (!form.description.trim()) errors.description = "Description is required.";

    if (Object.keys(errors).length) {
      setFormErr(errors);
      return;
    }

    const createdTicket = {
      id: `MTL-MY-${Date.now().toString().slice(-5)}`,
      title: form.title.trim(),
      project: form.project.trim() || "General Support",
      raisedBy: "Management TL",
      role: "Management Team Leader",
      priority: form.priority || "Medium",
      status: "Open",
      createdDate: today(),
      lastReply: "—",
      ticketType: form.ticketType,
      issueType: form.issueType,
      assignedTo,
      description: form.description.trim(),
      conversation: [
        {
          id: 1,
          sender: "Management TL",
          time: `${today()} 00:00`,
          text: form.description.trim(),
        },
      ],
    };

    setMyTickets((current) => [createdTicket, ...current]);
    setForm(blankForm);
    setFormErr({});
    closeModal("mtl-support-create-ticket");
  };

  const teamActions = [
    {
      icon: <MessageSquare size={15} />,
      tooltip: "View & Reply",
      variant: "primary",
      onClick: openTeamView,
    },
    {
      icon: <CheckCircle2 size={15} />,
      tooltip: "Mark Resolved",
      variant: "success",
      onClick: handleResolve,
    },
    {
      icon: <AlertTriangle size={15} />,
      tooltip: "Escalate to Manager",
      variant: "danger",
      onClick: handleEscalate,
    },
  ];

  const myActions = [
    {
      icon: <MessageSquare size={15} />,
      tooltip: "View Ticket",
      variant: "primary",
      onClick: openMyView,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Support Ticket" secondaryText="Management" size={12} />
        {kpiLabels.map((label, index) => (
          <DashCard
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
        columns={myColumns}
        rows={myTickets}
        actions={myActions}
        size={12}
        pageSize={5}
        searchable
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High", "Critical"] },
          { title: "Status", type: "toggle", key: "status", options: ["Open", "Pending", "In Progress", "Resolved", "Escalated"] },
          { title: "Ticket Type", type: "select", key: "ticketType", options: ticketTypeOptions },
        ]}
      />

      <DataTable
        title="Employee Tickets"
        columns={teamColumns}
        rows={teamTickets}
        actions={teamActions}
        size={12}
        pageSize={8}
        searchable
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High", "Critical"] },
          { title: "Status", type: "toggle", key: "status", options: ["Open", "Pending", "In Progress", "Resolved", "Escalated"] },
          { title: "Ticket Type", type: "select", key: "ticketType", options: ticketTypeOptions },
          { title: "Issue Type", type: "select", key: "issueType", options: Object.keys(assignedToByIssueType) },
        ]}
      />

      <CreateTicketModal
        form={form}
        formErr={formErr}
        issueTypeOptions={issueTypeOptions}
        assignedTo={assignedTo}
        onFieldChange={setField}
        onSubmit={handleCreateSubmit}
        onCancel={() => {
          setForm(blankForm);
          setFormErr({});
          closeModal("mtl-support-create-ticket");
        }}
      />

      <Modal id="mtl-team-ticket-view" title="Ticket Details" size="lg">
        {selectedTeamTicket && (
          <TicketConversation
            selected={selectedTeamTicket}
            currentUser="Management TL"
            onSend={handleTeamReply}
            onClose={() => closeModal("mtl-team-ticket-view")}
          />
        )}
      </Modal>

      <Modal id="mtl-my-ticket-view" title="My Ticket Details" size="lg">
        {selectedMyTicket && (
          <TicketConversation
            selected={selectedMyTicket}
            currentUser="Management TL"
            readOnly
            onClose={() => closeModal("mtl-my-ticket-view")}
          />
        )}
      </Modal>
    </div>
  );
}

function CreateTicketModal({
  form,
  formErr,
  issueTypeOptions,
  assignedTo,
  onFieldChange,
  onSubmit,
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

          <DataField
            label="Project"
            id="mtl-ticket-project"
            size={6}
            value={form.project}
            onChange={(event) => onFieldChange("project", event.target.value)}
            placeholder="Project name or ID"
          />

          <SelectField
            label="Ticket Type *"
            id="mtl-ticket-type"
            size={6}
            placeholder="Select ticket type"
            value={form.ticketType}
            onChange={(event) => onFieldChange("ticketType", event.target.value)}
          >
            {ticketTypeOptions.map((type) => (
              <Option key={type} value={type} label={type} />
            ))}
          </SelectField>

          <div className="col-span-6">
            <SelectField
              label="Issue Type *"
              id="mtl-ticket-issue-type"
              size={12}
              placeholder={form.ticketType ? "Select issue type" : "Select ticket type first"}
              value={form.issueType}
              onChange={(event) => onFieldChange("issueType", event.target.value)}
              disabled={!form.ticketType}
            >
              {issueTypeOptions.map((type) => (
                <Option key={type} value={type} label={type} />
              ))}
            </SelectField>
            {formErr.issueType && <p className="mt-1 px-1 text-xs text-rose-600">{formErr.issueType}</p>}
          </div>

          <SelectField
            label="Priority"
            id="mtl-ticket-priority"
            size={6}
            placeholder="Select priority"
            value={form.priority}
            onChange={(event) => onFieldChange("priority", event.target.value)}
          >
            <Option value="Low" label="Low" />
            <Option value="Medium" label="Medium" />
            <Option value="High" label="High" />
            <Option value="Critical" label="Critical" />
          </SelectField>

          <DataField
            label="Assigned To"
            id="mtl-ticket-assigned-to"
            size={6}
            value={assignedTo}
            placeholder="Auto assigned by issue type"
            readOnly
          />

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
        </Grid>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button text="Cancel" variant="secondary" size={3} onClick={onCancel} />
          <Button text="Raise Ticket" variant="primary" size={3} onClick={onSubmit} />
        </div>
      </div>
    </Modal>
  );
}

function TicketConversation({ selected, currentUser, readOnly = false, onSend, onClose }) {
  const statusColors = {
    Open: "bg-amber-100 text-amber-700",
    Pending: "bg-orange-100 text-orange-700",
    "In Progress": "bg-purple-100 text-purple-700",
    Resolved: "bg-emerald-100 text-emerald-700",
    Escalated: "bg-rose-100 text-rose-700",
  };

  const conversation = selected.conversation || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        {[
          ["Ticket ID", selected.id],
          ["Raised By", selected.raisedBy || currentUser],
          ["Issue Type", selected.issueType],
          ["Assigned To", selected.assignedTo],
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
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Project</p>
          <p className="text-xs font-bold text-[#2a465a]">{selected.project || "General Support"}</p>
        </div>
        <div className="col-span-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Issue Title</p>
          <p className="text-xs font-bold text-[#2a465a]">{selected.title}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Conversation</p>
        <UserChat
          messages={conversation}
          onSend={readOnly ? null : onSend}
          currentUser={currentUser}
          maxHeight="max-h-72"
          placeholder="Type your reply... (Enter to send)"
          readOnly={readOnly}
        />
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-1">
        <Button text="Close" variant="secondary" size={3} onClick={onClose} />
      </div>
    </div>
  );
}
