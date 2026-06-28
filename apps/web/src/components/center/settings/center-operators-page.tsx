"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CenterOperatorDetailSheet } from "@/components/center/settings/center-operator-detail-sheet";
import { CenterOperatorsGrid } from "@/components/center/settings/center-operators-grid";
import {
  CenterOperatorsToolbar,
  type CenterOperatorFilters,
} from "@/components/center/settings/center-operators-toolbar";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { Button } from "@/components/ui/button";
import {
  centerOperators,
  filterCenterOperators,
  type CenterOperator,
} from "@/lib/mock-data/center";

const defaultFilters: CenterOperatorFilters = {
  search: "",
  role: "all",
  status: "all",
};

export function CenterOperatorsPageContent() {
  const [filters, setFilters] = useState<CenterOperatorFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterOperator | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => filterCenterOperators(centerOperators, filters), [filters]);

  const invitedCount = centerOperators.filter((o) => o.status === "invited").length;

  function openOperator(op: CenterOperator) {
    setSelected(op);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Settings › Operators"
        title="Operators"
        count={centerOperators.length}
        description="AgainSoft staff accounts — RBAC hierarchy from super_admin to partner_admin."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/center/settings">Back to settings</Link>
            </Button>
            <Button size="sm" disabled>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Invite operator
            </Button>
          </div>
        }
      />

      {invitedCount > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>{invitedCount}</strong> pending invitation{invitedCount > 1 ? "s" : ""} — MFA setup
          required before first login.
        </div>
      ) : null}

      <CenterOperatorsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerOperators.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No operators match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterOperatorsGrid operators={filtered} onView={openOperator} />
      )}

      <CenterOperatorDetailSheet operator={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
