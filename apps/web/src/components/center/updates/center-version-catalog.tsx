"use client";

import { Badge } from "@/components/ui/badge";
import {
  centerErpVersions,
  centerRolloutStageLabels,
  centerUpdateChannelColors,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

export function CenterVersionCatalog() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {centerErpVersions.map((ver) => (
        <div
          key={ver.id}
          className="flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="font-mono text-lg font-semibold">{ver.version}</h2>
              <p className="text-xs text-muted-foreground">{ver.summary}</p>
            </div>
            {ver.isLatest ? (
              <Badge className="shrink-0 bg-violet-600 hover:bg-violet-600">Latest</Badge>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            <Badge
              variant="secondary"
              className={cn("capitalize text-[10px]", centerUpdateChannelColors[ver.channel])}
            >
              {ver.channel}
            </Badge>
            <Badge variant="outline" className="capitalize text-[10px]">
              {ver.type}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {centerRolloutStageLabels[ver.rolloutStage]}
            </Badge>
          </div>

          <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <dt>Released</dt>
              <dd>{ver.releasedAt}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Min agent</dt>
              <dd className="font-mono">{ver.agentMinVersion}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
