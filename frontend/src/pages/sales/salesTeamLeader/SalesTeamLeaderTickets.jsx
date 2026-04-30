import { useState } from "react";
import {
  Grid,
  Heading,
  Button,
  DataField,
  SelectField,
  Option,
  DataTable,
  Modal,
  openModal,
  closeModal,
} from "../../../components/shared/Common_Components.jsx";

// ─── Sample Tickets Data ──────────────────────────────────────────────────────
const initialTickets = [
  {
    id: "TKT-001",
    subject: "Lead data issue - duplicate entries",
    raisedBy: "Sales Team Leader",
    raisedTo: "Sales Manager",
    priority: "High",
    status: "Open",
    date: "2026-04-28",
    description: "There are multiple duplicate lead entries in the system. Need urgent resolution.",
    replies: [
      { from: "Sales Manager", text: "Looking into this issue. Will resolve by EOD.", date: "2026-04-28" },
    ],
  },
  {
    id: "TKT-002",
    subject: "Executive not able to login",
    raisedBy: "Sales Team Leader",
    raisedTo: "Sales Manager",
    priority: "Medium",
    status: "In Progress",
    date: "2026-04-27",
    description: "Team executive Rahul is unable to login since yesterday. Please fix ASAP.",
    replies: [],
  },
  {
    id: "TKT-003",
    subject: "Client data missing after bulk upload",
    raisedBy: "Sales Executive",
    raisedTo: "Sales Team Leader",
    priority: "High",
    status: "Open",
    date: "2026-04-26",
    description: "After bulk CSV upload, 15 client records are missing from the system.",
    replies: [],
  },
  {
    id: "TKT-004",
    subject: "Follow-up reminder not working",
    raisedBy: "Sales Executive",
    raisedTo: "Sales Team Leader",
    priority: "Low",
    status: "Resolved",
    date: "2026-04-25",
    description: "Follow-up reminders are not triggering notifications on mobile app.",
    replies: [
      { from: "Sales Team Leader", text: "This has been escalated to the manager. Fix deployed.", date: "2026-04-26" },
    ],
  },
];

