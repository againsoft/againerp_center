"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CenterMonitoringAlerts } from "@/components/center/monitoring/center-monitoring-alerts";
import { CenterMonitoringDetailSheet } from "@/components/center/monitoring/center-monitoring-detail-sheet";
import { CenterMonitoringGrid } from "@/components/center/monitoring/center-monitoring-grid";
import {
  CenterMonitoringToolbar,
  type CenterMonitoringFilters,
} from "@/components/center/monitoring/center-monitoring-toolbar";
import { Button } from "@/components/ui/button";
import {
  centerAgentHeartbeats,
  filterCenterAgentHeartbeats,
  getCenterAgentHeartbeat,
  type CenterAgentHeartbeat,
} from "@/lib/mock-data/center";

const defaultFilters: CenterMonitoringFilters = {
  search: "",
  agentStatus: "all",
  deployment: "all",
};

export function CenterMonitoringList() {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");

  const [filters, setFilters] = useState<CenterMonitoringFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterAgentHeartbeat | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterAgentHeartbeats(centerAgentHeartbeats, filters),
    [filters],
  );

  useEffect(() => {
    if (!clientParam) return;
    const hb = getCenterAgentHeartbeat(clientParam);
    if (hb) {
      setSelected(hb);
      setSheetOpen(true);
    }
  }, [clientParam]);

  function openHeartbeat(hb: CenterAgentHeartbeat) {
    setSelected(hb);
    setSheetOpen(true);
  }

  function openClientFromAlert(clientId: string) {
    const hb = getCenterAgentHeartbeat(clientId);
    if (hb) openHeartbeat(hb);
  }

  return (
    <>
      <CenterMonitoringAlerts onViewClient={openClientFromAlert} />

      <CenterMonitoringToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerAgentHeartbeats.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No agents match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterMonitoringGrid heartbeats={filtered} onView={openHeartbeat} />
      )}

      <CenterMonitoringDetailSheet
        heartbeat={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
