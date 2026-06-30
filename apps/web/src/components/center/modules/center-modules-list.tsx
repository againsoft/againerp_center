"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useMemo, useState } from "react";
import { CenterModuleDetailSheet } from "@/components/center/modules/center-module-detail-sheet";
import { CenterModulesGrid } from "@/components/center/modules/center-modules-grid";
import {
  CenterModulesToolbar,
  type CenterModuleFilters,
} from "@/components/center/modules/center-modules-toolbar";
import { Button } from "@/components/ui/button";
import {
  centerClients,
  centerModules,
  filterCenterModules,
  getCenterModuleClientCount,
  type CenterModuleDefinition,
} from "@/lib/mock-data/center";

const defaultFilters: CenterModuleFilters = {
  search: "",
  tier: "all",
  platformDefault: "all",
};

export function CenterModulesList() {
  const [filters, setFilters] = useState<CenterModuleFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterModuleDefinition | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => filterCenterModules(centerModules, filters), [filters]);

  const clientCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const mod of centerModules) {
      counts[mod.id] = getCenterModuleClientCount(mod.id, centerClients);
    }
    return counts;
  }, []);

  function openModule(mod: CenterModuleDefinition) {
    setSelected(mod);
    setSheetOpen(true);
  }

  return (
    <>
      <CenterModulesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerModules.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No modules match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterModulesGrid modules={filtered} clientCounts={clientCounts} onView={openModule} />
      )}

      <CenterModuleDetailSheet module={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
