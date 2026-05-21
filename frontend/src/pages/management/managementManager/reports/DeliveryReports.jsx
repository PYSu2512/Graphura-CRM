import {
  Grid,
  DashGrid,
  DashCard,
  GColumnChart,
  GLineChart,
} from "../../../../components/shared/Common_Components";

import {
  deliveryMetrics,
  monthlyDeliveryData,
} from "../reportsStore";

import {
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function DeliveryReports() {
  const chartData = monthlyDeliveryData.map((d) => ({
    name: d.month,
    delivered: d.delivered,
    delayed: d.delayed ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <Grid cols={12} gap={4}>
        <DashGrid cols={12} gap={4}>
          <DashCard
            title="Total Completed"
            value={deliveryMetrics.totalDelivered}
            icon={<CheckCircle size={20} />}
            accentColor="#10b981"
            size={3}
          />

          <DashCard
            title="On-Time %"
            value={`${deliveryMetrics.onTimePercentage.toFixed(
              1
            )}%`}
            icon={<TrendingUp size={20} />}
            accentColor="#3b82f6"
            size={3}
          />

          <DashCard
            title="Late Completions"
            value={deliveryMetrics.delayedDelivered}
            icon={<AlertCircle size={20} />}
            accentColor="#ef4444"
            size={3}
          />

          <DashCard
            title="Avg Delay Days"
            value={deliveryMetrics.avgDelayDays}
            icon={<AlertCircle size={20} />}
            accentColor="#f59e0b"
            size={3}
          />
        </DashGrid>
      </Grid>

      {/* Main Charts */}
      <Grid cols={12} gap={6}>
        <GColumnChart
          data={chartData}
          bars={[
            {
              key: "delivered",
              label: "Completed",
              color: "#10b981",
            },
            {
              key: "delayed",
              label: "Late",
              color: "#ef4444",
            },
          ]}
          title="Monthly Completion Trend"
          height={320}
          size={12}
        />

        <GLineChart
          data={chartData}
          lines={[
            {
              key: "delivered",
              label: "Completion Growth",
              color: "#2563eb",
            },
          ]}
          title="Completion Growth Analysis"
          height={300}
          size={6}
        />

        <GLineChart
          data={chartData}
          lines={[
            {
              key: "delayed",
              label: "Delay Analysis",
              color: "#dc2626",
            },
          ]}
          title="Delay Trend Analysis"
          height={300}
          size={6}
        />
      </Grid>

      {/* Extra Analytics Section */}
      <Grid cols={12} gap={4}>
        <div className="col-span-12 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#2a465a] mb-4">
            Completion Insights
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500">
                Best Performance
              </p>

              <h3 className="text-xl font-bold text-emerald-600 mt-2">
                {deliveryMetrics.onTimePercentage}%
              </h3>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500">
                Average Delay
              </p>

              <h3 className="text-xl font-bold text-amber-500 mt-2">
                {deliveryMetrics.avgDelayDays} Days
              </h3>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-500">
                Late Completions
              </p>

              <h3 className="text-xl font-bold text-red-500 mt-2">
                {deliveryMetrics.delayedDelivered}
              </h3>
            </div>
          </div>
        </div>
      </Grid>
    </div>
  );
}