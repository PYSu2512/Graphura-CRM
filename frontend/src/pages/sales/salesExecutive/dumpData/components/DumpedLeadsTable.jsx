import { Eye, RotateCcw } from "lucide-react";
import { DataTable } from "../../../../../components/shared/Common_Components";
import { DUMPED_LEAD_COLUMNS } from "../utils/dumpDataConstants";

export function DumpedLeadsTable({ rows, reasonOptions, onView, onRestore }) {
  return (
    <DataTable
      title="Dumped Leads"
      columns={DUMPED_LEAD_COLUMNS}
      rows={rows}
      searchable
      exportable
      date={true}
      filters={[
        {
          title: "Reason",
          type: "toggle",
          key: "reason",
          options: reasonOptions,
        },
      ]}
      actions={[
        {
          icon: <Eye size={15} />,
          tooltip: "View",
          variant: "ghost",
          onClick: onView,
        },
        {
          icon: <RotateCcw size={15} />,
          tooltip: "Restore",
          variant: "primary",
          onClick: onRestore,
        },
      ]}
      size={12}
      pageSize={8}
      pageSizeOptions={[8, 12, 20]}
    />
  );
}
