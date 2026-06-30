"use client";

import { useState } from "react";
import { CenterActiveRolloutsBanner } from "@/components/center/updates/center-active-rollouts-banner";
import { CenterFleetUpdatesList } from "@/components/center/updates/center-fleet-updates-list";
import { CenterVersionCatalog } from "@/components/center/updates/center-version-catalog";
import { cn } from "@/lib/utils";

const views = [
  { key: "fleet" as const, label: "Fleet updates" },
  { key: "versions" as const, label: "Version catalog" },
];

export function CenterUpdatesView() {
  const [view, setView] = useState<"fleet" | "versions">("fleet");

  return (
    <div className="space-y-4">
      <CenterActiveRolloutsBanner />

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

      {view === "fleet" ? <CenterFleetUpdatesList /> : <CenterVersionCatalog />}
    </div>
  );
}
