import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  LifeBuoy,
  Eye,
  Plus,
} from "lucide-react";

import {
  Heading,
  EnhancedDashCard,
  DashGrid,
  DataTable,
  Button,
  Modal,
  openModal,
  closeModal,
  ModalData,
  ModalGrid,
  DataField,
  SelectField,
  Option,
} from "../../components/shared/Common_Components";

// ── Demo projects (only id + name needed for ticket form) ─────────────────────
const ALL_PROJECTS = [
  { id: "PRJ-001", name: "Acme Corp Website Redesign" },
  { id: "PRJ-002", name: "Brand Identity & Logo Package" },
  { id: "PRJ-003", name: "Social Media Campaign — Q1" },
  { id: "PRJ-004", name: "E-Commerce Store Setup" },
];

// ── Seed support tickets ──────────────────────────────────────────────────────
const SEED_TICKETS = [
  {
    id: "TKT-001",
    projectId: "PRJ-001",
    project: "Acme Corp Website Redesign",
    category: "Technical Issue",
    priority: "High",
    subject: "Mobile layout broken on iPhone 14",
    description: "The hero section overlaps the navigation on iPhone 14 Safari. Please fix ASAP.",
    status: "In Progress",
    date: "2026-05-20",
    response: "Our team is looking into this. We'll update within 24 hours.",
  },
  {
    id: "TKT-002",
    projectId: "PRJ-003",
    project: "Social Media Campaign — Q1",
    category: "Delivery Issue",
    priority: "Medium",
    subject: "Campaign creatives not received",
    description: "We haven't received the promised batch of 10 creatives for week 3.",
    status: "Open",
    date: "2026-05-18",
    response: "",
  },
  {
    id: "TKT-003",
    projectId: "PRJ-002",
    project: "Brand Identity & Logo Package",
    category: "General Inquiry",
    priority: "Low",
    subject: "Can we get the source files in AI format?",
    description: "We need the logo in .ai format for our printer.",
    status: "Resolved",
    date: "2026-02-28",
    response: "Source files have been added to the drive handover folder.",
  },
];

// ── Config ────────────────────────────────────────────────────────────────────
const TICKET_STATUS_CFG = {
  "Open": { color: "#3b82f6", bg: "#eff6ff" },
  "In Progress": { color: "#f59e0b", bg: "#fffbeb" },
  "Resolved": { color: "#22c55e", bg: "#f0fdf4" },
  "Closed": { color: "#94a3b8", bg: "#f1f5f9" },
};

