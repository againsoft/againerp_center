"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useMemo, useState } from "react";
import { CenterLicenseDetailSheet } from "@/components/center/licenses/center-license-detail-sheet";
import { CenterLicensesGrid } from "@/components/center/licenses/center-licenses-grid";
import {
  CenterLicensesToolbar,
  type CenterLicenseFilters,
} from "@/components/center/licenses/center-licenses-toolbar";
import { Button } from "@/components/ui/button";
import { filterCenterLicenses, type CenterLicense } from "@/lib/mock-data/center";

const defaultFilters: CenterLicenseFilters = {
  search: "",
  status: "all",
};

type Props = {
  licenses: CenterLicense[];
};

export function CenterLicensesList({ licenses }: Props) {
  const [filters, setFilters] = useState<CenterLicenseFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterLicense | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterLicenses(licenses, filters),
    [licenses, filters],
  );

  const graceCount = licenses.filter((l) => l.status === "grace").length;

  function openLicense(lic: CenterLicense) {
    setSelected(lic);
    setSheetOpen(true);
  }

  return (
    <>
      {graceCount > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>{graceCount}</strong> license{graceCount > 1 ? "s" : ""} in grace period — client
          ERP continues with admin warnings until grace ends.
        </div>
      ) : null}

      <CenterLicensesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        licenses={licenses}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={licenses.length === 0 ? "No licenses yet" : "No licenses match your filters"}
          description={
            licenses.length === 0
              ? "Licenses are issued automatically when you add a client."
              : "Try clearing filters or search with a different term."
          }
          action={
            licenses.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterLicensesGrid licenses={filtered} onView={openLicense} />
      )}

      <CenterLicenseDetailSheet
        license={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
