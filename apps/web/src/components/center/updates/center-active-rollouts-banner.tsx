"use client";

import { Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  centerRolloutStageLabels,
  centerUpdateChannelColors,
  centerUpdateRollouts,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

export function CenterActiveRolloutsBanner() {
  const active = centerUpdateRollouts.filter((r) => r.status === "active");

  if (active.length === 0) return null;

  return (
    <div className="space-y-2">
      {active.map((rollout) => {
        const progress = Math.round((rollout.clientsComplete / rollout.clientsTotal) * 100);
        return (
          <div
            key={rollout.id}
            className="rounded-lg border border-violet-200 bg-violet-50/50 px-4 py-3 dark:border-violet-900 dark:bg-violet-950/20"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{rollout.name}</p>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {rollout.targetVersion}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerUpdateChannelColors[rollout.channel])}
                  >
                    {rollout.channel}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {centerRolloutStageLabels[rollout.stage]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rollout.clientsComplete}/{rollout.clientsTotal} complete · {rollout.clientsFailed} failed · soak
                  until {rollout.soakUntil}
                </p>
                <div className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-violet-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" className="h-8" disabled>
                  <Pause className="mr-1 h-3.5 w-3.5" />
                  Pause
                </Button>
                <Button variant="outline" size="sm" className="h-8" disabled>
                  <Play className="mr-1 h-3.5 w-3.5" />
                  Advance stage
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
