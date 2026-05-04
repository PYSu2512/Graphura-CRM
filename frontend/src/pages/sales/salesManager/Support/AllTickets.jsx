import { useState, useRef } from "react";
import {
  DashGrid, DashCard, DataTable, Grid, DataField,
  openModal, closeModal, Modal, Select, Option,
  Heading, Button, UserChat,
} from "../../../../components/shared/Common_Components";
import { kpiTickets } from "./TicketStore";
import {
  Ticket, CheckCircle, AlertCircle, Clock, Paperclip,
  MessageSquare, CheckCircle2, AlertTriangle, Trash2, X,
} from "lucide-react";

const kpiIcons   = [<Ticket size={22} />, <AlertCircle size={22} />, <Clock size={22} />, <CheckCircle size={22} />];
const kpiAccents = ["#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e"];

const ticketCols = [
  { key: "id",          label: "Ticket ID"    },
  { key: "title",       label: "Title"        },
  { key: "raisedBy",    label: "Raised By"    },
  { key: "role",        label: "Role"         },
  { key: "priority",    label: "Priority"     },
  { key: "status",      label: "Status"       },
  { key: "createdDate", label: "Created Date" },
];

// My Tickets columns — same shape, no Raised By / Role (it's always "me")
const myTicketCols = [
  { key: "id",          label: "Ticket ID"    },
  { key: "title",       label: "Title"        },
  { key: "priority",    label: "Priority"     },
  { key: "status",      label: "Status"       },
  { key: "createdDate", label: "Created Date" },
  { key: "lastReply",   label: "Last Reply"   },
];

const blankForm = { title: "", category: "", priority: "", assignedTo: "", description: "", attachments: [] };

// Seed data for My Tickets (raised by Sales Manager)
const MY_TICKETS_SEED = [
  {
    id: "TKT-SM01", title: "Lead sync issue in dashboard",
    raisedBy: "Sales Manager", role: "Sales Manager",
    priority: "High", status: "In Progress",
    createdDate: "2026-04-28", lastReply: "2026-04-29",
    description: "Lead count on dashboard doesn't match the actual assigned leads list.",
    conversation: [
      { sender: "Sales Manager", time: "2026-04-28 10:00", text: "Lead count mismatch noticed after last update." },
    ],
  },
  {
    id: "TKT-SM02", title: "Export CSV not working",
    raisedBy: "Sales Manager", role: "Sales Manager",
    priority: "Medium", status: "In Progress",
    createdDate: "2026-05-01", lastReply: "2026-05-02",
    description: "Clicking Export CSV on the All Leads page shows a blank download.",
    conversation: [
      { sender: "Sales Manager", time: "2026-05-01 09:30", text: "CSV export returns empty file." },
      { sender: "Admin",         time: "2026-05-02 11:00", text: "Investigating — likely a filter state issue." },
    ],
  },
  {
    id: "TKT-SM03", title: "Notification bell not clearing",
    raisedBy: "Sales Manager", role: "Sales Manager",
    priority: "Low", status: "Resolved",
    createdDate: "2026-04-15", lastReply: "2026-04-17",
    description: "Notification count badge stays even after reading all notifications.",
    conversation: [
      { sender: "Sales Manager", time: "2026-04-15 14:00", text: "Badge count not resetting after reading." },
      { sender: "Admin",         time: "2026-04-17 09:00", text: "Fixed in latest deploy. Please verify." },
    ],
  },
];

