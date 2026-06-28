"use client";

import { useMemo, useState } from "react";
import { CenterActivationBundlesGrid } from "@/components/center/agents/center-activation-bundles-grid";
import {
  CenterActivationBundlesToolbar,
  type CenterActivationBundleFilters,
} from "@/components/center/agents/center-activation-bundles-toolbar";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { Button } from "@/components/ui/button";
import {
  filterCenterActivationBundles,
  type CenterActivationBundle,
} from "@/lib/mock-data/center";

const defaultFilters: CenterActivationBundleFilters = {
  search: "",
  status: "all",
};

type Props = {
  bundles: CenterActivationBundle[];
};

export function CenterActivationBundlesList({ bundles }: Props) {
  const [filters, setFilters] = useState<CenterActivationBundleFilters>(defaultFilters);

  const filtered = useMemo(
    () => filterCenterActivationBundles(bundles, filters),
    [bundles, filters],
  );

  return (
    <>
      <CenterActivationBundlesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={bundles.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={bundles.length === 0 ? "No activation bundles yet" : "No bundles match your filters"}
          action={
            bundles.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterActivationBundlesGrid bundles={filtered} />
      )}
    </>
  );
}
