"use client";

import { centerModules } from "@/lib/mock-data/center";

const tiers = ["core", "growth", "premium"] as const;

export function CenterModuleTierStats() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiers.map((tier) => {
        const count = centerModules.filter((m) => m.tier === tier).length;
        const defaults = centerModules.filter((m) => m.tier === tier && m.platformDefault).length;
        return (
          <div key={tier} className="rounded-lg border bg-card p-3">
            <p className="text-xs font-medium capitalize text-muted-foreground">{tier} tier</p>
            <p className="text-2xl font-semibold">{count}</p>
            <p className="text-[10px] text-muted-foreground">{defaults} platform defaults</p>
          </div>
        );
      })}
    </div>
  );
}
