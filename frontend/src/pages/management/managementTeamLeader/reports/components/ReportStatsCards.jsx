import { AlertTriangle, BarChart3, CheckCircle2, Clock, FolderKanban, Gauge, Users, Workflow } from "lucide-react";
import { DashGrid, EnhancedDashCard } from "../../../../../components/shared/Common_Components";

const icons = [FolderKanban, Workflow, CheckCircle2, Clock, AlertTriangle, Users, Gauge, BarChart3];

export default function ReportStatsCards({ metrics }) {
  return (
    <DashGrid cols={12} gap={4}>
      {metrics.map((metric, index) => {
        const Icon = icons[index] || FolderKanban;
        return (
          <EnhancedDashCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            icon={<Icon size={20} />}
            accentColor={metric.accent}
            size={metrics.length === 4 || metrics.length > 6 ? 3 : 4}
          />
        );
      })}
    </DashGrid>
  );
}
