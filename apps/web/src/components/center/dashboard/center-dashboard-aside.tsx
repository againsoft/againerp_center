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
import type { DashboardStats } from "@/lib/adapters/center-dashboard-adapter";

const quickActions = [
  { label: "Review signups", href: "/center/registrations", icon: UserPlus },
  { label: "Agent monitoring", href: "/center/agents?tab=fleet", icon: Activity },
  { label: "Manage licenses", href: "/center/licenses", icon: KeyRound },
  { label: "Deploy update", href: "/center/updates", icon: RefreshCw },
];

type Props = {
  stats: DashboardStats;
};

export function CenterDashboardAside({ stats }: Props) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-medium">Pending registrations</h2>
        </div>
        {stats.pendingRegs === 0 ? (
          <p className="text-xs text-muted-foreground">No pending signups in queue</p>
        ) : (
          <div className="space-y-2">
            <p className="text-2xl font-semibold">{stats.pendingRegs}</p>
            <p className="text-xs text-muted-foreground">awaiting operator review</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/center/registrations">Review all ({stats.pendingRegs})</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <Bot className="h-4 w-4 text-violet-600" />
          <h2 className="text-sm font-medium">Fleet snapshot</h2>
        </div>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Clients</dt>
            <dd className="font-medium">{stats.total}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Agents online</dt>
            <dd className="font-medium">{stats.agentsOnline}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Licenses</dt>
            <dd className="font-medium">{stats.licenses}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Business+ plans</dt>
            <dd className="font-medium">{stats.aiEnabled}</dd>
          </div>
        </dl>
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
        {stats.activeSubscriptions} active subscription{stats.activeSubscriptions !== 1 ? "s" : ""} across{" "}
        {stats.active} active client{stats.active !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
