import { BarChart3, CheckCircle2, Clock, IndianRupee, PhoneCall, ShieldAlert, Target, Trash2, TrendingUp, UserCheck } from "lucide-react";
import { DashGrid, EnhancedDashCard } from "../../../../../components/shared/Common_Components";
import { progressStats } from "../data/progressData";

const icons = [Target, TrendingUp, UserCheck, CheckCircle2, Trash2, Clock, PhoneCall, BarChart3, IndianRupee, Target, UserCheck, ShieldAlert];

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
            size={3}
          />
        );
      })}
    </DashGrid>
  );
}
