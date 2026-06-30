"use client";

import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterActivityFeed } from "@/components/center/dashboard/center-activity-feed";
import { CenterAlertsBanner } from "@/components/center/dashboard/center-alerts-banner";
import { CenterChiefAiBriefing } from "@/components/center/dashboard/center-chief-ai-briefing";
import { CenterDashboardAside } from "@/components/center/dashboard/center-dashboard-aside";
import { CenterFleetHealth } from "@/components/center/dashboard/center-fleet-health";
import { CenterKpiGrid } from "@/components/center/dashboard/center-kpi-grid";

export function CenterDashboard() {
  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center"
        title="Platform Overview"
        description="Fleet health, commercial KPIs, and operational alerts — metadata from Edge Agents only."
      />

      <CenterKpiGrid />

      <CenterChiefAiBriefing />

      <CenterAlertsBanner />

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CenterActivityFeed />
        </div>
        <CenterDashboardAside />
      </div>

      <CenterFleetHealth />
    </div>
  );
}
