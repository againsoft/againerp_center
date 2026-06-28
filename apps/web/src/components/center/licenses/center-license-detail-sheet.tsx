"use client";

import Link from "next/link";
import { RefreshCw, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  centerLicenseStatusColors,
  centerPlans,
  formatCenterPlan,
  type CenterLicense,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  license: CenterLicense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CenterLicenseDetailSheet({ license, open, onOpenChange }: Props) {
  if (!license) return null;

  const plan = centerPlans.find((p) => p.id === license.plan);
  const daysToExpiry = Math.ceil(
    (new Date(license.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Signed license</p>
          <h2 className="font-mono text-lg font-semibold">{license.licenseKeyMasked}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerLicenseStatusColors[license.status])}
            >
              {license.status}
            </Badge>
            <Badge variant="outline">{formatCenterPlan(license.plan)}</Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Client binding</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Business" value={license.businessName} />
              <Row label="Instance ID" value={license.instanceId} mono />
              <Row label="Modules licensed" value={String(license.modulesCount)} />
              <Row label="AI entitlement" value={license.aiEnabled ? "Included" : "Not included"} />
            </dl>
            <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
              <Link href={`/center/clients/${license.clientId}?tab=subscription`}>
                Open client subscription tab
              </Link>
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Validity</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Issued" value={license.issuedAt} />
              <Row label="Expires" value={license.expiresAt} />
              <Row
                label="Days remaining"
                value={daysToExpiry > 0 ? `${daysToExpiry} days` : "Expired"}
              />
              <Row label="Grace period" value={`${license.graceDays} days after expiry`} />
              {license.graceEndsAt ? (
                <Row label="Grace ends" value={license.graceEndsAt} />
              ) : null}
              <Row label="Last agent sync" value={license.lastSyncedAt} />
            </dl>
          </div>

          {plan ? (
            <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
              Plan includes up to {plan.maxUsers} seats
              {plan.aiCreditsMonthly > 0
                ? ` · ${(plan.aiCreditsMonthly / 1000).toFixed(0)}k AI credits/mo`
                : ""}
              .
            </div>
          ) : null}

          {license.revokeReason ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs dark:border-amber-900 dark:bg-amber-950/20">
              <p className="font-medium text-amber-900 dark:text-amber-200">Note</p>
              <p className="mt-1">{license.revokeReason}</p>
            </div>
          ) : null}

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-sm font-medium">JWS payload (conceptual)</h3>
            <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[10px] leading-relaxed">
              {JSON.stringify(
                {
                  sub: license.clientId,
                  instance_id: license.instanceId,
                  plan: license.plan,
                  exp: license.expiresAt,
                  grace_days: license.graceDays,
                  modules_count: license.modulesCount,
                  ai_enabled: license.aiEnabled,
                },
                null,
                2,
              )}
            </pre>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Full key never stored in Control Center — hash + masked display only.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t p-4">
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Reissue license
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
            Revoke
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
      <dd className={cn("text-right font-medium", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}
