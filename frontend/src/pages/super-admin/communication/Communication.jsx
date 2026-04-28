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

// ─── Sample Sent Messages ─────────────────────────────────────────────────────
const initialSent = [
  {
    id: 1,
    type: "Announcement",
    title: "Platform Maintenance Tonight",
    message: "The CRM platform will undergo maintenance from 11PM to 1AM. Please save your work.",
    sentTo: "All Admins",
    sentBy: "Super Admin",
    date: "2026-04-26",
  },
  {
    id: 2,
    type: "Appreciation",
    title: "Great Onboarding This Month!",
    message: "Admin team has done an excellent job onboarding new companies this month.",
    sentTo: "Admin - Graphura Delhi",
    sentBy: "Super Admin",
    date: "2026-04-25",
  },
  {
    id: 3,
    type: "Warning",
    title: "Data Limit Almost Reached",
    message: "Admin account for Graphura Mumbai is approaching the 6000 lead limit. Please review.",
    sentTo: "Admin - Graphura Mumbai",
    sentBy: "Super Admin",
    date: "2026-04-24",
  },
];

// ─── Sample Received Messages ─────────────────────────────────────────────────
const initialReceived = [
  {
    id: 101,
    from: "Admin - Graphura Delhi",
    title: "Storage Issue",
    message: "We are facing storage issues. Our lead limit is almost full. Please increase the limit.",
    date: "2026-04-26",
    replied: false,
    replies: [],
  },
  {
    id: 102,
    from: "Admin - Graphura Mumbai",
    title: "Billing Query",
    message: "We have a query regarding our billing cycle for this month. Kindly assist.",
    date: "2026-04-25",
    replied: true,
    replies: [
      {
        text: "We have forwarded your query to the billing team. You will hear back within 24 hours.",
        date: "2026-04-25",
      },
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
export default function Communication() {
  const [activeTab, setActiveTab] = useState("compose");

  // Compose form state
  const [msgType, setMsgType] = useState("Announcement");
  const [sentTo, setSentTo]   = useState("All Admins");
  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");

  // Messages state
  const [sentMessages, setSentMessages]           = useState(initialSent);
  const [receivedMessages, setReceivedMessages]   = useState(initialReceived);

  // Modal state
  const [selectedMsg, setSelectedMsg]     = useState(null);
  const [selectedReceived, setSelectedReceived] = useState(null);
  const [replyText, setReplyText]         = useState("");

  // ── Handle Send ─────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      alert("Please fill in both Title and Message.");
      return;
    }
    const newMsg = {
      id: Date.now(),
      type: msgType,
      title: title.trim(),
      message: message.trim(),
      sentTo,
      sentBy: "Super Admin",
      date: new Date().toISOString().slice(0, 10),
    };
    setSentMessages((prev) => [newMsg, ...prev]);
    setMsgType("Announcement");
    setSentTo("All Admins");
    setTitle("");
    setMessage("");
    alert("Message sent successfully!");
  };

  // ── Handle Reply ─────────────────────────────────────────────────────────────
  const handleReply = () => {
    if (!replyText.trim()) {
      alert("Please write a reply before sending.");
      return;
    }
    setReceivedMessages((prev) =>
      prev.map((m) =>
        m.id === selectedReceived.id
          ? {
              ...m,
              replied: true,
              replies: [
                ...m.replies,
                {
                  text: replyText.trim(),
                  date: new Date().toISOString().slice(0, 10),
                },
              ],
            }
          : m
      )
    );
    setSelectedReceived((prev) => ({
      ...prev,
      replied: true,
      replies: [
        ...prev.replies,
        {
          text: replyText.trim(),
          date: new Date().toISOString().slice(0, 10),
        },
      ],
    }));
    setReplyText("");
    alert("Reply sent successfully!");
  };

  // ── Sent Table columns ───────────────────────────────────────────────────────
  const sentColumns = [
    { key: "type",   label: "Type"    },
    { key: "title",  label: "Title"   },
    { key: "sentTo", label: "Sent To" },
    { key: "date",   label: "Date"    },
  ];

  // ── Received Table columns ───────────────────────────────────────────────────
  const receivedColumns = [
    { key: "from",    label: "From"    },
    { key: "title",   label: "Title"   },
    { key: "date",    label: "Date"    },
    { key: "status",  label: "Status"  },
  ];

  const receivedRows = receivedMessages.map((m) => ({
    ...m,
    status: m.replied ? "Completed" : "Pending",
  }));

  const unreadCount = receivedMessages.filter((m) => !m.replied).length;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px", background: "#F7F8F0", minHeight: "100vh" }}>
      <Grid cols={12} gap={4}>

        {/* Heading */}
        <Heading
          primaryText="Communication"
          secondaryText="Admin Announcements"
          size={12}
        />

        {/* Tabs */}
        <div
          className="col-span-12"
          style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
        >
          <TabBtn label="Compose"          active={activeTab === "compose"}  onClick={() => setActiveTab("compose")}  />
          <TabBtn label="Sent Messages"    active={activeTab === "sent"}     onClick={() => setActiveTab("sent")}     count={sentMessages.length} />
          <TabBtn label="Received Messages" active={activeTab === "received"} onClick={() => setActiveTab("received")} count={unreadCount > 0 ? unreadCount : undefined} />
        </div>

        {/* ══════════ COMPOSE TAB ══════════ */}
        {activeTab === "compose" && (
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
              Compose Message
            </p>

            <Grid cols={12} gap={4}>

              <SelectField label="Message Type" id="msgType" size={4} value={msgType} onChange={(e) => setMsgType(e.target.value)} placeholder="Select type">
                <Option value="Announcement"  label="Announcement" />
                <Option value="Warning"       label="Warning" />
                <Option value="Appreciation"  label="Appreciation" />
              </SelectField>

              <SelectField label="Send To (Admin)" id="sentTo" size={4} value={sentTo} onChange={(e) => setSentTo(e.target.value)} placeholder="Select admin">
                <Option value="All Admins"              label="All Admins" />
                <Option value="Admin - Graphura Delhi"  label="Admin - Graphura Delhi" />
                <Option value="Admin - Graphura Mumbai" label="Admin - Graphura Mumbai" />
                <Option value="Admin - Graphura Pune"   label="Admin - Graphura Pune" />
              </SelectField>

              <DataField label="Title" id="title" placeholder="e.g. Platform Maintenance Tonight" size={4} value={title} onChange={(e) => setTitle(e.target.value)} />

              {/* Message Textarea */}
              <div className="col-span-12" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="message" style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em" }}>
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  maxLength={500}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ width: "100%", borderRadius: "16px", border: "1px solid #e2e8f0", background: "#f8fafc", padding: "14px 16px", fontSize: "14px", color: "#2a465a", resize: "vertical", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                />
                <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>{message.length} / 500</p>
              </div>

              <Button text="Send Message →" size={3} variant="primary" onClick={handleSend} />

              {/* Preview */}
              <div className="col-span-9">
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "6px" }}>Preview</p>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: title || message ? "#2a465a" : "#94a3b8", fontStyle: title || message ? "normal" : "italic", minHeight: "48px" }}>
                  {title || message ? (
                    <>{title && <strong style={{ display: "block", marginBottom: "4px" }}>{title}</strong>}{message}</>
                  ) : "Your message preview will appear here..."}
                </div>
              </div>

            </Grid>
          </div>
        )}

        {/* ══════════ SENT TAB ══════════ */}
        {activeTab === "sent" && (
          <DataTable
            title="Sent Messages"
            columns={sentColumns}
            rows={sentMessages}
            actions={[
              {
                label: "View",
                variant: "primary",
                onClick: (row) => {
                  setSelectedMsg(row);
                  openModal("view-sent-modal");
                },
              },
            ]}
            size={12}
            pageSize={5}
            searchable={true}
            filters={[
              { title: "Type", type: "toggle", key: "type", options: ["Announcement", "Warning", "Appreciation"] },
            ]}
            date={true}
          />
        )}

        {/* ══════════ RECEIVED TAB ══════════ */}
        {activeTab === "received" && (
          <DataTable
            title="Received Messages"
            columns={receivedColumns}
            rows={receivedRows}
            actions={[
              {
                label: "View & Reply",
                variant: "primary",
                onClick: (row) => {
                  setSelectedReceived(receivedMessages.find((m) => m.id === row.id));
                  setReplyText("");
                  openModal("view-received-modal");
                },
              },
            ]}
            size={12}
            pageSize={5}
            searchable={true}
          />
        )}

      </Grid>

      {/* ── View Sent Message Modal ──────────────────────────────────────────── */}
      <Modal id="view-sent-modal" title="Sent Message Details" size="md">
        {selectedMsg && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <span style={{
              background: selectedMsg.type === "Warning" ? "#FAECE7" : selectedMsg.type === "Appreciation" ? "#EAF3DE" : "#E6F1FB",
              color: selectedMsg.type === "Warning" ? "#993C1D" : selectedMsg.type === "Appreciation" ? "#3B6D11" : "#0C447C",
              padding: "4px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, display: "inline-block",
            }}>
              {selectedMsg.type}
            </span>
            {[
              { label: "Title",   value: selectedMsg.title   },
              { label: "Sent To", value: selectedMsg.sentTo  },
              { label: "Sent By", value: selectedMsg.sentBy  },
              { label: "Date",    value: selectedMsg.date    },
              { label: "Message", value: selectedMsg.message },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "4px" }}>{item.label}</p>
                <p style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", fontSize: "14px", color: "#2a465a", fontWeight: 500 }}>{item.value}</p>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button text="Close" size={3} variant="secondary" onClick={() => closeModal("view-sent-modal")} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── View & Reply Received Message Modal ─────────────────────────────── */}
      <Modal id="view-received-modal" title="Received Message" size="md">
        {selectedReceived && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Message Info */}
            {[
              { label: "From",    value: selectedReceived.from    },
              { label: "Title",   value: selectedReceived.title   },
              { label: "Date",    value: selectedReceived.date    },
              { label: "Message", value: selectedReceived.message },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "4px" }}>{item.label}</p>
                <p style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px 14px", fontSize: "14px", color: "#2a465a", fontWeight: 500 }}>{item.value}</p>
              </div>
            ))}

            {/* Previous Replies */}
            {selectedReceived.replies.length > 0 && (
              <div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "8px" }}>Previous Replies</p>
                {selectedReceived.replies.map((r, i) => (
                  <div key={i} style={{ background: "#E6F1FB", border: "1px solid #9CD5FF", borderRadius: "12px", padding: "10px 14px", marginBottom: "8px" }}>
                    <p style={{ fontSize: "14px", color: "#0C447C", fontWeight: 500 }}>{r.text}</p>
                    <p style={{ fontSize: "11px", color: "#7AAACE", marginTop: "4px" }}>{r.date}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Box */}
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

            {/* Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <Button text="Close"        size={3} variant="secondary" onClick={() => closeModal("view-received-modal")} />
              <Button text="Send Reply →" size={3} variant="primary"   onClick={handleReply} />
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}