"use client";

import { Database, Plug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Sidebar / compact menu — icon only */
  compact?: boolean;
};

export function CenterLiveDataBadge({ className, compact = false }: Props) {
  if (compact) {
    return (
      <span
        className={cn("inline-flex shrink-0 items-center gap-0.5", className)}
        title="Live API + PostgreSQL"
      >
        <Plug className="h-3 w-3 text-sky-600 dark:text-sky-400" aria-hidden />
        <Database className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden />
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Badge
        variant="outline"
        className="gap-1 border-sky-300 bg-sky-50 text-[10px] text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300"
      >
        <Plug className="h-3 w-3" aria-hidden />
        Live API
      </Badge>
      <Badge
        variant="outline"
        className="gap-1 border-emerald-300 bg-emerald-50 text-[10px] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
      >
        <Database className="h-3 w-3" aria-hidden />
        Live DB
      </Badge>
    </div>
  );
}
