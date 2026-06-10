import { Grid, GBarChart, GLineChart } from "../../../../components/shared/Common_Components";

export default function DeliveryReports({ data, loading }) {
  const trend   = data?.deliveryTrend  || [];
  const monthly = data?.monthlyDelivery || [];

  return (
    <div className="flex flex-col gap-6">
      <Grid cols={12} gap={6}>
        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">Delivery Growth Analysis</h2>
          {loading ? <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading…</div> : (
            <GLineChart data={trend} lines={[{ key: "delivered", label: "Delivery Growth", color: "#2563eb" }]} height={260} size={12} />
          )}
        </div>

        <div className="col-span-12 md:col-span-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">Delay Trend Analysis</h2>
          {loading ? <div className="h-64 flex items-center justify-center text-slate-400 text-sm">Loading…</div> : (
            <GLineChart data={trend} lines={[{ key: "delayed", label: "Delay Trend", color: "#dc2626" }]} height={260} size={12} />
          )}
        </div>

        <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2a465a] mb-4">Monthly Delivery Trend (12 months)</h2>
          {loading ? <div className="h-80 flex items-center justify-center text-slate-400 text-sm">Loading…</div> : (
            <GBarChart
              data={monthly}
              bars={[
                { key: "delivered", label: "Delivered", color: "#10b981" },
                { key: "delayed",   label: "Delayed",   color: "#ef4444" },
              ]}
              height={320} size={12}
            />
          )}
        </div>
      </Grid>
    </div>
  );
}
