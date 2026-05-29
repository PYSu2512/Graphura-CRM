import { useState } from "react";
import AllTickets from "./tickets/AllTickets";
import { MY_TICKETS_SEED } from "./tickets/ticketsStore";

export default function ManagementEmployeeTickets() {
  const [tickets, setTickets] = useState(MY_TICKETS_SEED);
  return <AllTickets tickets={tickets} setTickets={setTickets} />;
}
