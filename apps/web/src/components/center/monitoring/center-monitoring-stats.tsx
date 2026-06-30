"use client";

import { Activity, AlertTriangle, Clock, Wifi, WifiOff } from "lucide-react";
import { getCenterMonitoringStats } from "@/lib/mock-data/center";

export function CenterMonitoringStats() {
  const stats = getCenterMonitoringStats();

  const cards = [
    {
      label: "Agents online",
      value: stats.online,
      sub: "heartbeat OK",
      icon: Wifi,
      tone: "text-emerald-600",
    },
    {
      label: "Degraded",
      value: stats.degraded,
      sub: "investigate soon",
      icon: AlertTriangle,
      tone: "text-amber-600",
    },
    {
      label: "Offline",
      value: stats.offline,
      sub: "no recent heartbeat",
      icon: WifiOff,
      tone: "text-red-600",
    },
    {
      label: "Avg API p95",
      value: `${stats.avgLatency}ms`,
      sub: `${stats.activeAlerts} active alert${stats.activeAlerts !== 1 ? "s" : ""}`,
      icon: Activity,
      tone: "text-violet-600",
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
      {stats.pending > 0 ? (
        <p className="col-span-full flex items-center gap-1 text-xs text-muted-foreground sm:col-span-2 xl:col-span-4">
          <Clock className="h-3 w-3" />
          {stats.pending} client{stats.pending > 1 ? "s" : ""} awaiting first agent heartbeat
        </p>
      ) : null}
    </div>
  );
}
