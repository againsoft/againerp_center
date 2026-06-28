"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiClientUpdateToCenter,
  apiRolloutToCenterRollout,
  apiStatsToCenterUpdateStats,
  apiVersionToCenterVersion,
} from "@/lib/adapters/center-update-adapter";
import {
  advanceRollout,
  createRollout,
  fetchErpVersions,
  fetchFleetUpdates,
  fetchUpdateRollouts,
  fetchUpdateStats,
  pauseRollout,
  pushClientUpdate,
  rollbackClientUpdate,
} from "@/lib/api/updates";
import type {
  CenterClientUpdate,
  CenterErpVersion,
  CenterUpdateRollout,
} from "@/lib/mock-data/center";

export type UpdateStats = {
  upToDate: number;
  pending: number;
  failed: number;
  activeRollouts: number;
  latest: string;
};

const emptyStats: UpdateStats = {
  upToDate: 0,
  pending: 0,
  failed: 0,
  activeRollouts: 0,
  latest: "—",
};

export function useUpdatesData() {
  const [stats, setStats] = useState<UpdateStats>(emptyStats);
  const [versions, setVersions] = useState<CenterErpVersion[]>([]);
  const [rollouts, setRollouts] = useState<CenterUpdateRollout[]>([]);
  const [fleetUpdates, setFleetUpdates] = useState<CenterClientUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, versionsRes, rolloutsRes, fleetRes] = await Promise.all([
        fetchUpdateStats(),
        fetchErpVersions(),
        fetchUpdateRollouts(),
        fetchFleetUpdates(),
      ]);
      setStats(apiStatsToCenterUpdateStats(statsRes));
      setVersions(versionsRes.map(apiVersionToCenterVersion));
      setRollouts(rolloutsRes.map(apiRolloutToCenterRollout));
      setFleetUpdates(fleetRes.map(apiClientUpdateToCenter));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load updates");
      setStats(emptyStats);
      setVersions([]);
      setRollouts([]);
      setFleetUpdates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createNewRollout = useCallback(
    async (name: string, erpVersionId: string, stage = "canary") => {
      await createRollout({ name, erp_version_id: erpVersionId, stage });
      await load();
    },
    [load],
  );

  const advanceRolloutStage = useCallback(
    async (rolloutId: string) => {
      await advanceRollout(rolloutId);
      await load();
    },
    [load],
  );

  const pauseRolloutById = useCallback(
    async (rolloutId: string) => {
      await pauseRollout(rolloutId);
      await load();
    },
    [load],
  );

  const pushUpdate = useCallback(
    async (clientId: string) => {
      await pushClientUpdate(clientId);
      await load();
    },
    [load],
  );

  const rollbackUpdate = useCallback(
    async (clientId: string) => {
      await rollbackClientUpdate(clientId);
      await load();
    },
    [load],
  );

  return {
    stats,
    versions,
    rollouts,
    fleetUpdates,
    loading,
    error,
    refresh: load,
    createNewRollout,
    advanceRolloutStage,
    pauseRolloutById,
    pushUpdate,
    rollbackUpdate,
  };
}
