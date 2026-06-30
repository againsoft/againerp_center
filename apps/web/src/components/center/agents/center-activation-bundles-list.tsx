"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useMemo, useState } from "react";
import { CenterActivationBundlesGrid } from "@/components/center/agents/center-activation-bundles-grid";
import {
  CenterActivationBundlesToolbar,
  type CenterActivationBundleFilters,
} from "@/components/center/agents/center-activation-bundles-toolbar";
import { Button } from "@/components/ui/button";
import { centerActivationBundles, filterCenterActivationBundles } from "@/lib/mock-data/center";

const defaultFilters: CenterActivationBundleFilters = {
  search: "",
  status: "all",
};

export function CenterActivationBundlesList() {
  const [filters, setFilters] = useState<CenterActivationBundleFilters>(defaultFilters);

  const filtered = useMemo(
    () => filterCenterActivationBundles(centerActivationBundles, filters),
    [filters],
  );

  return (
    <>
      <CenterActivationBundlesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerActivationBundles.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No activation bundles match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterActivationBundlesGrid bundles={filtered} />
      )}
    </>
  );
}
