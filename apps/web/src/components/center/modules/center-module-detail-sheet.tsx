"use client";

import Link from "next/link";
import { GitBranch, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  centerClients,
  formatCenterPlan,
  getCenterModule,
  getCenterModuleDependents,
  getCenterModuleClientCount,
  getCenterPlansIncludingModule,
  type CenterModuleDefinition,
} from "@/lib/mock-data/center";

type Props = {
  module: CenterModuleDefinition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CenterModuleDetailSheet({ module: mod, open, onOpenChange }: Props) {
  if (!mod) return null;

  const dependents = getCenterModuleDependents(mod.id);
  const plans = getCenterPlansIncludingModule(mod.id);
  const clientCount = getCenterModuleClientCount(mod.id);
  const sampleClients = centerClients.filter((c) => c.modules.includes(mod.id)).slice(0, 3);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Platform module</p>
          <h2 className="text-lg font-semibold">{mod.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{mod.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {mod.tier}
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {mod.featureFlagKey}
            </Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Fleet usage</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Clients enabled" value={`${clientCount} / ${centerClients.length}`} />
              <Row label="Min ERP version" value={mod.minErpVersion} mono />
              <Row
                label="Platform default"
                value={mod.platformDefault ? "On for new clients" : "Opt-in add-on"}
              />
            </dl>
            {sampleClients.length > 0 ? (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Sample clients</p>
                {sampleClients.map((c) => (
                  <Link
                    key={c.id}
                    href={`/center/clients/${c.id}?tab=modules`}
                    className="block text-xs text-violet-700 hover:underline dark:text-violet-300"
                  >
                    {c.businessName}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
              <GitBranch className="h-3.5 w-3.5" />
              Dependencies
            </h3>
            {mod.dependencies.length === 0 ? (
              <p className="text-xs text-muted-foreground">No prerequisites — can enable standalone.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {mod.dependencies.map((depId) => {
                  const dep = getCenterModule(depId);
                  return (
                    <Badge key={depId} variant="secondary">
                      {dep?.label ?? depId}
                    </Badge>
                  );
                })}
              </div>
            )}
            {dependents.length > 0 ? (
              <div className="mt-3">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Required by</p>
                <div className="flex flex-wrap gap-1">
                  {dependents.map((d) => (
                    <Badge key={d.id} variant="outline" className="text-[10px]">
                      {d.label}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Subscription plans</h3>
            {plans.length === 0 ? (
              <p className="text-xs text-muted-foreground">Not included in standard plans — custom only.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {plans.map((p) => (
                  <Badge key={p.id} variant="secondary">
                    {formatCenterPlan(p.id)}
                  </Badge>
                ))}
              </div>
            )}
            <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
              <Link href="/center/subscriptions">Open plan catalog</Link>
            </Button>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Per-client enable/disable runs through Module Service → Edge Agent sync. Control Center stores
            entitlements only — no module code on the control plane.
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t p-4">
          <div className="flex w-full items-center justify-between rounded-md border px-3 py-2">
            <span className="text-sm">Platform default</span>
            <Switch checked={mod.platformDefault} disabled aria-label="Platform default" />
          </div>
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Package className="mr-1.5 h-3.5 w-3.5" />
            Push to fleet
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono text-xs font-medium" : "font-medium"}>{value}</dd>
    </div>
  );
}
