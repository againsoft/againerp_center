"use client";

import { AlertCircle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { getCenterUpdateStats } from "@/lib/mock-data/center";

export function CenterUpdateStats() {
  const stats = getCenterUpdateStats();

  const cards = [
    {
      label: "Latest stable",
      value: stats.latest,
      sub: "current GA target",
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
    {
      label: "Up to date",
      value: stats.upToDate,
      sub: "fleet clients",
      icon: CheckCircle2,
      tone: "text-violet-600",
    },
    {
      label: "Pending updates",
      value: stats.pending,
      sub: "scheduled or available",
      icon: Clock,
      tone: "text-sky-600",
    },
    {
      label: "Failed / rollback",
      value: stats.failed,
      sub: `${stats.activeRollouts} active rollout${stats.activeRollouts !== 1 ? "s" : ""}`,
      icon: stats.failed > 0 ? AlertCircle : RefreshCw,
      tone: stats.failed > 0 ? "text-red-600" : "text-muted-foreground",
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
