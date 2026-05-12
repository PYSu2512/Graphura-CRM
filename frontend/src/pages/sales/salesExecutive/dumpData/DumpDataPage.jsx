import { useMemo } from "react";
import { Archive, CalendarX2, Database, RotateCcw } from "lucide-react";
import {
  DashGrid,
  EnhancedDashCard,
  Heading,
} from "../../../../components/shared/Common_Components";
import { DumpedLeadsTable } from "./components/DumpedLeadsTable";
import { useDumpData } from "./hooks/useDumpData";

export default function DumpDataPage() {
  const { tableRows, reasonOptions } = useDumpData();

  const stats = useMemo(() => {
    const noResponse = tableRows.filter((lead) => lead.reason === "No Response").length;
    const today = new Date().toISOString().slice(0, 10);
    const todayDumped = tableRows.filter((lead) => lead.dumpDate === today).length;

    return [
      {
        title: "Dump Leads",
        value: String(tableRows.length),
        icon: <Archive size={20} />,
        accentColor: "#f43f5e",
      },
      {
        title: "No Response",
        value: String(noResponse),
        icon: <CalendarX2 size={20} />,
        accentColor: "#f59e0b",
      },
      {
        title: "Today Dumped",
        value: String(todayDumped),
        icon: <Database size={20} />,
        accentColor: "#38bdf8",
      },
      {
        title: "Restore Access",
        value: "Manager",
        icon: <RotateCcw size={20} />,
        accentColor: "#64748b",
      },
    ];
  }, [tableRows]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Heading primaryText="Dump Data" />

      <DashGrid cols={12} gap={4}>
        {stats.map((item) => (
          <EnhancedDashCard
            key={item.title}
            title={item.title.toUpperCase()}
            value={item.value}
            icon={item.icon}
            accentColor={item.accentColor}
            size={3}
          />
        ))}
      </DashGrid>

      <DumpedLeadsTable
        rows={tableRows}
        reasonOptions={reasonOptions}
      />
    </div>
  );
}
