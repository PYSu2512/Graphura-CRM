import { AlertOctagon, MessageSquare, Repeat2 } from "lucide-react";
import { DataTable, openModal } from "../../../../../components/shared/Common_Components";
import { delayedProjectsRows } from "../reportData";

const columns = [
  { key: "project", label: "Project" },
  { key: "employee", label: "Assigned Employee" },
  { key: "deadline", label: "Deadline" },
  { key: "delayDays", label: "Delay Days" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
];

export default function DelayedProjectsTable({ onSelect }) {
  return (
    <DataTable
      title="Delayed / Risk Projects"
      columns={columns}
      rows={delayedProjectsRows}
      size={12}
      pageSize={6}
      searchable
      date
      exportable
      exportFileName="management-tl-risk-projects"
      filters={[
        { title: "Priority", type: "toggle", key: "priority", options: ["Critical", "High", "Medium"] },
        { title: "Status", type: "select", key: "status", options: ["Escalation Needed", "Blocked", "Manager Review", "At Risk"] },
      ]}
      actions={[
        {
          icon: <AlertOctagon size={15} />,
          tooltip: "Escalate",
          variant: "danger",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-report-escalate-project");
          },
        },
        {
          icon: <Repeat2 size={15} />,
          tooltip: "Reassign",
          variant: "primary",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-report-reassign-work");
          },
        },
        {
          icon: <MessageSquare size={15} />,
          tooltip: "Add Comment",
          variant: "ghost",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-report-project-comment");
          },
        },
      ]}
    />
  );
}
