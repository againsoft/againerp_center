"use client";

import { Badge } from "@/components/ui/badge";
import { centerPlatformAiAgents } from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

export function CenterPlatformAiAgents() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {centerPlatformAiAgents.map((agent) => (
        <div key={agent.id} className="rounded-xl border bg-card p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h2 className="font-semibold">{agent.label}</h2>
            <Badge
              variant="secondary"
              className={cn(
                "capitalize text-[10px]",
                agent.status === "active"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {agent.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{agent.description}</p>
          <p className="mt-2 text-[10px] font-medium text-violet-700 dark:text-violet-300">
            {agent.autonomy}
          </p>
        </div>
      ))}
      <div className="col-span-full rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground md:col-span-2">
        Platform AI agents operate on Control Center metadata only — never client business database
        contents. Destructive actions require operator approval (Automation AI human-in-the-loop).
      </div>
    </div>
  );
}
