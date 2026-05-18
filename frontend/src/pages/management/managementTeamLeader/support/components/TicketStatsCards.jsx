import { AlertOctagon, CheckCircle2, Flame, Inbox, Loader2 } from "lucide-react";
import { DashGrid, EnhancedDashCard } from "../../../../../components/shared/Common_Components";
import { ticketMetrics } from "../supportData";

const icons = [Inbox, Loader2, AlertOctagon, CheckCircle2, Flame];

export default function TicketStatsCards() {
  return (
    <DashGrid cols={12} gap={4}>
      {ticketMetrics.map((metric, index) => {
        const Icon = icons[index] || Inbox;
        return (
          <EnhancedDashCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={<Icon size={20} />}
            accentColor={metric.accent}
            size={3}
          />
        );
      })}
    </DashGrid>
  );
}
