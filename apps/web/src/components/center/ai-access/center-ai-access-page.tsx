"use client";

import { Loader2 } from "lucide-react";
import { CenterAiAccessView } from "@/components/center/ai-access/center-ai-access-view";
import { CenterAiStats } from "@/components/center/ai-access/center-ai-stats";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { Button } from "@/components/ui/button";
import { useAiData } from "@/lib/hooks/use-ai-data";

export function CenterAiAccessPageContent() {
  const { stats, fleet, recommendations, platformAgents, loading, error, refresh, getClientAccess } =
    useAiData();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › AI Access"
        title="AI OS Provisioning & Usage"
        live
        count={stats.fleet}
        description={`${stats.enabled} clients with AI enabled — cloud-proxied via Edge Agent. Models never deploy to client servers.`}
      />

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading AI fleet data…
        </div>
      ) : error ? (
        <CenterEmptyState
          title="Failed to load AI access data"
          description={error}
          action={<Button variant="outline" size="sm" onClick={() => void refresh()}>Retry</Button>}
        />
      ) : (
        <>
          <CenterAiStats stats={stats} />
          <CenterAiAccessView
            fleet={fleet}
            recommendations={recommendations}
            platformAgents={platformAgents}
            getClientAccess={getClientAccess}
          />
        </>
      )}
    </div>
  );
}
