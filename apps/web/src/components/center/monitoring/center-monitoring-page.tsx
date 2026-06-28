"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CenterMonitoringFleetChart } from "@/components/center/monitoring/center-monitoring-fleet-chart";
import { CenterMonitoringList } from "@/components/center/monitoring/center-monitoring-list";
import { CenterMonitoringStats } from "@/components/center/monitoring/center-monitoring-stats";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { useMonitoringData } from "@/lib/hooks/use-monitoring-data";

export function CenterMonitoringPageContent() {
  const { data, loading, error } = useMonitoringData();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Monitoring"
        title="Fleet Health & Monitoring"
        live
        count={data.heartbeats.length}
        description={`${data.stats.online} agents online · telemetry via Edge Agent heartbeat (60s interval). No direct client database access.`}
      />

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading fleet monitoring…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Could not load monitoring data: {error}
        </div>
      ) : (
        <>
          <CenterMonitoringStats stats={data.stats} />

          <CenterMonitoringFleetChart series={data.fleetSeries} />

          <Suspense fallback={null}>
            <CenterMonitoringList
              heartbeats={data.heartbeats}
              alerts={data.alerts}
              clientSeries={data.clientSeries}
            />
          </Suspense>
        </>
      )}

      {!loading && !error && (
        <p className="text-xs text-muted-foreground">
          Live data from Control Center API · Auto-refreshes every 30s · API latency and Docker metrics in Phase 2.
        </p>
      )}
    </div>
  );
}
