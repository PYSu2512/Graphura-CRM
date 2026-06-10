import { Grid, DataTable, GBarChart, GLineChart } from "../../../../components/shared/Common_Components";

export default function TLReports({ data, loading }) {
  const tlRows    = data?.tlReports   || [];
  const chartData = data?.tlChartData || tlRows.map((t) => ({
    name:       t.name.split(" ")[0],
    completed:  t.completed,
    inProgress: t.inProgress,
    delayed:    t.delayed,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Grid cols={12} gap={6}>
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">Completion Analysis</h2>
          {loading ? <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading…</div> : (
            <GLineChart data={chartData} lines={[{ key: "completed", label: "Completion Trend", color: "#2563eb" }]} height={260} size={12} />
          )}
        </div>

        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">Delay Analysis</h2>
          {loading ? <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading…</div> : (
            <GLineChart data={chartData} lines={[{ key: "delayed", label: "Delay Trend", color: "#dc2626" }]} height={260} size={12} />
          )}
        </div>

        <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">TL Performance Overview</h2>
          {loading ? <div className="h-80 flex items-center justify-center text-slate-400 text-sm">Loading…</div> : (
            <GBarChart
              data={chartData}
              bars={[
                { key: "completed",  label: "Completed",   color: "#10b981" },
                { key: "inProgress", label: "In Progress", color: "#f59e0b" },
                { key: "delayed",    label: "Delayed",     color: "#ef4444" },
              ]}
              height={320} size={12}
            />
          )}
        </div>
      </Grid>

      <Grid cols={12} gap={4}>
        <DataTable
          title="Team Leader Wise Breakdown"
          columns={[
            { key: "name",          label: "Team Leader"    },
            { key: "totalProjects", label: "Total Projects" },
            { key: "completed",     label: "Completed"      },
            { key: "inProgress",    label: "In Progress"    },
            { key: "delayed",       label: "Delayed"        },
          ]}
          rows={tlRows}
          pageSize={10}
          searchable
          exportable
          exportFileName="tl_reports_export"
          loading={loading}
        />
      </Grid>
    </div>
  );
}
