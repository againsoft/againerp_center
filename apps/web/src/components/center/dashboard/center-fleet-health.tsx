"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import type { DashboardFleetItem, DashboardStats } from "@/lib/adapters/center-dashboard-adapter";
import { centerDbStatusColors, centerStatusColors } from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

const agentStatusLabel: Record<string, string> = {
  connected: "online",
  degraded: "degraded",
  offline: "offline",
  pending: "pending",
};

type Props = {
  fleet: DashboardFleetItem[];
  stats: DashboardStats;
};

export function CenterFleetHealth({ fleet, stats }: Props) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-violet-600" />
          <div>
            <h2 className="text-sm font-medium">Fleet health</h2>
            <p className="text-xs text-muted-foreground">
              Agent heartbeat status · {stats.agentsOnline} online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats.agentsAlert > 0 ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {stats.agentsAlert} alert{stats.agentsAlert > 1 ? "s" : ""}
            </Badge>
          ) : stats.total > 0 ? (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              All clear
            </Badge>
          ) : null}
          <Button asChild variant="ghost" size="sm">
            <Link href="/center/clients">All clients</Link>
          </Button>
        </div>
      </div>

      {fleet.length === 0 ? (
        <CenterEmptyState
          title="No clients in fleet"
          description="Add a client and start Edge Agent to see health status here."
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.map((client) => (
            <Link
              key={client.id}
              href={client.href}
              className="flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors hover:bg-accent"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{client.businessName}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerStatusColors[client.status])}
                  >
                    {client.status}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerDbStatusColors[client.agentStatus])}
                  >
                    agent {agentStatusLabel[client.agentStatus]}
                  </Badge>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
