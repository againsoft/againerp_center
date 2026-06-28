"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CenterAgentDiagnosticDetailSheet } from "@/components/center/agents/center-agent-diagnostic-detail-sheet";
import { CenterAgentDiagnosticsGrid } from "@/components/center/agents/center-agent-diagnostics-grid";
import {
  CenterAgentDiagnosticsToolbar,
  type CenterAgentDiagnosticFilters,
} from "@/components/center/agents/center-agent-diagnostics-toolbar";
import { Button } from "@/components/ui/button";
import {
  centerAgentDiagnostics,
  filterCenterAgentDiagnostics,
  getCenterAgentDiagnostic,
  type CenterAgentDiagnostic,
} from "@/lib/mock-data/center";

const defaultFilters: CenterAgentDiagnosticFilters = {
  search: "",
  status: "all",
  clientId: "",
};

export function CenterAgentDiagnosticsList() {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client") ?? "";
  const diagnosticParam = searchParams.get("diagnostic");

  const [filters, setFilters] = useState<CenterAgentDiagnosticFilters>({
    ...defaultFilters,
    clientId: clientParam,
  });
  const [selected, setSelected] = useState<CenterAgentDiagnostic | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const base = filterCenterAgentDiagnostics(centerAgentDiagnostics, filters);
    if (!filters.clientId) return base;
    return base.filter((d) => d.clientId === filters.clientId);
  }, [filters]);

  useEffect(() => {
    if (clientParam) {
      setFilters((prev) => ({ ...prev, clientId: clientParam }));
    }
  }, [clientParam]);

  useEffect(() => {
    if (!diagnosticParam) return;
    const diagnostic = getCenterAgentDiagnostic(diagnosticParam);
    if (diagnostic) {
      setSelected(diagnostic);
      setSheetOpen(true);
    }
  }, [diagnosticParam]);

  function openDiagnostic(diagnostic: CenterAgentDiagnostic) {
    setSelected(diagnostic);
    setSheetOpen(true);
  }

  return (
    <>
      <CenterAgentDiagnosticsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerAgentDiagnostics.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No diagnostics match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterAgentDiagnosticsGrid diagnostics={filtered} onView={openDiagnostic} />
      )}

      <CenterAgentDiagnosticDetailSheet
        diagnostic={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