// ─── Tab Button ───────────────────────────────────────────────────────────────
const TabBtn = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 20px",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "14px",
      background: active ? "#355872" : "#f1f5f9",
      color: active ? "#ffffff" : "#64748b",
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }}
  >
    {label}
    {count !== undefined && (
      <span
        style={{
          background: active ? "#ffffff30" : "#e2e8f0",
          color: active ? "#ffffff" : "#355872",
          borderRadius: "20px",
          padding: "1px 8px",
          fontSize: "12px",
          fontWeight: 800,
        }}
      >
        {count}
      </span>
    )}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalesTeamLeaderTickets() {
  const [activeTab, setActiveTab] = useState("my-tickets");

  // Raise ticket form state
  const [subject, setSubject]       = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]     = useState("Medium");
  const [raisedTo, setRaisedTo]     = useState("Sales Manager");

  // Tickets state
  const [tickets, setTickets] = useState(initialTickets);

  // Modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText]           = useState("");

  // ── My Tickets = raised by Team Leader
  const myTickets   = tickets.filter((t) => t.raisedBy === "Sales Team Leader");
  // ── Team Tickets = raised by Executives to Team Leader
  const teamTickets = tickets.filter((t) => t.raisedTo === "Sales Team Leader");

  const openCount = teamTickets.filter((t) => t.status === "Open").length;

  // ── Handle Raise Ticket ──────────────────────────────────────────────────────
  const handleRaise = () => {
    if (!subject.trim() || !description.trim()) {
      alert("Please fill in Subject and Description.");
      return;
    }
    const newTicket = {
      id: `TKT-00${tickets.length + 1}`,
      subject: subject.trim(),
      raisedBy: "Sales Team Leader",
      raisedTo,
      priority,
      status: "Open",
      date: new Date().toISOString().slice(0, 10),
      description: description.trim(),
      replies: [],
    };
    setTickets((prev) => [newTicket, ...prev]);
    setSubject("");
    setDescription("");
    setPriority("Medium");
    setRaisedTo("Sales Manager");
    alert("Ticket raised successfully!");
    setActiveTab("my-tickets");
  };

  // ── Handle Reply ─────────────────────────────────────────────────────────────
  const handleReply = () => {
    if (!replyText.trim()) {
      alert("Please write a reply.");
      return;
    }
    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            status: "In Progress",
            replies: [
              ...t.replies,
              {
                from: "Sales Team Leader",
                text: replyText.trim(),
                date: new Date().toISOString().slice(0, 10),
              },
            ],
          }
        : t
    );
    setTickets(updatedTickets);
    setSelectedTicket((prev) => ({
      ...prev,
      status: "In Progress",
      replies: [
        ...prev.replies,
        {
          from: "Sales Team Leader",
          text: replyText.trim(),
          date: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
    setReplyText("");
    alert("Reply sent!");
  };

  // ── Handle Escalate ──────────────────────────────────────────────────────────
  const handleEscalate = () => {
    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id
        ? { ...t, raisedTo: "Sales Manager", status: "Escalated" }
        : t
    );
    setTickets(updatedTickets);
    setSelectedTicket((prev) => ({
      ...prev,
      raisedTo: "Sales Manager",
      status: "Escalated",
    }));
    alert("Ticket escalated to Sales Manager!");
    closeModal("view-ticket-modal");
  };

  // ── Handle Resolve ───────────────────────────────────────────────────────────
  const handleResolve = () => {
    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id ? { ...t, status: "Resolved" } : t
    );
    setTickets(updatedTickets);
    setSelectedTicket((prev) => ({ ...prev, status: "Resolved" }));
    alert("Ticket marked as Resolved!");
    closeModal("view-ticket-modal");
  };

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns = [
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
    {
      label: "View & Reply",
      variant: "primary",
      onClick: (row) => {
        setSelectedTicket(tickets.find((t) => t.id === row.id));
        setReplyText("");
        openModal("view-ticket-modal");
      },
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px", background: "#F7F8F0", minHeight: "100vh" }}>
      <Grid cols={12} gap={4}>

        {/* Heading */}
        <Heading
          primaryText="Tickets"
          secondaryText="Support & Escalation"
          size={12}
        />

        {/* Tabs */}
        <div className="col-span-12" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <TabBtn label="Raise Ticket"  active={activeTab === "raise"}       onClick={() => setActiveTab("raise")}       />
          <TabBtn label="My Tickets"    active={activeTab === "my-tickets"}  onClick={() => setActiveTab("my-tickets")}  count={myTickets.length} />
          <TabBtn label="Team Tickets"  active={activeTab === "team-tickets"} onClick={() => setActiveTab("team-tickets")} count={openCount > 0 ? openCount : undefined} />
        </div>

        {/* ══════════ RAISE TICKET TAB ══════════ */}
        {activeTab === "raise" && (
          <div
            className="col-span-12"
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "24px",
            }}
          >
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#355872", marginBottom: "20px" }}>
              Raise New Ticket
            </p>

            <Grid cols={12} gap={4}>

              <DataField
                label="Subject"
                id="subject"
                placeholder="e.g. Lead data issue"
                size={8}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <SelectField label="Priority" id="priority" size={4} value={priority} onChange={(e) => setPriority(e.target.value)}>
                <Option value="Low"    label="Low" />
                <Option value="Medium" label="Medium" />
                <Option value="High"   label="High" />
              </SelectField>

              <SelectField label="Raise To" id="raisedTo" size={4} value={raisedTo} onChange={(e) => setRaisedTo(e.target.value)}>
                <Option value="Sales Manager" label="Sales Manager" />
              </SelectField>

              {/* Description */}
              <div className="col-span-12" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="description" style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em" }}>
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  maxLength={500}
                  placeholder="Describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#f8fafc", padding: "14px 16px", fontSize: "14px", color: "#2a465a", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
                <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>{description.length} / 500</p>
              </div>

              <Button text="Raise Ticket →" size={3} variant="primary" onClick={handleRaise} />

            </Grid>
          </div>
        )}

        {/* ══════════ MY TICKETS TAB ══════════ */}
        {activeTab === "my-tickets" && (
          <DataTable
            title="My Tickets"
            columns={columns}
            rows={myTickets}
            actions={tableActions}
            size={12}
            pageSize={5}
            searchable={true}
            filters={[
              { title: "Status",   type: "toggle", key: "status",   options: ["Open", "In Progress", "Escalated", "Resolved"] },
              { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
            ]}
            date={true}
          />
        )}

        {/* ══════════ TEAM TICKETS TAB ══════════ */}
        {activeTab === "team-tickets" && (
          <DataTable
            title="Team Tickets"
            columns={teamColumns}
            rows={teamTickets}
            actions={tableActions}
            size={12}
            pageSize={5}
            searchable={true}
            filters={[
              { title: "Status",   type: "toggle", key: "status",   options: ["Open", "In Progress", "Escalated", "Resolved"] },
              { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High"] },
            ]}
            date={true}
          />
        )}

      </Grid>

      {/* ── View & Reply Modal ───────────────────────────────────────────────── */}
      <Modal id="view-ticket-modal" title="Ticket Details" size="md">
        {selectedTicket && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Status + Priority badges */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{
                background: selectedTicket.status === "Resolved" ? "#EAF3DE" : selectedTicket.status === "Escalated" ? "#FAECE7" : selectedTicket.status === "In Progress" ? "#FEF3C7" : "#E6F1FB",
                color: selectedTicket.status === "Resolved" ? "#3B6D11" : selectedTicket.status === "Escalated" ? "#993C1D" : selectedTicket.status === "In Progress" ? "#92400E" : "#0C447C",
                padding: "4px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: 700,
              }}>
                {selectedTicket.status}
              </span>
              <span style={{
                background: selectedTicket.priority === "High" ? "#FAECE7" : selectedTicket.priority === "Medium" ? "#FEF3C7" : "#F1F5F9",
                color: selectedTicket.priority === "High" ? "#993C1D" : selectedTicket.priority === "Medium" ? "#92400E" : "#64748b",
                padding: "4px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: 700,
              }}>
                {selectedTicket.priority} Priority
              </span>
            </div>

            {/* Ticket Info */}
            {[
              { label: "Ticket ID",   value: selectedTicket.id          },
              { label: "Subject",     value: selectedTicket.subject      },
              { label: "Raised By",   value: selectedTicket.raisedBy     },
              { label: "Raised To",   value: selectedTicket.raisedTo     },
              { label: "Date",        value: selectedTicket.date         },
              { label: "Description", value: selectedTicket.description  },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "4px" }}>{item.label}</p>
                <p style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", fontSize: "14px", color: "#2a465a", fontWeight: 500 }}>{item.value}</p>
              </div>
            ))}

            {/* Previous Replies */}
            {selectedTicket.replies.length > 0 && (
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "8px" }}>Replies</p>
                {selectedTicket.replies.map((r, i) => (
                  <div key={i} style={{ background: "#E6F1FB", border: "1px solid #9CD5FF", borderRadius: "12px", padding: "10px 14px", marginBottom: "8px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#355872", marginBottom: "4px" }}>{r.from}</p>
                    <p style={{ fontSize: "14px", color: "#0C447C", fontWeight: 500 }}>{r.text}</p>
                    <p style={{ fontSize: "11px", color: "#7AAACE", marginTop: "4px" }}>{r.date}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Box */}
            {selectedTicket.status !== "Resolved" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em" }}>
                  Write Reply
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  placeholder="Write your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", padding: "12px 14px", fontSize: "14px", color: "#2a465a", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" }}>
              <Button text="Close" size={3} variant="secondary" onClick={() => closeModal("view-ticket-modal")} />
              {selectedTicket.status !== "Resolved" && (
                <>
                  <Button text="Send Reply →"      size={3} variant="primary" onClick={handleReply} />
                  <Button text="Escalate to Manager" size={4} variant="danger"  onClick={handleEscalate} />
                  <Button text="Mark Resolved ✓"   size={3} variant="ghost"   onClick={handleResolve} />
                </>
              )}
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}