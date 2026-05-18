import { Grid, DashGrid, DashCard, GColumnChart } from "../../../../components/shared/Common_Components";
import { deliveryMetrics, monthlyDeliveryData } from "../reportsStore";
import { TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

export default function DeliveryReports() {
  const chartData = monthlyDeliveryData.map((d) => ({
    name:      d.month,
    delivered: d.delivered,
    delayed:   d.delayed ?? 0,
  }));

  return (
    <Grid cols={12} gap={4}>
      <DashGrid cols={12} gap={4}>
        <DashCard
          title="Total Delivered"
          value={deliveryMetrics.totalDelivered}
          icon={<CheckCircle size={20} />}
          accentColor="#10b981"
          size={3}
        />
        <DashCard
          title="On-Time Delivery %"
          value={`${deliveryMetrics.onTimePercentage.toFixed(1)}%`}
          icon={<TrendingUp size={20} />}
          accentColor="#3b82f6"
          size={3}
        />
        <DashCard
          title="Delayed Deliveries"
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

      <GColumnChart
        data={chartData}
        bars={[
          { key: "delivered", label: "Delivered", color: "#10b981" },
          { key: "delayed",   label: "Delayed",   color: "#ef4444" },
        ]}
        title="Monthly Delivery Trend"
        height={300}
        size={12}
      />
    </Grid>
  );
}