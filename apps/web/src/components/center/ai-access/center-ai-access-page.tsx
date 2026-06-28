"use client";

import { CenterAiAccessView } from "@/components/center/ai-access/center-ai-access-view";
import { CenterAiStats } from "@/components/center/ai-access/center-ai-stats";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { getCenterAiStats } from "@/lib/mock-data/center";

export function CenterAiAccessPageContent() {
  const stats = getCenterAiStats();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › AI Access"
        title="AI OS Provisioning & Usage"
        count={stats.fleet}
        description={`${stats.enabled} clients with AI enabled — cloud-proxied via Edge Agent. Models never deploy to client servers.`}
      />

      <CenterAiStats />
      <CenterAiAccessView />
    </div>
  );
}
