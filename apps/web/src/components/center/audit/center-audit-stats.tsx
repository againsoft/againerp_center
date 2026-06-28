"use client";

import { Bot, Lock, Server, User } from "lucide-react";
import { getCenterAuditStats } from "@/lib/mock-data/center";

export function CenterAuditStats() {
  const stats = getCenterAuditStats();

  const cards = [
    {
      label: "Total entries",
      value: stats.total,
      sub: "append-only log",
      icon: Lock,
      tone: "text-violet-600",
    },
    {
      label: "Operator actions",
      value: stats.operator,
      sub: "human-initiated",
      icon: User,
      tone: "text-violet-600",
    },
    {
      label: "System events",
      value: stats.system,
      sub: "automated services",
      icon: Server,
      tone: "text-sky-600",
    },
    {
      label: "Agent events",
      value: stats.agent,
      sub: `${stats.security} security-related`,
      icon: Bot,
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
