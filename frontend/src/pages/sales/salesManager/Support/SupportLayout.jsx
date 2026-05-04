import React, { useState } from "react";
import AllTickets from "./AllTickets";
import { initialTickets } from "./TicketStore";

export default function SupportLayout() {
  const [tickets, setTickets] = useState(initialTickets);

  return <AllTickets tickets={tickets} setTickets={setTickets} />;
}
