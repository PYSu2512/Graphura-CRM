import { useState, useRef } from "react";
import {
  Heading,
  EnhancedDashCard,
  DashGrid,
  DataTable,
  GBarChart,
  GDoughnutChart,
  HeadingForDataTable,
} from "../../../../components/shared/Common_Components";

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
        {supportStats.map((stat, idx) => (
          <EnhancedDashCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            accentColor={stat.color}
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
          { title: "Status", type: "toggle", key: "status", options: ["Opened", "In Progress", "Replied", "Resolved", "Escalated", "Closed"] },
        ]}
      />
    </div>
  );
}
