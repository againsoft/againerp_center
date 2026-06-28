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
import { filterCenterAuditLogs, type CenterAuditLogEntry } from "@/lib/mock-data/center";

const defaultFilters: CenterAuditFilters = {
  search: "",
  actorType: "all",
  resourceType: "all",
};

type Props = {
  logs: CenterAuditLogEntry[];
};

export function CenterAuditList({ logs }: Props) {
  const searchParams = useSearchParams();
  const entryParam = searchParams.get("entry");

  const [filters, setFilters] = useState<CenterAuditFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterAuditLogEntry | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => filterCenterAuditLogs(logs, filters), [logs, filters]);

  useEffect(() => {
    if (!entryParam) return;
    const log = logs.find((l) => l.id === entryParam);
    if (log) {
      setSelected(log);
      setSheetOpen(true);
    }
  }, [entryParam, logs]);

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
        totalCount={logs.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={logs.length === 0 ? "No audit entries yet" : "No audit entries match your filters"}
          description={
            logs.length === 0
              ? "Actions appear here when operators create or modify clients, licenses, and subscriptions."
              : "Try clearing filters or search with a different term."
          }
          action={
            logs.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterAuditGrid logs={filtered} onView={openLog} />
      )}

      <CenterAuditDetailSheet log={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