export default function AllTickets({ tickets, setTickets }) {
  const [selected,   setSelected]   = useState(null);
  const [form,       setForm]       = useState(blankForm);
  const [formErr,    setFormErr]    = useState({});
  const [myTickets,  setMyTickets]  = useState(MY_TICKETS_SEED);
  const [mySelected, setMySelected] = useState(null);

  // Refs for file inputs
  const attachInputRef = useRef(null); // create-ticket attachment

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (formErr[k]) setFormErr((e) => ({ ...e, [k]: "" }));
  };

  // ── Handle attachment files in create-ticket form ──
  const handleAttachFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({
      name: file.name,
      url:  URL.createObjectURL(file),
      type: file.type,
    }));
    setForm((f) => ({ ...f, attachments: [...f.attachments, ...previews] }));
    e.target.value = ""; // reset so same file can be re-selected
  };

  const removeAttachment = (idx) => {
    setForm((f) => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
  };

  // ── Handle image attach in chat — handled inside TicketDetailContent ──

  // ── Build initial conversation with description + attachments prepended ──
  const withInitialMsg = (ticket) => {
    const SYSTEM_ID = "__initial__";
    // Don't duplicate if already injected
    if ((ticket.conversation || [])[0]?.id === SYSTEM_ID) return ticket;

    const initial = [];

    // Description bubble
    if (ticket.description?.trim()) {
      initial.push({
        id:     SYSTEM_ID,
        sender: ticket.raisedBy || "Requester",
        time:   ticket.createdDate ? `${ticket.createdDate} 00:00` : "",
        text:   ticket.description,
      });
    }

    // Attachment bubbles (images from create-ticket form)
    (ticket.attachments || []).forEach((att, i) => {
      if (att.url) {
        initial.push({
          id:        `${SYSTEM_ID}_img_${i}`,
          sender:    ticket.raisedBy || "Requester",
          time:      ticket.createdDate ? `${ticket.createdDate} 00:00` : "",
          imageUrl:  att.url,
          imageName: att.name,
        });
      }
    });

    return { ...ticket, conversation: [...initial, ...(ticket.conversation || [])] };
  };

  // ── Open view modal (all tickets) ──
  const openView = (row) => {
    const ticket = tickets.find((t) => t.id === row.id) ?? row;
    setSelected(withInitialMsg(ticket));
    openModal("ticket-view-modal");
  };

  // ── Open view modal (my tickets) ──
  const openMyView = (row) => {
    const ticket = myTickets.find((t) => t.id === row.id) ?? row;
    setMySelected(withInitialMsg(ticket));
    openModal("my-ticket-view-modal");
  };

  // ── Send reply (all tickets modal) — receives full msg from UserChat.onSend ──
  const sendReply = (msg) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? { ...t, status: "Replied", lastReply: msg.time.slice(0, 10),
              conversation: [...(t.conversation || []), msg] }
          : t
      )
    );
    setSelected((s) => ({
      ...s, status: "Replied", lastReply: msg.time.slice(0, 10),
      conversation: [...(s.conversation || []), msg],
    }));
  };

  // ── Send reply (my tickets modal) — Sales Manager is the owner, so
  //    sending a message does NOT change status (only admin replies should) ──
  const sendMyReply = (msg) => {
    setMyTickets((prev) =>
      prev.map((t) =>
        t.id === mySelected.id
          ? { ...t, lastReply: msg.time.slice(0, 10),
              conversation: [...(t.conversation || []), msg] }
          : t
      )
    );
    setMySelected((s) => ({
      ...s, lastReply: msg.time.slice(0, 10),
      conversation: [...(s.conversation || []), msg],
    }));
  };

  // ── Change status (all tickets) — kept for future use ──
  // (status changes now happen via table action buttons only)

  // ── Submit new ticket ──
  const handleCreateSubmit = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = "Title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    const now = new Date().toISOString().slice(0, 10);
    const ticket = {
      id:           `TKT-${Date.now().toString().slice(-4)}`,
      title:        form.title,
      raisedBy:     "Sales Manager",
      role:         "Sales Manager",
      priority:     form.priority || "Medium",
      status:       "In Progress",
      createdDate:  now,
      lastReply:    now,
      description:  form.description,
      attachments:  form.attachments,
      conversation: [],
    };
    // Add to both tables
    setTickets((prev)   => [ticket, ...prev]);
    setMyTickets((prev) => [ticket, ...prev]);
    setForm(blankForm);
    setFormErr({});
    closeModal("create-ticket-modal");
  };

  // ── Live KPI counts ──
  const liveCounts = [
    tickets.length,
    tickets.filter((t) => t.status === "In Progress").length,
    tickets.filter((t) => t.status === "Replied").length,
    tickets.filter((t) => t.status === "Resolved").length,
  ];

  // ── Actions: icon + tooltip only ──
  const actions = [
    {
      icon: <MessageSquare size={15} />, tooltip: "View & Reply",
      variant: "primary",
      onClick: openView,
    },
    {
      icon: <AlertTriangle size={15} />, tooltip: "Escalate",
      variant: "danger",
      onClick: (row) => setTickets((prev) => prev.map((t) => t.id === row.id ? { ...t, status: "Escalated" } : t)),
    },
  ];

  // My Tickets actions
  const myActions = [
    {
      icon: <MessageSquare size={15} />, tooltip: "View & Reply",
      variant: "primary",
      onClick: openMyView,
    },
    {
      icon: <CheckCircle2 size={15} />, tooltip: "Resolved",
      variant: "ghost",
      onClick: (row) => setMyTickets((prev) => prev.map((t) => t.id === row.id ? { ...t, status: "Resolved" } : t)),
    },
    {
      icon: <Trash2 size={15} />, tooltip: "Delete",
      variant: "danger",
      onClick: (row) => setMyTickets((prev) => prev.filter((t) => t.id !== row.id)),
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── KPI cards ── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Support Ticket" secondaryText="Management" size={12} />
        {kpiTickets.map((k, i) => (
          <DashCard
            key={k.title}
            title={k.title}
            value={String(liveCounts[i])}
            icon={kpiIcons[i]}
            accentColor={kpiAccents[i]}
            size={3}
          />
        ))}
      </DashGrid>

      {/* ── Create Ticket button — centered ── */}
      <div className="flex justify-end">
        <Button
          text="+ Create Ticket"
          variant="primary"
          size={3}
          onClick={() => openModal("create-ticket-modal")}
        />
      </div>

      {/* ── My Tickets table ── */}
      <DataTable
        title="My Tickets"
        columns={myTicketCols}
        rows={myTickets}
        actions={myActions}
        size={12}
        pageSize={5}
        searchable
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
          { title: "Status",   type: "toggle", key: "status",   options: ["In Progress", "Replied", "Resolved", "Escalated"] },
        ]}
      />

      {/* ── All Tickets table ── */}
      <DataTable
        title="All Tickets"
        columns={ticketCols}
        rows={tickets}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
          { title: "Status",   type: "toggle", key: "status",   options: ["In Progress", "Replied", "Resolved", "Escalated"] },
        ]}
      />

      {/* ── Create Ticket Modal ── */}
      <Modal id="create-ticket-modal" title="Create New Ticket" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={4}>

            <div className="col-span-12">
              <DataField
                label="Ticket Title *" id="tkt-title" size={12}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Enter a clear, concise ticket title"
              />
              {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
            </div>

            <div className="col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Category</label>
              <Select value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="Select category" size={12}>
                <Option value="Client Data"     label="Client Data" />
                <Option value="Technical Issue" label="Technical Issue" />
                <Option value="Lead Issue"      label="Lead Issue" />
                <Option value="Payment Alert"   label="Payment Alert" />
                <Option value="Other"           label="Other" />
              </Select>
            </div>

            <div className="col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Priority</label>
              <Select value={form.priority} onChange={(e) => setField("priority", e.target.value)} placeholder="Select priority" size={12}>
                <Option value="Low"    label="Low" />
                <Option value="Medium" label="Medium" />
                <Option value="High"   label="High" />
              </Select>
            </div>

            <div className="col-span-12">
              <DataField
                label="Assign To / Send To" id="tkt-assign" size={12}
                value={form.assignedTo}
                onChange={(e) => setField("assignedTo", e.target.value)}
                placeholder="Team Leader / Executive name (optional)"
              />
            </div>

            <div className="col-span-12">
              <DataField
                label="Description *" id="tkt-desc" type="textarea" rows={4} size={12}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Describe the issue in detail..."
              />
              {formErr.description && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.description}</p>}
            </div>

            <div className="col-span-12">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] block mb-2">
                Attachment (optional)
              </label>
              {/* Hidden file input */}
              <input
                ref={attachInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAttachFiles}
              />
              {/* Drop zone / click trigger */}
              <div
                onClick={() => attachInputRef.current?.click()}
                className="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 cursor-pointer hover:border-[#2a465a]/40 hover:bg-white transition"
              >
                <Paperclip size={18} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-400">Click to upload image</span>
              </div>
              {/* Previews */}
              {form.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.attachments.map((att, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      {att.type.startsWith("image/") ? (
                        <img src={att.url} alt={att.name} className="w-20 h-20 object-cover" />
                      ) : (
                        <div className="w-20 h-20 flex flex-col items-center justify-center bg-slate-100 gap-1">
                          <Paperclip size={20} className="text-slate-400" />
                          <span className="text-[9px] text-slate-500 text-center px-1 truncate w-full">{att.name}</span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeAttachment(idx); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </Grid>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              text="Cancel"
              variant="secondary"
              size={3}
              onClick={() => { setForm(blankForm); setFormErr({}); closeModal("create-ticket-modal"); }}
            />
            <Button
              text="Submit Ticket"
              variant="primary"
              size={3}
              onClick={handleCreateSubmit}
            />
          </div>
        </div>
      </Modal>

      {/* ── View / Reply Modal (All Tickets) ── */}
      <Modal id="ticket-view-modal" title="Ticket Details" size="lg">
        {selected && (
          <TicketDetailContent
            selected={selected}
            onSendMsg={sendReply}
            onClose={() => closeModal("ticket-view-modal")}
          />
        )}
      </Modal>

      {/* ── View / Reply Modal (My Tickets) ── */}
      <Modal id="my-ticket-view-modal" title="My Ticket Details" size="lg">
        {mySelected && (
          <TicketDetailContent
            selected={mySelected}
            onSendMsg={sendMyReply}
            onClose={() => closeModal("my-ticket-view-modal")}
          />
        )}
      </Modal>

    </div>
  );
}

// ── Shared ticket detail content — uses <UserChat /> from Common_Components ──
function TicketDetailContent({ selected, onSendMsg, onClose }) {
  const statusColors = {
    Open:         "bg-amber-100 text-amber-700",
    "In Progress":"bg-purple-100 text-purple-700",
    Replied:      "bg-blue-100 text-blue-700",
    Resolved:     "bg-emerald-100 text-emerald-700",
    Escalated:    "bg-rose-100 text-rose-700",
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Ticket meta tiles ── */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: "Ticket ID",  value: selected.id },
          { label: "Raised By",  value: selected.raisedBy },
          { label: "Priority",   value: selected.priority },
          { label: "Status",     value: selected.status },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-xs font-bold ${
              label === "Status"
                ? `inline-flex px-2 py-0.5 rounded-full ${statusColors[value] ?? "bg-slate-100 text-slate-600"}`
                : "text-[#2a465a]"
            }`}>
              {value}
            </p>
          </div>
        ))}
        {/* Title — full width */}
        <div className="col-span-2 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Title</p>
          <p className="text-xs font-bold text-[#2a465a]">{selected.title}</p>
        </div>
      </div>

      {/* ── Chat thread — powered by <UserChat /> ── */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conversation</p>
        <UserChat
          messages={selected.conversation || []}
          onSend={onSendMsg}
          currentUser="Sales Manager"
          maxHeight="max-h-72"
          placeholder="Type your reply… (Enter to send)"
        />
      </div>

      {/* ── Footer ── */}
      <div className="flex justify-end pt-1 border-t border-slate-100">
        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition active:scale-95"
        >
          Close
        </button>
      </div>

    </div>
  );
}
