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
  centerInvoiceStatusColors,
  type CenterBillingInvoice,
} from "@/lib/mock-data/center";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  invoices: CenterBillingInvoice[];
  onView: (invoice: CenterBillingInvoice) => void;
};

export function CenterBillingInvoicesGrid({ invoices, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <p className="font-mono text-xs font-medium">{inv.invoiceNumber}</p>
                  {inv.externalRef ? (
                    <p className="text-[10px] text-muted-foreground">{inv.externalRef}</p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/center/clients/${inv.clientId}?tab=subscription`}
                    className="font-medium hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {inv.businessName}
                  </Link>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {inv.periodStart} → {inv.periodEnd}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize text-[10px]", centerInvoiceStatusColors[inv.status])}
                  >
                    {inv.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{inv.dueAt}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {inv.amount > 0 ? formatCurrency(inv.amount) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(inv)}>
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {invoices.map((inv) => (
          <div key={inv.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-medium">{inv.invoiceNumber}</p>
                <p className="text-sm">{inv.businessName}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize shrink-0 text-[10px]", centerInvoiceStatusColors[inv.status])}
              >
                {inv.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="mt-1 text-sm font-medium tabular-nums">
              {inv.amount > 0 ? formatCurrency(inv.amount) : "Draft"}
            </p>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(inv)}>
              View invoice
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
