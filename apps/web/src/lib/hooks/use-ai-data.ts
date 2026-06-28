"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiAiStatsToCenter,
  apiFleetToCenter,
  apiPlatformAgentsToCenter,
  apiRecommendationsToCenter,
} from "@/lib/adapters/center-ai-adapter";
import {
  fetchAiFleet,
  fetchAiRecommendations,
  fetchAiStats,
  fetchPlatformAiAgents,
} from "@/lib/api/ai";
import type {
  CenterAiRecommendation,
  CenterClientAiAccess,
  CenterPlatformAiAgent,
} from "@/lib/mock-data/center";

export type AiStats = {
  fleet: number;
  enabled: number;
  agentsActive: number;
  agentsAllocated: number;
  creditPct: number;
  creditWarnings: number;
  recommendations: number;
};

const emptyStats: AiStats = {
  fleet: 0,
  enabled: 0,
  agentsActive: 0,
  agentsAllocated: 0,
  creditPct: 0,
  creditWarnings: 0,
  recommendations: 0,
};

export function useAiData() {
  const [stats, setStats] = useState<AiStats>(emptyStats);
  const [fleet, setFleet] = useState<CenterClientAiAccess[]>([]);
  const [recommendations, setRecommendations] = useState<CenterAiRecommendation[]>([]);
  const [platformAgents, setPlatformAgents] = useState<CenterPlatformAiAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, fleetRes, recsRes, agentsRes] = await Promise.all([
        fetchAiStats(),
        fetchAiFleet(),
        fetchAiRecommendations(),
        fetchPlatformAiAgents(),
      ]);
      setStats(apiAiStatsToCenter(statsRes));
      setFleet(apiFleetToCenter(fleetRes));
      setRecommendations(apiRecommendationsToCenter(recsRes));
      setPlatformAgents(apiPlatformAgentsToCenter(agentsRes));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load AI data");
      setStats(emptyStats);
      setFleet([]);
      setRecommendations([]);
      setPlatformAgents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const getClientAccess = useCallback(
    (clientId: string) => fleet.find((row) => row.clientId === clientId),
    [fleet],
  );

  return {
    stats,
    fleet,
    recommendations,
    platformAgents,
    loading,
    error,
    refresh: load,
    getClientAccess,
  };
}
