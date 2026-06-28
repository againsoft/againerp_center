"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiModulesToCenterModules,
  apiStatsToTierStats,
} from "@/lib/adapters/center-module-adapter";
import { fetchModuleStats, fetchModules } from "@/lib/api/modules";
import type { CenterModuleDefinition } from "@/lib/mock-data/center";

export type ModuleTierStats = {
  core: { count: number; defaults: number };
  growth: { count: number; defaults: number };
  premium: { count: number; defaults: number };
  clientCounts: Record<string, number>;
  totalClients: number;
  moduleCount: number;
};

const emptyStats: ModuleTierStats = {
  core: { count: 0, defaults: 0 },
  growth: { count: 0, defaults: 0 },
  premium: { count: 0, defaults: 0 },
  clientCounts: {},
  totalClients: 0,
  moduleCount: 0,
};

export function useModulesData() {
  const [modules, setModules] = useState<CenterModuleDefinition[]>([]);
  const [stats, setStats] = useState<ModuleTierStats>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [modsRes, statsRes] = await Promise.all([fetchModules(), fetchModuleStats()]);
      setModules(apiModulesToCenterModules(modsRes));
      setStats(apiStatsToTierStats(statsRes));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load modules");
      setModules([]);
      setStats(emptyStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { modules, stats, loading, error, refresh: load };
}
