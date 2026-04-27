import { useMemo, useState } from "react";
import {
  BarChart3,
  CalendarRange,
  ChevronDown,
  Layers3,
  Plus,
  Users,
  X,
} from "lucide-react";

const initialReports = [
  {
    id: "RPT-300",
    title: "Daily Sales Activity",
    type: "Sales",
    department: "Sales",
    cadence: "Daily",
    period: "23 Apr 2026",
    status: "Published",
    owner: "Aarav Mehta",
    generatedOn: "23 Apr 2026, 08:30 AM",
    summary:
      "Captures fresh leads, follow-ups completed, and conversion movement across the sales desk.",
    metrics: [
      { label: "New Leads", value: "26" },
      { label: "Calls Closed", value: "49" },
      { label: "Conversions", value: "8" },
    ],
  },
  {
    id: "RPT-301",
    title: "Monthly Sales Performance",
    type: "Sales",
    department: "Sales",
    cadence: "Monthly",
    period: "Apr 2026",
    status: "Published",
    owner: "Riya Sharma",
    generatedOn: "19 Apr 2026, 09:20 AM",
    summary:
      "Tracks lead conversion, revenue movement, and follow-up performance across regional sales teams.",
    metrics: [
      { label: "Revenue", value: "Rs 8.4L" },
      { label: "Conversions", value: "124" },
      { label: "Follow-ups", value: "392" },
    ],
  },
  {
    id: "RPT-302",
    title: "Finance Collection Overview",
    type: "Finance",
    department: "Finance",
    cadence: "Quarterly",
    period: "Q2 2026",
    status: "Draft",
    owner: "Vikram Nair",
    generatedOn: "18 Apr 2026, 05:10 PM",
    summary:
      "Shows pending invoices, collection trends, and payment delays across active client accounts.",
    metrics: [
      { label: "Collections", value: "Rs 5.9L" },
      { label: "Pending", value: "Rs 1.3L" },
      { label: "Overdue", value: "17" },
    ],
  },
  {
    id: "RPT-303",
    title: "Management Pipeline Snapshot",
    type: "Executive",
    department: "Mgmt",
    cadence: "Weekly",
    period: "Week 16, 2026",
    status: "Scheduled",
    owner: "Ananya Patel",
    generatedOn: "19 Apr 2026, 08:00 AM",
    summary:
      "High-level summary of team delivery, lead pipeline, project health, and escalation trends.",
    metrics: [
      { label: "Projects", value: "28" },
      { label: "At Risk", value: "4" },
      { label: "Escalations", value: "6" },
    ],
  },
];

const filterConfig = [
  {
    key: "type",
    title: "Report Type",
    icon: Layers3,
    options: ["All", "Sales", "Finance", "Executive"],
  },
  {
    key: "status",
    title: "Status",
    icon: BarChart3,
    options: ["All", "Published", "Draft", "Scheduled"],
  },
  {
    key: "department",
    title: "Department",
    icon: Users,
    options: ["All", "Sales", "Finance", "Mgmt"],
  },
  {
    key: "cadence",
    title: "Report View",
    icon: CalendarRange,
    options: ["All", "Daily", "Weekly", "Monthly", "Quarterly"],
  },
];

const defaultReportForm = {
  title: "",
  type: "Sales",
  department: "Sales",
  cadence: "Monthly",
  period: "",
  owner: "",
  status: "Draft",
  summary: "",
};

function statusClass(status) {
  if (status === "Published") return "bg-[#e8f4ec] text-[#246247]";
  if (status === "Scheduled") return "bg-[#e6f0f8] text-[#355872]";
  return "bg-[#fff2d7] text-[#9a6a06]";
}

