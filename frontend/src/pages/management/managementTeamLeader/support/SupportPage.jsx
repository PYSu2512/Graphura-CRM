import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import {
  Button,
  GAreaChart,
  Grid,
  Heading,
  openModal,
} from "../../../../components/shared/Common_Components";
import TicketStatsCards from "./components/TicketStatsCards";
import TicketsTable from "./components/TicketsTable";
import TicketDrawer from "./components/TicketDrawer";
import RaiseTicketModal from "./components/RaiseTicketModal";
import EscalationPanel from "./components/EscalationPanel";
import TicketConversation from "./components/TicketConversation";
import { blockerHeatmap, issueTrends, tickets } from "./supportData";

const heatTone = {
  danger: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export default function SupportPage() {
  const [selectedTicket, setSelectedTicket] = useState(tickets[0]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <Heading
        primaryText="Management Team"
        secondaryText="Support"
        showAnimations
      />

      <div className="flex justify-end">
        <Button text="Raise Ticket" variant="primary" onClick={() => openModal("mtl-support-raise-ticket")} />
      </div>

      <TicketStatsCards />

      <Grid cols={12} gap={6}>
        <GAreaChart
          title="Issue Trend"
          subtitle="Blockers, escalations, and resolved tickets"
          data={issueTrends}
          areas={[
            { key: "blockers", label: "Blockers", color: "#f59e0b" },
            { key: "escalations", label: "Escalations", color: "#dc2626" },
            { key: "resolved", label: "Resolved", color: "#16a34a" },
          ]}
          size={8}
          height={320}
        />
        <section className="col-span-12 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-[#243b53]">Team Issue Monitoring</h3>
              <p className="text-xs font-medium text-slate-500">Repeated blockers and dependency pressure</p>
            </div>
            <ShieldAlert size={18} className="text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {blockerHeatmap.map((item) => (
              <div key={item.label} className={`rounded-xl border p-3 ${heatTone[item.tone]}`}>
                <p className="text-xs font-black uppercase tracking-wider">{item.label}</p>
                <p className="mt-2 text-2xl font-black">{item.count}</p>
              </div>
            ))}
          </div>
        </section>
      </Grid>

      <TicketsTable onSelect={setSelectedTicket} />

      <Grid cols={12} gap={6}>
        <div className="col-span-12 xl:col-span-5">
          <EscalationPanel onSelect={setSelectedTicket} />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <TicketConversation />
        </div>
      </Grid>

      <TicketDrawer ticket={selectedTicket} />
      <RaiseTicketModal />
    </div>
  );
}
