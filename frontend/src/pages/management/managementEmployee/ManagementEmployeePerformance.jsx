import { useMemo, useState } from "react";
import {
  Grid,
  Heading,
  DashGrid,
  DashCard,
  GLineChart,
  GPieChart,
} from "../../../components/shared/Common_Components.jsx";
import {
  FolderOpen,
  CheckCircle2,
  Activity,
  Percent,
} from "lucide-react";
import { myProjects, weeklyNotesAdded } from "./managementEmployeeStore";

// Fabricated trend buckets for the period filter on the GLineChart.
// Week values reuse `weeklyNotesAdded` from the canonical store; month/year
// are derived rollups so the chart has something to show under each filter.
const trendData = {
  week:  weeklyNotesAdded.map(({ name, count }) => ({ name, score: count })),
  month: [
    { name: "Wk 1", score: 14 },
    { name: "Wk 2", score: 18 },
    { name: "Wk 3", score: 21 },
    { name: "Wk 4", score: 19 },
  ],
  year:  [
    { name: "Jan", score: 12 }, { name: "Feb", score: 18 }, { name: "Mar", score: 25 },
    { name: "Apr", score: 22 }, { name: "May", score: 28 }, { name: "Jun", score: 30 },
  ],
};

const KPI_ICONS   = [<FolderOpen size={20} />, <CheckCircle2 size={20} />, <Activity size={20} />, <Percent size={20} />];
const KPI_ACCENTS = ["#3b82f6", "#22c55e", "#14b8a6", "#8b5cf6"];

export default function ManagementEmployeePerformance() {
  const [period, setPeriod] = useState("week");

  // ── Live-derived KPIs from myProjects ──────────────────────────────
  const { kpis, statusMix } = useMemo(() => {
    const total     = myProjects.length;
    const completed = myProjects.filter((p) => p.status === "Completed");
    const active    = myProjects.filter((p) => p.status === "In Progress").length;

    // On-time % = completedOnTime / completed. "—" when no completed projects.
    const onTime = completed.filter((p) => p.deliveredDate && p.deliveredDate <= p.deadline).length;
    const onTimePct = completed.length === 0
      ? "—"
      : `${Math.round((onTime / completed.length) * 100)}%`;

    const statusMix = [
      "Not Started", "Work Started", "In Progress", "Review Stage", "Finalization", "Completed", "Delayed",
    ]
      .map((s) => ({ name: s, value: myProjects.filter((p) => p.status === s).length }))
      .filter((s) => s.value > 0);

    return {
      kpis: [
        { title: "Total Assigned", value: String(total) },
        { title: "Completed",      value: String(completed.length) },
        { title: "Active",         value: String(active) },
        { title: "On-Time %",      value: onTimePct },
      ],
      statusMix,
    };
  }, []);

  return (
    <div>
      <Grid cols={12} gap={6}>
        <Heading
          primaryText="My"
          secondaryText="Performance"
          size={12}
          fontSize="2xl"
        />

        <div className="col-span-12">
          <DashGrid cols={12} gap={4}>
            {kpis.map((k, i) => (
              <DashCard
                key={k.title}
                title={k.title}
                value={k.value}
                icon={KPI_ICONS[i]}
                accentColor={KPI_ACCENTS[i]}
                size={3}
              />
            ))}
          </DashGrid>
        </div>

        <GLineChart
          title="My Activity"
          subtitle="Work notes added — period filter"
          data={trendData[period]}
          lines={[{ key: "score", label: "Notes added", color: "#2a465a" }]}
          size={7}
          height={300}
          filters={[
            { label: "This Week",  onClick: () => setPeriod("week")  },
            { label: "This Month", onClick: () => setPeriod("month") },
            { label: "This Year",  onClick: () => setPeriod("year")  },
          ]}
        />

        <GPieChart
          title="My Status Mix"
          subtitle="Where each of my projects sits today"
          data={statusMix}
          colors={["#94a3b8", "#0ea5e9", "#f59e0b", "#8b5cf6", "#14b8a6", "#22c55e", "#f43f5e"]}
          size={5}
          height={300}
        />
      </Grid>
    </div>
  );
}
