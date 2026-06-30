"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CenterBillingInvoiceSheet } from "@/components/center/billing/center-billing-invoice-sheet";
import { CenterBillingInvoicesGrid } from "@/components/center/billing/center-billing-invoices-grid";
import {
  CenterBillingInvoicesToolbar,
  type CenterBillingInvoiceFilters,
} from "@/components/center/billing/center-billing-invoices-toolbar";
import { Button } from "@/components/ui/button";
import {
  centerBillingInvoices,
  filterCenterBillingInvoices,
  getCenterBillingInvoice,
  getCenterBillingStats,
  type CenterBillingInvoice,
} from "@/lib/mock-data/center";
import { formatCurrency } from "@/lib/utils";

const defaultFilters: CenterBillingInvoiceFilters = {
  search: "",
  status: "all",
};

export function CenterBillingInvoicesList() {
  const searchParams = useSearchParams();
  const invoiceParam = searchParams.get("invoice");

  const [filters, setFilters] = useState<CenterBillingInvoiceFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterBillingInvoice | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterBillingInvoices(centerBillingInvoices, filters),
    [filters],
  );

  const stats = getCenterBillingStats();

  useEffect(() => {
    if (!invoiceParam) return;
    const inv = getCenterBillingInvoice(invoiceParam);
    if (inv) {
      setSelected(inv);
      setSheetOpen(true);
    }
  }, [invoiceParam]);

  function openInvoice(inv: CenterBillingInvoice) {
    setSelected(inv);
    setSheetOpen(true);
  }

  return (
    <>
      {stats.pastDueAmount > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          <strong>{formatCurrency(stats.pastDueAmount)}</strong> past due — StyleHub Fashion
          subscription suspended. Review dunning workflow before license reinstatement.
        </div>
      ) : null}

      <CenterBillingInvoicesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerBillingInvoices.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No invoices match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterBillingInvoicesGrid invoices={filtered} onView={openInvoice} />
      )}

      <CenterBillingInvoiceSheet invoice={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
