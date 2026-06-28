"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CenterAuditDetailSheet } from "@/components/center/audit/center-audit-detail-sheet";
import { CenterAuditGrid } from "@/components/center/audit/center-audit-grid";
import {
  CenterAuditToolbar,
  type CenterAuditFilters,
} from "@/components/center/audit/center-audit-toolbar";
import { Button } from "@/components/ui/button";
import {
  centerAuditLogs,
  filterCenterAuditLogs,
  getCenterAuditLog,
  type CenterAuditLogEntry,
} from "@/lib/mock-data/center";

const defaultFilters: CenterAuditFilters = {
  search: "",
  actorType: "all",
  resourceType: "all",
};

export function CenterAuditList() {
  const searchParams = useSearchParams();
  const entryParam = searchParams.get("entry");

  const [filters, setFilters] = useState<CenterAuditFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterAuditLogEntry | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => filterCenterAuditLogs(centerAuditLogs, filters), [filters]);

  useEffect(() => {
    if (!entryParam) return;
    const log = getCenterAuditLog(entryParam);
    if (log) {
      setSelected(log);
      setSheetOpen(true);
    }
  }, [entryParam]);

  function openLog(log: CenterAuditLogEntry) {
    setSelected(log);
    setSheetOpen(true);
  }

  return (
    <>
      <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-4 py-3 text-xs text-muted-foreground dark:border-violet-900 dark:bg-violet-950/20">
        Immutable append-only log — operator, system, and Edge Agent actions with correlation IDs for
        forensics. Requires <code className="rounded bg-muted px-1">audit.read</code> permission.
      </div>

      <CenterAuditToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerAuditLogs.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No audit entries match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterAuditGrid logs={filtered} onView={openLog} />
      )}

      <CenterAuditDetailSheet log={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
