import { Grid, GLineChart, GBarChart } from "../../../../components/shared/Common_Components";

export default function ProjectReports({ data, loading }) {
  const trend = data?.projectTrend || [];

  return (
    <div className="flex flex-col gap-6">
      <Grid cols={12} gap={6}>
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">Completed Projects Growth</h2>
          {loading ? <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading…</div> : (
            <GLineChart data={trend} lines={[{ key: "delivered", label: "Completion Growth", color: "#2563eb" }]} height={260} size={12} />
          )}
        </div>

        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">Delayed Projects Analysis</h2>
          {loading ? <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading…</div> : (
            <GLineChart data={trend} lines={[{ key: "delayed", label: "Delay Analysis", color: "#dc2626" }]} height={260} size={12} />
          )}
        </div>

        <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">Daily Project Status Trend</h2>
          {loading ? <div className="h-80 flex items-center justify-center text-slate-400 text-sm">Loading…</div> : (
            <GBarChart
              data={trend}
              bars={[
                { key: "delivered",  label: "Completed",   color: "#10b981" },
                { key: "inProgress", label: "In Progress", color: "#f59e0b" },
                { key: "delayed",    label: "Delayed",     color: "#ef4444" },
              ]}
              height={320} size={12}
            />
          )}
        </div>
      </Grid>
    </div>
  );
}
