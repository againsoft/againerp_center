"use client";

import Link from "next/link";
import { RotateCcw, Upload, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  centerClientUpdateStatusColors,
  centerUpdateChannelColors,
  centerUpdateRollouts,
  type CenterClientUpdate,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  update: CenterClientUpdate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CenterClientUpdateSheet({ update, open, onOpenChange }: Props) {
  if (!update) return null;

  const rollout = update.rolloutId
    ? centerUpdateRollouts.find((r) => r.id === update.rolloutId)
    : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Client update state</p>
          <h2 className="text-lg font-semibold">{update.businessName}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerClientUpdateStatusColors[update.status])}
            >
              {update.status.replace("_", " ")}
            </Badge>
            <Badge
              variant="secondary"
              className={cn("capitalize", centerUpdateChannelColors[update.channel])}
            >
              {update.channel}
            </Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Versions</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Current" value={update.currentVersion} mono />
              <Row label="Target" value={update.targetVersion ?? "None"} mono />
              {update.scheduledAt ? <Row label="Scheduled" value={update.scheduledAt} /> : null}
              {update.lastAttempt ? <Row label="Last attempt" value={update.lastAttempt} /> : null}
            </dl>
            <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
              <Link href={`/center/clients/${update.clientId}?tab=agent`}>Open client agent tab</Link>
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Policy</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Auto-update</span>
              <Switch checked={update.autoUpdate} disabled aria-label="Auto-update" />
            </div>
            {rollout ? (
              <div className="mt-3 rounded-md bg-muted/40 p-2 text-xs">
                <p className="font-medium">{rollout.name}</p>
                <p className="text-muted-foreground">
                  Rollout stage: {rollout.stage} · {rollout.clientsComplete}/{rollout.clientsTotal}{" "}
                  complete
                </p>
              </div>
            ) : null}
          </div>

          {update.errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-xs dark:border-red-900 dark:bg-red-950/20">
              <p className="font-medium text-red-900 dark:text-red-200">Last error</p>
              <p className="mt-1">{update.errorMessage}</p>
            </div>
          ) : null}

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Updates execute on the client host via Edge Agent — pull images, run migrations, smoke
            tests, and report status. Pre-update backup is triggered automatically for major upgrades.
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t p-4">
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Push now
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            Schedule
          </Button>
          <Button variant="outline" size="sm" className="w-full" disabled>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Rollback to previous
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
