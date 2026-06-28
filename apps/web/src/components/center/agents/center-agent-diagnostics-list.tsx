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
  filterCenterAgentDiagnostics,
  type CenterAgentDiagnostic,
} from "@/lib/mock-data/center";

const defaultFilters: CenterAgentDiagnosticFilters = {
  search: "",
  status: "all",
};

type Props = {
  diagnostics: CenterAgentDiagnostic[];
  getDiagnostic: (id: string) => CenterAgentDiagnostic | undefined;
};

export function CenterAgentDiagnosticsList({ diagnostics, getDiagnostic }: Props) {
  const searchParams = useSearchParams();
  const diagnosticParam = searchParams.get("diagnostic");
  const clientParam = searchParams.get("client");

  const [filters, setFilters] = useState<CenterAgentDiagnosticFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterAgentDiagnostic | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const base = filterCenterAgentDiagnostics(diagnostics, filters);
    if (!clientParam) return base;
    return base.filter((d) => d.clientId === clientParam);
  }, [diagnostics, filters, clientParam]);

  useEffect(() => {
    if (!diagnosticParam) return;
    const row = getDiagnostic(diagnosticParam);
    if (row) {
      setSelected(row);
      setSheetOpen(true);
    }
  }, [diagnosticParam, getDiagnostic]);

  function openDiagnostic(row: CenterAgentDiagnostic) {
    setSelected(row);
    setSheetOpen(true);
  }

  return (
    <>
      <CenterAgentDiagnosticsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={diagnostics.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={diagnostics.length === 0 ? "No diagnostics yet" : "No diagnostics match your filters"}
          description={diagnostics.length === 0 ? "Request a bundle from Monitoring or client detail." : undefined}
          action={
            diagnostics.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
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
