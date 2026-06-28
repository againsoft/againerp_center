"use client";

import Link from "next/link";
import { ShieldOff, UserCog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  centerOperatorRoleLabels,
  centerOperatorStatusColors,
  type CenterOperator,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  operator: CenterOperator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CenterOperatorDetailSheet({ operator, open, onOpenChange }: Props) {
  if (!operator) return null;

  const highRisk = operator.role === "super_admin" || operator.role === "platform_admin";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Operator account</p>
          <h2 className="text-lg font-semibold">{operator.name}</h2>
          <p className="text-sm text-muted-foreground">{operator.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{centerOperatorRoleLabels[operator.role]}</Badge>
            <Badge
              variant="secondary"
              className={cn("capitalize", centerOperatorStatusColors[operator.status])}
            >
              {operator.status}
            </Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Access</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Operator ID" value={operator.id} mono />
              <Row label="Created" value={operator.createdAt} />
              <Row label="Last login" value={operator.lastLogin ?? "—"} />
              <Row label="IP allowlist" value={operator.ipAllowlist ?? "None"} />
            </dl>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">MFA</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Multi-factor auth</span>
              <Switch checked={operator.mfaEnabled} disabled aria-label="MFA enabled" />
            </div>
            {operator.mfaType ? (
              <p className="mt-2 text-xs text-muted-foreground capitalize">Method: {operator.mfaType}</p>
            ) : null}
            {highRisk ? (
              <p className="mt-2 text-xs text-violet-700 dark:text-violet-300">
                Role changes and high-risk actions require step-up MFA within 5 minutes.
              </p>
            ) : null}
          </div>

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Partner admins are scoped to `client.partner_id`. Read-only role has audit.read and
            fleet read permissions only.
          </div>

          <Button asChild variant="link" size="sm" className="h-auto p-0 text-violet-600">
            <Link href="/center/audit">View audit log for this operator</Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 border-t p-4">
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <UserCog className="mr-1.5 h-3.5 w-3.5" />
            Change role
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
            Disable
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
      <dd className={cn("font-medium", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}
