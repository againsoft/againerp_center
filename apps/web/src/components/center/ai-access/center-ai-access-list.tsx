"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CenterAiAccessDetailSheet } from "@/components/center/ai-access/center-ai-access-detail-sheet";
import { CenterAiAccessGrid } from "@/components/center/ai-access/center-ai-access-grid";
import {
  CenterAiAccessToolbar,
  type CenterAiAccessFilters,
} from "@/components/center/ai-access/center-ai-access-toolbar";
import { CenterAiRecommendations } from "@/components/center/ai-access/center-ai-recommendations";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { Button } from "@/components/ui/button";
import {
  centerClientAiAccess,
  filterCenterClientAiAccess,
  getCenterClientAiAccess,
  type CenterClientAiAccess,
} from "@/lib/mock-data/center";

const defaultFilters: CenterAiAccessFilters = {
  search: "",
  aiEnabled: "all",
  creditStatus: "all",
};

export function CenterAiAccessList() {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");

  const [filters, setFilters] = useState<CenterAiAccessFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterClientAiAccess | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterClientAiAccess(centerClientAiAccess, filters),
    [filters],
  );

  useEffect(() => {
    if (!clientParam) return;
    const row = getCenterClientAiAccess(clientParam);
    if (row) {
      setSelected(row);
      setSheetOpen(true);
    }
  }, [clientParam]);

  function openAccess(row: CenterClientAiAccess) {
    setSelected(row);
    setSheetOpen(true);
  }

  function openClientFromRec(clientId: string) {
    const row = getCenterClientAiAccess(clientId);
    if (row) openAccess(row);
  }

  return (
    <>
      <CenterAiRecommendations onViewClient={openClientFromRec} />

      <CenterAiAccessToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerClientAiAccess.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No clients match your filters"
          description="Adjust AI enabled or credit status filters."
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterAiAccessGrid access={filtered} onView={openAccess} />
      )}

      <CenterAiAccessDetailSheet access={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
