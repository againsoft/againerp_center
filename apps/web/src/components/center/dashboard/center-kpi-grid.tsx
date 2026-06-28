"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bot,
  Building2,
  ClipboardList,
  UserPlus,
  Wallet,
} from "lucide-react";
import { getCenterDashboardStats } from "@/lib/mock-data/center";
import { cn, formatCurrency } from "@/lib/utils";

type KpiItem = {
  id: string;
  label: string;
  value: string;
  sub: string;
  up?: boolean;
  href: string;
  icon: LucideIcon;
  accent: string;
};

function KpiCard({ item }: { item: KpiItem }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="block">
      <div className="group flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:border-violet-200 hover:shadow-md dark:hover:border-violet-900">
        <div className="flex items-start justify-between gap-2">
          <div className={cn("rounded-lg p-2.5", item.accent)}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          {item.up != null ? (
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                item.up
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
              )}
            >
              {item.sub}
            </span>
          ) : null}
        </div>
        <div>
          <p className="text-2xl font-bold tracking-tight">{item.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
          {item.up == null ? (
            <p className="mt-0.5 text-[11px] text-muted-foreground/70">{item.sub}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function CenterKpiGrid() {
  const stats = getCenterDashboardStats();

  const items: KpiItem[] = [
    {
      id: "active",
      label: "Active clients",
      value: String(stats.active),
      sub: `${stats.total} total · ${stats.suspended} suspended`,
      href: "/center/clients",
      icon: Building2,
      accent: "bg-violet-600",
    },
    {
      id: "mrr",
      label: "Monthly revenue (MRR)",
      value: formatCurrency(stats.mrr),
      sub: "+18.2% vs last month",
      up: true,
      href: "/center/billing",
      icon: Wallet,
      accent: "bg-emerald-600",
    },
    {
      id: "agents",
      label: "Agents online",
      value: `${stats.agentsOnline}/${stats.total}`,
      sub: stats.agentsAlert > 0 ? `${stats.agentsAlert} need attention` : "All heartbeats OK",
      up: stats.agentsAlert === 0,
      href: "/center/monitoring",
      icon: Activity,
      accent: stats.agentsAlert > 0 ? "bg-amber-500" : "bg-sky-600",
    },
    {
      id: "ai",
      label: "AI OS enabled",
      value: `${stats.aiEnabled}/${stats.total}`,
      sub: `${Math.round((stats.aiEnabled / stats.total) * 100)}% of fleet`,
      up: true,
      href: "/center/ai-access",
      icon: Bot,
      accent: "bg-indigo-600",
    },
    {
      id: "pending",
      label: "Pending signups",
      value: String(stats.pendingRegs),
      sub: "Needs review",
      up: false,
      href: "/center/registrations",
      icon: UserPlus,
      accent: "bg-orange-500",
    },
    {
      id: "subscriptions",
      label: "Active subscriptions",
      value: String(stats.active),
      sub: "Plans billed this cycle",
      href: "/center/subscriptions",
      icon: ClipboardList,
      accent: "bg-slate-600",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map((item) => (
        <KpiCard key={item.id} item={item} />
      ))}
    </div>
  );
}
