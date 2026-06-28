"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  centerAiRecommendations,
  centerPlatformAiAgentLabels,
  type CenterAiRecommendation,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  onViewClient?: (clientId: string) => void;
};

const severityStyles = {
  info: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
  action: "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30",
};

export function CenterAiRecommendations({ onViewClient }: Props) {
  const active = centerAiRecommendations.filter((r) => !r.dismissed);

  if (active.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
        No pending AI recommendations — fleet provisioning looks healthy.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {active.map((rec) => (
        <RecommendationRow key={rec.id} rec={rec} onViewClient={onViewClient} />
      ))}
    </div>
  );
}

function RecommendationRow({
  rec,
  onViewClient,
}: {
  rec: CenterAiRecommendation;
  onViewClient?: (clientId: string) => void;
}) {
  return (
    <div className={cn("rounded-lg border px-4 py-3", severityStyles[rec.severity])}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{rec.title}</p>
            <Badge variant="outline" className="text-[10px]">
              {centerPlatformAiAgentLabels[rec.agent]}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{rec.detail}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {rec.clientId ? (
            onViewClient ? (
              <Button variant="outline" size="sm" className="h-8" onClick={() => onViewClient(rec.clientId!)}>
                View client
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="h-8">
                <Link href={`/center/ai-access?client=${rec.clientId}`}>View client</Link>
              </Button>
            )
          ) : null}
          <Button variant="ghost" size="sm" className="h-8" disabled>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
