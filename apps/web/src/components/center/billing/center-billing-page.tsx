"use client";

import Link from "next/link";
import { ClipboardList, Loader2, RefreshCw } from "lucide-react";
import { CenterBillingStats } from "@/components/center/billing/center-billing-stats";
import { CenterBillingView } from "@/components/center/billing/center-billing-view";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { useBillingData } from "@/lib/hooks/use-billing-data";
import { formatCurrency } from "@/lib/utils";

export function CenterBillingPageContent() {
  const { invoices, subscriptions, stats, pastDueClients, loading, error, refresh } = useBillingData();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Billing"
        title="Billing & Invoices"
        live
        description={
          loading
            ? "Loading fleet billing metadata…"
            : `Fleet MRR ${formatCurrency(stats.totalMrr)} — invoice metadata and payment status via tokenized gateway.`
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
            <Button asChild variant="outline" size="sm">
              <Link href="/center/subscriptions">
                <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
                Subscriptions
              </Link>
            </Button>
          </div>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          {error}
        </div>
      ) : null}

      <CenterBillingStats stats={stats} loading={loading} />
      <CenterBillingView
        invoices={invoices}
        subscriptions={subscriptions}
        stats={stats}
        pastDueClients={pastDueClients}
        loading={loading}
      />
    </div>
  );
}
