"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CenterRegistrationsGrid,
  CenterRegistrationsMobileCards,
} from "@/components/center/registrations/center-registrations-grid";
import { CenterRegistrationReviewSheet } from "@/components/center/registrations/center-registration-review-sheet";
import {
  CenterRegistrationsToolbar,
  type CenterRegistrationFilters,
} from "@/components/center/registrations/center-registrations-toolbar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  apiRegistrationsToCenterRegistrations,
  countPendingRegistrations,
} from "@/lib/adapters/center-registration-adapter";
import {
  approveRegistration,
  fetchRegistrations,
  rejectRegistration,
} from "@/lib/api/registrations";
import {
  filterCenterRegistrations,
  type CenterRegistration,
} from "@/lib/mock-data/center";
import { StepUpMfaSheet, isStepUpRequired } from "@/components/center/settings/step-up-mfa-sheet";

const defaultFilters: CenterRegistrationFilters = {
  search: "",
  status: "all",
};

type Props = {
  refreshKey?: number;
  onStatsChange?: (stats: { pending: number; total: number }) => void;
};

export function CenterRegistrationsList({ refreshKey = 0, onStatsChange }: Props) {
  const [registrations, setRegistrations] = useState<CenterRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CenterRegistrationFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterRegistration | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [provisionResult, setProvisionResult] = useState<{
    clientId: string;
    agentToken: string;
  } | null>(null);

  const [stepUpOpen, setStepUpOpen] = useState(false);
  const [pendingApprove, setPendingApprove] = useState<{ id: string; notes?: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRegistrations();
      const mapped = apiRegistrationsToCenterRegistrations(data);
      setRegistrations(mapped);
      onStatsChange?.({ pending: countPendingRegistrations(data), total: data.length });
    } catch {
      setRegistrations([]);
      onStatsChange?.({ pending: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [onStatsChange]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const filtered = useMemo(
    () => filterCenterRegistrations(registrations, filters),
    [registrations, filters],
  );

  const pendingCount = registrations.filter((r) => r.status === "pending_review").length;

  function openReview(reg: CenterRegistration) {
    setProvisionResult(null);
    setSelected(reg);
    setSheetOpen(true);
  }

  async function doApprove(id: string, notes?: string) {
    const result = await approveRegistration(id, notes);
    setProvisionResult({ clientId: result.client_id, agentToken: result.agent_token });
    await load();
  }

  async function handleApprove(id: string, notes?: string) {
    try {
      await doApprove(id, notes);
    } catch (err) {
      if (isStepUpRequired(err)) {
        setPendingApprove({ id, notes });
        setStepUpOpen(true);
        return;
      }
      throw err;
    }
  }

  async function handleReject(id: string, reason: string) {
    await rejectRegistration(id, reason);
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading registrations…
      </div>
    );
  }

  return (
    <>
      {pendingCount > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>{pendingCount}</strong> registration{pendingCount > 1 ? "s" : ""} awaiting review.
          Approve to auto-provision client, subscription, license, and agent token.
        </div>
      ) : null}

      {provisionResult ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="font-medium text-emerald-900 dark:text-emerald-200">Client provisioned</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Client ID: <code className="rounded bg-muted px-1">{provisionResult.clientId}</code>
          </p>
          <p className="mt-2 text-xs font-medium">Edge Agent token (save now):</p>
          <code className="mt-1 block break-all rounded-md bg-background p-2 font-mono text-xs">
            {provisionResult.agentToken}
          </code>
        </div>
      ) : null}

      <CenterRegistrationsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        registrations={registrations}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={registrations.length === 0 ? "No registrations yet" : "No registrations match your filters"}
          description={
            registrations.length === 0
              ? "Use Manual registration to add a signup for review."
              : "Try clearing filters."
          }
          action={
            registrations.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <>
          <CenterRegistrationsMobileCards registrations={filtered} onReview={openReview} />
          <CenterRegistrationsGrid registrations={filtered} onReview={openReview} />
        </>
      )}

      <CenterRegistrationReviewSheet
        registration={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onApprove={(id, notes) => void handleApprove(id, notes)}
        onReject={(id, reason) => void handleReject(id, reason)}
      />

      <StepUpMfaSheet
        open={stepUpOpen}
        onOpenChange={setStepUpOpen}
        title="Verify to approve registration"
        description="Registration approval is a high-risk action. Enter your TOTP code to continue."
        onVerified={async () => {
          if (pendingApprove) {
            await doApprove(pendingApprove.id, pendingApprove.notes);
            setPendingApprove(null);
          }
        }}
      />
    </>
  );
}
