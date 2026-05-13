import { useState, useRef, useEffect } from "react";
import { PenSquare, Send, Inbox, ChevronDown } from "lucide-react";
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
    sentTo: "Admin - TechNova Solutions",
    sentBy: "Super Admin",
    date: "2026-04-25",
  },
  {
    id: 3,
    type: "Warning",
    title: "Data Limit Almost Reached",
    message: "Admin account for Globex Inc is approaching the 6000 lead limit. Please review.",
    sentTo: "Admin - Globex Inc",
    sentBy: "Super Admin",
    date: "2026-04-24",
  },
];

// ─── Sample Received Messages ─────────────────────────────────────────────────
const initialReceived = [
  {
    id: 101,
    from: "Admin - TechNova Solutions",
    title: "Storage Issue",
    message: "We are facing storage issues. Our lead limit is almost full. Please increase the limit.",
    date: "2026-04-26",
    replied: false,
    replies: [],
  },
  {
    id: 102,
    from: "Admin - Globex Inc",
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

const MultiSelectDropdown = ({ options, selected, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt) => {
    if (opt === "All Admins") {
      if (selected.includes("All Admins")) {
        onChange([]);
      } else {
        onChange([...options]);
      }
      return;
    }

    if (selected.includes(opt)) {
      onChange(selected.filter((item) => item !== opt && item !== "All Admins"));
    } else {
      const newSelected = [...selected, opt];
      const allOthersSelected = options.filter(o => o !== "All Admins").every(o => newSelected.includes(o));
      if (allOthersSelected) {
        onChange([...options]);
      } else {
        onChange(newSelected);
      }
    }
  };

  return (
    <div className="col-span-12" style={{ display: "flex", flexDirection: "column", gap: "6px" }} ref={dropdownRef}>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em" }}>
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border bg-slate-50/90 text-[#2a465a] text-sm font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 ${
            isOpen ? "border-[#2a465a]/40 ring-2 ring-[#2a465a]/20" : "border-slate-200 hover:border-[#2a465a]/40"
          }`}
        >
          <span className="truncate">
            {selected.length === 0 ? "Select company admin..." : selected.join(", ")}
          </span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180 text-[#2a465a]" : "text-slate-400"}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <label 
                  key={opt} 
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 last:border-0 transition-colors ${
                    isSelected ? "bg-[#2a465a]" : "hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOption(opt)}
                    className={`w-4 h-4 rounded cursor-pointer ${
                      isSelected ? "bg-white border-transparent text-[#2a465a] focus:ring-white" : "text-[#2a465a] border-slate-300 focus:ring-[#2a465a]"
                    }`}
                  />
                  <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-slate-700"}`}>{opt}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Communication() {
  const [activeTab, setActiveTab] = useState("compose");

  // Compose form state
  const [sentTo, setSentTo]   = useState(["All Admins"]);
  const [title, setTitle]     = useState("");
  const [message, setMessage] = useState("");
  const [msgType, setMsgType] = useState("Announcement");

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
    if (sentTo.length === 0) {
      alert("Please select at least one recipient.");
      return;
    }
    const newMsg = {
      id: Date.now(),
      type: msgType,
      title: title.trim(),
      message: message.trim(),
      sentTo: sentTo.join(", "),
      sentBy: "Super Admin",
      date: new Date().toISOString().slice(0, 10),
    };
    setSentMessages((prev) => [newMsg, ...prev]);
    setSentTo(["All Admins"]);
    setTitle("");
    setMessage("");
    setMsgType("Announcement");
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
    <div className="w-full max-w-[1600px] mx-auto space-y-6">
      <Grid cols={12} gap={4}>

        {/* Heading */}
        <Heading
          primaryText="Communication"
          secondaryText="Super-Admin Announcements"
          size={12}
          fontSize="3xl"
          showAnimation={true}
        />

        {/* Tabs */}
        <div className="col-span-12">
          <div className="flex flex-wrap gap-1.5 bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            <button
              onClick={() => setActiveTab("compose")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "compose"
                  ? "bg-[#2a465a] text-white shadow"
                  : "text-slate-500 hover:bg-slate-100 hover:text-[#2a465a]"
              }`}
            >
              <PenSquare size={16} />
              Compose
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "sent"
                  ? "bg-[#2a465a] text-white shadow"
                  : "text-slate-500 hover:bg-slate-100 hover:text-[#2a465a]"
              }`}
            >
              <Send size={16} />
              Sent Messages
            </button>
            <button
              onClick={() => setActiveTab("received")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === "received"
                  ? "bg-[#2a465a] text-white shadow"
                  : "text-slate-500 hover:bg-slate-100 hover:text-[#2a465a]"
              }`}
            >
              <Inbox size={16} />
              Received Messages
              {unreadCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === "received" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-600"
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ══════════ COMPOSE TAB ══════════ */}
        {activeTab === "compose" && (
          <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-sm font-black text-[#2a465a] mb-5">
              Compose Message
            </p>

            <Grid cols={12} gap={4}>

              {/* Message Type */}
              <div className="col-span-12 sm:col-span-6">
                <SelectField
                  label="Message Type *" id="sa-msg-type" size={12}
                  placeholder="Select type..."
                  value={msgType}
                  onChange={(e) => setMsgType(e.target.value)}
                >
                  <Option value="Announcement" label="Announcement" />
                  <Option value="Warning" label="Warning" />
                  <Option value="Appreciation" label="Appreciation" />
                </SelectField>
              </div>

              {/* Multi-select Send To */}
              <div className="col-span-12 sm:col-span-6">
                <MultiSelectDropdown
                  label="Send To (Company Wise)"
                  options={[
                    "All Admins",
                    "Admin - TechNova Solutions",
                    "Admin - Globex Inc",
                    "Admin - Zenith Retail"
                  ]}
                  selected={sentTo}
                  onChange={setSentTo}
                />
              </div>

              {/* Title */}
              <div className="col-span-12">
                <DataField
                  label="Title *" id="sa-title" size={12}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Platform Maintenance Tonight"
                />
              </div>

              {/* Message Textarea */}
              <div className="col-span-12" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label htmlFor="message" style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em" }}>
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={4}
                  maxLength={500}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3.5 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 transition duration-200 resize-none"
                />
                <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "right" }}>{message.length} / 500</p>
              </div>

              {/* ── Live Preview ── */}
              {(title.trim() || message.trim()) && (
                <div className="col-span-12">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-2">
                    Preview
                  </p>
                  <div className={`rounded-2xl border p-5 space-y-3 transition-all ${
                    msgType === "Warning"
                      ? "bg-amber-50 border-amber-200"
                      : msgType === "Appreciation"
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-blue-50 border-blue-200"
                  }`}>
                    {/* Type badge + audience */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {msgType && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          msgType === "Warning"
                            ? "bg-amber-100 text-amber-700"
                            : msgType === "Appreciation"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                        }`}>
                          {msgType}
                        </span>
                      )}
                      {sentTo.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          → {sentTo.join(", ")}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    {title.trim() ? (
                      <h3 className={`text-base font-black leading-snug ${
                        msgType === "Warning"
                          ? "text-amber-800"
                          : msgType === "Appreciation"
                            ? "text-emerald-800"
                            : "text-blue-900"
                      }`}>
                        {title}
                      </h3>
                    ) : (
                      <p className="text-sm italic text-slate-400">Title will appear here…</p>
                    )}

                    {/* Divider */}
                    <div className={`h-px ${
                      msgType === "Warning"
                        ? "bg-amber-200"
                        : msgType === "Appreciation"
                          ? "bg-emerald-200"
                          : "bg-blue-200"
                    }`} />

                    {/* Body */}
                    {message.trim() ? (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {message}
                      </p>
                    ) : (
                      <p className="text-sm italic text-slate-400">Message body will appear here…</p>
                    )}

                    {/* Footer */}
                    <p className="text-[10px] text-slate-400 pt-1">
                      From: Super Admin &nbsp;·&nbsp; {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="col-span-6">
                <Button text="Reset" variant="secondary" onClick={() => { setSentTo(["All Admins"]); setTitle(""); setMessage(""); setMsgType("Announcement"); }} />
              </div>
              <div className="col-span-6">
                <Button text="Send Message →" variant="primary" onClick={handleSend} />
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
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3.5 text-[#2a465a] placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2a465a]/20 focus:border-[#2a465a]/40 transition duration-200 resize-none"
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