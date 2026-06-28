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
  centerClientSubscriptions,
  centerSubscriptionStatusColors,
  formatCenterPlan,
  type CenterClientSubscription,
} from "@/lib/mock-data/center";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  subscriptions?: CenterClientSubscription[];
};

export function CenterFleetSubscriptionsTable({
  subscriptions = centerClientSubscriptions,
}: Props) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-medium">Active fleet subscriptions</h2>
        <p className="text-xs text-muted-foreground">
          Per-client billing period, seats, and renewal — links to client detail.
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Cycle</TableHead>
            <TableHead>Period end</TableHead>
            <TableHead>Seats</TableHead>
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
              <TableCell className="text-sm">{sub.periodEnd}</TableCell>
              <TableCell className="text-sm">
                {sub.seatsUsed}/{sub.seatsLimit}
              </TableCell>
              <TableCell className="text-right">
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
    </div>
  );
}