const PRIORITY_CFG = {
  "Low": { color: "#22c55e", bg: "#f0fdf4" },
  "Medium": { color: "#f59e0b", bg: "#fffbeb" },
  "High": { color: "#f43f5e", bg: "#fff1f2" },
  "Urgent": { color: "#dc2626", bg: "#fef2f2" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];

let ticketCounter = SEED_TICKETS.length + 1;
const nextTicketId = () => {
  const id = `TKT-${String(ticketCounter).padStart(3, "0")}`;
  ticketCounter++;
  return id;
};

// ── StatusPill ────────────────────────────────────────────────────────────────
function StatusPill({ status, cfgMap }) {
  const cfg = cfgMap[status] ?? { color: "#94a3b8", bg: "#f1f5f9" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {status}
    </span>
  );
}

// ── SUPPORT PAGE ──────────────────────────────────────────────────────────────
export default function ClientSupport() {
  const [tickets, setTickets] = useState(SEED_TICKETS);
  const [selected, setSelected] = useState(null);

  // Form state
  const [form, setForm] = useState({
    projectId: "",
    category: "",
    priority: "",
    subject: "",
    description: "",
  });
  const [formError, setFormError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    if (!form.projectId || !form.category || !form.priority || !form.subject.trim() || !form.description.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormError("");
    const proj = ALL_PROJECTS.find((p) => p.id === form.projectId);
    const newTicket = {
      id:          nextTicketId(),
      projectId:   form.projectId,
      project:     proj?.name ?? "—",
      category:    form.category,
      priority:    form.priority,
      subject:     form.subject.trim(),
      description: form.description.trim(),
      status:      "Open",
      date:        today(),
      response:    "",
    };
    setTickets((prev) => [newTicket, ...prev]);
    setForm({ projectId: "", category: "", priority: "", subject: "", description: "" });
    closeModal("raise-ticket-modal");
  };

  // Stat counts
  const open       = tickets.filter((t) => t.status === "Open").length;
  const resolved   = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  // Table rows
  const tableRows = tickets.map((t) => ({
    ...t,
    priorityBadge: t.priority,
    statusBadge:   t.status,
  }));

  return (
    <main className="flex flex-col gap-6">

      {/* Heading */}
      <Heading primaryText="Support" secondaryText="Tickets" size={12} fontSize="2xl" />

      {/* EnhancedDashCards */}
      <DashGrid cols={12} gap={5}>
        <EnhancedDashCard title="Total Tickets"  value={String(tickets.length)} icon={<LifeBuoy size={22} />}      accentColor="#2a465a" size={4} />
        <EnhancedDashCard title="Open"           value={String(open)}           icon={<Clock size={22} />}         accentColor="#3b82f6" size={4} />
        <EnhancedDashCard title="Resolved"       value={String(resolved)}       icon={<CheckCircle2 size={22} />}  accentColor="#22c55e" size={4} />
      </DashGrid>

      {/* Raise ticket button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => openModal("raise-ticket-modal")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2a465a] text-white text-sm font-bold hover:bg-[#1a2e3f] transition-colors shadow-md shadow-[#2a465a]/20"
        >
          <Plus size={15} /> Raise a Ticket
        </button>
      </div>

      {/* Tickets table */}
      <DataTable
        title="My Support Tickets"
        columns={[
          { key: "subject",  label: "Subject" },
          { key: "priority", label: "Priority" },
          { key: "status",   label: "Status" },
          { key: "date",     label: "Date" },
        ]}
        rows={tableRows}
        size={12}
        pageSize={5}
        searchable
        filters={[
          { title: "Status",   type: "toggle", key: "status",   options: ["Open","In Progress","Resolved","Closed"] },
          { title: "Priority", type: "toggle", key: "priority", options: ["Low","Medium","High","Urgent"] },
        ]}
        actions={[
          {
            icon: <Eye size={14} />,
            tooltip: "View Ticket",
            variant: "ghost",
            onClick: (row) => {
              setSelected(row);
              openModal("view-ticket-modal");
            },
          },
        ]}
      />

      {/* ── Modal: Raise Ticket ── */}
      <Modal id="raise-ticket-modal" title="Raise a Support Ticket" size="md">
        <div className="space-y-4">
          <SelectField
            label="Project *"
            id="ticket-project"
            size={12}
            placeholder="Select project"
            value={form.projectId}
            onChange={set("projectId")}
          >
            {ALL_PROJECTS.map((p) => (
              <Option key={p.id} value={p.id} label={`${p.id} — ${p.name}`} />
            ))}
          </SelectField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Category *"
              id="ticket-category"
              size={12}
              placeholder="Select category"
              value={form.category}
              onChange={set("category")}
            >
              <Option value="Technical Issue"  label="Technical Issue" />
              <Option value="Payment Issue"    label="Payment Issue" />
              <Option value="Delivery Issue"   label="Delivery Issue" />
              <Option value="General Inquiry"  label="General Inquiry" />
              <Option value="Other"            label="Other" />
            </SelectField>

            <SelectField
              label="Priority *"
              id="ticket-priority"
              size={12}
              placeholder="Select priority"
              value={form.priority}
              onChange={set("priority")}
            >
              <Option value="Low"    label="Low" />
              <Option value="Medium" label="Medium" />
              <Option value="High"   label="High" />
              <Option value="Urgent" label="Urgent" />
            </SelectField>
          </div>

          <DataField
            label="Subject *"
            id="ticket-subject"
            placeholder="Brief title of your issue"
            value={form.subject}
            onChange={set("subject")}
            size={12}
          />

          <DataField
            label="Description *"
            id="ticket-desc"
            type="textarea"
            rows={4}
            placeholder="Describe your issue in detail…"
            value={form.description}
            onChange={set("description")}
            size={12}
          />

          {formError && (
            <p className="text-xs text-rose-600 font-bold px-1">{formError}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              text="Cancel"
              variant="secondary"
              size={3}
              onClick={() => { closeModal("raise-ticket-modal"); setFormError(""); }}
            />
            <Button
              text="Submit Ticket →"
              variant="primary"
              size={4}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </Modal>

      {/* ── Modal: View Ticket ── */}
      <Modal id="view-ticket-modal" title="Ticket Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusPill status={selected.status}   cfgMap={TICKET_STATUS_CFG} />
              <StatusPill status={selected.priority} cfgMap={PRIORITY_CFG} />
            </div>

            <ModalGrid title="Ticket Info" cols={2}>
              <ModalData label="Project"  value={selected.project} />
              <ModalData label="Category" value={selected.category} />
              <ModalData label="Priority" value={selected.priority} />
              <ModalData label="Date"     value={selected.date} />
              <ModalData label="Status"   value={selected.status} />
            </ModalGrid>

            <ModalGrid title="Subject" cols={1}>
              <ModalData label="Subject"     value={selected.subject} />
              <ModalData label="Description" value={selected.description} />
            </ModalGrid>

            {selected.response ? (
              <ModalGrid title="Response from Graphura" cols={1}>
                <ModalData label="Response" value={selected.response} />
              </ModalGrid>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
                Awaiting response from Graphura team…
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                text="Close"
                variant="ghost"
                size={3}
                onClick={() => closeModal("view-ticket-modal")}
              />
            </div>
          </div>
        )}
      </Modal>


    </main>
  );
}
