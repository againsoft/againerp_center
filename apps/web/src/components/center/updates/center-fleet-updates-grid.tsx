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
  centerClientUpdateStatusColors,
  centerUpdateChannelColors,
  type CenterClientUpdate,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  updates: CenterClientUpdate[];
  onView: (update: CenterClientUpdate) => void;
};

export function CenterFleetUpdatesGrid({ updates, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Auto</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {updates.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <Link
                    href={`/center/clients/${u.clientId}?tab=agent`}
                    className="font-medium hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {u.businessName}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{u.currentVersion}</TableCell>
                <TableCell className="font-mono text-xs">{u.targetVersion ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerUpdateChannelColors[u.channel])}
                  >
                    {u.channel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerClientUpdateStatusColors[u.status])}
                  >
                    {u.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{u.autoUpdate ? "Yes" : "Manual"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {u.scheduledAt ?? u.lastAttempt ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(u)}>
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
        {updates.map((u) => (
          <div key={u.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{u.businessName}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {u.currentVersion} → {u.targetVersion ?? "—"}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize shrink-0 text-[10px]", centerClientUpdateStatusColors[u.status])}
              >
                {u.status.replace("_", " ")}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(u)}>
              View update
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
