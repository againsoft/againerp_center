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
  centerDiagnosticStatusColors,
  type CenterAgentDiagnostic,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  diagnostics: CenterAgentDiagnostic[];
  onView: (diagnostic: CenterAgentDiagnostic) => void;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CenterAgentDiagnosticsGrid({ diagnostics, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Bundle</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diagnostics.map((diag) => (
              <TableRow key={diag.id}>
                <TableCell>
                  <Link
                    href={`/center/clients/${diag.clientId}?tab=agent`}
                    className="text-sm hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {diag.businessName}
                  </Link>
                  <p className="font-mono text-[10px] text-muted-foreground">{diag.id}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerDiagnosticStatusColors[diag.status])}
                  >
                    {diag.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs tabular-nums">{formatTime(diag.requestedAt)}</TableCell>
                <TableCell className="max-w-[140px] truncate text-xs">{diag.requestedBy}</TableCell>
                <TableCell className="font-mono text-xs">{diag.bundlePrefix}</TableCell>
                <TableCell className="text-xs tabular-nums">
                  {diag.bundleSizeMb ? `${diag.bundleSizeMb} MB` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(diag)}>
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
        {diagnostics.map((diag) => (
          <div key={diag.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{diag.businessName}</p>
                <p className="font-mono text-xs text-muted-foreground">{diag.bundlePrefix}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize text-[10px]", centerDiagnosticStatusColors[diag.status])}
              >
                {diag.status}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-8 w-full"
              onClick={() => onView(diag)}
            >
              View bundle
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
