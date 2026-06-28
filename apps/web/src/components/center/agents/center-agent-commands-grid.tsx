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
  centerAgentCommandRiskColors,
  centerAgentCommandStatusColors,
  centerAgentCommandTypeLabels,
  type CenterAgentCommand,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  commands: CenterAgentCommand[];
  onView: (command: CenterAgentCommand) => void;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CenterAgentCommandsGrid({ commands, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Command</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Issuer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {commands.map((cmd) => (
              <TableRow key={cmd.id}>
                <TableCell>
                  <Link
                    href={`/center/clients/${cmd.clientId}`}
                    className="text-sm hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {cmd.businessName}
                  </Link>
                  <p className="font-mono text-[10px] text-muted-foreground">{cmd.id}</p>
                </TableCell>
                <TableCell>
                  <p className="font-mono text-xs">{cmd.type}</p>
                  <p className="mt-0.5 max-w-[220px] truncate text-[10px] text-muted-foreground">
                    {cmd.payloadSummary}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerAgentCommandRiskColors[cmd.risk])}
                  >
                    {cmd.risk}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerAgentCommandStatusColors[cmd.status])}
                  >
                    {cmd.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs tabular-nums">{formatTime(cmd.issuedAt)}</TableCell>
                <TableCell className="max-w-[140px] truncate text-xs">{cmd.issuedBy}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(cmd)}>
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
        {commands.map((cmd) => (
          <div key={cmd.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{cmd.businessName}</p>
                <p className="font-mono text-xs">{centerAgentCommandTypeLabels[cmd.type]}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize text-[10px]", centerAgentCommandStatusColors[cmd.status])}
              >
                {cmd.status}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{cmd.payloadSummary}</p>
            <Button variant="outline" size="sm" className="mt-3 h-8 w-full" onClick={() => onView(cmd)}>
              View command
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
