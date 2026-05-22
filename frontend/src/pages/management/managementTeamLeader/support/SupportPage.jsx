import { useState } from "react";
import {
  Button,
  Heading,
  openModal,
} from "../../../../components/shared/Common_Components";
import TicketStatsCards from "./components/TicketStatsCards";
import TicketsTable from "./components/TicketsTable";
import TicketDrawer from "./components/TicketDrawer";
import RaiseTicketModal from "./components/RaiseTicketModal";
import { tickets } from "./supportData";

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <Heading
        primaryText="Management Team"
        secondaryText="Support"
        showAnimations
      />

      <TicketStatsCards />

      <div className="flex justify-end">
        <Button text="Raise Ticket" variant="primary" onClick={() => openModal("mtl-support-raise-ticket")} />
      </div>

      <TicketsTable onSelect={setSelectedTicket} />

      <TicketDrawer ticket={selectedTicket} />
      <RaiseTicketModal />
    </div>
  );
}
