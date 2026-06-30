"use client";

import { Suspense } from "react";
import { Plus } from "lucide-react";
import { CenterAgentStats } from "@/components/center/agents/center-agent-stats";
import { CenterAgentsView } from "@/components/center/agents/center-agents-view";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { getCenterAgentConsoleStats } from "@/lib/mock-data/center";

export function CenterAgentsPageContent() {
  const stats = getCenterAgentConsoleStats();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Edge Agents"
        title="Edge Agent Console"
        description={`${stats.pendingCommands} commands in flight · signed command queue delivered via heartbeat. mTLS outbound — Control Center never connects to client hosts directly.`}
        actions={
          <Button size="sm" disabled>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Issue command
          </Button>
        }
      />

      <CenterAgentStats />

      <Suspense fallback={null}>
        <CenterAgentsView />
      </Suspense>
    </div>
  );
}
