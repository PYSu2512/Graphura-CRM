import { AlertTriangle, CheckCircle2, Eye } from "lucide-react";
import { DataTable, openModal } from "../../../../../components/shared/Common_Components";
import { tickets } from "../supportData";

const columns = [
  { key: "id", label: "Ticket ID" },
  { key: "title", label: "Issue Title" },
  { key: "raisedBy", label: "Raised By" },
  { key: "project", label: "Project" },
  { key: "ticketType", label: "Ticket Type" },
  { key: "issueType", label: "Issue Type" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "createdDate", label: "Created Date" },
  { key: "assignedTo", label: "Assigned To" },
];

export default function TicketsTable({ onSelect }) {
  return (
    <DataTable
      title="Team Support Tickets"
      columns={columns}
      rows={tickets}
      size={12}
      pageSize={8}
      searchable
      filters={[
        { title: "Status", type: "toggle", key: "status", options: ["Open", "Pending", "Escalated", "Resolved"] },
        { title: "Priority", type: "toggle", key: "priority", options: ["Low", "Medium", "High", "Critical"] },
        { title: "Ticket Type", type: "select", key: "ticketType", options: ["Project", "Technical", "Employee", "Client", "Resource"] },
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
          icon: <CheckCircle2 size={15} />,
          tooltip: "Resolve Issue",
          variant: "primary",
          onClick: (row) => {
            onSelect(row);
            openModal("mtl-support-resolve-ticket");
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
      ]}
    />
  );
}
