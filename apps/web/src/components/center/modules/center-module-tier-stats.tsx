"use client";

import { Loader2 } from "lucide-react";
import type { ModuleTierStats } from "@/lib/hooks/use-modules-data";

const tiers = ["core", "growth", "premium"] as const;

type Props = {
  stats: ModuleTierStats;
  loading?: boolean;
};

export function CenterModuleTierStats({ stats, loading }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiers.map((tier) => {
        const tierStats = stats[tier];
        return (
          <div key={tier} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium capitalize text-muted-foreground">{tier} tier</p>
                <p className="text-2xl font-semibold">{loading ? "…" : tierStats.count}</p>
                <p className="text-[10px] text-muted-foreground">
                  {loading ? "…" : `${tierStats.defaults} platform defaults`}
                </p>
              </div>
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
