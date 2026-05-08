import { useState, useRef } from "react";
import {
  DashGrid, DashCard, DataTable, Grid, DataField,
  openModal, closeModal, Modal, Select, Option,
  Heading, Button, UserChat,
} from "../../../../components/shared/Common_Components";
import { kpiTickets, initialTickets } from "./TicketStore";
import {
  Ticket, CheckCircle, AlertCircle, Clock, Paperclip,
  MessageSquare, CheckCircle2, Trash2, X,
} from "lucide-react";

const kpiIcons   = [<Ticket size={22} />, <AlertCircle size={22} />, <Clock size={22} />, <CheckCircle size={22} />];
const kpiAccents = ["#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e"];

const ticketCols = [
  { key: "id",          label: "Ticket ID"    },
  { key: "title",       label: "Subject"      },
  { key: "category",    label: "Type"         },
  { key: "priority",    label: "Priority"     },
  { key: "status",      label: "Status"       },
  { key: "createdDate", label: "Created Date" },
  { key: "lastReply",   label: "Last Updated" },
];

const blankForm = { title: "", category: "", priority: "Medium", description: "", attachments: [] };

export default function Support() {
  const [tickets,    setTickets]    = useState(initialTickets);
  const [selected,   setSelected]   = useState(null);
  const [form,       setForm]       = useState(blankForm);
  const [formErr,    setFormErr]    = useState({});

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

  const withInitialMsg = (ticket) => {
    const SYSTEM_ID = "__initial__";
    if ((ticket.conversation || [])[0]?.id === SYSTEM_ID) return ticket;

    const initial = [];
    if (ticket.description?.trim()) {
      initial.push({
        id:     SYSTEM_ID,
        sender: "Me",
        time:   ticket.createdDate ? `${ticket.createdDate} 00:00` : "",
        text:   ticket.description,
      });
    }

    (ticket.attachments || []).forEach((att, i) => {
      if (att.url) {
        initial.push({
          id:        `${SYSTEM_ID}_img_${i}`,
          sender:    "Me",
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
    openModal("ticket-view-modal");
  };

  const sendReply = (msg) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? { ...t, lastReply: msg.time.slice(0, 10),
              conversation: [...(t.conversation || []), msg] }
          : t
      )
    );
    setSelected((s) => ({
      ...s, lastReply: msg.time.slice(0, 10),
      conversation: [...(s.conversation || []), msg],
    }));
  };

  const handleCreateSubmit = () => {
    const errs = {};
    if (!form.title.trim())       errs.title       = "Subject is required.";
    if (!form.description.trim()) errs.description = "Description is required.";
    if (Object.keys(errs).length) { setFormErr(errs); return; }

    const now = new Date().toISOString().slice(0, 10);
    const ticket = {
      id:           `TKT-${Date.now().toString().slice(-4)}`,
      title:        form.title,
      raisedBy:     "Sales Executive",
      role:         "Sales Executive",
      priority:     form.priority || "Medium",
      status:       "In Progress",
      createdDate:  now,
      lastReply:    now,
      description:  form.description,
      attachments:  form.attachments,
      conversation: [],
    };
    setTickets((prev) => [ticket, ...prev]);
    setForm(blankForm);
    setFormErr({});
    closeModal("create-ticket-modal");
  };

  const liveCounts = [
    tickets.length,
    tickets.filter((t) => t.status === "In Progress").length,
    tickets.filter((t) => t.status === "Replied").length,
    tickets.filter((t) => t.status === "Resolved").length,
  ];

  const actions = [
    {
      icon: <MessageSquare size={15} />, tooltip: "View & Reply",
      variant: "primary",
      onClick: openView,
    },
    {
      icon: <CheckCircle2 size={15} />, tooltip: "Mark Resolved",
      variant: "success",
      onClick: (row) => setTickets((prev) => prev.map((t) => t.id === row.id ? { ...t, status: "Resolved" } : t)),
    },
    {
      icon: <Trash2 size={15} />, tooltip: "Delete",
      variant: "danger",
      onClick: (row) => setTickets((prev) => prev.filter((t) => t.id !== row.id)),
    },
  ];

  return (
    <div className="flex flex-col gap-6">

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

      <div className="flex justify-end">
        <Button
          text="+ Raise Support Ticket"
          variant="primary"
          size={3}
          onClick={() => openModal("create-ticket-modal")}
        />
      </div>

      <DataTable
        title="My Support Tickets"
        columns={ticketCols}
        rows={tickets}
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
          { title: "Status",   type: "toggle", key: "status",   options: ["In Progress", "Replied", "Resolved"] },
        ]}
      />

      {/* Create Ticket Modal */}
      <Modal id="create-ticket-modal" title="Raise New Ticket" size="lg">
        <div className="flex flex-col gap-5">
          <Grid cols={12} gap={4}>
            <div className="col-span-12">
              <DataField
                label="Subject *" id="tkt-title" size={12}
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Briefly describe the issue"
              />
              {formErr.title && <p className="text-xs text-rose-600 mt-1 px-1">{formErr.title}</p>}
            </div>

            <div className="col-span-6 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Category</label>
              <Select value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="Select category" size={12}>
                <Option value="Client Data"     label="Client Data" />
                <Option value="Sales Team Lead" label="Sales Team Lead" />
                <Option value="Sales Manager"  label="Sales Manager" />
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
                label="Description *" id="tkt-desc" type="textarea" rows={4} size={12}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Provide detailed information about the issue..."
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
                <span className="text-sm text-slate-400">Click to upload screenshot</span>
              </div>
              {form.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.attachments.map((att, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={att.url} alt={att.name} className="w-20 h-20 object-cover" />
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
              text="Raise Ticket"
              variant="primary"
              size={3}
              onClick={handleCreateSubmit}
            />
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal id="ticket-view-modal" title="Ticket Details" size="lg">
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "Ticket ID",  value: selected.id },
                { label: "Priority",   value: selected.priority },
                { label: "Status",     value: selected.status },
                { label: "Raised Date", value: selected.createdDate },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-xs font-bold text-[#2a465a]">{value}</p>
                </div>
              ))}
              <div className="col-span-2 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Subject</p>
                <p className="text-xs font-bold text-[#2a465a]">{selected.title}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Conversation</p>
              <UserChat
                messages={selected.conversation || []}
                onSend={sendReply}
                currentUser="Sales Executive"
                maxHeight="max-h-72"
                placeholder="Type your message…"
              />
            </div>

            <div className="flex justify-end pt-1 border-t border-slate-100">
              <Button text="Close" variant="ghost" size={3} onClick={() => closeModal("ticket-view-modal")} />
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
