import React, { useState } from "react";
import Announcements  from "./Announcements";
import MessageHistory from "./MessageHistory";
import { initialMessages } from "./CommunicationStore";

const TABS = ["Announcements", "Message History"];

export default function CommunicationLayout() {
  const [active, setActive]     = useState("Announcements");
  const [messages, setMessages] = useState(initialMessages);

  const handleMessageSent = (msg) => {
    setMessages((prev) => [msg, ...prev]);
    setActive("Message History");
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-1.5 shadow-sm w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
              active === tab
                ? "bg-[#2a465a] text-white shadow"
                : "text-slate-500 hover:text-[#2a465a] hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "Announcements"   && <Announcements onMessageSent={handleMessageSent} />}
      {active === "Message History" && <MessageHistory messages={messages} setMessages={setMessages} />}
    </div>
  );
}