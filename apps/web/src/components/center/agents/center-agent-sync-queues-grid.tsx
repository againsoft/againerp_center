"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  centerAgentConnectivityColors,
  centerAgentQueueTypeLabels,
  type CenterAgentSyncQueue,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  queues: CenterAgentSyncQueue[];
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CenterAgentSyncQueuesGrid({ queues }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Connectivity</TableHead>
              <TableHead>Queue</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Oldest item</TableHead>
              <TableHead>Grace</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {queues.map((queue) => (
              <TableRow key={queue.id}>
                <TableCell>
                  <Link
                    href={`/center/clients/${queue.clientId}?tab=agent`}
                    className="text-sm hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {queue.businessName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize text-[10px]",
                      centerAgentConnectivityColors[queue.connectivity],
                    )}
                  >
                    {queue.connectivity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {centerAgentQueueTypeLabels[queue.queueType]}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium tabular-nums">{queue.pendingCount}</TableCell>
                <TableCell className="text-xs tabular-nums">
                  {formatTime(queue.oldestQueuedAt)}
                </TableCell>
                <TableCell className="text-xs">
                  {queue.graceActive ? (
                    <span className="text-amber-700 dark:text-amber-300">
                      Active
                      {queue.graceExpiresAt
                        ? ` · until ${formatTime(queue.graceExpiresAt)}`
                        : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[260px] text-xs text-muted-foreground">
                  {queue.summary}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {queues.map((queue) => (
          <div key={queue.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{queue.businessName}</p>
                <p className="text-xs text-muted-foreground">
                  {centerAgentQueueTypeLabels[queue.queueType]} · {queue.pendingCount} pending
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "capitalize text-[10px]",
                  centerAgentConnectivityColors[queue.connectivity],
                )}
              >
                {queue.connectivity}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{queue.summary}</p>
          </div>
        ))}
      </div>
    </>
  );
}
