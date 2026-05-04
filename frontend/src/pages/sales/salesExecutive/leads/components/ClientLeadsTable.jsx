import { DataTable } from "../../../../../components/shared/Common_Components";
import {
  Eye,
  Phone,
  MessageCircle,
  MessageSquare,
  Clock,
  Archive,
  ClipboardList,
} from "lucide-react";
import { CLIENT_LEAD_COLUMNS, STATUS_OPTIONS } from "../utils/leadConstants";

export function ClientLeadsTable({
  leads,
  onOpenLead,
  onCallLead,
  onWhatsAppLead,
  onOpenComment,
  onOpenReminder,
  onOpenProspectForm,
  onMoveToDump,
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
          tooltip: "View",
          onClick: onOpenLead,
        },
        {
          icon: <Phone size={15} />,
          tooltip: "Call",
          onClick: onCallLead,
        },
        {
          icon: <MessageCircle size={15} />,
          tooltip: "WhatsApp",
          onClick: onWhatsAppLead,
        },
        {
          icon: <MessageSquare size={15} />,
          tooltip: "Add Comment",
          onClick: onOpenComment,
        },
        {
          icon: <Clock size={15} />,
          tooltip: "Add Follow-up",
          onClick: onOpenReminder,
        },
        {
          icon: <ClipboardList size={15} />,
          tooltip: "Prospect Form",
          onClick: onOpenProspectForm,
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
