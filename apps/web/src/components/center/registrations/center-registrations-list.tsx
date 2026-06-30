"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useMemo, useState } from "react";
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
import {
  centerRegistrations,
  filterCenterRegistrations,
  getCenterPendingRegistrationCount,
  type CenterRegistration,
} from "@/lib/mock-data/center";

const defaultFilters: CenterRegistrationFilters = {
  search: "",
  status: "all",
};

export function CenterRegistrationsList() {
  const [registrations, setRegistrations] = useState(centerRegistrations);
  const [filters, setFilters] = useState<CenterRegistrationFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterRegistration | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterRegistrations(registrations, filters),
    [registrations, filters],
  );

  const pendingCount = getCenterPendingRegistrationCount(registrations);

  function openReview(reg: CenterRegistration) {
    setSelected(reg);
    setSheetOpen(true);
  }

  function handleApprove(id: string, notes?: string) {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "approved" as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "Super Admin",
              operatorNotes: notes ?? r.operatorNotes,
            }
          : r,
      ),
    );
  }

  function handleReject(id: string, reason: string) {
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "rejected" as const,
              reviewedAt: new Date().toISOString(),
              reviewedBy: "Super Admin",
              rejectionReason: reason,
            }
          : r,
      ),
    );
  }

  return (
    <>
      {pendingCount > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          <strong>{pendingCount}</strong> registration{pendingCount > 1 ? "s" : ""} awaiting review.
          Prototype approve/reject updates local state only.
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
          title="No registrations match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
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
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
}
