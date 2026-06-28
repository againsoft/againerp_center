"use client";

import { Suspense } from "react";
import { Loader2, Plus } from "lucide-react";
import { CenterAgentFleetList, useAgentFleetStats } from "@/components/center/agents/center-agent-fleet-list";
import { CenterAgentStats } from "@/components/center/agents/center-agent-stats";
import { CenterAgentsView } from "@/components/center/agents/center-agents-view";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { Button } from "@/components/ui/button";
import { useAgentConsoleData } from "@/lib/hooks/use-agent-console-data";

export function CenterAgentsPageContent() {
  const fleetStats = useAgentFleetStats();
  const consoleData = useAgentConsoleData();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Edge Agents"
        title="Edge Agent Console"
        live
        description={`${fleetStats.online} online · ${fleetStats.offline} offline — signed command queue delivered via heartbeat. mTLS outbound — Control Center never connects to client hosts directly.`}
        actions={
          <Button size="sm" disabled>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Issue command
          </Button>
        }
      />

      <CenterAgentStats fleetStats={fleetStats} consoleStats={consoleData.stats} />

      {consoleData.loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading agent console…
        </div>
      ) : consoleData.error ? (
        <CenterEmptyState
          title="Failed to load agent console"
          description={consoleData.error}
          action={<Button variant="outline" size="sm" onClick={() => void consoleData.refresh()}>Retry</Button>}
        />
      ) : (
        <Suspense fallback={null}>
          <CenterAgentsView
            fleetList={<CenterAgentFleetList />}
            commands={consoleData.commands}
            activations={consoleData.activations}
            syncQueues={consoleData.syncQueues}
            diagnostics={consoleData.diagnostics}
            getCommand={consoleData.getCommand}
            getDiagnostic={consoleData.getDiagnostic}
          />
        </Suspense>
      )}
    </div>
  );
}
