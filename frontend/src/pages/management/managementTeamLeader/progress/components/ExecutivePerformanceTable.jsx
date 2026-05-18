import { Eye, ShieldAlert } from "lucide-react";
import { DataTable, openModal } from "../../../../../components/shared/Common_Components";
import { executives } from "../data/progressData";

const columns = [
  { key: "name", label: "Executive Name" },
  { key: "totalLeads", label: "Total Leads" },
  { key: "callsMade", label: "Calls Made" },
  { key: "interested", label: "Interested Leads" },
  { key: "prospects", label: "Prospects Created" },
  { key: "converted", label: "Converted Leads" },
  { key: "dumpCount", label: "Dump Count" },
  { key: "followupsPending", label: "Follow-Ups Pending" },
  { key: "conversion", label: "Conversion %" },
  { key: "lastActivity", label: "Last Activity" },
  { key: "productivity", label: "Productivity Score" },
  { key: "status", label: "Status" },
];

export default function ExecutivePerformanceTable({ onSelect }) {
  return (
    <DataTable
      title="Executive Performance"
      columns={columns}
      rows={executives}
      userProfile="name"
      size={12}
      pageSize={10}
      searchable
      date
      exportable
      exportFileName="management-tl-executive-performance"
      filters={[
        { title: "Status", type: "toggle", key: "status", options: ["Top Performer", "On Track", "Needs Attention", "Low Activity"] },
        { title: "Productivity", type: "select", key: "productivity", options: ["90+", "75-89", "Below 75"], fn: (row, value) => {
          if (value === "90+") return row.productivity >= 90;
          if (value === "75-89") return row.productivity >= 75 && row.productivity < 90;
          return row.productivity < 75;
        } },
      ]}
      actions={[
        {
          icon: <Eye size={15} />,
          tooltip: "View Activity",
          variant: "ghost",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-progress-executive-details");
          },
        },
        {
          icon: <ShieldAlert size={15} />,
          tooltip: "Escalate Performance",
          variant: "danger",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-progress-escalate-executive");
          },
        },
      ]}
    />
  );
}
