"use client";

import { useState } from "react";
import { Loader2, Plus, RefreshCw } from "lucide-react";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterUpdateStats } from "@/components/center/updates/center-update-stats";
import { CenterUpdatesView } from "@/components/center/updates/center-updates-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useUpdatesData } from "@/lib/hooks/use-updates-data";

export function CenterUpdatesPageContent() {
  const {
    stats,
    versions,
    rollouts,
    fleetUpdates,
    loading,
    error,
    refresh,
    createNewRollout,
    advanceRolloutStage,
    pauseRolloutById,
    pushUpdate,
    rollbackUpdate,
  } = useUpdatesData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rolloutName, setRolloutName] = useState("");
  const [versionId, setVersionId] = useState("");
  const [stage, setStage] = useState("canary");
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateRollout() {
    if (!rolloutName.trim() || !versionId) return;
    setSubmitting(true);
    try {
      await createNewRollout(rolloutName.trim(), versionId, stage);
      setDialogOpen(false);
      setRolloutName("");
      setVersionId("");
      setStage("canary");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Updates"
        title="Update Manager"
        live
        description={
          loading
            ? "Loading version catalog and fleet rollout state…"
            : `Latest stable ${stats.latest} — staged rollouts via Edge Agent with pre-update backup and smoke validation.`
        }
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)} disabled={loading || versions.length === 0}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New rollout
            </Button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          {error}
        </div>
      ) : null}

      <CenterUpdateStats stats={stats} loading={loading} />
      <CenterUpdatesView
        fleetUpdates={fleetUpdates}
        versions={versions}
        rollouts={rollouts}
        loading={loading}
        onAdvanceRollout={advanceRolloutStage}
        onPauseRollout={pauseRolloutById}
        onPushUpdate={pushUpdate}
        onRollbackUpdate={rollbackUpdate}
      />

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent side="right" className="w-full max-w-lg overflow-y-auto" title="New staged rollout">
          <SheetTitle>New staged rollout</SheetTitle>
          <SheetDescription>
            Assign a target ERP version and initial rollout ring. Edge Agents receive update commands as stages advance.
          </SheetDescription>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollout-name">Rollout name</Label>
              <Input
                id="rollout-name"
                placeholder="2026.6.2 stable patch"
                value={rolloutName}
                onChange={(e) => setRolloutName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Target version</Label>
              <Select value={versionId} onValueChange={setVersionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ERP version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.version} ({v.channel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="canary">Canary (5%)</SelectItem>
                  <SelectItem value="early">Early adopters (10%)</SelectItem>
                  <SelectItem value="tier1">Business tier (25%)</SelectItem>
                  <SelectItem value="tier2">Professional (50%)</SelectItem>
                  <SelectItem value="ga">General availability</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => void handleCreateRollout()}
                disabled={submitting || !rolloutName.trim() || !versionId}
              >
                {submitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                Create rollout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
