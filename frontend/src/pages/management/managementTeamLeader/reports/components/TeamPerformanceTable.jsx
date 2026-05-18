import { Eye, Repeat2 } from "lucide-react";
import { DataTable, openModal } from "../../../../../components/shared/Common_Components";
import { teamPerformanceRows } from "../reportData";

const columns = [
  { key: "name", label: "Employee Name" },
  { key: "assigned", label: "Assigned Projects" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
  { key: "delayed", label: "Delayed" },
  { key: "productivity", label: "Productivity %" },
  { key: "lastActivity", label: "Last Activity" },
  { key: "quality", label: "Quality Score" },
];

export default function TeamPerformanceTable({ onSelect }) {
  return (
    <DataTable
      title="Employee Performance"
      columns={columns}
      rows={teamPerformanceRows}
      userProfile="name"
      size={12}
      pageSize={8}
      searchable
      exportable
      exportFileName="management-tl-employee-performance"
      filters={[
        { title: "Productivity", type: "select", key: "productivity", options: ["90%+", "80%+", "Below 80%"], fn: (row, value) => {
          const score = Number(String(row.productivity).replace("%", ""));
          if (value === "90%+") return score >= 90;
          if (value === "80%+") return score >= 80;
          return score < 80;
        } },
      ]}
      actions={[
        {
          icon: <Eye size={15} />,
          tooltip: "View Employee Activity",
          variant: "ghost",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-report-employee-activity");
          },
        },
        {
          icon: <Repeat2 size={15} />,
          tooltip: "Reassign Work",
          variant: "primary",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-report-reassign-work");
          },
        },
      ]}
    />
  );
}
