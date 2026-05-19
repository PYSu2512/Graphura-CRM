import { AlertTriangle, BarChart3, CheckCircle2, Clock, FolderKanban, Gauge, ShieldAlert } from "lucide-react";
import { DashGrid, EnhancedDashCard } from "../../../../../components/shared/Common_Components";
import { progressStats } from "../data/progressData";

const icons = [FolderKanban, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Gauge];

export default function ProgressStats() {
  return (
    <DashGrid cols={12} gap={4}>
      {progressStats.map((item, index) => {
        const Icon = icons[index] || BarChart3;
        return (
          <EnhancedDashCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={<Icon size={20} />}
            accentColor={item.accent}
            size={4}
          />
        );
      })}
    </DashGrid>
  );
}
