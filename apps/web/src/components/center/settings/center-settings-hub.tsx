"use client";

import Link from "next/link";
import { ArrowRight, Key, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { centerPlatformSettings } from "@/lib/mock-data/center";

const sections = [
  {
    title: "Operators",
    description: "RBAC roles, MFA status, IP allowlists — super_admin through partner_admin.",
    href: "/settings/operators",
    icon: Users,
    highlight: false,
  },
  {
    title: "Integrations",
    description: "PageSpeed, Email, SMS, AI — configure third-party API keys used across all client stores.",
    href: "/settings/integrations",
    icon: Zap,
    highlight: true,
  },
  {
    title: "API Keys",
    description: "Scoped keys for integrations and partners — prefix display only, secrets never stored in UI.",
    href: "/settings/api-keys",
    icon: Key,
    highlight: false,
  },
];

export function CenterSettingsHub() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-sm font-medium">Platform configuration</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Global defaults — changes require super_admin and step-up MFA in production.
        </p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Item label="Platform" value={centerPlatformSettings.platformName} />
          <Item label="Default grace" value={`${centerPlatformSettings.defaultGraceDays} days`} />
          <Item label="Maintenance window" value={centerPlatformSettings.maintenanceWindow} />
          <Item label="Alert email" value={centerPlatformSettings.alertEmail} />
          <Item label="Agent heartbeat" value={`${centerPlatformSettings.agentHeartbeatIntervalSec}s`} />
          <Item label="Audit retention" value={`${centerPlatformSettings.auditRetentionYears} years`} />
          <Item label="Default update channel" value={centerPlatformSettings.defaultUpdateChannel} />
          <Item label="MFA required" value={centerPlatformSettings.requireMfaAllOperators ? "Yes" : "No"} />
        </dl>
        <Button variant="outline" size="sm" className="mt-4" disabled>
          Edit platform settings
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={cn(
              "group flex flex-col rounded-xl border bg-card p-4 transition-colors",
              section.highlight
                ? "border-amber-200 hover:border-amber-400 hover:bg-amber-50/30 dark:border-amber-900 dark:hover:border-amber-700 dark:hover:bg-amber-950/20"
                : "hover:border-violet-300 hover:bg-violet-50/30 dark:hover:border-violet-800 dark:hover:bg-violet-950/20",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <section.icon className={cn("h-5 w-5", section.highlight ? "text-amber-500" : "text-violet-600")} />
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <h2 className="mt-3 font-semibold">{section.title}</h2>
            <p className="mt-1 flex-1 text-xs text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
