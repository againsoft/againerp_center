"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useMemo, useState } from "react";
import { CenterClientUpdateSheet } from "@/components/center/updates/center-client-update-sheet";
import { CenterFleetUpdatesGrid } from "@/components/center/updates/center-fleet-updates-grid";
import {
  CenterFleetUpdatesToolbar,
  type CenterFleetUpdateFilters,
} from "@/components/center/updates/center-fleet-updates-toolbar";
import { Button } from "@/components/ui/button";
import {
  filterCenterClientUpdates,
  type CenterClientUpdate,
  type CenterUpdateRollout,
} from "@/lib/mock-data/center";

const defaultFilters: CenterFleetUpdateFilters = {
  search: "",
  status: "all",
  channel: "all",
};

type Props = {
  updates: CenterClientUpdate[];
  rollouts: CenterUpdateRollout[];
  loading?: boolean;
  onPushUpdate: (clientId: string) => Promise<void>;
  onRollbackUpdate: (clientId: string) => Promise<void>;
};

export function CenterFleetUpdatesList({
  updates,
  rollouts,
  loading,
  onPushUpdate,
  onRollbackUpdate,
}: Props) {
  const [filters, setFilters] = useState<CenterFleetUpdateFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterClientUpdate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterClientUpdates(updates, filters),
    [updates, filters],
  );

  const failedCount = updates.filter((u) => u.status === "failed").length;

  function openUpdate(update: CenterClientUpdate) {
    setSelected(update);
    setSheetOpen(true);
  }

  if (loading && updates.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Loading fleet update state…
      </div>
    );
  }

  return (
    <>
      {failedCount > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          <strong>{failedCount}</strong> client update{failedCount > 1 ? "s" : ""} failed — review agent
          connectivity and pre-flight checks before retry.
        </div>
      ) : null}

      <CenterFleetUpdatesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={updates.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={updates.length === 0 ? "No clients in update registry" : "No updates match your filters"}
          description={
            updates.length === 0
              ? "Create clients and ERP versions will appear here for staged rollouts."
              : undefined
          }
          action={
            updates.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterFleetUpdatesGrid updates={filtered} onView={openUpdate} />
      )}

      <CenterClientUpdateSheet
        update={selected}
        rollouts={rollouts}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onPushUpdate={onPushUpdate}
        onRollbackUpdate={onRollbackUpdate}
      />
    </>
  );
}
