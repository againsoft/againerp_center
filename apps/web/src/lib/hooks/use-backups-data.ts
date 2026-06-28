"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiFleetToCenter,
  apiRunsToCenter,
  apiStatsToCenter,
} from "@/lib/adapters/center-backup-adapter";
import {
  fetchBackupFleet,
  fetchBackupRuns,
  fetchBackupStats,
  triggerClientBackup,
  verifyBackupRun,
} from "@/lib/api/backups";
import type { CenterBackupRecord, CenterClientBackupStatus } from "@/lib/mock-data/center";

export type BackupStats = {
  verified: number;
  overdue: number;
  pendingVerify: number;
  totalMetadataMb: number;
  fleet: number;
};

const emptyStats: BackupStats = {
  verified: 0,
  overdue: 0,
  pendingVerify: 0,
  totalMetadataMb: 0,
  fleet: 0,
};

export function useBackupsData() {
  const [stats, setStats] = useState<BackupStats>(emptyStats);
  const [fleet, setFleet] = useState<CenterClientBackupStatus[]>([]);
  const [runs, setRuns] = useState<CenterBackupRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, fleetRes, runsRes] = await Promise.all([
        fetchBackupStats(),
        fetchBackupFleet(),
        fetchBackupRuns(),
      ]);
      setStats(apiStatsToCenter(statsRes));
      setFleet(apiFleetToCenter(fleetRes));
      setRuns(apiRunsToCenter(runsRes));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load backup data");
      setStats(emptyStats);
      setFleet([]);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const triggerBackup = useCallback(
    async (clientId: string) => {
      await triggerClientBackup(clientId);
      await load();
    },
    [load],
  );

  const verifyRun = useCallback(
    async (recordId: string) => {
      await verifyBackupRun(recordId);
      await load();
    },
    [load],
  );

  const getClientRuns = useCallback(
    (clientId: string) => runs.filter((r) => r.clientId === clientId),
    [runs],
  );

  return {
    stats,
    fleet,
    runs,
    loading,
    error,
    refresh: load,
    triggerBackup,
    verifyRun,
    getClientRuns,
  };
}
