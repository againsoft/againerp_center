"use client";

import { Bot, Cpu, Sparkles, TrendingUp } from "lucide-react";
import { getCenterAiStats } from "@/lib/mock-data/center";

export function CenterAiStats() {
  const stats = getCenterAiStats();

  const cards = [
    {
      label: "AI enabled",
      value: stats.enabled,
      sub: `of ${stats.fleet} clients`,
      icon: Bot,
      tone: "text-violet-600",
    },
    {
      label: "Agents active",
      value: `${stats.agentsActive}/${stats.agentsAllocated}`,
      sub: "allocated fleet-wide",
      icon: Cpu,
      tone: "text-sky-600",
    },
    {
      label: "Credit usage",
      value: `${stats.creditPct}%`,
      sub: `${stats.creditWarnings} near limit`,
      icon: TrendingUp,
      tone: stats.creditWarnings > 0 ? "text-amber-600" : "text-emerald-600",
    },
    {
      label: "AI recommendations",
      value: stats.recommendations,
      sub: "awaiting review",
      icon: Sparkles,
      tone: "text-violet-600",
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
