"use client";

import { AlertTriangle, CheckCircle2, Clock, HardDrive, Loader2 } from "lucide-react";
import { formatBackupSizeMb } from "@/lib/mock-data/center";
import type { BackupStats } from "@/lib/hooks/use-backups-data";

type Props = {
  stats: BackupStats;
  loading?: boolean;
};

export function CenterBackupStats({ stats, loading }: Props) {
  const cards = [
    {
      label: "Verified",
      value: loading ? "…" : stats.verified,
      sub: "checksum + restore test OK",
      icon: CheckCircle2,
      tone: "text-emerald-600",
    },
    {
      label: "Overdue / failed",
      value: loading ? "…" : stats.overdue,
      sub: "needs operator review",
      icon: AlertTriangle,
      tone: stats.overdue > 0 ? "text-red-600" : "text-muted-foreground",
    },
    {
      label: "Awaiting verify",
      value: loading ? "…" : stats.pendingVerify,
      sub: "completed, test pending",
      icon: Clock,
      tone: "text-sky-600",
    },
    {
      label: "Fleet metadata",
      value: loading ? "…" : formatBackupSizeMb(stats.totalMetadataMb),
      sub: loading ? "…" : `${stats.fleet} clients — files stay on client`,
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
            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <card.icon className={`h-4 w-4 shrink-0 ${card.tone}`} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
