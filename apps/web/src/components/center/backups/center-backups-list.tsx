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
  centerClientBackupStatuses,
  filterCenterClientBackupStatuses,
  type CenterClientBackupStatus,
} from "@/lib/mock-data/center";

const defaultFilters: CenterBackupFilters = {
  search: "",
  status: "all",
  storage: "all",
};

export function CenterBackupsList() {
  const [filters, setFilters] = useState<CenterBackupFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterClientBackupStatus | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterClientBackupStatuses(centerClientBackupStatuses, filters),
    [filters],
  );

  const overdueCount = centerClientBackupStatuses.filter(
    (s) => s.status === "overdue" || s.status === "failed",
  ).length;

  function openStatus(status: CenterClientBackupStatus) {
    setSelected(status);
    setSheetOpen(true);
  }

  return (
    <>
      {overdueCount > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>{overdueCount}</strong> client{overdueCount > 1 ? "s" : ""} with overdue or failed
          backups — review agent connectivity and disk space before next update.
        </div>
      ) : null}

      <CenterBackupsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerClientBackupStatuses.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No clients match your filters"
          description="Try a different search or status filter."
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterBackupsGrid statuses={filtered} onView={openStatus} />
      )}

      <CenterBackupDetailSheet status={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
