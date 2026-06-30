"use client";

import { CloudOff, FileSearch, KeyRound, ListTodo, Radio, ShieldAlert } from "lucide-react";
import { getCenterAgentConsoleStats } from "@/lib/mock-data/center";

export function CenterAgentStats() {
  const stats = getCenterAgentConsoleStats();

  const cards = [
    {
      label: "In flight",
      value: stats.pendingCommands,
      sub: "queued · delivered · running",
      icon: ListTodo,
      tone: "text-violet-600",
    },
    {
      label: "Succeeded",
      value: stats.succeededToday,
      sub: "recent completions",
      icon: Radio,
      tone: "text-emerald-600",
    },
    {
      label: "Failed / expired",
      value: stats.failedOrExpired,
      sub: "needs review",
      icon: ShieldAlert,
      tone: "text-red-600",
    },
    {
      label: "Pending activations",
      value: stats.pendingActivations,
      sub: "bootstrap bundles",
      icon: KeyRound,
      tone: "text-amber-600",
    },
    {
      label: "Offline agents",
      value: stats.offlineAgents,
      sub: `${stats.queuedItems} queued items`,
      icon: CloudOff,
      tone: "text-red-600",
    },
    {
      label: "Diagnostics",
      value: stats.diagnosticsReady,
      sub: `${stats.diagnosticsPending} in progress`,
      icon: FileSearch,
      tone: "text-sky-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
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
