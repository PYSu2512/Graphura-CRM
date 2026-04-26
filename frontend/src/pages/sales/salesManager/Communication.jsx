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
  ModalGrid,
  ModalData,
} from "../../../components/shared/Common_Components.jsx";

// ─── Sample sent messages history ───────────────────────────────────────────
const initialMessages = [
  {
    id: 1,
    type: "Announcement",
    title: "Q2 Target Update",
    message: "Q2 sales targets have been updated. Please check the dashboard.",
    sentTo: "All Teams",
    role: "All Roles",
    sentBy: "Sales Manager",
    date: "2026-04-26",
  },
  {
    id: 2,
    type: "Appreciation",
    title: "Great Work Team A!",
    message: "Excellent performance hitting 120% of last week target. Keep it up!",
    sentTo: "Team A",
    role: "Sales Executive",
    sentBy: "Sales Manager",
    date: "2026-04-25",
  },
  {
    id: 3,
    type: "Warning",
    title: "Follow-up Miss Alert",
    message: "Follow-up miss rate is above 30% this week. Immediate action required.",
    sentTo: "Team B",
    role: "Team Leader",
    sentBy: "Sales Manager",
    date: "2026-04-24",
  },
];

// ─── Badge color helper ──────────────────────────────────────────────────────
const typeBadge = (type) => {
  if (type === "Warning")
    return (
      <span
        style={{
          background: "#FAECE7",
          color: "#993C1D",
          padding: "3px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        Warning
      </span>
    );
  if (type === "Appreciation")
    return (
      <span
        style={{
          background: "#EAF3DE",
          color: "#3B6D11",
          padding: "3px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        Appreciation
      </span>
    );
  return (
    <span
      style={{
        background: "#E6F1FB",
        color: "#0C447C",
        padding: "3px 10px",
        borderRadius: "12px",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      Announcement
    </span>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Communication() {
  // Form state
  const [msgType, setMsgType]       = useState("Announcement");
  const [department, setDepartment] = useState("Sales Department");
  const [team, setTeam]             = useState("All Teams");
  const [role, setRole]             = useState("All Roles");
  const [title, setTitle]           = useState("");
  const [message, setMessage]       = useState("");

  // History state
  const [messages, setMessages]     = useState(initialMessages);

  // View modal state
  const [selectedMsg, setSelectedMsg] = useState(null);

  // ── Handle Send ────────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      alert("Please fill in both Title and Message before sending.");
      return;
    }

    const newMsg = {
      id: Date.now(),
      type: msgType,
      title: title.trim(),
      message: message.trim(),
      sentTo: team,
      role: role,
      sentBy: "Sales Manager",
      date: new Date().toISOString().slice(0, 10),
    };

    setMessages((prev) => [newMsg, ...prev]);

    // Reset form
    setMsgType("Announcement");
    setDepartment("Sales Department");
    setTeam("All Teams");
    setRole("All Roles");
    setTitle("");
    setMessage("");

    alert("Message sent successfully!");
  };

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns = [
    { key: "type",    label: "Type" },
    { key: "title",   label: "Title" },
    { key: "sentTo",  label: "Sent To" },
    { key: "role",    label: "Role" },
    { key: "date",    label: "Date" },
  ];

  // Rows with badge rendered for type
  const tableRows = messages.map((m) => ({
    ...m,
    type: m.type, // kept as string; badge rendered in custom cell below
  }));

  // ── View action ─────────────────────────────────────────────────────────────
  const actions = [
    {
      label: "View",
      variant: "primary",
      onClick: (row) => {
        setSelectedMsg(row);
        openModal("view-message-modal");
      },
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px", background: "#F7F8F0", minHeight: "100vh" }}>
      <Grid cols={12} gap={4}>

        {/* ── Page Heading ─────────────────────────────────────────────────── */}
        <Heading
          primaryText="Communication"
          secondaryText="Send Messages"
          size={12}
        />

        {/* ══════════════════════════════════════════════════════════════════
            COMPOSE MESSAGE CARD
        ══════════════════════════════════════════════════════════════════ */}
        <div
          className="col-span-12"
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          {/* Section title */}
          <p
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#355872",
              marginBottom: "20px",
            }}
          >
            Compose Message
          </p>

          <Grid cols={12} gap={4}>

            {/* Message Type */}
            <SelectField
              label="Message Type"
              id="msgType"
              size={4}
              value={msgType}
              onChange={(e) => setMsgType(e.target.value)}
              placeholder="Select type"
            >
              <Option value="Announcement"  label="Announcement" />
              <Option value="Warning"       label="Warning" />
              <Option value="Appreciation"  label="Appreciation" />
            </SelectField>

            {/* Department */}
            <SelectField
              label="Department"
              id="department"
              size={4}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <Option value="Sales Department"      label="Sales Department" />
              <Option value="Management Department" label="Management Department" />
              <Option value="Finance Department"    label="Finance Department" />
              <Option value="All Departments"       label="All Departments" />
            </SelectField>

            {/* Team */}
            <SelectField
              label="Team"
              id="team"
              size={4}
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            >
              <Option value="All Teams" label="All Teams" />
              <Option value="Team A"    label="Team A" />
              <Option value="Team B"    label="Team B" />
              <Option value="Team C"    label="Team C" />
            </SelectField>

            {/* Role */}
            <SelectField
              label="Role"
              id="role"
              size={4}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <Option value="All Roles"       label="All Roles" />
              <Option value="Sales Manager"   label="Sales Manager" />
              <Option value="Team Leader"     label="Team Leader" />
              <Option value="Sales Executive" label="Sales Executive" />
            </SelectField>

            {/* Title */}
            <DataField
              label="Title"
              id="title"
              placeholder="e.g. Q2 Target Update"
              size={8}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Message textarea — DataField doesn't support textarea so we use a
                styled native textarea matching the design system */}
            <div
              className="col-span-12"
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <label
                htmlFor="message"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                }}
              >
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                maxLength={500}
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  padding: "14px 16px",
                  fontSize: "14px",
                  color: "#2a465a",
                  resize: "vertical",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <p
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  textAlign: "right",
                }}
              >
                {message.length} / 500
              </p>
            </div>

            {/* Send Button */}
            <Button
              text="Send Message →"
              size={3}
              variant="primary"
              onClick={handleSend}
            />

            {/* Preview box */}
            <div className="col-span-9">
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.3em",
                  marginBottom: "6px",
                }}
              >
                Preview
              </p>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: title || message ? "#2a465a" : "#94a3b8",
                  fontStyle: title || message ? "normal" : "italic",
                  minHeight: "48px",
                }}
              >
                {title || message ? (
                  <>
                    {title && (
                      <strong style={{ display: "block", marginBottom: "4px" }}>
                        {title}
                      </strong>
                    )}
                    {message}
                  </>
                ) : (
                  "Your message preview will appear here..."
                )}
              </div>
            </div>

          </Grid>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            MESSAGE HISTORY TABLE
        ══════════════════════════════════════════════════════════════════ */}
        <DataTable
          title="Message History"
          columns={columns}
          rows={tableRows}
          actions={actions}
          size={12}
          pageSize={5}
          searchable={true}
          filters={[
            {
              title: "Type",
              type: "toggle",
              key: "type",
              options: ["Announcement", "Warning", "Appreciation"],
            },
          ]}
          date={true}
        />

      </Grid>

      {/* ── View Message Modal ──────────────────────────────────────────────── */}
      <Modal id="view-message-modal" title="Message Details" size="md">
        {selectedMsg && (
          <Grid cols={12} gap={4}>

            {/* Type badge */}
            <div className="col-span-12">
              {typeBadge(selectedMsg.type)}
            </div>

            <ModalGrid title="Message Info" cols={2}>
              <ModalData label="Title"   value={selectedMsg.title} />
              <ModalData label="Type"    value={selectedMsg.type} />
              <ModalData label="Sent To" value={selectedMsg.sentTo} />
              <ModalData label="Role"    value={selectedMsg.role} />
              <ModalData label="Sent By" value={selectedMsg.sentBy} />
              <ModalData label="Date"    value={selectedMsg.date} />
            </ModalGrid>

            <ModalGrid title="Message Content" cols={1}>
              <ModalData label="Message" value={selectedMsg.message} />
            </ModalGrid>

            {/* Close button */}
            <div className="col-span-12" style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                text="Close"
                size={3}
                variant="secondary"
                onClick={() => closeModal("view-message-modal")}
              />
            </div>

          </Grid>
        )}
      </Modal>
    </div>
  );
}