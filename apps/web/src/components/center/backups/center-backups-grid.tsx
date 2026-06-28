"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  type CenterClientBackupStatus,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  statuses: CenterClientBackupStatus[];
  onView: (status: CenterClientBackupStatus) => void;
};

export function CenterBackupsGrid({ statuses, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Last backup</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Storage</TableHead>
              <TableHead>Retention</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((s) => (
              <TableRow key={s.clientId}>
                <TableCell>
                  <Link
                    href={`/center/clients/${s.clientId}?tab=agent`}
                    className="font-medium hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {s.businessName}
                  </Link>
                  <p className="text-[10px] text-muted-foreground">{s.scheduleLabel}</p>
                </TableCell>
                <TableCell className="text-sm">{formatCenterPlan(s.plan)}</TableCell>
                <TableCell className="text-sm">{s.lastBackupAt}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {s.lastBackupType.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerBackupStatusColors[s.status])}
                  >
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm tabular-nums">{formatBackupSizeMb(s.sizeMb)}</TableCell>
                <TableCell className="text-xs">{centerBackupStorageLabels[s.storageTarget]}</TableCell>
                <TableCell className="text-sm">{s.retentionDays}d</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(s)}>
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {statuses.map((s) => (
          <div key={s.clientId} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{s.businessName}</p>
                <p className="text-xs text-muted-foreground">
                  {s.lastBackupAt} · {formatBackupSizeMb(s.sizeMb)}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize shrink-0 text-[10px]", centerBackupStatusColors[s.status])}
              >
                {s.status}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(s)}>
              View backup status
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
