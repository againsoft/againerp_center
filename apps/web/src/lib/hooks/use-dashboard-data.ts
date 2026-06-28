"use client";

import { useCallback, useEffect, useState } from "react";
import {
  auditToActivity,
  buildFleetHealthItems,
  computeDashboardStats,
  deriveDashboardAlerts,
  type DashboardFleetItem,
  type DashboardStats,
} from "@/lib/adapters/center-dashboard-adapter";
import { fetchAuditLogs } from "@/lib/api/audit";
import { fetchClients } from "@/lib/api/clients";
import { fetchLicenses } from "@/lib/api/licenses";
import { countPendingRegistrations } from "@/lib/adapters/center-registration-adapter";
import { fetchRegistrations } from "@/lib/api/registrations";
import { fetchServers } from "@/lib/api/servers";
import { fetchSubscriptions } from "@/lib/api/subscriptions";
import type { CenterDashboardActivity, CenterDashboardAlert } from "@/lib/mock-data/center";

export type DashboardData = {
  stats: DashboardStats;
  activity: CenterDashboardActivity[];
  alerts: CenterDashboardAlert[];
  fleet: DashboardFleetItem[];
};

const emptyStats: DashboardStats = {
  total: 0,
  active: 0,
  suspended: 0,
  mrr: 0,
  aiEnabled: 0,
  pendingRegs: 0,
  agentsOnline: 0,
  agentsAlert: 0,
  activeSubscriptions: 0,
  licenses: 0,
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    stats: emptyStats,
    activity: [],
    alerts: [],
    fleet: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clients, servers, subscriptions, licenses, auditLogs, registrations] = await Promise.all([
        fetchClients(),
        fetchServers(),
        fetchSubscriptions(),
        fetchLicenses(),
        fetchAuditLogs(undefined, 10),
        fetchRegistrations(),
      ]);

      const clientMap = new Map(clients.map((c) => [c.id, c]));
      const stats = computeDashboardStats(clients, servers, subscriptions, licenses.length);
      stats.pendingRegs = countPendingRegistrations(registrations);

      setData({
        stats,
        activity: auditToActivity(auditLogs, clientMap),
        alerts: deriveDashboardAlerts(clients, servers, countPendingRegistrations(registrations)),
        fleet: buildFleetHealthItems(clients, servers),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
      setData({ stats: emptyStats, activity: [], alerts: [], fleet: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
