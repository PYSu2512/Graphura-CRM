import { AlertTriangle, Eye, UserPlus } from "lucide-react";
import { DataTable, openModal } from "../../../../../components/shared/Common_Components";
import { tickets } from "../supportData";

const columns = [
  { key: "id", label: "Ticket ID" },
  { key: "title", label: "Issue Title" },
  { key: "raisedBy", label: "Raised By" },
  { key: "department", label: "Department" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "createdDate", label: "Created Date" },
  { key: "assignedTo", label: "Assigned To" },
  { key: "sla", label: "SLA Timer" },
];

export default function TicketsTable({ onSelect }) {
  return (
    <DataTable
      title="Internal Operations Tickets"
      columns={columns}
      rows={tickets}
      size={12}
      pageSize={8}
      searchable
      date
      exportable
      exportFileName="management-tl-support-tickets"
      filters={[
        { title: "Status", type: "toggle", key: "status", options: ["Open", "In Progress", "Waiting", "Escalated", "Resolved", "Closed"] },
        { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High", "Critical"] },
        { title: "Department", type: "select", key: "department", options: ["Engineering", "QA", "Operations", "Design", "DevOps"] },
      ]}
      actions={[
        {
          icon: <Eye size={15} />,
          tooltip: "View Ticket",
          variant: "ghost",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-support-ticket-details");
          },
        },
        {
          icon: <AlertTriangle size={15} />,
          tooltip: "Escalate to Manager",
          variant: "danger",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-support-escalate-ticket");
          },
        },
        {
          icon: <UserPlus size={15} />,
          tooltip: "Assign Employee",
          variant: "primary",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-support-assign-ticket");
          },
        },
      ]}
    />
  );
}
