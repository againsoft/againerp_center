"use client";

import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterSettingsHub } from "@/components/center/settings/center-settings-hub";
import { CenterSettingsStats } from "@/components/center/settings/center-settings-stats";

export function CenterSettingsPageContent() {
  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Settings"
        title="Platform Settings"
        description="Operator accounts, API keys, and global platform configuration — RBAC and MFA enforced per Security architecture."
      />
      <CenterSettingsStats />
      <CenterSettingsHub />
    </div>
  );
}
