import { DataTable } from "../../../../../components/shared/Common_Components";

const columns = [
  { key: "employee", label: "Employee", width: "22%" },
  { key: "totalProjects", label: "Total Projects", width: "14%", align: "center" },
  { key: "completed", label: "Completed", width: "12%", align: "center" },
  { key: "pending", label: "Pending", width: "12%", align: "center" },
  { key: "productivityView", label: "Productivity", width: "24%", align: "center" },
  { key: "status", label: "Weekly Status", width: "16%", align: "center" },
];

export default function WeeklyPerformanceTable({ rows }) {
  const tableRows = rows.map((row) => ({
    ...row,
    status: row.weeklyStatus,
    productivityView: <span className="font-black text-[#243b53]">{row.productivity}</span>,
  }));

  return (
    <DataTable
      title="Weekly Performance"
      columns={columns}
      rows={tableRows}
      userProfile="employee"
      size={12}
      pageSize={5}
      searchable
      exportable
      exportFileName="management-tl-weekly-performance"
      filters={[
        { title: "Weekly Status", type: "toggle", key: "status", options: ["Excellent", "Good", "Average", "Delayed"] },
      ]}
    />
  );
}
