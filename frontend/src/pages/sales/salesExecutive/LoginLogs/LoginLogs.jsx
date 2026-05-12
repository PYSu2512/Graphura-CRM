import { useState } from "react";
import {
  Heading,
  EnhancedDashCard,
  DashGrid,
  DataTable,
  GLineChart,
  GDoughnutChart,
  HeadingForDataTable,
} from "../../../../components/shared/Common_Components";

export default function LoginLogs() {
  const [selected, setSelected] = useState(null);

  const actions = [
    {
      icon: <Eye size={15} />, tooltip: "View Details",
      variant: "ghost",
      onClick: (row) => { setSelected(row); openModal("log-view-modal"); },
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* ── KPI Cards ── */}
      <DashGrid cols={12} gap={4}>
        {loginStats.map((stat, idx) => (
          <EnhancedDashCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            accentColor={stat.color}
            size={4}
          />
        ))}
      </DashGrid>

      {/* ── My Logs Table ── */}
      <DataTable
        title="My Login History"
        columns={logCols}
        rows={myLogRows}
        actions={actions}
        size={12}
        pageSize={10}
        searchable
        date
        exportable
        exportFileName="my-login-logs"
        filters={[
          { title: "Status", type: "toggle", key: "status", options: ["Success", "Pending", "Failed"] },
        ]}
      />
    </div>
  );
}
