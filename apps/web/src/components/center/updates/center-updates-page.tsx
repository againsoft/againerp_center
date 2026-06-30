"use client";

import { Plus } from "lucide-react";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterUpdateStats } from "@/components/center/updates/center-update-stats";
import { CenterUpdatesView } from "@/components/center/updates/center-updates-view";
import { Button } from "@/components/ui/button";
import { getCenterUpdateStats } from "@/lib/mock-data/center";

export function CenterUpdatesPageContent() {
  const stats = getCenterUpdateStats();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Updates"
        title="Update Manager"
        description={`Latest stable ${stats.latest} — staged rollouts via Edge Agent with pre-update backup and smoke validation.`}
        actions={
          <Button size="sm" disabled>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New rollout
          </Button>
        }
      />

      <CenterUpdateStats />
      <CenterUpdatesView />
    </div>
  );
}
