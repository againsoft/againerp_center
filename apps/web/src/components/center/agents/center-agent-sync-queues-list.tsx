"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CenterAgentSyncQueuesGrid } from "@/components/center/agents/center-agent-sync-queues-grid";
import {
  CenterAgentSyncQueuesToolbar,
  type CenterAgentSyncQueueFilters,
} from "@/components/center/agents/center-agent-sync-queues-toolbar";
import { Button } from "@/components/ui/button";
import { centerAgentSyncQueues, filterCenterAgentSyncQueues } from "@/lib/mock-data/center";

const defaultFilters: CenterAgentSyncQueueFilters = {
  search: "",
  connectivity: "all",
  queueType: "all",
  clientId: "",
};

export function CenterAgentSyncQueuesList() {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client") ?? "";

  const [filters, setFilters] = useState<CenterAgentSyncQueueFilters>({
    ...defaultFilters,
    clientId: clientParam,
  });

  const filtered = useMemo(() => {
    const base = filterCenterAgentSyncQueues(centerAgentSyncQueues, filters);
    if (!filters.clientId) return base;
    return base.filter((q) => q.clientId === filters.clientId);
  }, [filters]);

  useEffect(() => {
    if (clientParam) {
      setFilters((prev) => ({ ...prev, clientId: clientParam }));
    }
  }, [clientParam]);

  return (
    <>
      <CenterAgentSyncQueuesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerAgentSyncQueues.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No sync queues match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterAgentSyncQueuesGrid queues={filtered} />
      )}
    </>
  );
}
