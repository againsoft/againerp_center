"use client";

import { CloudOff, ListTodo, Radio, Server } from "lucide-react";
import type { AgentConsoleStats } from "@/lib/hooks/use-agent-console-data";

type FleetStats = {
  total: number;
  online: number;
  offline: number;
};

type Props = {
  fleetStats?: FleetStats;
  consoleStats?: AgentConsoleStats;
};

export function CenterAgentStats({ fleetStats, consoleStats }: Props) {
  const cards = [
    {
      label: "Registered agents",
      value: fleetStats?.total ?? 0,
      sub: `${fleetStats?.online ?? 0} online now`,
      icon: Server,
      tone: "text-violet-600",
    },
    {
      label: "Offline agents",
      value: fleetStats?.offline ?? consoleStats?.offlineAgents ?? 0,
      sub: "no heartbeat in 5 min",
      icon: CloudOff,
      tone: "text-red-600",
    },
    {
      label: "In flight",
      value: consoleStats?.pendingCommands ?? 0,
      sub: "queued · delivered · running",
      icon: ListTodo,
      tone: "text-violet-600",
    },
    {
      label: "Succeeded",
      value: consoleStats?.succeededToday ?? 0,
      sub: `${consoleStats?.diagnosticsReady ?? 0} diagnostics ready`,
      icon: Radio,
      tone: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-2xl font-semibold">{card.value}</p>
              <p className="text-[10px] text-muted-foreground">{card.sub}</p>
            </div>
            <card.icon className={`h-4 w-4 shrink-0 ${card.tone}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
