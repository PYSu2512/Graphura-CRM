import React, { useState } from "react";
import {
  Heading, DashGrid, DashCard, DataTable,
  openModal, closeModal, Modal, ModalData,
} from "../../../../components/shared/Common_Components";
import { kpiTickets, initialTickets } from "./TicketStore";
import { Ticket, CheckCircle, AlertCircle, Clock, TrendingUp } from "lucide-react";

const kpiIcons = [
  <Ticket size={22} />, <AlertCircle size={22} />, <Clock size={22} />,
  <CheckCircle size={22} />, <TrendingUp size={22} />,
];
const kpiAccents = ["#3b82f6","#f59e0b","#8b5cf6","#22c55e","#f43f5e"];

const ticketCols = [
  { key: "id",          label: "Ticket ID" },
  { key: "title",       label: "Title" },
  { key: "raisedBy",   label: "Raised By" },
  { key: "role",        label: "Role" },
  { key: "priority",    label: "Priority" },
  { key: "status",      label: "Status" },
  { key: "createdDate", label: "Created Date" },
  { key: "lastReply",   label: "Last Reply" },
];

export default function AllTickets({ tickets, setTickets }) {
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState("");

  const openView = (row) => { setSelected(row); setReplyText(""); openModal("ticket-view-modal"); };

  const sendReply = () => {
    if (!replyText.trim()) return;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? { ...t, lastReply: now.slice(0, 10),
              conversation: [...(t.conversation || []), { sender: "Sales Manager", time: now, text: replyText }] }
          : t
      )
    );
    setSelected((s) => ({
      ...s,
      lastReply: now.slice(0, 10),
      conversation: [...(s.conversation || []), { sender: "Sales Manager", time: now, text: replyText }],
    }));
    setReplyText("");
  };

  const changeStatus = (newStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === selected.id ? { ...t, status: newStatus } : t))
    );
    setSelected((s) => ({ ...s, status: newStatus }));
  };

  const actions = [
    { label: "View",     variant: "ghost",   onClick: openView },
    { label: "Reply",    variant: "primary", onClick: (row) => openView(row) },
    { label: "Resolve",  variant: "ghost",   onClick: (row) => setTickets((prev) => prev.map((t) => t.id === row.id ? { ...t, status: "Resolved" } : t)) },
    { label: "Escalate", variant: "danger",  onClick: (row) => setTickets((prev) => prev.map((t) => t.id === row.id ? { ...t, status: "Escalated" } : t)) },
  ];

  // Compute live KPI values from current ticket state
  const liveCounts = [
    tickets.length,
    tickets.filter((t) => t.status === "Open").length,
    tickets.filter((t) => t.status === "In Progress").length,
    tickets.filter((t) => t.status === "Resolved").length,
    tickets.filter((t) => t.status === "Escalated").length,
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashGrid cols={12} gap={4}>
        <Heading primaryText="Support" secondaryText="All Tickets" size={12} />
        {kpiTickets.map((k, i) => (
          <DashCard key={k.title} title={k.title} value={String(liveCounts[i])}
            icon={kpiIcons[i]} accentColor={kpiAccents[i]} size={2} />
        ))}
      </DashGrid>

      <DataTable
        title="Ticket List"
        columns={ticketCols}
        rows={tickets}
        actions={actions}
        size={12}
        pageSize={8}
        searchable
        filters={[
          { title: "Priority", type: "toggle", key: "priority", options: ["Low","Medium","High"] },
          { title: "Status",   type: "toggle", key: "status",   options: ["Open","In Progress","Resolved","Escalated"] },
        ]}
      />

      {/* View / Reply Modal */}
      <Modal id="ticket-view-modal" title="Ticket Details" size="lg">
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-3">
              <ModalData label="Ticket ID"    value={selected.id} />
              <ModalData label="Raised By"    value={selected.raisedBy} />
              <ModalData label="Priority"     value={selected.priority} />
              <ModalData label="Status"       value={selected.status} />
              <div className="col-span-2">
                <ModalData label="Description" value={selected.description} />
              </div>
            </div>

            {/* Conversation */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Conversation</p>
              <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
                {(selected.conversation || []).map((msg, i) => (
                  <div key={i} className={`flex flex-col gap-0.5 ${msg.sender === "Sales Manager" ? "items-end" : "items-start"}`}>
                    <span className="text-xs font-bold text-slate-500">{msg.sender} · {msg.time}</span>
                    <div className={`px-4 py-2 rounded-2xl text-sm font-medium max-w-xs ${
                      msg.sender === "Sales Manager"
                        ? "bg-[#2a465a] text-white"
                        : "bg-slate-100 text-[#2a465a]"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply */}
            <div className="flex gap-2">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-[#2a465a] focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20"
              />
              <button onClick={sendReply}
                className="px-4 py-2 rounded-xl bg-[#2a465a] text-white text-sm font-bold">
                Send
              </button>
            </div>

            {/* Status Actions */}
            <div className="flex gap-2 pt-1">
              <button onClick={() => changeStatus("Resolved")}
                className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold">
                Mark Resolved
              </button>
              <button onClick={() => changeStatus("Escalated")}
                className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-sm font-bold">
                Escalate
              </button>
              <button onClick={() => closeModal("ticket-view-modal")}
                className="flex-1 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-bold">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}