function Report() {
  const [reports, setReports] = useState(initialReports);
  const [filters, setFilters] = useState({
    type: "All",
    status: "All",
    department: "All",
    cadence: "All",
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [form, setForm] = useState(defaultReportForm);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesType = filters.type === "All" || report.type === filters.type;
      const matchesStatus = filters.status === "All" || report.status === filters.status;
      const matchesDepartment =
        filters.department === "All" || report.department === filters.department;
      const matchesCadence = filters.cadence === "All" || report.cadence === filters.cadence;

      return matchesType && matchesStatus && matchesDepartment && matchesCadence;
    });
  }, [filters, reports]);

  const tableReports = useMemo(() => {
    return filteredReports.filter(
      (report) => report.cadence !== "Daily" && report.cadence !== "Monthly"
    );
  }, [filteredReports]);

  const stats = useMemo(() => {
    const total = reports.length;
    const daily = reports.filter((report) => report.cadence === "Daily").length;
    const monthly = reports.filter((report) => report.cadence === "Monthly").length;
    const published = reports.filter((report) => report.status === "Published").length;

    return [
      {
        label: "Total Reports",
        value: total,
        helper: "All business reports",
        tone: "from-[#355872] to-[#4d7897] text-white",
      },
      {
        label: "Published",
        value: published,
        helper: "Ready to share",
        tone: "from-[#e4f5ec] to-[#cbe8d8] text-[#1f6b4f]",
      },
      {
        label: "Daily Reports",
        value: daily,
        helper: "Day-wise activity summary",
        tone: "from-[#fff1de] to-[#ffe2b9] text-[#8a4b08]",
      },
      {
        label: "Monthly Reports",
        value: monthly,
        helper: "Month-wise performance summary",
        tone: "from-[#e6f0f8] to-[#d5e6f3] text-[#355872]",
      },
    ];
  }, [reports]);

  const spotlightReports = useMemo(() => {
    return {
      daily: reports.find((report) => report.cadence === "Daily") ?? null,
      monthly: reports.find((report) => report.cadence === "Monthly") ?? null,
    };
  }, [reports]);

  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function handleFormChange(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleCreateReport(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.owner.trim() || !form.summary.trim()) {
      return;
    }

    const nextReport = {
      id: `RPT-${304 + reports.length}`,
      title: form.title.trim(),
      type: form.type,
      department: form.department,
      cadence: form.cadence,
      period: form.period.trim() || form.cadence,
      status: form.status,
      owner: form.owner.trim(),
      generatedOn: new Date().toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      summary: form.summary.trim(),
      metrics: [
        { label: "Primary KPI", value: "Pending" },
        { label: "Coverage", value: "All Teams" },
        { label: "Format", value: "Dashboard" },
      ],
    };

    setReports((current) => [nextReport, ...current]);
    setFilters({
      type: "All",
      status: "All",
      department: "All",
      cadence: "All",
    });
    setActiveReport(nextReport);
    setIsCreateOpen(false);
  }

  return (
    <>
      <div className="space-y-6 text-[#2d3d4a]">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <article
              key={item.label}
              className={`rounded-2xl border border-white/60 bg-gradient-to-br p-5 shadow-sm ${item.tone}`}
            >
              <p className="text-sm font-medium opacity-90">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm opacity-80">{item.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {[
            {
              key: "daily",
              title: "Daily Report",
              subtitle: "Quick view of today's operational movement",
              accent: "text-[#c77727]",
              report: spotlightReports.daily,
            },
            {
              key: "monthly",
              title: "Monthly Report",
              subtitle: "Month-end performance and KPI snapshot",
              accent: "text-[#355872]",
              report: spotlightReports.monthly,
            },
          ].map((item) => (
            <article
              key={item.key}
              className="rounded-[24px] border border-[#dfe9ef] bg-white/85 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${item.accent}`}>
                    {item.title}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[#355872]">{item.subtitle}</h2>
                </div>
                {item.report && (
                  <button
                    onClick={() =>
                      setFilters((current) => ({ ...current, cadence: item.report.cadence }))
                    }
                    className="rounded-xl border border-[#d5e3eb] px-3 py-2 text-sm font-semibold text-[#355872] transition hover:bg-[#f5f9fb]"
                  >
                    Show {item.report.cadence}
                  </button>
                )}
              </div>

              {item.report ? (
                <>
                  <div className="mt-4 rounded-2xl bg-[#f7fafc] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-slate-800">
                        {item.report.title}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(item.report.status)}`}
                      >
                        {item.report.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {item.report.owner} - {item.report.department} - {item.report.period}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {item.report.metrics.map((metric) => (
                      <div key={metric.label} className="rounded-2xl bg-[#f5f9fb] p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-lg font-semibold text-slate-800">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">{item.report.summary}</p>
                </>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-[#d6e2ea] bg-[#fafcfd] p-6 text-sm text-slate-500">
                  No {item.key} report available yet.
                </div>
              )}
            </article>
          ))}
        </section>

        <section className="rounded-[24px] border border-[#dfe9ef] bg-white/85 p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c77727]">
                Reports Center
              </p>
              <h2 className="mt-1 text-xl font-semibold text-[#355872]">
                Filter reports and open the full report preview
              </h2>
            </div>
            <button
              onClick={() => {
                setForm(defaultReportForm);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#355872] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4a60]"
            >
              <Plus size={16} />
              Create Report
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {filterConfig.map((filter) => (
              <div key={filter.key} className="rounded-2xl border border-[#e6edf2] bg-[#fdfefe] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#355872]">
                  <filter.icon size={15} />
                  {filter.title}
                </div>
                <div className="relative">
                  <select
                    value={filters[filter.key]}
                    onChange={(event) => handleFilterChange(filter.key, event.target.value)}
                    className="w-full appearance-none rounded-xl border border-[#d5e3eb] bg-[#f5f9fb] px-4 py-3 text-sm font-medium text-[#355872] outline-none transition focus:border-[#7AAACE] focus:bg-white"
                  >
                    {filter.options.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#d9e6ef]">
            <div className="overflow-x-auto bg-white">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#355872] text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Report</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Department</th>
                    <th className="px-4 py-3 font-semibold">View</th>
                    <th className="px-4 py-3 font-semibold">Period</th>
                    <th className="px-4 py-3 font-semibold">Generated</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tableReports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        No reports found.
                      </td>
                    </tr>
                  ) : (
                    tableReports.map((report, index) => (
                      <tr
                        key={report.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-[#f8fbfd]"}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#1e3445]">{report.title}</p>
                          <p className="text-xs text-slate-500">{report.id} | {report.owner}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                            {report.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                            {report.department}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                            {report.cadence}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{report.period}</td>
                        <td className="px-4 py-3 text-slate-600">{report.generatedOn}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setActiveReport(report)}
                            className="rounded-lg border border-[#cedee8] px-3 py-2 text-sm font-semibold text-[#355872] transition hover:bg-[#f3f8fb]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172532]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-[#d9e6ef] bg-white p-6 shadow-[0_30px_80px_rgba(23,37,50,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c77727]">
                  Create Report
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#355872]">
                  Add a new admin report
                </h2>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="rounded-full bg-[#f3f7fa] p-2 text-slate-500 transition hover:bg-[#e7eef3]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Report Title
                  <input
                    value={form.title}
                    onChange={(event) => handleFormChange("title", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                    placeholder="Enter report title"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Owner
                  <input
                    value={form.owner}
                    onChange={(event) => handleFormChange("owner", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                    placeholder="Enter owner name"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Report Type
                  <select
                    value={form.type}
                    onChange={(event) => handleFormChange("type", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    <option>Sales</option>
                    <option>Finance</option>
                    <option>Executive</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Department
                  <select
                    value={form.department}
                    onChange={(event) => handleFormChange("department", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    <option>Sales</option>
                    <option>Finance</option>
                    <option>Mgmt</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Report View
                  <select
                    value={form.cadence}
                    onChange={(event) => handleFormChange("cadence", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872]">
                  Period Label
                  <input
                    value={form.period}
                    onChange={(event) => handleFormChange("period", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                    placeholder="Example: 23 Apr 2026 or Apr 2026"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium text-[#355872] md:col-span-2">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) => handleFormChange("status", event.target.value)}
                    className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  >
                    <option>Draft</option>
                    <option>Published</option>
                    <option>Scheduled</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-2 text-sm font-medium text-[#355872]">
                Summary
                <textarea
                  value={form.summary}
                  onChange={(event) => handleFormChange("summary", event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-[#d5e3eb] bg-[#f8fbfd] px-4 py-3 text-sm text-slate-700 outline-none focus:border-[#7AAACE] focus:bg-white"
                  placeholder="Describe what this report covers"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl border border-[#d5e3eb] px-4 py-2 text-sm font-semibold text-[#355872] transition hover:bg-[#f5f9fb]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#355872] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d4a60]"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#172532]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-[28px] border border-[#d9e6ef] bg-white p-6 shadow-[0_30px_80px_rgba(23,37,50,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c77727]">
                  Report Preview
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#355872]">{activeReport.title}</h2>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="rounded-full bg-[#f3f7fa] p-2 text-slate-500 transition hover:bg-[#e7eef3]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(activeReport.status)}`}
                >
                  {activeReport.status}
                </span>
                <span className="rounded-full bg-[#f2f7fa] px-3 py-1 text-xs font-semibold text-[#355872]">
                  {activeReport.type}
                </span>
                <span className="rounded-full bg-[#f2f7fa] px-3 py-1 text-xs font-semibold text-[#355872]">
                  {activeReport.department}
                </span>
                <span className="rounded-full bg-[#fff5e8] px-3 py-1 text-xs font-semibold text-[#9a6a06]">
                  {activeReport.cadence}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {activeReport.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl bg-[#f5f9fb] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-800">{metric.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-[#f5f9fb] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Owner</p>
                  <p className="mt-2 font-semibold text-slate-800">{activeReport.owner}</p>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Generated On</p>
                  <p className="mt-2 font-semibold text-slate-800">{activeReport.generatedOn}</p>
                </div>
                <div className="rounded-2xl bg-[#f5f9fb] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Period</p>
                  <p className="mt-2 font-semibold text-slate-800">{activeReport.period}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e5edf3] bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{activeReport.summary}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Report;
