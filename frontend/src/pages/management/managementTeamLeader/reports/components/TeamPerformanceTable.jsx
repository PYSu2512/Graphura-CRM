import { Eye, Repeat2 } from "lucide-react";
import { DataTable, openModal } from "../../../../../components/shared/Common_Components";
import { projectReportRows } from "../reportData";

const columns = [
  { key: "project", label: "Project" },
  { key: "employee", label: "Assigned Employee" },
  { key: "status", label: "Status" },
  { key: "reportType", label: "Report Type" },
  { key: "updatedOn", label: "Updated On" },
];

export default function TeamPerformanceTable({ onSelect }) {
  return (
    <DataTable
      title="Project Reports"
      columns={columns}
      rows={projectReportRows}
      size={12}
      pageSize={8}
      searchable
      actions={[
        {
          icon: <Eye size={15} />,
          tooltip: "View Report",
          variant: "ghost",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-report-employee-activity");
          },
        },
        {
          icon: <Repeat2 size={15} />,
          tooltip: "Reassign Project",
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
