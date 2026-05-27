import { useState, useRef } from "react";
import {
  DashGrid, EnhancedDashCard, DataTable, Grid, DataField,
  openModal, closeModal, Modal, Select, Option,
  Heading, Button, UserChat,
} from "../../../../components/shared/Common_Components";
import {
  kpiTickets, MY_TICKETS_SEED, ROLE_MM, ROLE_ADMIN,
} from "../ticketsStore";
import {
  Ticket, CheckCircle, AlertCircle, Clock, Paperclip,
  MessageSquare, CheckCircle2, AlertTriangle, Trash2, X,
} from "lucide-react";

const kpiIcons   = [<Ticket size={22} />, <AlertCircle size={22} />, <Clock size={22} />, <CheckCircle size={22} />];
const kpiAccents = ["#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e"];

// Team Tickets columns — TLs/Employees raised to MM
const ticketCols = [
  { key: "id",          label: "Ticket ID"    },
  { key: "title",       label: "Title"        },
  { key: "raisedBy",    label: "Raised By"    },
  { key: "role",        label: "Role"         },
  { key: "priority",    label: "Priority"     },
  { key: "status",      label: "Status"       },
  { key: "createdDate", label: "Created Date" },
];

// My Tickets columns — MM → Admin
const myTicketCols = [
  { key: "id",          label: "Ticket ID"    },
  { key: "title",       label: "Title"        },
  { key: "priority",    label: "Priority"     },
  { key: "status",      label: "Status"       },
  { key: "createdDate", label: "Created Date" },
  { key: "lastReply",   label: "Last Reply"   },
];

const blankForm = { title: "", category: "", priority: "", assignedTo: "", description: "", attachments: [] };

