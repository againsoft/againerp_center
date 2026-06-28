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
  centerSubscriptionStatusColors,
  formatCenterPlan,
  type CenterClientSubscription,
} from "@/lib/mock-data/center";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  subscriptions: CenterClientSubscription[];
  loading?: boolean;
};

export function CenterBillingFleetTable({ subscriptions, loading }: Props) {
  const totalMrr = subscriptions.reduce((sum, s) => sum + s.mrr, 0);

  if (loading && subscriptions.length === 0) {
    return (
      <div className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Loading fleet MRR…
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-medium">Fleet MRR by subscription</h2>
        <p className="text-xs text-muted-foreground">
          Total MRR {formatCurrency(totalMrr)} — links to subscriptions and client billing tab.
        </p>
      </div>
      {subscriptions.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No active subscriptions — approve a registration or create a client first.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead className="text-right">MRR</TableHead>
              <TableHead>Renew</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <Link
                    href={`/center/clients/${sub.clientId}?tab=subscription`}
                    className="font-medium hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {sub.businessName}
                  </Link>
                </TableCell>
                <TableCell>{formatCenterPlan(sub.plan)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", centerSubscriptionStatusColors[sub.status])}
                  >
                    {sub.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize text-sm">{sub.billingCycle}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {sub.mrr > 0 ? formatCurrency(sub.mrr) : "—"}
                </TableCell>
                <TableCell>
                  {sub.autoRenew ? (
                    <Badge variant="outline" className="text-[10px]">
                      Auto
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Manual</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="border-t px-4 py-2 text-right">
        <Link
          href="/center/subscriptions"
          className="text-xs text-violet-600 hover:underline dark:text-violet-300"
        >
          Open subscription plans →
        </Link>
      </div>
    </div>
  );
}
