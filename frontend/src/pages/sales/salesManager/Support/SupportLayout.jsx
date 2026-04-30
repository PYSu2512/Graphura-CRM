import React, { useState } from "react";
import AllTickets   from "./AllTickets";
import CreateTicket from "./CreateTicket";
import { initialTickets } from "./TicketStore";

const TABS = ["All Tickets", "Create Ticket"];

export default function SupportLayout() {
  const [active, setActive]   = useState("All Tickets");
  const [tickets, setTickets] = useState(initialTickets);

  const handleTicketCreated = (ticket) => {
    setTickets((prev) => [ticket, ...prev]);
    setActive("All Tickets");
  };

  return (
    <div>
      {/* Tab Bar */}
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

      {active === "All Tickets"   && <AllTickets tickets={tickets} setTickets={setTickets} />}
      {active === "Create Ticket" && <CreateTicket onTicketCreated={handleTicketCreated} />}
    </div>
  );
}