/**
 * ClientLeadsTable — Sales Executive
 *
 * Rules:
 *  - INTERESTED / Won (CONVERTED) leads → only View button, no Action button
 *  - Dump button removed entirely — auto-dump happens via backend (3× NOT_TALK)
 *  - Dumped leads filtered OUT before this table (shown in Dump Data page only)
 *  - Active leads = not isDumped and status !== "Dumped"
 *  - WhatsApp icon opens wa.me chat for the row's phone number
 */
import { DataTable } from "../../../../../components/shared/Common_Components";
import { Eye, MessageSquare } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { CLIENT_LEAD_COLUMNS, STATUS_OPTIONS } from "../utils/leadConstants";

/** Strip all non-digits, ensure 91-prefix for Indian numbers */
const toWaNumber = (raw = "") => {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits) return null;
  return digits.startsWith("91") ? digits : `91${digits}`;
};

/** Open WhatsApp chat for the phone number in the row */
const openWhatsApp = (row) => {
  const number = toWaNumber(row.phone || row.mobile || "");
  if (!number) return;
  const msg = encodeURIComponent(
    `Hi ${row.name || ""}, I'm following up regarding your query.`
  );
  window.open(`https://wa.me/${number}?text=${msg}`, "_blank", "noopener");
};

/** Filter out dumped leads — they belong in the Dump Data page */
const ACTIVE_STATUS_OPTIONS = STATUS_OPTIONS.filter((s) => s !== "Dumped");

export function ClientLeadsTable({ leads, onOpenLead, onOpenActionModal }) {
  // Exclude dumped leads from this view
  const activeLeads = leads.filter(
    (l) => !l.isDumped && l.status !== "Dumped"
  );

  return (
    <DataTable
      title="Client Leads"
      columns={CLIENT_LEAD_COLUMNS}
      rows={activeLeads}
      searchable
      exportable
      date={true}
      filters={[
        {
          title: "Status",
          type: "toggle",
          key: "status",
          options: ACTIVE_STATUS_OPTIONS,
        },
      ]}
      actions={[
        {
          icon: <Eye size={15} />,
          tooltip: "View Lead",
          onClick: onOpenLead,
        },
        {
          // WhatsApp icon — always visible, opens chat directly
          icon: <FaWhatsapp size={16} className="text-green-500" />,
          tooltip: "Open WhatsApp",
          variant: "ghost",
          show: (row) => Boolean(toWaNumber(row.phone || row.mobile || "")),
          onClick: openWhatsApp,
        },
        {
          icon: <MessageSquare size={15} />,
          tooltip: "Take Action",
          // Hide Action button for terminal/pipeline states
          show: (row) =>
            row.status !== "Won" &&
            row.status !== "Converted" &&
            row.status !== "Interested",
          onClick: onOpenActionModal,
        },
      ]}
      size={12}
      pageSize={8}
      pageSizeOptions={[8, 12, 20]}
    />
  );
}

