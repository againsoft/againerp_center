"use client";

import { Suspense, useState } from "react";
import { CenterAiAccessList } from "@/components/center/ai-access/center-ai-access-list";
import { CenterPlatformAiAgents } from "@/components/center/ai-access/center-platform-ai-agents";
import { cn } from "@/lib/utils";

const views = [
  { key: "fleet" as const, label: "Fleet provisioning" },
  { key: "platform" as const, label: "Platform AI agents" },
];

export function CenterAiAccessView() {
  const [view, setView] = useState<"fleet" | "platform">("fleet");

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

      {view === "fleet" ? (
        <Suspense fallback={null}>
          <CenterAiAccessList />
        </Suspense>
      ) : (
        <CenterPlatformAiAgents />
      )}
    </div>
  );
}
