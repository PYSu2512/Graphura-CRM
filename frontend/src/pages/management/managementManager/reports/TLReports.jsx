import { Grid, DataTable } from "../../../../components/shared/Common_Components";
import { tlReports } from "../reportsStore";

export default function TLReports() {
  return (
    <Grid cols={12} gap={4}>
      <DataTable
        title="Team Leader Wise Breakdown"
        columns={[
          { key: "id", label: "TL ID" },
          { key: "name", label: "Team Leader" },
          { key: "totalProjects", label: "Total Projects" },
          { key: "completed", label: "Completed" },
          { key: "inProgress", label: "In Progress" },
          { key: "delayed", label: "Delayed" },
          { key: "avgCompletionDays", label: "Avg Completion Days" },
          { key: "onTimePercentage", label: "On-Time %" },
        ]}
        rows={tlReports}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="tl_reports_export"
      />
    </Grid>
  );
}