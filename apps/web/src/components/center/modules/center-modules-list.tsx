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
import type { ModuleTierStats } from "@/lib/hooks/use-modules-data";
import { filterCenterModules, type CenterModuleDefinition } from "@/lib/mock-data/center";

const defaultFilters: CenterModuleFilters = {
  search: "",
  tier: "all",
  platformDefault: "all",
};

type Props = {
  modules: CenterModuleDefinition[];
  stats: ModuleTierStats;
  loading?: boolean;
};

export function CenterModulesList({ modules, stats, loading }: Props) {
  const [filters, setFilters] = useState<CenterModuleFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterModuleDefinition | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => filterCenterModules(modules, filters), [modules, filters]);

  const clientCounts = stats.clientCounts;

  function openModule(mod: CenterModuleDefinition) {
    setSelected(mod);
    setSheetOpen(true);
  }

  if (loading && modules.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Loading module catalog…
      </div>
    );
  }

  return (
    <>
      <CenterModulesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={modules.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={modules.length === 0 ? "No modules in registry" : "No modules match your filters"}
          action={
            modules.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterModulesGrid modules={filtered} clientCounts={clientCounts} onView={openModule} />
      )}

      <CenterModuleDetailSheet
        module={selected}
        modules={modules}
        clientCount={selected ? (clientCounts[selected.id] ?? 0) : 0}
        totalClients={stats.totalClients}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