export default function AllTickets({ tickets, setTickets }) {
  const [selected,   setSelected]   = useState(null);
  const [form,       setForm]       = useState(blankForm);
  const [formErr,    setFormErr]    = useState({});
  const [myTickets,  setMyTickets]  = useState(MY_TICKETS_SEED);
  const [mySelected, setMySelected] = useState(null);

  const attachInputRef = useRef(null);

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (formErr[k]) setFormErr((e) => ({ ...e, [k]: "" }));
  };

  const handleAttachFiles = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => ({
      name: file.name,
      url:  URL.createObjectURL(file),
      type: file.type,
    }));
    setForm((f) => ({ ...f, attachments: [...f.attachments, ...previews] }));
    e.target.value = "";
  };

  const removeAttachment = (idx) => {
    setForm((f) => ({ ...f, attachments: f.attachments.filter((_, i) => i !== idx) }));
  };

  // Build initial conversation with description + attachments prepended.
  const withInitialMsg = (ticket) => {
    const SYSTEM_ID = "__initial__";
    if ((ticket.conversation || [])[0]?.id === SYSTEM_ID) return ticket;

    const initial = [];
    if (ticket.description?.trim()) {
      initial.push({
        id:     SYSTEM_ID,
        sender: ticket.raisedBy || "Requester",
        time:   ticket.createdDate ? `${ticket.createdDate} 00:00` : "",
        text:   ticket.description,
      });
    }
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

  const openView = (row) => {
    const ticket = tickets.find((t) => t.id === row.id) ?? row;
    setSelected(withInitialMsg(ticket));
    openModal("mm-ticket-view");
  };

  const openMyView = (row) => {
    const ticket = myTickets.find((t) => t.id === row.id) ?? row;
    setMySelected(withInitialMsg(ticket));
    openModal("mm-myticket-view");
  };

  // MM replies to a TL/Employee ticket
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

  // MM adds to their own ticket (to Admin)
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

  // MM creates a new ticket addressed to Admin
  const handleCreateSubmit = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = "Title is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    const now = new Date().toISOString().slice(0, 10);
    const ticket = {
      id:           `TKT-${Date.now().toString().slice(-4)}`,
      title:        form.title,
      raisedBy:     ROLE_MM,
      role:         ROLE_MM,
      priority:     form.priority || "Medium",
      status:       "In Progress",
      createdDate:  now,
      lastReply:    now,
      description:  form.description,
      attachments:  form.attachments,
      conversation: [],
    };
    setMyTickets((prev) => [ticket, ...prev]);
    setForm(blankForm);
    setFormErr({});
    closeModal("mm-ticket-create");
  };

  const allCombined = [...tickets, ...myTickets];
  const liveCounts = [
    allCombined.length,
    allCombined.filter((t) => t.status === "In Progress").length,
    allCombined.filter((t) => t.status === "Replied").length,
    allCombined.filter((t) => t.status === "Resolved").length,
  ];

  // Team Tickets actions
  const actions = [
    {
      icon: <MessageSquare size={15} />, tooltip: "View & Reply",
      variant: "primary",
      onClick: openView,
    },
    {
      icon: <AlertTriangle size={15} />, tooltip: "Escalate to Admin",
      variant: "danger",
      onClick: (row) => setTickets((prev) => prev.map((t) =>
        t.id === row.id ? { ...t, status: "Escalated", raisedTo: ROLE_ADMIN } : t
      )),
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
      icon: <CheckCircle2 size={15} />, tooltip: "Mark Resolved",
      variant: "success",
      onClick: (row) => setMyTickets((prev) => prev.map((t) =>
        t.id === row.id ? { ...t, status: "Resolved" } : t
      )),
    },
    {
      icon: <Trash2 size={15} />, tooltip: "Delete",
      variant: "danger",
      onClick: (row) => setMyTickets((prev) => prev.filter((t) => t.id !== row.id)),
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Support Tickets" secondaryText="Management" size={12} />
        {kpiTickets.map((k, i) => (
          <EnhancedDashCard
            key={k.title}
            title={k.title}
            value={String(liveCounts[i])}
            icon={kpiIcons[i]}
            accentColor={kpiAccents[i]}
            size={3}
          />
        ))}
      </DashGrid>

      {/* ── Create Ticket button ─────────────────────────────────────────── */}
      <div className="flex justify-end">
        <Button
          text="+ Create Ticket"
          variant="primary"
          size={3}
          onClick={() => openModal("mm-ticket-create")}
        />
      </div>

      {/* ── My Tickets table (MM → Admin) ─────────────────────────────────── */}
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

      {/* ── Team Tickets table (TLs/Employees → MM) ──────────────────────── */}
      <DataTable
        title="Team Tickets"
        columns={ticketCols}
        rows={tickets}
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
          { title: "Status",   type: "toggle", key: "status",   options: ["In Progress", "Replied", "Resolved", "Escalated"] },
        ]}
      />

      {/* ── Create Ticket Modal ──────────────────────────────────────────── */}
      <Modal id="mm-ticket-create" title="Create New Ticket" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={4}>

            <div className="col-span-12">
              <DataField
                label="Ticket Title *" id="mm-tkt-title" size={12}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Enter a clear, concise ticket title"
              />
              {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
            </div>

            <div className="col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Category</label>
              <Select value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="Select category" size={12}>
                <Option value="Project Issue"     label="Project Issue" />
                <Option value="Team Issue"        label="Team Issue" />
                <Option value="Client Escalation" label="Client Escalation" />
                <Option value="Resource Request"  label="Resource Request" />
                <Option value="Technical Issue"   label="Technical Issue" />
                <Option value="Other"             label="Other" />
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
                label="Send To" id="mm-tkt-assign" size={12}
                value={form.assignedTo || ROLE_ADMIN}
                onChange={(e) => setField("assignedTo", e.target.value)}
                placeholder="Admin"
              />
            </div>

            <div className="col-span-12">
              <DataField
                label="Description *" id="mm-tkt-desc" type="textarea" rows={4} size={12}
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
              <input
                ref={attachInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAttachFiles}
              />
              <div
                onClick={() => attachInputRef.current?.click()}
                className="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 cursor-pointer hover:border-[#2a465a]/40 hover:bg-white transition"
              >
                <Paperclip size={18} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-400">Click to upload image</span>
              </div>
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
              onClick={() => { setForm(blankForm); setFormErr({}); closeModal("mm-ticket-create"); }}
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

      {/* ── View / Reply Modal (Team Tickets) ────────────────────────────── */}
      <Modal id="mm-ticket-view" title="Ticket Details" size="lg">
        {selected && (
          <TicketDetailContent
            selected={selected}
            onSendMsg={sendReply}
            onClose={() => closeModal("mm-ticket-view")}
          />
        )}
      </Modal>

      {/* ── View / Reply Modal (My Tickets) ──────────────────────────────── */}
      <Modal id="mm-myticket-view" title="My Ticket Details" size="lg">
        {mySelected && (
          <TicketDetailContent
            selected={mySelected}
            onSendMsg={sendMyReply}
            onClose={() => closeModal("mm-myticket-view")}
          />
        )}
      </Modal>

    </div>
  );
}

// ─── Shared ticket detail content ───────────────────────────────────────────
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
        <div className="col-span-2 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Title</p>
          <p className="text-xs font-bold text-[#2a465a]">{selected.title}</p>
        </div>
      </div>

      {/* ── Chat thread ── */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conversation</p>
        <UserChat
          messages={selected.conversation || []}
          onSend={onSendMsg}
          currentUser={ROLE_MM}
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
