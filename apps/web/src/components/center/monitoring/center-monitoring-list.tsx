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
  filterCenterAgentHeartbeats,
  type CenterAgentHeartbeat,
  type CenterAgentMetricPoint,
  type CenterMonitoringAlert,
} from "@/lib/mock-data/center";

const defaultFilters: CenterMonitoringFilters = {
  search: "",
  agentStatus: "all",
  deployment: "all",
};

type Props = {
  heartbeats: CenterAgentHeartbeat[];
  alerts: CenterMonitoringAlert[];
  clientSeries: Record<string, CenterAgentMetricPoint[]>;
};

export function CenterMonitoringList({ heartbeats, alerts, clientSeries }: Props) {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");

  const [filters, setFilters] = useState<CenterMonitoringFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterAgentHeartbeat | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterAgentHeartbeats(heartbeats, filters),
    [heartbeats, filters],
  );

  useEffect(() => {
    if (!clientParam) return;
    const hb = heartbeats.find((h) => h.clientId === clientParam);
    if (hb) {
      setSelected(hb);
      setSheetOpen(true);
    }
  }, [clientParam, heartbeats]);

  function openHeartbeat(hb: CenterAgentHeartbeat) {
    setSelected(hb);
    setSheetOpen(true);
  }

  function openClientFromAlert(clientId: string) {
    const hb = heartbeats.find((h) => h.clientId === clientId);
    if (hb) openHeartbeat(hb);
  }

  return (
    <>
      <CenterMonitoringAlerts alerts={alerts} onViewClient={openClientFromAlert} />

      <CenterMonitoringToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={heartbeats.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={heartbeats.length === 0 ? "No clients in fleet" : "No agents match your filters"}
          description={
            heartbeats.length === 0
              ? "Add clients and start Edge Agent to see monitoring data."
              : "Try clearing filters or search with a different term."
          }
          action={
            heartbeats.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterMonitoringGrid heartbeats={filtered} onView={openHeartbeat} />
      )}

      <CenterMonitoringDetailSheet
        heartbeat={selected}
        metricSeries={selected ? (clientSeries[selected.clientId] ?? []) : []}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
