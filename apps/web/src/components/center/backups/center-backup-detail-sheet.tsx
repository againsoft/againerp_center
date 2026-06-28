"use client";

import Link from "next/link";
import { Download, Play, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  centerBackupStatusColors,
  centerBackupStorageLabels,
  formatBackupSizeMb,
  formatCenterPlan,
  getCenterBackupRecordsForClient,
  type CenterClientBackupStatus,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  status: CenterClientBackupStatus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CenterBackupDetailSheet({ status, open, onOpenChange }: Props) {
  if (!status) return null;

  const records = getCenterBackupRecordsForClient(status.clientId);
  const overdue = status.hoursSinceBackup > status.policyMaxAgeHours;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Backup policy & history</p>
          <h2 className="text-lg font-semibold">{status.businessName}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerBackupStatusColors[status.status])}
            >
              {status.status}
            </Badge>
            <Badge variant="outline">{formatCenterPlan(status.plan)}</Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Policy</h3>
            <dl className="space-y-2 text-sm">
              <Row label="Schedule" value={status.scheduleLabel} />
              <Row label="Retention" value={`${status.retentionDays} days local`} />
              <Row label="Storage" value={centerBackupStorageLabels[status.storageTarget]} />
              <Row label="Next run" value={status.nextScheduled ?? "—"} />
              <Row label="Last checksum" value={status.checksumMasked} mono />
            </dl>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Auto verification</span>
              <Switch checked={status.verificationEnabled} disabled aria-label="Verification" />
            </div>
            {overdue ? (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                Backup age {status.hoursSinceBackup}h exceeds policy window ({status.policyMaxAgeHours}h).
              </p>
            ) : null}
            <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
              <Link href={`/center/clients/${status.clientId}?tab=agent`}>Open client agent tab</Link>
            </Button>
          </div>

          {status.errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-xs dark:border-red-900 dark:bg-red-950/20">
              <p className="font-medium text-red-900 dark:text-red-200">Last issue</p>
              <p className="mt-1">{status.errorMessage}</p>
            </div>
          ) : null}

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Recent runs (metadata)</h3>
            {records.length === 0 ? (
              <p className="text-xs text-muted-foreground">No backup records reported yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="capitalize text-xs">{r.type.replace("_", " ")}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn("capitalize text-[10px]", centerBackupStatusColors[r.status])}
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs tabular-nums">{formatBackupSizeMb(r.sizeMb)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Backup files remain on client infrastructure (local, S3, or NAS). Control Center stores
            checksums, sizes, and verification status only — never backup payloads.
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t p-4">
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Play className="mr-1.5 h-3.5 w-3.5" />
            Trigger backup
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Run verify
          </Button>
          <Button variant="outline" size="sm" className="w-full" disabled>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Initiate restore (DR)
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
