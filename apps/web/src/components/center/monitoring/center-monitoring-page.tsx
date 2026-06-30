"use client";

import { Suspense } from "react";
import { CenterMonitoringFleetChart } from "@/components/center/monitoring/center-monitoring-fleet-chart";
import { CenterMonitoringList } from "@/components/center/monitoring/center-monitoring-list";
import { CenterMonitoringStats } from "@/components/center/monitoring/center-monitoring-stats";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { centerAgentHeartbeats, getCenterMonitoringStats } from "@/lib/mock-data/center";

export function CenterMonitoringPageContent() {
  const stats = getCenterMonitoringStats();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Monitoring"
        title="Fleet Health & Monitoring"
        count={centerAgentHeartbeats.length}
        description={`${stats.online} agents online · telemetry via Edge Agent heartbeat (60s interval). No direct client database access.`}
      />

      <CenterMonitoringStats />

      <CenterMonitoringFleetChart />

      <Suspense fallback={null}>
        <CenterMonitoringList />
      </Suspense>
    </div>
  );
}
