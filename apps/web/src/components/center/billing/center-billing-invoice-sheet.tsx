"use client";

import Link from "next/link";
import { CreditCard, Mail, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  centerInvoiceStatusColors,
  type CenterBillingInvoice,
} from "@/lib/mock-data/center";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  invoice: CenterBillingInvoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CenterBillingInvoiceSheet({ invoice, open, onOpenChange }: Props) {
  if (!invoice) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Platform invoice</p>
          <h2 className="font-mono text-lg font-semibold">{invoice.invoiceNumber}</h2>
          <p className="text-sm">{invoice.businessName}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerInvoiceStatusColors[invoice.status])}
            >
              {invoice.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline">{invoice.currency}</Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <dl className="space-y-2 text-sm">
              <Row label="Amount" value={invoice.amount > 0 ? formatCurrency(invoice.amount) : "—"} />
              <Row label="Period" value={`${invoice.periodStart} → ${invoice.periodEnd}`} />
              <Row label="Issued" value={invoice.issuedAt} />
              <Row label="Due" value={invoice.dueAt} />
              <Row label="Paid" value={invoice.paidAt ?? "—"} />
              {invoice.externalRef ? <Row label="Gateway ref" value={invoice.externalRef} mono /> : null}
            </dl>
            <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
              <Link href={`/center/clients/${invoice.clientId}?tab=subscription`}>
                Open client subscription tab
              </Link>
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Line items</h3>
            <Table>
              <TableBody>
                {invoice.lineItems.map((line, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{line.label}</TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {line.amount > 0 ? formatCurrency(line.amount) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Payments processed via tokenized gateway — Control Center stores invoice metadata and
            external references only, not card data (PCI scope minimized).
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t p-4">
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <CreditCard className="mr-1.5 h-3.5 w-3.5" />
            Record payment
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Send reminder
          </Button>
          <Button variant="outline" size="sm" className="w-full" disabled>
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Void invoice
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}
