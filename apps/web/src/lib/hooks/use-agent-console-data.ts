"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiBundlesToCenter,
  apiCommandsToCenter,
  apiConsoleStatsToCenter,
  apiDiagnosticsToCenter,
  apiSyncQueuesToCenter,
} from "@/lib/adapters/center-agent-adapter";
import {
  fetchActivationBundles,
  fetchAgentCommands,
  fetchAgentConsoleStats,
  fetchAgentDiagnostics,
  fetchAgentSyncQueues,
} from "@/lib/api/agents";
import type {
  CenterActivationBundle,
  CenterAgentCommand,
  CenterAgentDiagnostic,
  CenterAgentSyncQueue,
} from "@/lib/mock-data/center";

export type AgentConsoleStats = {
  pendingCommands: number;
  succeededToday: number;
  failedOrExpired: number;
  pendingActivations: number;
  offlineAgents: number;
  queuedItems: number;
  diagnosticsReady: number;
  diagnosticsPending: number;
};

const emptyStats: AgentConsoleStats = {
  pendingCommands: 0,
  succeededToday: 0,
  failedOrExpired: 0,
  pendingActivations: 0,
  offlineAgents: 0,
  queuedItems: 0,
  diagnosticsReady: 0,
  diagnosticsPending: 0,
};

export function useAgentConsoleData() {
  const [stats, setStats] = useState<AgentConsoleStats>(emptyStats);
  const [commands, setCommands] = useState<CenterAgentCommand[]>([]);
  const [activations, setActivations] = useState<CenterActivationBundle[]>([]);
  const [syncQueues, setSyncQueues] = useState<CenterAgentSyncQueue[]>([]);
  const [diagnostics, setDiagnostics] = useState<CenterAgentDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, cmdsRes, actsRes, syncRes, diagRes] = await Promise.all([
        fetchAgentConsoleStats(),
        fetchAgentCommands(),
        fetchActivationBundles(),
        fetchAgentSyncQueues(),
        fetchAgentDiagnostics(),
      ]);
      setStats(apiConsoleStatsToCenter(statsRes));
      setCommands(apiCommandsToCenter(cmdsRes));
      setActivations(apiBundlesToCenter(actsRes));
      setSyncQueues(apiSyncQueuesToCenter(syncRes));
      setDiagnostics(apiDiagnosticsToCenter(diagRes));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load agent console data");
      setStats(emptyStats);
      setCommands([]);
      setActivations([]);
      setSyncQueues([]);
      setDiagnostics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const getCommand = useCallback(
    (id: string) => commands.find((c) => c.id === id),
    [commands],
  );

  const getDiagnostic = useCallback(
    (id: string) => diagnostics.find((d) => d.id === id),
    [diagnostics],
  );

  return {
    stats,
    commands,
    activations,
    syncQueues,
    diagnostics,
    loading,
    error,
    refresh: load,
    getCommand,
    getDiagnostic,
  };
}
