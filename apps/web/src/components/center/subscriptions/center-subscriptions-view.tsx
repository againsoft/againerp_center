"use client";

import { useState } from "react";
import { CenterFleetSubscriptionsTable } from "@/components/center/subscriptions/center-fleet-subscriptions-table";
import { CenterPlanCatalog } from "@/components/center/subscriptions/center-plan-catalog";
import { cn } from "@/lib/utils";

const views = [
  { key: "plans" as const, label: "Plan catalog" },
  { key: "fleet" as const, label: "Fleet subscriptions" },
];

export function CenterSubscriptionsView() {
  const [view, setView] = useState<"plans" | "fleet">("plans");

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

      {view === "plans" ? <CenterPlanCatalog /> : <CenterFleetSubscriptionsTable />}
    </div>
  );
}
