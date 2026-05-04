import { DataTable } from "../../../../../components/shared/Common_Components";
import { DUMPED_LEAD_COLUMNS } from "../utils/dumpDataConstants";

export function DumpedLeadsTable({ rows, reasonOptions }) {
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
      size={12}
      pageSize={8}
      pageSizeOptions={[8, 12, 20]}
    />
  );
}
