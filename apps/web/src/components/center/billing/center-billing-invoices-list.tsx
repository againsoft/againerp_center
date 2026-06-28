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
import type { BillingStats } from "@/lib/hooks/use-billing-data";
import {
  filterCenterBillingInvoices,
  type CenterBillingInvoice,
} from "@/lib/mock-data/center";
import { formatCurrency } from "@/lib/utils";

const defaultFilters: CenterBillingInvoiceFilters = {
  search: "",
  status: "all",
};

type Props = {
  invoices: CenterBillingInvoice[];
  stats: BillingStats;
  pastDueClients: string[];
  loading?: boolean;
};

export function CenterBillingInvoicesList({ invoices, stats, pastDueClients, loading }: Props) {
  const searchParams = useSearchParams();
  const invoiceParam = searchParams.get("invoice");

  const [filters, setFilters] = useState<CenterBillingInvoiceFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterBillingInvoice | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(
    () => filterCenterBillingInvoices(invoices, filters),
    [invoices, filters],
  );

  useEffect(() => {
    if (!invoiceParam) return;
    const inv = invoices.find((i) => i.id === invoiceParam);
    if (inv) {
      setSelected(inv);
      setSheetOpen(true);
    }
  }, [invoiceParam, invoices]);

  function openInvoice(inv: CenterBillingInvoice) {
    setSelected(inv);
    setSheetOpen(true);
  }

  if (loading && invoices.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Loading invoices…
      </div>
    );
  }

  return (
    <>
      {stats.pastDueAmount > 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          <strong>{formatCurrency(stats.pastDueAmount)}</strong> past due
          {pastDueClients.length > 0 ? (
            <> — {pastDueClients.join(", ")} subscription(s) at risk. Review dunning before license reinstatement.</>
          ) : (
            <> — review dunning workflow before license reinstatement.</>
          )}
        </div>
      ) : null}

      <CenterBillingInvoicesToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={invoices.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title={invoices.length === 0 ? "No invoices yet" : "No invoices match your filters"}
          description={
            invoices.length === 0
              ? "Invoices are created when subscriptions renew or via Stripe webhooks."
              : undefined
          }
          action={
            invoices.length === 0 ? undefined : (
              <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <CenterBillingInvoicesGrid invoices={filtered} onView={openInvoice} />
      )}

      <CenterBillingInvoiceSheet invoice={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}
