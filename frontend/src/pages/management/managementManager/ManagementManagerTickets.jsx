import { useState } from "react";
import AllTickets from "./tickets/AllTickets";
import { initialTickets } from "./ticketsStore";

export default function ManagementManagerTickets() {
  const [tickets, setTickets] = useState(initialTickets);
  return <AllTickets tickets={tickets} setTickets={setTickets} />;
}
