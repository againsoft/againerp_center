"use client";

import { KeyRound, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { centerApiKeyStatusColors, type CenterApiKey } from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  apiKey: CenterApiKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CenterApiKeyDetailSheet({ apiKey, open, onOpenChange }: Props) {
  if (!apiKey) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">API key</p>
          <h2 className="text-lg font-semibold">{apiKey.name}</h2>
          <p className="font-mono text-sm text-muted-foreground">{apiKey.keyPrefix}…</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerApiKeyStatusColors[apiKey.status])}
            >
              {apiKey.status}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {apiKey.ownerType}
            </Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Metadata</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Owner" value={apiKey.ownerLabel} />
              <Row label="Created" value={apiKey.createdAt} />
              <Row label="Last used" value={apiKey.lastUsedAt ?? "Never"} />
              <Row label="Expires" value={apiKey.expiresAt ?? "No expiry"} />
            </dl>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-sm font-medium">Scopes</h3>
            <div className="flex flex-wrap gap-1">
              {apiKey.scopes.map((scope) => (
                <Badge key={scope} variant="secondary" className="font-mono text-[10px]">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Full secret shown once at creation — stored as hash only. Production-scope key creation
            requires step-up MFA. Rate limited per key prefix.
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t p-4">
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            Rotate key
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
