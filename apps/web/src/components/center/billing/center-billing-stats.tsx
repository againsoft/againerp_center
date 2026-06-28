"use client";

import { AlertCircle, CheckCircle2, Loader2, Receipt, TrendingUp } from "lucide-react";
import type { BillingStats } from "@/lib/hooks/use-billing-data";
import { formatCurrency } from "@/lib/utils";

type Props = {
  stats: BillingStats;
  loading?: boolean;
};

export function CenterBillingStats({ stats, loading }: Props) {
  const monthLabel = new Date().toLocaleDateString("en-GB", { month: "short" });

  const cards = [
    {
      label: "Fleet MRR",
      value: loading ? "…" : formatCurrency(stats.totalMrr),
      sub: "recurring revenue metadata",
      icon: TrendingUp,
      tone: "text-violet-600",
    },
    {
      label: "Open invoices",
      value: loading ? "…" : stats.openInvoices,
      sub: "awaiting payment",
      icon: Receipt,
      tone: stats.openInvoices > 0 ? "text-sky-600" : "text-muted-foreground",
    },
    {
      label: "Past due",
      value: loading ? "…" : formatCurrency(stats.pastDueAmount),
      sub: "requires dunning",
      icon: AlertCircle,
      tone: stats.pastDueAmount > 0 ? "text-red-600" : "text-muted-foreground",
    },
    {
      label: `Collected (${monthLabel})`,
      value: loading ? "…" : formatCurrency(stats.paidThisMonth),
      sub: loading ? "…" : `${stats.invoiceCount} invoices on file`,
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold">{card.value}</p>
              <p className="text-[10px] text-muted-foreground">{card.sub}</p>
            </div>
            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <card.icon className={`h-4 w-4 shrink-0 ${card.tone}`} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
