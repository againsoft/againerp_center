"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterSubscriptionsView } from "@/components/center/subscriptions/center-subscriptions-view";
import { Button } from "@/components/ui/button";
import { centerClientSubscriptions } from "@/lib/mock-data/center";

export function CenterSubscriptionsPageContent() {
  const activeCount = centerClientSubscriptions.filter(
    (s) => s.status === "active" || s.status === "trial",
  ).length;

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Subscriptions"
        title="Subscription Plans"
        description={`${activeCount} active fleet subscriptions — plans define modules, seats, AI credits, and grace periods.`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/center/licenses">
              <KeyRound className="mr-1.5 h-3.5 w-3.5" />
              License center
            </Link>
          </Button>
        }
      />
      <CenterSubscriptionsView />
    </div>
  );
}
