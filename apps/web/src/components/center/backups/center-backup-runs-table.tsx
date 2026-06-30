"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  centerBackupRecords,
  centerBackupStatusColors,
  centerBackupStorageLabels,
  formatBackupSizeMb,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

export function CenterBackupRunsTable() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-medium">Recent backup runs</h2>
        <p className="text-xs text-muted-foreground">
          Metadata reported by Edge Agent — encrypted files stay on client storage.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Storage</TableHead>
            <TableHead>Checksum</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {centerBackupRecords.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.businessName}</TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize text-[10px]">
                  {r.type.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{r.startedAt}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn("capitalize text-[10px]", centerBackupStatusColors[r.status])}
                >
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm tabular-nums">{formatBackupSizeMb(r.sizeMb)}</TableCell>
              <TableCell className="text-xs">{centerBackupStorageLabels[r.storageTarget]}</TableCell>
              <TableCell className="font-mono text-[10px]">{r.checksumMasked}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
