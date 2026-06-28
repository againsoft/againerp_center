"use client";

import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

type Props = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
};

export function CenterEmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: Props) {
  return (
    <div className="rounded-lg border border-dashed bg-muted/10 px-6 py-12 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950/50">
        <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden />
      </div>
      <p className="mt-3 text-sm font-medium">{title}</p>
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  );
}
