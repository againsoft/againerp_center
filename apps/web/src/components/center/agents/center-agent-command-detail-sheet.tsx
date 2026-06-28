"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  centerAgentCommandRiskColors,
  centerAgentCommandStatusColors,
  centerAgentCommandTypeLabels,
  type CenterAgentCommand,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  command: CenterAgentCommand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function CenterAgentCommandDetailSheet({ command, open, onOpenChange }: Props) {
  if (!command) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Signed command envelope</p>
          <h2 className="font-mono text-lg font-semibold">{command.type}</h2>
          <p className="text-sm text-muted-foreground">{command.businessName}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerAgentCommandStatusColors[command.status])}
            >
              {command.status}
            </Badge>
            <Badge
              variant="secondary"
              className={cn("capitalize", centerAgentCommandRiskColors[command.risk])}
            >
              {command.risk} risk
            </Badge>
            <Badge variant="outline">{centerAgentCommandTypeLabels[command.type]}</Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Command metadata</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Command ID" value={command.id} mono />
              <Row label="Correlation ID" value={command.correlationId} mono />
              <Row label="Issued by" value={command.issuedBy} />
              <Row label="Issued at" value={formatTime(command.issuedAt)} />
              <Row label="Expires at" value={formatTime(command.expiresAt)} />
              {command.deliveredAt ? (
                <Row label="Delivered at" value={formatTime(command.deliveredAt)} />
              ) : null}
              {command.completedAt ? (
                <Row label="Completed at" value={formatTime(command.completedAt)} />
              ) : null}
              <Row
                label="Signature"
                value={command.signatureValid ? "JWS valid" : "Invalid — rejected"}
              />
            </dl>
            <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
              <Link href={`/center/clients/${command.clientId}`}>Open client detail</Link>
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-sm font-medium">Payload</h3>
            <p className="text-sm text-muted-foreground">{command.payloadSummary}</p>
            {command.resultSummary ? (
              <>
                <h3 className="mb-2 mt-4 text-sm font-medium">Result</h3>
                <p className="text-sm text-muted-foreground">{command.resultSummary}</p>
              </>
            ) : null}
          </div>

          {command.risk === "high" ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-muted-foreground dark:border-amber-900 dark:bg-amber-950/30">
              High-risk commands may require operator approval on enterprise tiers. Agent rejects
              expired or duplicate command IDs (idempotent).
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" disabled>
              Cancel command
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/center/audit">View audit log</Link>
            </Button>
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
