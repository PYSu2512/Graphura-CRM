import { useState } from "react";
import toast from "react-hot-toast";
import {
  Heading, Grid, Button, DataField, SelectField, Option,
  DataTable, Modal, ModalGrid, ModalData,
  openModal, closeModal,
} from "../../../components/shared/Common_Components.jsx";
import { PenSquare, Inbox, Users, Eye } from "lucide-react";
import {
  INITIAL_TICKETS, PRIORITY_OPTIONS, RAISE_TO_OPTIONS,
  ROLE_TL, ROLE_MANAGER,
} from "./ticketsStore";

const TABS = [
  { key: "raise", label: "Raise Ticket", icon: PenSquare },
  { key: "mine",  label: "My Tickets",   icon: Inbox     },
  { key: "team",  label: "Team Tickets", icon: Users     },
];

const today = () => new Date().toISOString().split("T")[0];

// ─── Priority pill (small standalone — not a status badge) ──────────────────
const priorityClasses = {
  High:   "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-slate-100 text-slate-600",
};

const PriorityPill = ({ value }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest ${priorityClasses[value] || "bg-slate-100 text-slate-600"}`}>
    {value} Priority
  </span>
);

export default function SalesTeamLeaderTickets() {
  const [tickets,    setTickets]    = useState(INITIAL_TICKETS);
  const [active,     setActive]     = useState("mine");
  const [selectedId, setSelectedId] = useState(null);
  const [replyText,  setReplyText]  = useState("");

  // ── Raise form state ─────────────────────────────────────────────────────
  const EMPTY_FORM = { subject: "", description: "", priority: "Medium", raisedTo: ROLE_MANAGER };
  const [form, setForm] = useState(EMPTY_FORM);

  const myTickets   = tickets.filter((t) => t.raisedBy === ROLE_TL);
  const teamTickets = tickets.filter((t) => t.raisedTo === ROLE_TL);
  const teamOpenCount = teamTickets.filter((t) => t.status === "Open").length;

  // selected re-derives from state so reply edits stay live
  const selected = tickets.find((t) => t.id === selectedId) || null;

  const onChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  // ── Raise ticket ─────────────────────────────────────────────────────────
  const handleRaise = () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Please fill in Subject and Description.");
      return;
    }
    const newTicket = {
      id:          `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      subject:     form.subject.trim(),
      raisedBy:    ROLE_TL,
      raisedTo:    form.raisedTo,
      priority:    form.priority,
      status:      "Open",
      date:        today(),
      description: form.description.trim(),
      replies:     [],
    };
    setTickets((prev) => [newTicket, ...prev]);
    setForm(EMPTY_FORM);
    toast.success("Ticket raised successfully!", { icon: "🎟️" });
    setActive("mine");
  };

  // ── Reply / escalate / resolve ───────────────────────────────────────────
  const openTicket = (row) => {
    setSelectedId(row.id);
    setReplyText("");
    openModal("tl-ticket-view");
  };

  const handleReply = () => {
    if (!replyText.trim()) {
      toast.error("Please write a reply.");
      return;
    }
    const stamp = today();
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedId
          ? {
              ...t,
              status:  "In Progress",
              replies: [...t.replies, { from: ROLE_TL, text: replyText.trim(), date: stamp }],
            }
          : t
      )
    );
    setReplyText("");
    toast.success("Reply sent!");
  };

  const handleEscalate = () => {
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, raisedTo: ROLE_MANAGER, status: "Escalated" } : t))
    );
    toast("Ticket escalated to Sales Manager.", { icon: "⚠️" });
    closeModal("tl-ticket-view");
  };

  const handleResolve = () => {
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, status: "Resolved" } : t))
    );
    toast.success("Ticket marked as Resolved!");
    closeModal("tl-ticket-view");
  };

  // ── Table columns ────────────────────────────────────────────────────────
  const myColumns = [
    { key: "id",       label: "Ticket ID" },
    { key: "subject",  label: "Subject"   },
    { key: "raisedTo", label: "Raised To" },
    { key: "priority", label: "Priority"  },
    { key: "status",   label: "Status"    },
    { key: "date",     label: "Date"      },
  ];
  const teamColumns = [
    { key: "id",       label: "Ticket ID" },
    { key: "subject",  label: "Subject"   },
    { key: "raisedBy", label: "Raised By" },
    { key: "priority", label: "Priority"  },
    { key: "status",   label: "Status"    },
    { key: "date",     label: "Date"      },
  ];

  const tableActions = [
    { icon: <Eye size={15} />, tooltip: "View & Reply", variant: "primary", onClick: openTicket },
  ];

  const FILTERS = [
    { title: "Status",   type: "toggle", key: "status",   options: ["Open", "In Progress", "Escalated", "Resolved"] },
    { title: "Priority", type: "toggle", key: "priority", options: PRIORITY_OPTIONS },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Heading primaryText="Tickets" secondaryText="Support & Escalation" size={12} />

      {/* ── Tab nav ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm">
        {TABS.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          const badge =
            key === "mine" ? myTickets.length :
            key === "team" ? (teamOpenCount > 0 ? teamOpenCount : undefined) :
            undefined;
          return (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                isActive
                  ? "bg-[#2a465a] text-white shadow"
                  : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
              }`}
            >
              <Icon size={15} className="flex-shrink-0" />
              {label}
              {badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ══ RAISE TICKET ══════════════════════════════════════════════════ */}
      {active === "raise" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-bold text-[#2a465a] mb-5">Raise New Ticket</p>
          <Grid cols={12} gap={4}>
            <DataField
              label="Subject *" id="tl-tk-subject" placeholder="e.g. Lead data issue"
              value={form.subject} onChange={onChange("subject")} size={8}
            />
            <SelectField label="Priority" value={form.priority} onChange={onChange("priority")} size={4}>
              {PRIORITY_OPTIONS.map((p) => <Option key={p} value={p} label={p} />)}
            </SelectField>
            <SelectField label="Raise To" value={form.raisedTo} onChange={onChange("raisedTo")} size={4}>
              {RAISE_TO_OPTIONS.map((r) => <Option key={r} value={r} label={r} />)}
            </SelectField>

            <div className="col-span-12">
              <label htmlFor="tl-tk-desc" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="tl-tk-desc"
                rows={4}
                maxLength={500}
                placeholder="Describe your issue in detail..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:bg-white resize-none transition"
              />
              <p className="text-xs text-slate-400 text-right mt-1">{form.description.length} / 500</p>
            </div>
          </Grid>
          <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
            <Button text="Clear" variant="ghost"
              onClick={() => setForm(EMPTY_FORM)} />
            <Button text="Raise Ticket" variant="primary" onClick={handleRaise} />
          </div>
        </div>
      )}

      {/* ══ MY TICKETS ════════════════════════════════════════════════════ */}
      {active === "mine" && (
        <DataTable
          title="My Tickets"
          columns={myColumns}
          rows={myTickets}
          actions={tableActions}
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="my_tickets"
          filters={FILTERS}
          date
        />
      )}

      {/* ══ TEAM TICKETS ══════════════════════════════════════════════════ */}
      {active === "team" && (
        <DataTable
          title="Team Tickets"
          columns={teamColumns}
          rows={teamTickets}
          actions={tableActions}
          size={12}
          pageSize={10}
          searchable
          exportable
          exportFileName="team_tickets"
          filters={FILTERS}
          date
        />
      )}

      {/* ── View & Reply Modal ───────────────────────────────────────────── */}
      <Modal id="tl-ticket-view" title="Ticket Details" size="md">
        {selected && (
          <div className="flex flex-col gap-4">
            {/* Status (auto-styled) + Priority badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                selected.status === "Resolved"     ? "bg-emerald-100 text-emerald-700"
              : selected.status === "Escalated"    ? "bg-rose-100 text-rose-700"
              : selected.status === "In Progress"  ? "bg-amber-100 text-amber-700"
              : "bg-blue-100 text-blue-700"
              }`}>
                {selected.status}
              </span>
              <PriorityPill value={selected.priority} />
            </div>

            <ModalGrid title="Ticket Info" cols={2}>
              <ModalData label="Ticket ID" value={selected.id} />
              <ModalData label="Date"      value={selected.date} />
              <ModalData label="Raised By" value={selected.raisedBy} />
              <ModalData label="Raised To" value={selected.raisedTo} />
            </ModalGrid>

            <ModalGrid title="Subject & Description" cols={1}>
              <ModalData label="Subject"     value={selected.subject} />
              <ModalData label="Description" value={selected.description} />
            </ModalGrid>

            {/* Replies thread */}
            {selected.replies.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Replies</p>
                <div className="space-y-2">
                  {selected.replies.map((r, i) => (
                    <div key={i} className="rounded-2xl bg-sky-50 border border-sky-200 px-4 py-3">
                      <p className="text-xs font-bold text-[#2a465a] mb-1">{r.from}</p>
                      <p className="text-sm text-[#0c447c] font-medium">{r.text}</p>
                      <p className="text-[11px] text-sky-700/60 mt-1">{r.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply box (only if not resolved) */}
            {selected.status !== "Resolved" && (
              <div>
                <label htmlFor="tl-tk-reply" className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                  Write Reply
                </label>
                <textarea
                  id="tl-tk-reply"
                  rows={3}
                  maxLength={500}
                  placeholder="Write your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#2a465a] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:bg-white resize-none transition"
                />
              </div>
            )}

            {/* Action footer */}
            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-100">
              <Button text="Close" variant="secondary" size={2} onClick={() => closeModal("tl-ticket-view")} />
              {selected.status !== "Resolved" && (
                <>
                  <Button text="Send Reply"    variant="primary" size={3} onClick={handleReply}    />
                  <Button text="Escalate"      variant="danger"  size={3} onClick={handleEscalate} />
                  <Button text="Mark Resolved" variant="ghost"   size={3} onClick={handleResolve}  />
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
