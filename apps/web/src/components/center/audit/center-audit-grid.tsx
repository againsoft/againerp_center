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
  centerAuditActorTypeColors,
  centerAuditResourceTypeLabels,
  formatAuditTimestamp,
  type CenterAuditLogEntry,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  logs: CenterAuditLogEntry[];
  onView: (log: CenterAuditLogEntry) => void;
};

export function CenterAuditGrid({ logs, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Correlation</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs tabular-nums">{formatAuditTimestamp(log.timestamp)}</TableCell>
                <TableCell>
                  <p className="text-sm">{log.actorLabel}</p>
                  <Badge
                    variant="secondary"
                    className={cn("mt-1 capitalize text-[10px]", centerAuditActorTypeColors[log.actorType])}
                  >
                    {log.actorType}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{log.action}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {centerAuditResourceTypeLabels[log.resourceType]}
                  </Badge>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{log.resourceId}</p>
                </TableCell>
                <TableCell className="text-sm">
                  {log.clientId ? (
                    <Link
                      href={`/center/clients/${log.clientId}`}
                      className="hover:text-violet-700 dark:hover:text-violet-300"
                    >
                      {log.clientName}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                  {log.correlationId.slice(0, 12)}…
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(log)}>
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.actorLabel}</p>
              </div>
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {formatAuditTimestamp(log.timestamp)}
              </span>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(log)}>
              View entry
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
