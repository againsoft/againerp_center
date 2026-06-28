"use client";

import type { CenterAgentMetricPoint } from "@/lib/mock-data/center";
import { CenterMonitoringMetricsChart } from "@/components/center/monitoring/center-monitoring-metrics-chart";

type Props = {
  series: CenterAgentMetricPoint[];
};

export function CenterMonitoringFleetChart({ series }: Props) {
  return (
    <CenterMonitoringMetricsChart
      series={series}
      title="Fleet average — recent heartbeats"
      subtitle="Aggregated CPU and RAM from Edge Agent telemetry · live samples"
      showApi={false}
    />
  );
}
