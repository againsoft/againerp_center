"use client";

import Link from "next/link";
import { AlertTriangle, ChevronRight, Info } from "lucide-react";
import {
  centerDashboardAlerts,
  type CenterDashboardAlertSeverity,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

const severityStyles: Record<
  CenterDashboardAlertSeverity,
  { row: string; icon: string; Icon: typeof AlertTriangle }
> = {
  critical: {
    row: "border-red-200 bg-red-50/80 dark:border-red-900 dark:bg-red-950/30",
    icon: "text-red-600",
    Icon: AlertTriangle,
  },
  warning: {
    row: "border-amber-200 bg-amber-50/80 dark:border-amber-900 dark:bg-amber-950/30",
    icon: "text-amber-600",
    Icon: AlertTriangle,
  },
  info: {
    row: "border-sky-200 bg-sky-50/80 dark:border-sky-900 dark:bg-sky-950/30",
    icon: "text-sky-600",
    Icon: Info,
  },
};

export function CenterAlertsBanner() {
  const critical = centerDashboardAlerts.filter((a) => a.severity === "critical").length;
  const warning = centerDashboardAlerts.filter((a) => a.severity === "warning").length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium">Operational alerts</h2>
          <p className="text-xs text-muted-foreground">
            {critical} critical · {warning} warning · from Edge Agent + billing events
          </p>
        </div>
        <Link
          href="/center/monitoring"
          className="text-xs font-medium text-violet-600 hover:underline"
        >
          Open monitoring
        </Link>
      </div>
      <div className="grid gap-2 lg:grid-cols-2">
        {centerDashboardAlerts.map((alert) => {
          const style = severityStyles[alert.severity];
          const Icon = style.Icon;
          return (
            <Link
              key={alert.id}
              href={alert.href}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-opacity hover:opacity-90",
                style.row,
              )}
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.icon)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.detail}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <span>{alert.time}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
