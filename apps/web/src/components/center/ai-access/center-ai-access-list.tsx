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
  filterCenterClientAiAccess,
  type CenterAiRecommendation,
  type CenterClientAiAccess,
} from "@/lib/mock-data/center";

const defaultFilters: CenterAiAccessFilters = {
  search: "",
  aiEnabled: "all",
  creditStatus: "all",
};

type Props = {
  fleet: CenterClientAiAccess[];
  recommendations: CenterAiRecommendation[];
  getClientAccess: (clientId: string) => CenterClientAiAccess | undefined;
};

export function CenterAiAccessList({ fleet, recommendations, getClientAccess }: Props) {
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");

  const [filters, setFilters] = useState<CenterAiAccessFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterClientAiAccess | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterClientAiAccess(fleet, filters),
    [fleet, filters],
  );

  useEffect(() => {
    if (!clientParam) return;
    const row = getClientAccess(clientParam);
    if (row) {
      setSelected(row);
      setSheetOpen(true);
    }
  }, [clientParam, getClientAccess]);

  function openAccess(row: CenterClientAiAccess) {
    setSelected(row);
    setSheetOpen(true);
  }

  function openClientFromRec(clientId: string) {
    const row = getClientAccess(clientId);
    if (row) openAccess(row);
  }

  return (
    <>
      <CenterAiRecommendations recommendations={recommendations} onViewClient={openClientFromRec} />

      <CenterAiAccessToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={fleet.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={fleet.length === 0 ? "No clients in fleet yet" : "No clients match your filters"}
          description={fleet.length === 0 ? "Approve a registration or create a client first." : "Adjust AI enabled or credit status filters."}
          action={
            fleet.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterAiAccessGrid access={filtered} onView={openAccess} />
      )}

      <CenterAiAccessDetailSheet access={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
