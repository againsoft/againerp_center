"use client";

import { Key, Shield, Users } from "lucide-react";
import { getCenterSettingsStats } from "@/lib/mock-data/center";

export function CenterSettingsStats() {
  const stats = getCenterSettingsStats();

  const cards = [
    {
      label: "Operators",
      value: stats.activeOperators,
      sub: `${stats.invited} invited · ${stats.operators} total`,
      icon: Users,
      tone: "text-violet-600",
    },
    {
      label: "Active API keys",
      value: stats.apiKeys,
      sub: `${stats.revokedKeys} revoked`,
      icon: Key,
      tone: "text-sky-600",
    },
    {
      label: "MFA policy",
      value: "Required",
      sub: "all operators",
      icon: Shield,
      tone: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
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
