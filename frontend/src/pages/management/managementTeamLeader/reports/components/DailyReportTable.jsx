import { Eye, Repeat2 } from "lucide-react";
import { DataTable, openModal } from "../../../../../components/shared/Common_Components";

const columns = [
  { key: "employee", label: "Employee", width: "16%" },
  { key: "projectName", label: "Project Name", width: "24%" },
  { key: "status", label: "Status", width: "10%" },
  { key: "deadline", label: "Deadline", width: "12%" },
  { key: "priority", label: "Priority", width: "10%" },
  { key: "progressView", label: "Progress %", width: "16%", align: "center" },
  { key: "submittedDate", label: "Submitted Date", width: "12%" },
];

export default function DailyReportTable({ rows, onSelect }) {
  const tableRows = rows.map((row) => ({
    ...row,
    progressView: <span className="font-black text-[#243b53]">{row.progress}%</span>,
  }));

  return (
    <DataTable
      title="Daily Project Report"
      columns={columns}
      rows={tableRows}
      userProfile="employee"
      size={12}
      pageSize={5}
      searchable
      exportable
      exportFileName="management-tl-daily-project-report"
      filters={[
        { title: "Status", type: "toggle", key: "status", options: ["Completed", "Pending", "Delayed"] },
        { title: "Priority", type: "toggle", key: "priority", options: ["Critical", "High", "Medium", "Low"] },
      ]}
      actions={[
        {
          icon: <Eye size={15} />,
          tooltip: "View",
          variant: "ghost",
          onClick: (row) => {
            onSelect(rows.find((item) => item.id === row.id) || row);
            openModal("mtl-report-employee-activity");
          },
        },
        {
          icon: <Repeat2 size={15} />,
          tooltip: "Reassign",
          variant: "primary",
          onClick: (row) => {
            onSelect(rows.find((item) => item.id === row.id) || row);
            openModal("mtl-report-reassign-work");
          },
        },
      ]}
    />
  );
}
