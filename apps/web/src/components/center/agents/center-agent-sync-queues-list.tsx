"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CenterAgentSyncQueuesGrid } from "@/components/center/agents/center-agent-sync-queues-grid";
import {
  CenterAgentSyncQueuesToolbar,
  type CenterAgentSyncQueueFilters,
} from "@/components/center/agents/center-agent-sync-queues-toolbar";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { Button } from "@/components/ui/button";
import {
  filterCenterAgentSyncQueues,
  type CenterAgentSyncQueue,
} from "@/lib/mock-data/center";

const defaultFilters: CenterAgentSyncQueueFilters = {
  search: "",
  connectivity: "all",
  queueType: "all",
};

type Props = {
  queues: CenterAgentSyncQueue[];
};

export function CenterAgentSyncQueuesList({ queues }: Props) {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");

  const [filters, setFilters] = useState<CenterAgentSyncQueueFilters>(defaultFilters);

  const filtered = useMemo(() => {
    const base = filterCenterAgentSyncQueues(queues, filters);
    if (!clientParam) return base;
    return base.filter((q) => q.clientId === clientParam);
  }, [queues, filters, clientParam]);

  return (
    <>
      <CenterAgentSyncQueuesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={queues.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={queues.length === 0 ? "All sync queues empty" : "No queues match your filters"}
          description={queues.length === 0 ? "Pending commands and offline agents appear here automatically." : undefined}
          action={
            queues.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterAgentSyncQueuesGrid queues={filtered} />
      )}
    </>
  );
}
