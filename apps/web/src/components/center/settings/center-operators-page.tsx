"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { CenterOperatorDetailSheet } from "@/components/center/settings/center-operator-detail-sheet";
import { CenterOperatorsGrid } from "@/components/center/settings/center-operators-grid";
import {
  CenterOperatorsToolbar,
  type CenterOperatorFilters,
} from "@/components/center/settings/center-operators-toolbar";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { Button } from "@/components/ui/button";
import { apiOperatorsToCenter } from "@/lib/adapters/center-operator-adapter";
import { fetchOperators } from "@/lib/api/operators";
import { filterCenterOperators, type CenterOperator } from "@/lib/mock-data/center";

const defaultFilters: CenterOperatorFilters = {
  search: "",
  role: "all",
  status: "all",
};

export function CenterOperatorsPageContent() {
  const [operators, setOperators] = useState<CenterOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CenterOperatorFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterOperator | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOperators();
      setOperators(apiOperatorsToCenter(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load operators");
      setOperators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => filterCenterOperators(operators, filters), [operators, filters]);

  const invitedCount = operators.filter((o) => o.status === "invited").length;
  const mfaDisabled = operators.filter((o) => !o.mfaEnabled && o.status === "active").length;

  function openOperator(op: CenterOperator) {
    setSelected(op);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Settings › Operators"
        title="Operators"
        live
        count={loading ? undefined : operators.length}
        description="AgainSoft staff accounts — RBAC hierarchy from super_admin to partner_admin."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Refresh
            </Button>
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

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          {error}
        </div>
      ) : null}

      {mfaDisabled > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>{mfaDisabled}</strong> operator{mfaDisabled > 1 ? "s" : ""} without MFA —{" "}
          <Link href="/center/settings/security" className="text-violet-700 underline dark:text-violet-300">
            enable TOTP
          </Link>{" "}
          before production.
        </div>
      ) : null}

      {invitedCount > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>{invitedCount}</strong> pending invitation{invitedCount > 1 ? "s" : ""} — MFA setup required
          before first login.
        </div>
      ) : null}

      <CenterOperatorsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={operators.length}
      />

      {loading && operators.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading operators…</div>
      ) : filtered.length === 0 ? (
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
