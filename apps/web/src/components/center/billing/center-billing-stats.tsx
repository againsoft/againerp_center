"use client";

import { AlertCircle, CheckCircle2, Receipt, TrendingUp } from "lucide-react";
import { getCenterBillingStats } from "@/lib/mock-data/center";
import { formatCurrency } from "@/lib/utils";

export function CenterBillingStats() {
  const stats = getCenterBillingStats();

  const cards = [
    {
      label: "Fleet MRR",
      value: formatCurrency(stats.totalMrr),
      sub: "recurring revenue metadata",
      icon: TrendingUp,
      tone: "text-violet-600",
    },
    {
      label: "Open invoices",
      value: stats.openInvoices,
      sub: "awaiting payment",
      icon: Receipt,
      tone: stats.openInvoices > 0 ? "text-sky-600" : "text-muted-foreground",
    },
    {
      label: "Past due",
      value: formatCurrency(stats.pastDueAmount),
      sub: "requires dunning",
      icon: AlertCircle,
      tone: stats.pastDueAmount > 0 ? "text-red-600" : "text-muted-foreground",
    },
    {
      label: "Collected (Jun)",
      value: formatCurrency(stats.paidThisMonth),
      sub: `${stats.invoiceCount} invoices on file`,
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
            <card.icon className={`h-4 w-4 shrink-0 ${card.tone}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
