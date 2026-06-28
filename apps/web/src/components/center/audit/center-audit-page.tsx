"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { CenterAuditList } from "@/components/center/audit/center-audit-list";
import { CenterAuditStats } from "@/components/center/audit/center-audit-stats";
import { CenterPageHeader } from "@/components/center/center-page-header";
import {
  apiAuditLogsToCenterAuditLogs,
  computeAuditStats,
} from "@/lib/adapters/center-audit-adapter";
import { fetchAuditLogs } from "@/lib/api/audit";
import { fetchClients } from "@/lib/api/clients";
import type { CenterAuditLogEntry } from "@/lib/mock-data/center";

export function CenterAuditPageContent() {
  const [logs, setLogs] = useState<CenterAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [entries, clients] = await Promise.all([fetchAuditLogs(), fetchClients()]);
      setLogs(apiAuditLogsToCenterAuditLogs(entries, clients));
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = computeAuditStats(logs);

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Audit Log"
        title="Audit Log"
        live
        count={stats.total}
        description="Immutable operator, system, and agent action history — partitioned monthly, archived after 12 months."
      />

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading audit log…
        </div>
      ) : (
        <>
          <CenterAuditStats stats={stats} />
          <Suspense fallback={null}>
            <CenterAuditList logs={logs} />
          </Suspense>
        </>
      )}

      {!loading && (
        <p className="text-xs text-muted-foreground">
          Live data from Control Center API · Actions logged on client, license, and subscription changes.
        </p>
      )}
    </div>
  );
}
