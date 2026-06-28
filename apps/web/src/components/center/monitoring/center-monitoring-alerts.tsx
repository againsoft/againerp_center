"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  centerMonitoringAlertColors,
  centerMonitoringAlerts,
  type CenterMonitoringAlert,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  onViewClient?: (clientId: string) => void;
};

export function CenterMonitoringAlerts({ onViewClient }: Props) {
  const active = centerMonitoringAlerts.filter((a) => !a.acknowledged);

  if (active.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
        All agent heartbeat checks clear — no unacknowledged monitoring alerts.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {active.map((alert) => (
        <AlertRow key={alert.id} alert={alert} onViewClient={onViewClient} />
      ))}
    </div>
  );
}

function AlertRow({
  alert,
  onViewClient,
}: {
  alert: CenterMonitoringAlert;
  onViewClient?: (clientId: string) => void;
}) {
  return (
    <div className={cn("rounded-lg border px-4 py-3", centerMonitoringAlertColors[alert.severity])}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{alert.title}</p>
            <Badge variant="outline" className="font-mono text-[10px]">
              {alert.rule}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{alert.detail}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{alert.time}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {alert.clientId ? (
            onViewClient ? (
              <Button variant="outline" size="sm" className="h-8" onClick={() => onViewClient(alert.clientId!)}>
                View agent
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm" className="h-8">
                <Link href={`/center/monitoring?client=${alert.clientId}`}>View agent</Link>
              </Button>
            )
          ) : null}
          <Button variant="ghost" size="sm" className="h-8" disabled>
            Acknowledge
          </Button>
        </div>
      </div>
    </div>
  );
}
