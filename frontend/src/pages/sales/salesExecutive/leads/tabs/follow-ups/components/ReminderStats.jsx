import { Clock3, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard,
} from "../../../../../../../components/shared/Common_Components";

export default function ReminderStats({ reminders = [] }) {
  const upcoming = reminders.filter((r) => r.status === "Upcoming").length;

  const missed = reminders.filter((r) => r.status === "Missed").length;

  const completed = reminders.filter((r) => r.status === "Completed").length;

  const stats = [
    {
      title: "Upcoming",
      value: upcoming,
      icon: <Clock3 />,
      accentColor: "#2563eb",
    },
    {
      title: "Missed",
      value: missed,
      icon: <AlertTriangle />,
      accentColor: "#e11d48",
    },
    {
      title: "Completed",
      value: completed,
      icon: <CheckCircle2 />,
      accentColor: "#059669",
    },
  ];

  return (
    <DashGrid cols={12} gap={5}>
      {stats.map((item) => (
        <EnhancedDashCard
          key={item.title}
          title={item.title.toUpperCase()}
          value={item.value}
          icon={item.icon}
          accentColor={item.accentColor}
          size={4}
        />
      ))}
    </DashGrid>
  );
}
