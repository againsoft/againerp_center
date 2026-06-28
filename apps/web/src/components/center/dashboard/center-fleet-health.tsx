"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  centerClients,
  centerDbStatusColors,
  centerStatusColors,
  getCenterDashboardStats,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

const agentStatusLabel: Record<string, string> = {
  connected: "online",
  degraded: "degraded",
  offline: "offline",
  pending: "pending",
};

export function CenterFleetHealth() {
  const stats = getCenterDashboardStats();
  const sorted = [...centerClients].sort((a, b) => {
    const order = { offline: 0, degraded: 1, pending: 2, connected: 3 };
    return order[a.dbStatus] - order[b.dbStatus];
  });

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
          ) : (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
              All clear
            </Badge>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href="/center/clients">All clients</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((client) => (
          <Link
            key={client.id}
            href={`/center/monitoring?client=${client.id}`}
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
                  className={cn("capitalize text-[10px]", centerDbStatusColors[client.dbStatus])}
                >
                  agent {agentStatusLabel[client.dbStatus]}
                </Badge>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
