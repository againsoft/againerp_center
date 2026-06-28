"use client";

import Link from "next/link";
import { Bot, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  centerAiAccessStatusColors,
  centerAiCreditStatusColors,
  centerStatusColors,
  formatAiCredits,
  formatCenterPlan,
  getAiCreditPercent,
  type CenterClientAiAccess,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  access: CenterClientAiAccess[];
  onView: (row: CenterClientAiAccess) => void;
};

function CreditBar({ used, limit }: { used: number; limit: number }) {
  const pct = getAiCreditPercent(used, limit);
  if (limit <= 0) return <span className="text-xs text-muted-foreground">—</span>;

  const tone =
    pct >= 100 ? "bg-red-500" : pct >= 85 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums">{pct}%</span>
    </div>
  );
}

export function CenterAiAccessGrid({ access, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>AI access</TableHead>
              <TableHead>Agents</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Proxy</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {access.map((row) => (
              <TableRow key={row.clientId}>
                <TableCell>
                  <Link
                    href={`/center/clients/${row.clientId}?tab=modules`}
                    className="font-medium hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {row.businessName}
                  </Link>
                  <div className="mt-1">
                    <Badge
                      variant="secondary"
                      className={cn("capitalize text-[10px]", centerStatusColors[row.clientStatus])}
                    >
                      {row.clientStatus}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{formatCenterPlan(row.plan)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={row.aiEnabled} disabled aria-label="AI enabled" />
                    <Badge
                      variant="secondary"
                      className={cn("capitalize text-[10px]", centerAiAccessStatusColors[row.accessStatus])}
                    >
                      {row.accessStatus}
                    </Badge>
                    {row.aiEnabled ? <Bot className="h-3.5 w-3.5 text-violet-600" /> : null}
                  </div>
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {row.aiEnabled ? `${row.agentsActive}/${row.agentsLimit}` : "—"}
                </TableCell>
                <TableCell className="text-sm">
                  {row.aiEnabled ? (
                    <span>
                      {formatAiCredits(row.creditsUsed)}
                      <span className="text-muted-foreground"> / {formatAiCredits(row.creditsMonthly)}</span>
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {row.aiEnabled ? (
                    <CreditBar used={row.creditsUsed} limit={row.creditsMonthly} />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="capitalize text-xs">{row.proxyMode}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(row)}>
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
        {access.map((row) => (
          <div key={row.clientId} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{row.businessName}</p>
                <p className="text-xs text-muted-foreground">
                  {row.aiEnabled
                    ? `${getAiCreditPercent(row.creditsUsed, row.creditsMonthly)}% credits · ${row.agentsActive} agents`
                    : "AI not enabled"}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize shrink-0 text-[10px]", centerAiAccessStatusColors[row.accessStatus])}
              >
                {row.accessStatus}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(row)}>
              View AI access
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
