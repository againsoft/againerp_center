"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  centerDiagnosticStatusColors,
  type CenterAgentDiagnostic,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  diagnostic: CenterAgentDiagnostic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function CenterAgentDiagnosticDetailSheet({ diagnostic, open, onOpenChange }: Props) {
  if (!diagnostic) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Diagnostics bundle</p>
          <h2 className="font-mono text-lg font-semibold">{diagnostic.bundlePrefix}</h2>
          <p className="text-sm text-muted-foreground">{diagnostic.businessName}</p>
          <Badge
            variant="secondary"
            className={cn("mt-2 capitalize", centerDiagnosticStatusColors[diagnostic.status])}
          >
            {diagnostic.status}
          </Badge>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Bundle metadata</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Bundle ID" value={diagnostic.id} mono />
              {diagnostic.commandId ? (
                <Row label="Command ID" value={diagnostic.commandId} mono />
              ) : null}
              <Row label="Requested by" value={diagnostic.requestedBy} />
              <Row label="Requested at" value={formatTime(diagnostic.requestedAt)} />
              {diagnostic.uploadedAt ? (
                <Row label="Uploaded at" value={formatTime(diagnostic.uploadedAt)} />
              ) : null}
              <Row label="Expires at" value={formatTime(diagnostic.expiresAt)} />
              {diagnostic.bundleSizeMb ? (
                <Row label="Size" value={`${diagnostic.bundleSizeMb} MB`} />
              ) : null}
            </dl>
          </div>

          <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-4 py-3 text-xs text-muted-foreground dark:border-violet-900 dark:bg-violet-950/20">
            Bundles contain redacted docker logs and agent config — no client business data or PII.
            Download requires operator MFA in production. Remote shell is not available.
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled>
              Download bundle
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/center/clients/${diagnostic.clientId}?tab=agent`}>Client agent tab</Link>
            </Button>
            {diagnostic.commandId ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/center/agents?tab=commands&command=${diagnostic.commandId}`}>
                  View command
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}
