"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Plus } from "lucide-react";
import { CenterApiKeyDetailSheet } from "@/components/center/settings/center-api-key-detail-sheet";
import { CenterApiKeysGrid } from "@/components/center/settings/center-api-keys-grid";
import {
  CenterApiKeysToolbar,
  type CenterApiKeyFilters,
} from "@/components/center/settings/center-api-keys-toolbar";
import { StepUpMfaSheet, isStepUpRequired } from "@/components/center/settings/step-up-mfa-sheet";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { filterCenterApiKeys, type CenterApiKey } from "@/lib/mock-data/center";
import { useApiKeysData } from "@/lib/hooks/use-api-keys-data";

const defaultFilters: CenterApiKeyFilters = {
  search: "",
  status: "all",
  ownerType: "all",
};

export function CenterApiKeysPageContent() {
  const { keys, loading, error, revoke, create, refresh } = useApiKeysData();
  const [filters, setFilters] = useState<CenterApiKeyFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterApiKey | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"create" | "revoke" | null>(null);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [createOwner, setCreateOwner] = useState("");
  const [creating, setCreating] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = useMemo(() => filterCenterApiKeys(keys, filters), [keys, filters]);

  function openKey(key: CenterApiKey) {
    setSelected(key);
    setSheetOpen(true);
  }

  async function doCreate() {
    setCreating(true);
    setFormError(null);
    try {
      const secret = await create({
        name: createName.trim(),
        owner_label: createOwner.trim(),
        owner_type: "integration",
      });
      setNewSecret(secret);
      setCreateName("");
      setCreateOwner("");
    } catch (err) {
      if (isStepUpRequired(err)) {
        setPendingAction("create");
        setStepUpOpen(true);
        return;
      }
      setFormError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function doRevoke(id: string) {
    try {
      await revoke(id);
      setSheetOpen(false);
    } catch (err) {
      if (isStepUpRequired(err)) {
        setPendingRevokeId(id);
        setPendingAction("revoke");
        setStepUpOpen(true);
        return;
      }
      throw err;
    }
  }

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Settings › API Keys"
        title="API Keys"
        live
        count={keys.length}
        description="Scoped access for operators, partners, and integrations — prefix display only."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/center/settings">Back to settings</Link>
            </Button>
            <Button size="sm" onClick={() => { setCreateOpen(true); setNewSecret(null); }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create key
            </Button>
          </div>
        }
      />

      <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-4 py-3 text-xs text-muted-foreground dark:border-violet-900 dark:bg-violet-950/20">
        API keys use scoped permissions — no MFA at request time, but creation and revoke require step-up MFA when enabled.
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading API keys…
        </div>
      ) : error ? (
        <CenterEmptyState title="Failed to load API keys" description={error} action={
          <Button variant="outline" size="sm" onClick={() => void refresh()}>Retry</Button>
        } />
      ) : (
        <>
          <CenterApiKeysToolbar
            filters={filters}
            onChange={setFilters}
            resultCount={filtered.length}
            totalCount={keys.length}
          />

          {filtered.length === 0 ? (
            <CenterEmptyState
              title={keys.length === 0 ? "No API keys yet" : "No API keys match your filters"}
              action={
                keys.length === 0 ? undefined : (
                  <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                    Reset filters
                  </Button>
                )
              }
            />
          ) : (
            <CenterApiKeysGrid keys={filtered} onView={openKey} />
          )}
        </>
      )}

      <CenterApiKeyDetailSheet
        apiKey={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRevoke={(id) => void doRevoke(id)}
      />

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full max-w-sm" title="Create API key">
          <SheetTitle>Create API key</SheetTitle>
          <SheetDescription>Secret shown once — copy before closing.</SheetDescription>
          {newSecret ? (
            <div className="mt-6 space-y-3">
              <p className="text-xs text-muted-foreground">Copy this secret now — it will not be shown again.</p>
              <code className="block rounded border bg-muted p-3 text-xs font-mono break-all">{newSecret}</code>
              <Button className="w-full" onClick={() => { setCreateOpen(false); setNewSecret(null); }}>
                Done
              </Button>
            </div>
          ) : (
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => { e.preventDefault(); void doCreate(); }}
            >
              <div>
                <label className="text-xs font-medium">Name</label>
                <Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="SIEM export" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Owner label</label>
                <Input value={createOwner} onChange={(e) => setCreateOwner(e.target.value)} placeholder="Security integration" className="mt-1" />
              </div>
              {formError ? <p className="text-xs text-red-600">{formError}</p> : null}
              <Button type="submit" className="w-full" disabled={creating || !createName.trim() || !createOwner.trim()}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>

      <StepUpMfaSheet
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        title="Verify to manage API keys"
        description="Creating or revoking API keys requires step-up MFA."
        onVerified={async () => {
          if (pendingAction === "create") {
            await doCreate();
          } else if (pendingAction === "revoke" && pendingRevokeId) {
            await doRevoke(pendingRevokeId);
          }
          setPendingAction(null);
          setPendingRevokeId(null);
        }}
      />
    </div>
  );
}
