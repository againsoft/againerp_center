"use client";

import { AlertTriangle, CheckCircle2, Clock, HardDrive } from "lucide-react";
import { formatBackupSizeMb, getCenterBackupStats } from "@/lib/mock-data/center";

export function CenterBackupStats() {
  const stats = getCenterBackupStats();

  const cards = [
    {
      label: "Verified",
      value: stats.verified,
      sub: "checksum + restore test OK",
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
    {
      label: "Overdue / failed",
      value: stats.overdue,
      sub: "needs operator review",
      icon: AlertTriangle,
      tone: stats.overdue > 0 ? "text-red-600" : "text-muted-foreground",
    },
    {
      label: "Awaiting verify",
      value: stats.pendingVerify,
      sub: "completed, test pending",
      icon: Clock,
      tone: "text-sky-600",
    },
    {
      label: "Fleet metadata",
      value: formatBackupSizeMb(stats.totalMetadataMb),
      sub: `${stats.fleet} clients — files stay on client`,
      icon: HardDrive,
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
    </div>
  );
}
