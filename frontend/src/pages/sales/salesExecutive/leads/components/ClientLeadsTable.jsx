/**
 * ClientLeadsTable — Sales Executive
 *
 * Renders the lead data table.
 * WON (CONVERTED) leads are read-only — no action or dump button shown.
 * Won status is set automatically when Finance confirms a payment.
 */
import { DataTable } from "../../../../../components/shared/Common_Components";
import { Archive, Eye, MessageSquare } from "lucide-react";
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
          // Hide for Won leads — deal is closed, no manual actions allowed
          show: (row) => row.status !== "Won" && row.status !== "Converted",
          onClick: onOpenActionModal,
        },
        {
          icon: <Archive size={15} />,
          tooltip: "Move to Dump",
          variant: "danger",
          // Hide for Won / Converted and already-Dumped leads
          show: (row) =>
            row.status !== "Won" &&
            row.status !== "Converted" &&
            row.status !== "Dumped" &&
            !row.isDumped,
          onClick: onMoveToDump,
        },
      ]}
      size={12}
      pageSize={8}
      pageSizeOptions={[8, 12, 20]}
    />
  );
}

