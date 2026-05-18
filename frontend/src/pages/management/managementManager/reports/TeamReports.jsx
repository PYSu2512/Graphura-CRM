import { Grid, DataTable } from "../../../../components/shared/Common_Components";
import { teamReports } from "../reportsStore";

export default function TeamReports() {
  return (
    <Grid cols={12} gap={4}>
      <DataTable
        title="Team Performance Report"
        columns={[
          { key: "id", label: "Team Leader ID" },
          { key: "name", label: "Team Leader Name" },
          { key: "totalProjects", label: "Total Projects" },
          { key: "completed", label: "Completed" },
          { key: "inProgress", label: "In Progress" },
          { key: "delayed", label: "Delayed" },
          { key: "avgCompletionDays", label: "Avg Days" },
          { key: "onTimePercentage", label: "On-Time %" },
        ]}
        rows={teamReports}
        size={12}
        pageSize={10}
        searchable
        exportable
        exportFileName="team_reports_export"
      />
    </Grid>
  );
}