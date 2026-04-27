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

const initialMessages = [
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

export default function Communication() {
  const [msgType, setMsgType]   = useState("Announcement");
  const [sentTo, setSentTo]     = useState("All Admins");
  const [title, setTitle]       = useState("");
  const [message, setMessage]   = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMsg, setSelectedMsg] = useState(null);

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
      sentTo: sentTo,
      sentBy: "Super Admin",
      date: new Date().toISOString().slice(0, 10),
    };
    setMessages((prev) => [newMsg, ...prev]);
    setMsgType("Announcement");
    setSentTo("All Admins");
    setTitle("");
    setMessage("");
    alert("Message sent successfully!");
  };

  const columns = [
    { key: "type",   label: "Type"    },
    { key: "title",  label: "Title"   },
    { key: "sentTo", label: "Sent To" },
    { key: "sentBy", label: "Sent By" },
    { key: "date",   label: "Date"    },
  ];

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

  return (
    <div style={{ padding: "24px", background: "#F7F8F0", minHeight: "100vh" }}>
      <Grid cols={12} gap={4}>

        <Heading
          primaryText="Communication"
          secondaryText="Admin Announcements"
          size={12}
        />

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

            <SelectField
              label="Send To (Admin)"
              id="sentTo"
              size={4}
              value={sentTo}
              onChange={(e) => setSentTo(e.target.value)}
              placeholder="Select admin"
            >
              <Option value="All Admins"              label="All Admins" />
              <Option value="Admin - Graphura Delhi"  label="Admin - Graphura Delhi" />
              <Option value="Admin - Graphura Mumbai" label="Admin - Graphura Mumbai" />
              <Option value="Admin - Graphura Pune"   label="Admin - Graphura Pune" />
            </SelectField>

            <DataField
              label="Title"
              id="title"
              placeholder="e.g. Platform Maintenance Tonight"
              size={4}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div className="col-span-12" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="message"
                style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em" }}
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
                  width: "100%", borderRadius: "16px", border: "1px solid #e2e8f0",
                  background: "#f8fafc", padding: "14px 16px", fontSize: "14px",
                  color: "#2a465a", resize: "vertical", fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box",
                }}
              />
              <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>
                {message.length} / 500
              </p>
            </div>

            <Button text="Send Message →" size={3} variant="primary" onClick={handleSend} />

            <div className="col-span-9">
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "6px" }}>
                Preview
              </p>
              <div
                style={{
                  background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px",
                  padding: "12px 16px", fontSize: "13px",
                  color: title || message ? "#2a465a" : "#94a3b8",
                  fontStyle: title || message ? "normal" : "italic", minHeight: "48px",
                }}
              >
                {title || message ? (
                  <>
                    {title && <strong style={{ display: "block", marginBottom: "4px" }}>{title}</strong>}
                    {message}
                  </>
                ) : "Your message preview will appear here..."}
              </div>
            </div>

          </Grid>
        </div>

        <DataTable
          title="Message History"
          columns={columns}
          rows={messages}
          actions={actions}
          size={12}
          pageSize={5}
          searchable={true}
          filters={[
            { title: "Type", type: "toggle", key: "type", options: ["Announcement", "Warning", "Appreciation"] },
          ]}
          date={true}
        />

      </Grid>

      <Modal id="view-message-modal" title="Message Details" size="md">
        {selectedMsg && (
          <Grid cols={12} gap={4}>
            <ModalGrid title="Message Info" cols={2}>
              <ModalData label="Title"   value={selectedMsg.title}   />
              <ModalData label="Type"    value={selectedMsg.type}    />
              <ModalData label="Sent To" value={selectedMsg.sentTo}  />
              <ModalData label="Sent By" value={selectedMsg.sentBy}  />
              <ModalData label="Date"    value={selectedMsg.date}    />
            </ModalGrid>
            <ModalGrid title="Message Content" cols={1}>
              <ModalData label="Message" value={selectedMsg.message} />
            </ModalGrid>
            <div className="col-span-12" style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button text="Close" size={3} variant="secondary" onClick={() => closeModal("view-message-modal")} />
            </div>
          </Grid>
        )}
      </Modal>
    </div>
  );
}