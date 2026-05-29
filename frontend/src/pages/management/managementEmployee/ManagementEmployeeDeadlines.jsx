import React from "react";
import {
  DataTable,
  Heading,
} from "../../../components/shared/Common_Components";

const data = [
  {
    id: "PRJ-002",
    title: "Bluewave Mobile App",
    client: "Bluewave Studios",
    status: "Review Stage",
    progress: 78,
    deadline: "2026-05-30",
    tag: "This Week",
  },
  {
    id: "PRJ-005",
    title: "Evermore Property Portal",
    client: "Evermore Realty",
    status: "Work Started",
    progress: 25,
    deadline: "2026-06-15",
    tag: "This Month",
  },
  {
    id: "PRJ-009",
    title: "Acme Marketing Microsite",
    client: "Acme Corp",
    status: "In Progress",
    progress: 38,
    deadline: "2026-05-25",
    tag: "Overdue",
  },
];

export default function ManagementEmployeeDeadlines() {
  const tableData = data.map((item) => ({
    ...item,
    progress: `${item.progress}%`,
  }));

  const columns = [
    {
      key: "id",
      label: "Project ID",
    },
    {
      key: "title",
      label: "Project",
    },
    {
      key: "client",
      label: "Client",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "progress",
      label: "Progress",
    },
    {
      key: "deadline",
      label: "Deadline",
    },
    {
      key: "tag",
      label: "Category",
    },
  ];

  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen">
      <Heading
        title="Deadlines"
        subtitle="Track all upcoming project deadlines"
      />

      <div className="mt-6 bg-white rounded-2xl shadow-sm border p-4">
        <DataTable
  rows={tableData}
  columns={columns}
  searchable
  exportable
  pagination
/>
      </div>
    </div>
  );
}