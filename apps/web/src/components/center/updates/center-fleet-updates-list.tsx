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
  centerClientUpdates,
  filterCenterClientUpdates,
  type CenterClientUpdate,
} from "@/lib/mock-data/center";

const defaultFilters: CenterFleetUpdateFilters = {
  search: "",
  status: "all",
  channel: "all",
};

export function CenterFleetUpdatesList() {
  const [filters, setFilters] = useState<CenterFleetUpdateFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterClientUpdate | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterClientUpdates(centerClientUpdates, filters),
    [filters],
  );

  const failedCount = centerClientUpdates.filter((u) => u.status === "failed").length;

  function openUpdate(update: CenterClientUpdate) {
    setSelected(update);
    setSheetOpen(true);
  }

  return (
    <>
      {failedCount > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          <strong>{failedCount}</strong> client update{failedCount > 1 ? "s" : ""} failed — review
          agent connectivity and pre-flight checks before retry.
        </div>
      ) : null}

      <CenterFleetUpdatesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerClientUpdates.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No updates match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterFleetUpdatesGrid updates={filtered} onView={openUpdate} />
      )}

      <CenterClientUpdateSheet update={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
