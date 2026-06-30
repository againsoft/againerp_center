"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { CenterClientGrid, CenterClientMobileCards } from "@/components/center/clients/client-grid";
import {
  CenterClientsToolbar,
  type CenterClientFilters,
} from "@/components/center/clients/center-clients-toolbar";
import { Button } from "@/components/ui/button";
import { centerClients, filterCenterClients } from "@/lib/mock-data/center";

const defaultFilters: CenterClientFilters = {
  search: "",
  status: "all",
  plan: "all",
  agent: "all",
};

export function CenterClientsList() {
  const [filters, setFilters] = useState<CenterClientFilters>(defaultFilters);

  const filtered = useMemo(
    () =>
      filterCenterClients(centerClients, {
        search: filters.search,
        status: filters.status,
        plan: filters.plan,
        agent: filters.agent,
      }),
    [filters],
  );

  return (
    <div className="space-y-4">
      <CenterClientsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No clients match your filters"
          description="Try clearing filters or search with a different term."
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <>
          <CenterClientMobileCards clients={filtered} />
          <div className="hidden md:block">
            <CenterClientGrid clients={filtered} />
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Tip: approve new tenants via{" "}
        <Link href="/registrations" className="text-violet-600 hover:underline">
          Registrations
        </Link>{" "}
        before they appear in this list.
      </p>
    </div>
  );
}
