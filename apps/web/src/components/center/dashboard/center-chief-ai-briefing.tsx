"use client";

import Link from "next/link";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  centerChiefAiBriefing,
  centerPlatformAiAgentLabels,
  type CenterChiefBriefingInsight,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

const sourceBadgeStyles: Record<CenterChiefBriefingInsight["source"], string> = {
  chief: "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300",
  health: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  recommendation:
    "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  update: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  license: "border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300",
  monitoring:
    "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-300",
  automation:
    "border-slate-300 bg-slate-50 text-slate-800 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300",
};

export function CenterChiefAiBriefing() {
  const briefing = centerChiefAiBriefing;

  return (
    <section
      className="rounded-lg border border-violet-200/80 bg-gradient-to-br from-violet-50/90 via-card to-card p-4 dark:border-violet-900/60 dark:from-violet-950/20"
      aria-labelledby="chief-ai-briefing-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
            <Sparkles className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="chief-ai-briefing-title" className="text-sm font-medium">
                Chief AI — Daily briefing
              </h2>
              <Badge variant="outline" className="text-[10px]">
                {briefing.generatedAt}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{briefing.summary}</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/center/ai-access">
            <Bot className="mr-1.5 h-3.5 w-3.5" />
            Platform AI agents
          </Link>
        </Button>
      </div>

      <ul className="mt-4 space-y-2.5">
        {briefing.insights.map((insight) => (
          <li
            key={insight.id}
            className="flex flex-wrap items-start justify-between gap-2 rounded-md border bg-background/70 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1 space-y-1.5">
              <Badge
                variant="outline"
                className={cn("text-[10px] font-normal", sourceBadgeStyles[insight.source])}
              >
                {centerPlatformAiAgentLabels[insight.source]}
              </Badge>
              <p className="text-xs leading-relaxed text-foreground/90">{insight.text}</p>
            </div>
            {insight.href && insight.hrefLabel ? (
              <Link
                href={insight.href}
                className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-violet-600 hover:underline"
              >
                {insight.hrefLabel}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : null}
          </li>
        ))}
      </ul>

      {briefing.creditNote ? (
        <p className="mt-3 text-[11px] text-muted-foreground">{briefing.creditNote}</p>
      ) : null}
    </section>
  );
}
