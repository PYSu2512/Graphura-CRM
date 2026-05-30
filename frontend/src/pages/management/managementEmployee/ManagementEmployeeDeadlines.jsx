import { useMemo } from "react";
import {
  Grid,
  Heading,
  DashGrid,
  DashCard,
  DataTable,
} from "../../../components/shared/Common_Components.jsx";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  Clock,
} from "lucide-react";
import { myProjects } from "./managementEmployeeStore";

// Today is locked to the brief's current date to keep bucket math deterministic
// across screenshots / demo runs (matches managementEmployeeStore.js).
const TODAY = "2026-05-25";

function deadlineBucket(deadline) {
  const d = new Date(deadline);
  const t = new Date(TODAY);
  const diff = Math.ceil((d - t) / 86400000);
  if (diff < 0)   return "Overdue";
  if (diff <= 7)  return "This Week";
  if (diff <= 30) return "This Month";
  return "Future";
}

const COLS = [
  { key: "id",            label: "ID" },
  { key: "name",          label: "Project" },
  { key: "clientName",    label: "Client" },
  { key: "deadline",      label: "Deadline" },
  { key: "progress",      label: "Progress" },
  { key: "bucket",        label: "Bucket" },
  { key: "status",        label: "Project Status" },  // auto-coloured via STATUS_MAP
];

const KPI_ICONS   = [<AlertTriangle size={20} />, <Clock size={20} />, <CalendarDays size={20} />, <CalendarClock size={20} />];
const KPI_ACCENTS = ["#f97316", "#f59e0b", "#3b82f6", "#94a3b8"];

export default function ManagementEmployeeDeadlines() {
  // Live-derive from myProjects every render — no inline mock data.
  const rows = useMemo(
    () =>
      myProjects
        .filter((p) => p.status !== "Completed")
        .map((p) => ({
          id:         p.id,
          name:       p.name,
          clientName: p.clientName,
          deadline:   p.deadline,
          progress:   `${p.progress}%`,
          bucket:     deadlineBucket(p.deadline),
          status:     p.status,
        }))
        .sort((a, b) => (a.deadline < b.deadline ? -1 : 1)),
    []
  );

  const kpis = useMemo(() => [
    { title: "Overdue",     value: String(rows.filter((r) => r.bucket === "Overdue").length) },
    { title: "This Week",   value: String(rows.filter((r) => r.bucket === "This Week").length) },
    { title: "This Month",  value: String(rows.filter((r) => r.bucket === "This Month").length) },
    { title: "Future",      value: String(rows.filter((r) => r.bucket === "Future").length) },
  ], [rows]);

  return (
    <div>
      <Grid cols={12} gap={6}>
        <Heading
          primaryText="My"
          secondaryText="Deadlines"
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

        <div className="col-span-12">
          <DataTable
            title="Upcoming Deadlines"
            columns={COLS}
            rows={rows}
            size={12}
            pageSize={10}
            searchable
            exportable
            exportFileName="my_deadlines"
            filters={[
              { title: "Bucket",  type: "toggle", key: "bucket", options: ["Overdue", "This Week", "This Month", "Future"] },
              { title: "Status",  type: "toggle", key: "status", options: ["Not Started", "Work Started", "In Progress", "Review Stage", "Finalization", "Delayed"] },
            ]}
          />
        </div>
      </Grid>
    </div>
  );
}
