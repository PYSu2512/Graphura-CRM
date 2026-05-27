import React from "react";

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
  const handleExport = () => {
    const csvData = [
      ["Project ID", "Project Name", "Client", "Status", "Progress", "Deadline", "Tag"],
      ...data.map((item) => [
        item.id,
        item.title,
        item.client,
        item.status,
        item.progress + "%",
        item.deadline,
        item.tag,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "deadlines-report.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Upcoming Deadlines
        </h1>

        <p className="text-sm text-gray-500">
          Track all your project deadlines in one place
        </p>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        {/* TOP BAR */}
        <div className="flex justify-between items-center p-4 border-b">

          <input
            type="text"
            placeholder="Search projects..."
            className="border px-3 py-2 rounded-lg text-sm w-64 outline-none"
          />

          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:opacity-90 transition"
          >
            Export
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Project</th>
                <th className="p-3">Client</th>
                <th className="p-3">Status</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Tag</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="border-t hover:bg-gray-50 transition"
                >

                  <td className="p-3 font-medium">
                    {item.id}
                    <br />

                    <span className="text-gray-500 font-normal">
                      {item.title}
                    </span>
                  </td>

                  <td className="p-3 text-gray-600">
                    {item.client}
                  </td>

                  <td className="p-3">
                    {item.status}
                  </td>

                  <td className="p-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>

                    <span className="text-xs text-gray-500">
                      {item.progress}%
                    </span>
                  </td>

                  <td className="p-3">
                    {item.deadline}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.tag === "Overdue"
                          ? "bg-red-100 text-red-600"
                          : item.tag === "This Week"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.tag}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}