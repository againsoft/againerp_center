"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  centerAuditActorTypeColors,
  centerAuditResourceTypeLabels,
  formatAuditTimestamp,
  type CenterAuditLogEntry,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  log: CenterAuditLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CenterAuditDetailSheet({ log, open, onOpenChange }: Props) {
  if (!log) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Audit log entry</p>
          <h2 className="font-mono text-lg font-semibold">{log.action}</h2>
          <p className="text-sm text-muted-foreground">{formatAuditTimestamp(log.timestamp)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerAuditActorTypeColors[log.actorType])}
            >
              {log.actorType}
            </Badge>
            <Badge variant="outline">{centerAuditResourceTypeLabels[log.resourceType]}</Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Actor & target</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Actor" value={log.actorLabel} />
              <Row label="Actor ID" value={log.actorId} mono />
              <Row label="Resource ID" value={log.resourceId} mono />
              <Row label="Correlation ID" value={log.correlationId} mono />
              {log.ipAddress ? <Row label="IP address" value={log.ipAddress} mono /> : null}
            </dl>
            {log.clientId ? (
              <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
                <Link href={`/center/clients/${log.clientId}`}>Open {log.clientName}</Link>
              </Button>
            ) : null}
          </div>

          {log.beforeState || log.afterState ? (
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">State change</h3>
              {log.beforeState ? (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">Before</p>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[10px]">
                    {JSON.stringify(log.beforeState, null, 2)}
                  </pre>
                </div>
              ) : null}
              {log.afterState ? (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">After</p>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[10px]">
                    {JSON.stringify(log.afterState, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Append-only audit log — entries cannot be modified or deleted. Archived to object storage
            after 12 months; verification failures retained 7 years.
          </div>
        </div>

        <div className="border-t p-4">
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
