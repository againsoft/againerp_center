"use client";

import Link from "next/link";
import {
  Activity,
  Bot,
  KeyRound,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  centerClients,
  centerRegistrations,
  getCenterDashboardStats,
} from "@/lib/mock-data/center";
import { cn, formatCurrency } from "@/lib/utils";

const quickActions = [
  { label: "Review signups", href: "/center/registrations", icon: UserPlus },
  { label: "Agent monitoring", href: "/center/monitoring", icon: Activity },
  { label: "Manage licenses", href: "/center/licenses", icon: KeyRound },
  { label: "Deploy update", href: "/center/updates", icon: RefreshCw },
];

export function CenterDashboardAside() {
  const stats = getCenterDashboardStats();
  const pendingRegs = centerRegistrations.filter((r) => r.status === "pending_review");
  const aiUsageLeader = [...centerClients]
    .filter((c) => c.aiEnabled && c.aiTokensLimit > 0)
    .sort((a, b) => b.aiTokensUsed / b.aiTokensLimit - a.aiTokensUsed / a.aiTokensLimit)[0];
  const aiUsagePct = aiUsageLeader
    ? Math.round((aiUsageLeader.aiTokensUsed / aiUsageLeader.aiTokensLimit) * 100)
    : 0;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-medium">Pending registrations</h2>
        </div>
        {pendingRegs.length === 0 ? (
          <p className="text-xs text-muted-foreground">No pending signups</p>
        ) : (
          <div className="space-y-2">
            {pendingRegs.map((reg) => (
              <div key={reg.id} className="rounded-md border px-3 py-2">
                <p className="text-sm font-medium">{reg.businessName}</p>
                <p className="text-xs text-muted-foreground">{reg.contactEmail}</p>
                <p className="mt-1 text-[10px] text-muted-foreground capitalize">
                  {reg.requestedPlan} plan · {reg.requestedModules.length} modules
                </p>
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/center/registrations">Review all ({pendingRegs.length})</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <Bot className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-medium">AI fleet usage</h2>
        </div>
        <p className="text-2xl font-semibold">
          {stats.aiEnabled}
          <span className="text-sm font-normal text-muted-foreground"> / {stats.total}</span>
        </p>
        <p className="text-xs text-muted-foreground">clients with AI OS enabled</p>
        {aiUsageLeader ? (
          <div className="mt-3 rounded-md border bg-muted/30 px-3 py-2">
            <p className="text-[10px] font-medium uppercase text-muted-foreground">Highest usage</p>
            <p className="text-sm font-medium">{aiUsageLeader.businessName}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  aiUsagePct > 80 ? "bg-amber-500" : "bg-violet-600",
                )}
                style={{ width: `${Math.min(aiUsagePct, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{aiUsagePct}% of monthly credits</p>
          </div>
        ) : null}
        <Button asChild variant="outline" size="sm" className="mt-3 w-full">
          <Link href="/center/ai-access">Manage AI access</Link>
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-sm font-medium">Quick actions</h2>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                asChild
                variant="outline"
                size="sm"
                className="h-auto flex-col gap-1 py-2.5 text-[11px]"
              >
                <Link href={action.href}>
                  <Icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-2.5 text-[11px] text-muted-foreground">
        Fleet MRR snapshot:{" "}
        <strong className="text-foreground">{formatCurrency(stats.mrr)}</strong> from{" "}
        {stats.active} billable clients
      </div>
    </div>
  );
}
