"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CenterApiKeyDetailSheet } from "@/components/center/settings/center-api-key-detail-sheet";
import { CenterApiKeysGrid } from "@/components/center/settings/center-api-keys-grid";
import {
  CenterApiKeysToolbar,
  type CenterApiKeyFilters,
} from "@/components/center/settings/center-api-keys-toolbar";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { Button } from "@/components/ui/button";
import {
  centerApiKeys,
  filterCenterApiKeys,
  type CenterApiKey,
} from "@/lib/mock-data/center";

const defaultFilters: CenterApiKeyFilters = {
  search: "",
  status: "all",
  ownerType: "all",
};

export function CenterApiKeysPageContent() {
  const [filters, setFilters] = useState<CenterApiKeyFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterApiKey | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => filterCenterApiKeys(centerApiKeys, filters), [filters]);

  function openKey(key: CenterApiKey) {
    setSelected(key);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Settings › API Keys"
        title="API Keys"
        count={centerApiKeys.length}
        description="Scoped access for operators, partners, and integrations — prefix display only."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/center/settings">Back to settings</Link>
            </Button>
            <Button size="sm" disabled>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create key
            </Button>
          </div>
        }
      />

      <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-4 py-3 text-xs text-muted-foreground dark:border-violet-900 dark:bg-violet-950/20">
        API keys use scoped permissions — no MFA, but rate limited. Aligns with `api_keys` table in
        Database Architecture.
      </div>

      <CenterApiKeysToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerApiKeys.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No API keys match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterApiKeysGrid keys={filtered} onView={openKey} />
      )}

      <CenterApiKeyDetailSheet apiKey={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
