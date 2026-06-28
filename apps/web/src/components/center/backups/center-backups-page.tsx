"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { CenterBackupStats } from "@/components/center/backups/center-backup-stats";
import { CenterBackupsView } from "@/components/center/backups/center-backups-view";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { useBackupsData } from "@/lib/hooks/use-backups-data";

export function CenterBackupsPageContent() {
  const { stats, fleet, runs, loading, error, refresh, triggerBackup, verifyRun, getClientRuns } =
    useBackupsData();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Backups"
        title="Backup Status"
        live
        count={loading ? undefined : stats.fleet}
        description="Policy, verification, and retention metadata — backup files never leave client infrastructure."
        actions={
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          {error}
        </div>
      ) : null}

      <CenterBackupStats stats={stats} loading={loading} />
      <CenterBackupsView
        fleet={fleet}
        runs={runs}
        loading={loading}
        onTriggerBackup={triggerBackup}
        onVerifyRun={verifyRun}
        getClientRuns={getClientRuns}
      />
    </div>
  );
}
