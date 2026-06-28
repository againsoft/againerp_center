"use client";

import { Suspense, useState } from "react";
import { CenterBillingFleetTable } from "@/components/center/billing/center-billing-fleet-table";
import { CenterBillingInvoicesList } from "@/components/center/billing/center-billing-invoices-list";
import type { BillingStats } from "@/lib/hooks/use-billing-data";
import type { CenterBillingInvoice, CenterClientSubscription } from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

const views = [
  { key: "invoices" as const, label: "Invoices" },
  { key: "mrr" as const, label: "Fleet MRR" },
];

type Props = {
  invoices: CenterBillingInvoice[];
  subscriptions: CenterClientSubscription[];
  stats: BillingStats;
  pastDueClients: string[];
  loading?: boolean;
};

export function CenterBillingView({ invoices, subscriptions, stats, pastDueClients, loading }: Props) {
  const [view, setView] = useState<"invoices" | "mrr">("invoices");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b pb-1">
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              view === v.key
                ? "bg-violet-100 font-medium text-violet-900 dark:bg-violet-950 dark:text-violet-100"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "invoices" ? (
        <Suspense fallback={null}>
          <CenterBillingInvoicesList
            invoices={invoices}
            stats={stats}
            pastDueClients={pastDueClients}
            loading={loading}
          />
        </Suspense>
      ) : (
        <CenterBillingFleetTable subscriptions={subscriptions} loading={loading} />
      )}
    </div>
  );
}
