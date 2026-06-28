"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { CenterClientGrid, CenterClientMobileCards } from "@/components/center/clients/client-grid";
import {
  CenterClientsToolbar,
  type CenterClientFilters,
} from "@/components/center/clients/center-clients-toolbar";
import { Button } from "@/components/ui/button";
import { fetchClients } from "@/lib/api/clients";
import { apiClientsToCenterClients } from "@/lib/adapters/center-client-adapter";
import { filterCenterClients, type CenterClient } from "@/lib/mock-data/center";

const defaultFilters: CenterClientFilters = {
  search: "",
  status: "all",
  plan: "all",
  agent: "all",
};

export function CenterClientsList({ refreshKey = 0 }: { refreshKey?: number }) {
  const [clients, setClients] = useState<CenterClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CenterClientFilters>(defaultFilters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchClients();
      setClients(apiClientsToCenterClients(data));
    } catch (e) {
      setClients([]);
      setError(e instanceof Error ? e.message : "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const filtered = useMemo(
    () =>
      filterCenterClients(clients, {
        search: filters.search,
        status: filters.status,
        plan: filters.plan,
        agent: filters.agent,
      }),
    [clients, filters],
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading clients…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Could not load clients: {error}
        </div>
      ) : null}

      <CenterClientsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={clients.length === 0 ? "No clients yet" : "No clients match your filters"}
          description={
            clients.length === 0
              ? "Add your first client store to begin fleet management."
              : "Try clearing filters or search with a different term."
          }
          action={
            clients.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
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
        Live data from Control Center API · Demo fleet pages use mock metadata until Edge Agent is connected.
        {" "}
        <Link href="/center/registrations" className="text-violet-600 hover:underline">
          Registrations
        </Link>
      </p>
    </div>
  );
}
