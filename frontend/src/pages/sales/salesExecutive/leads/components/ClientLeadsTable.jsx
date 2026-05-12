import { DataTable } from "../../../../../components/shared/Common_Components";
import { Eye, MessageSquare, Archive } from "lucide-react";
import { CLIENT_LEAD_COLUMNS, STATUS_OPTIONS } from "../utils/leadConstants";

export function ClientLeadsTable({
  leads,
  onOpenLead,
  onMoveToDump,
  onOpenActionModal,
}) {
  return (
    <DataTable
      title="Client Leads"
      columns={CLIENT_LEAD_COLUMNS}
      rows={leads}
      searchable
      exportable
      date={true}
      filters={[
        {
          title: "Status",
          type: "toggle",
          key: "status",
          options: STATUS_OPTIONS,
        },
      ]}
      actions={[
        {
          icon: <Eye size={15} />,
          tooltip: "View Lead",
          onClick: onOpenLead,
        },
        {
          icon: <MessageSquare size={15} />,
          tooltip: "Action",
          onClick: onOpenActionModal,
        },
        {
          icon: <Archive size={15} />,
          tooltip: "Move to Dump",
          variant: "danger",
          onClick: onMoveToDump,
        },
      ]}
      size={12}
      pageSize={8}
      pageSizeOptions={[8, 12, 20]}
    />
  );
}
