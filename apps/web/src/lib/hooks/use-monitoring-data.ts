"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiAgentToHeartbeat,
  apiFleetSeriesToMetricPoints,
  computeMonitoringStats,
  deriveMonitoringAlerts,
  snapshotsToMetricSeries,
  type MonitoringStats,
} from "@/lib/adapters/center-monitoring-adapter";
import {
  fetchFleetMetricSeries,
  fetchHealthSnapshots,
  fetchMonitoringAgents,
} from "@/lib/api/monitoring";
import type {
  CenterAgentHeartbeat,
  CenterAgentMetricPoint,
  CenterMonitoringAlert,
} from "@/lib/mock-data/center";

export type MonitoringData = {
  heartbeats: CenterAgentHeartbeat[];
  stats: MonitoringStats;
  alerts: CenterMonitoringAlert[];
  fleetSeries: CenterAgentMetricPoint[];
  clientSeries: Record<string, CenterAgentMetricPoint[]>;
};

const emptyStats: MonitoringStats = {
  online: 0,
  degraded: 0,
  offline: 0,
  pending: 0,
  activeAlerts: 0,
  avgLatency: 0,
};

export function useMonitoringData() {
  const [data, setData] = useState<MonitoringData>({
    heartbeats: [],
    stats: emptyStats,
    alerts: [],
    fleetSeries: [],
    clientSeries: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [agents, fleetSeries] = await Promise.all([
        fetchMonitoringAgents(),
        fetchFleetMetricSeries(24),
      ]);

      const heartbeats = agents.map(apiAgentToHeartbeat);
      const onlineAgents = agents.filter((a) => a.agent_status === "connected" || a.agent_status === "degraded");

      const seriesEntries = await Promise.all(
        onlineAgents.slice(0, 20).map(async (a) => {
          const snaps = await fetchHealthSnapshots(a.client_id, 24);
          return [a.client_id, snapshotsToMetricSeries(snaps)] as const;
        }),
      );

      setData({
        heartbeats,
        stats: computeMonitoringStats(agents),
        alerts: deriveMonitoringAlerts(agents),
        fleetSeries: apiFleetSeriesToMetricPoints(fleetSeries),
        clientSeries: Object.fromEntries(seriesEntries),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load monitoring data");
      setData({ heartbeats: [], stats: emptyStats, alerts: [], fleetSeries: [], clientSeries: {} });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  return { data, loading, error, refresh: load };
}
