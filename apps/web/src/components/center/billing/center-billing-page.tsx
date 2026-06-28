"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { CenterBillingStats } from "@/components/center/billing/center-billing-stats";
import { CenterBillingView } from "@/components/center/billing/center-billing-view";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { getCenterBillingStats } from "@/lib/mock-data/center";
import { formatCurrency } from "@/lib/utils";

export function CenterBillingPageContent() {
  const stats = getCenterBillingStats();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Billing"
        title="Billing & Invoices"
        description={`Fleet MRR ${formatCurrency(stats.totalMrr)} — invoice metadata and payment status via tokenized gateway.`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/center/subscriptions">
              <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
              Subscriptions
            </Link>
          </Button>
        }
      />

      <CenterBillingStats />
      <CenterBillingView />
    </div>
  );
}
