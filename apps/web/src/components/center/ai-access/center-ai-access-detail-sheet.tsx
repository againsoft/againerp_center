"use client";

import Link from "next/link";
import { Bot, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  centerAiAccessStatusColors,
  centerAiCreditStatusColors,
  formatAiCredits,
  formatCenterPlan,
  getAiCreditPercent,
  type CenterClientAiAccess,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  access: CenterClientAiAccess | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CenterAiAccessDetailSheet({ access, open, onOpenChange }: Props) {
  if (!access) return null;

  const creditPct = getAiCreditPercent(access.creditsUsed, access.creditsMonthly);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">AI OS provisioning</p>
          <h2 className="text-lg font-semibold">{access.businessName}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerAiAccessStatusColors[access.accessStatus])}
            >
              {access.accessStatus}
            </Badge>
            <Badge variant="outline">{formatCenterPlan(access.plan)}</Badge>
            {access.aiEnabled ? (
              <Badge variant="secondary" className="bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                <Bot className="mr-1 h-3 w-3" />
                AI OS
              </Badge>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Entitlements</h3>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI OS enabled</span>
              <Switch checked={access.aiEnabled} disabled aria-label="AI enabled" />
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="Agents" value={access.aiEnabled ? `${access.agentsActive} active / ${access.agentsLimit} limit` : "Not provisioned"} />
              <Row
                label="Monthly credits"
                value={
                  access.aiEnabled
                    ? `${formatAiCredits(access.creditsUsed)} / ${formatAiCredits(access.creditsMonthly)} (${creditPct}%)`
                    : "—"
                }
              />
              <Row label="Credit status">
                <Badge
                  variant="secondary"
                  className={cn("capitalize", centerAiCreditStatusColors[access.creditsStatus])}
                >
                  {access.creditsStatus}
                </Badge>
              </Row>
              <Row label="Last request" value={access.lastAiRequest ?? "—"} />
              <Row label="Proxy mode" value={access.proxyMode} capitalize />
            </dl>
            {access.aiEnabled && access.creditsMonthly > 0 ? (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    creditPct >= 100 ? "bg-red-500" : creditPct >= 85 ? "bg-amber-500" : "bg-emerald-500",
                  )}
                  style={{ width: `${creditPct}%` }}
                />
              </div>
            ) : null}
          </div>

          {access.toolsEnabled.length > 0 ? (
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 text-sm font-medium">Enabled tools</h3>
              <div className="flex flex-wrap gap-1">
                {access.toolsEnabled.map((tool) => (
                  <Badge key={tool} variant="secondary" className="text-[10px]">
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Client ERP accesses AI through Edge Agent proxy — models run in AgainSoft cloud. No AI
            weights on client servers. Credit metering deducts from monthly plan allocation.
          </div>

          <Button asChild variant="link" size="sm" className="h-auto p-0 text-violet-600">
            <Link href={`/center/clients/${access.clientId}?tab=modules`}>
              Open client modules & AI tab
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-t p-4">
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            Adjust limits
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled>
            {access.aiEnabled ? "Disable AI" : "Enable AI"}
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
  capitalize,
  children,
}: {
  label: string;
  value?: string;
  capitalize?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", capitalize && "capitalize")}>
        {children ?? value}
      </dd>
    </div>
  );
}
