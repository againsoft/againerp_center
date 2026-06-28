"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useMemo, useState } from "react";
import { CenterBackupDetailSheet } from "@/components/center/backups/center-backup-detail-sheet";
import { CenterBackupsGrid } from "@/components/center/backups/center-backups-grid";
import {
  CenterBackupsToolbar,
  type CenterBackupFilters,
} from "@/components/center/backups/center-backups-toolbar";
import { Button } from "@/components/ui/button";
import {
  filterCenterClientBackupStatuses,
  type CenterBackupRecord,
  type CenterClientBackupStatus,
} from "@/lib/mock-data/center";

const defaultFilters: CenterBackupFilters = {
  search: "",
  status: "all",
  storage: "all",
};

type Props = {
  fleet: CenterClientBackupStatus[];
  loading?: boolean;
  onTriggerBackup: (clientId: string) => Promise<void>;
  onVerifyRun: (recordId: string) => Promise<void>;
  getClientRuns: (clientId: string) => CenterBackupRecord[];
};

export function CenterBackupsList({
  fleet,
  loading,
  onTriggerBackup,
  onVerifyRun,
  getClientRuns,
}: Props) {
  const [filters, setFilters] = useState<CenterBackupFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterClientBackupStatus | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => filterCenterClientBackupStatuses(fleet, filters), [fleet, filters]);

  const overdueCount = fleet.filter((s) => s.status === "overdue" || s.status === "failed").length;

  function openStatus(status: CenterClientBackupStatus) {
    setSelected(status);
    setSheetOpen(true);
  }

  if (loading && fleet.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Loading fleet backup status…
      </div>
    );
  }

  return (
    <>
      {overdueCount > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>{overdueCount}</strong> client{overdueCount > 1 ? "s" : ""} with overdue or failed backups
          — review agent connectivity and disk space before next update.
        </div>
      ) : null}

      <CenterBackupsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={fleet.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={fleet.length === 0 ? "No clients in backup registry" : "No clients match your filters"}
          description={
            fleet.length === 0
              ? "Create clients to track backup policy and verification metadata."
              : "Try a different search or status filter."
          }
          action={
            fleet.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterBackupsGrid statuses={filtered} onView={openStatus} />
      )}

      <CenterBackupDetailSheet
        status={selected}
        records={selected ? getClientRuns(selected.clientId) : []}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onTriggerBackup={onTriggerBackup}
        onVerifyRun={onVerifyRun}
      />
    </>
  );
}
