"use client";

import Link from "next/link";
import {
  Activity,
  Bot,
  CreditCard,
  KeyRound,
  Package,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { centerRecentActivity } from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const categoryConfig: Record<
  (typeof centerRecentActivity)[number]["category"],
  { icon: LucideIcon; color: string }
> = {
  license: { icon: KeyRound, color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  registration: { icon: UserPlus, color: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
  billing: { icon: CreditCard, color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
  agent: { icon: Activity, color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  update: { icon: RefreshCw, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  ai: { icon: Bot, color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300" },
  module: { icon: Package, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
};

export function CenterActivityFeed() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Recent platform activity</h2>
          <p className="text-xs text-muted-foreground">Audit trail preview — full log in UI Step 12</p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/center/audit">View audit</Link>
        </Button>
      </div>
      <div className="space-y-2">
        {centerRecentActivity.map((item) => {
          const config = categoryConfig[item.category];
          const Icon = config.icon;
          return (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-md border px-3 py-2.5 text-sm"
            >
              <div
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  config.color,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                {item.clientId ? (
                  <Link
                    href={`/center/clients/${item.clientId}`}
                    className="font-medium hover:text-violet-600 hover:underline"
                  >
                    {item.client}
                  </Link>
                ) : (
                  <p className="font-medium">{item.client}</p>
                )}
                <p className="text-xs text-muted-foreground">{item.action}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                <p>{item.time}</p>
                <p>{item.actor}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
