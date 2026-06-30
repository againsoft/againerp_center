"use client";

import { getCenterFleetMetricSeries } from "@/lib/mock-data/center";
import { CenterMonitoringMetricsChart } from "@/components/center/monitoring/center-monitoring-metrics-chart";

export function CenterMonitoringFleetChart() {
  const series = getCenterFleetMetricSeries();

  return (
    <CenterMonitoringMetricsChart
      series={series}
      title="Fleet average — last 24 hours"
      subtitle="Aggregated from online and degraded agents · hourly heartbeat samples (mock)"
      showApi
    />
  );
}
