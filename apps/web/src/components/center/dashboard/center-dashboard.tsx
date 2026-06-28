"use client";

import { Loader2 } from "lucide-react";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterActivityFeed } from "@/components/center/dashboard/center-activity-feed";
import { CenterAlertsBanner } from "@/components/center/dashboard/center-alerts-banner";
import { CenterChiefAiBriefing } from "@/components/center/dashboard/center-chief-ai-briefing";
import { CenterDashboardAside } from "@/components/center/dashboard/center-dashboard-aside";
import { CenterFleetHealth } from "@/components/center/dashboard/center-fleet-health";
import { CenterKpiGrid } from "@/components/center/dashboard/center-kpi-grid";
import { useDashboardData } from "@/lib/hooks/use-dashboard-data";

export function CenterDashboard() {
  const { data, loading, error } = useDashboardData();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center"
        title="Platform Overview"
        live
        description="Fleet health, commercial KPIs, and operational alerts — metadata from Edge Agents only."
      />

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading platform overview…
        </div>
      ) : error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Could not load live dashboard data: {error}
        </div>
      ) : (
        <>
          <CenterKpiGrid stats={data.stats} />

          <CenterChiefAiBriefing />

          <CenterAlertsBanner alerts={data.alerts} />

          <div className="grid gap-3 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CenterActivityFeed activity={data.activity} />
            </div>
            <CenterDashboardAside stats={data.stats} />
          </div>

          <CenterFleetHealth fleet={data.fleet} stats={data.stats} />
        </>
      )}

      {!loading && !error && (
        <p className="text-xs text-muted-foreground">
          Live data from Control Center API · Chief AI briefing and notifications from fleet metadata.
        </p>
      )}
    </div>
  );
}
