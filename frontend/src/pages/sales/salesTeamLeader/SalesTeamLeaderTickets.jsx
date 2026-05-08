import { useState } from "react";
import AllTickets from "./tickets/AllTickets";
import { initialTickets } from "./ticketsStore";

export default function SalesTeamLeaderTickets() {
  const [tickets, setTickets] = useState(initialTickets);
  return <AllTickets tickets={tickets} setTickets={setTickets} />;
}
