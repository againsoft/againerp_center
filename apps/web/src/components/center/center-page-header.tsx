"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  breadcrumb: string;
  title: string;
  count?: number;
  description?: string;
  actions?: React.ReactNode;
  preview?: boolean;
  className?: string;
};

export function CenterPageHeader({
  breadcrumb,
  title,
  count,
  description,
  actions,
  preview = true,
  className,
}: Props) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <p className="page-subtitle">{breadcrumb}</p>
        <h1 className="page-title">
          {title}
          {count != null ? (
            <span className="ml-2 text-base font-normal text-muted-foreground">({count})</span>
          ) : null}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {preview ? (
          <Badge variant="outline" className="border-violet-300 text-violet-700 dark:text-violet-300">
            UI Preview
          </Badge>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
