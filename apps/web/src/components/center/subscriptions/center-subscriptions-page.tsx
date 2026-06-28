"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2 } from "lucide-react";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterSubscriptionsView } from "@/components/center/subscriptions/center-subscriptions-view";
import { Button } from "@/components/ui/button";
import { apiSubscriptionsToCenterSubscriptions } from "@/lib/adapters/center-subscription-adapter";
import { fetchClients } from "@/lib/api/clients";
import { fetchSubscriptions } from "@/lib/api/subscriptions";
import type { CenterClientSubscription } from "@/lib/mock-data/center";

export function CenterSubscriptionsPageContent() {
  const [subscriptions, setSubscriptions] = useState<CenterClientSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, clients] = await Promise.all([fetchSubscriptions(), fetchClients()]);
      setSubscriptions(apiSubscriptionsToCenterSubscriptions(subs, clients));
    } catch {
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeCount = useMemo(
    () => subscriptions.filter((s) => s.status === "active" || s.status === "trial").length,
    [subscriptions],
  );

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Subscriptions"
        title="Subscription Plans"
        live
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

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading subscriptions…
        </div>
      ) : (
        <CenterSubscriptionsView subscriptions={subscriptions} />
      )}

      {!loading && (
        <p className="text-xs text-muted-foreground">
          Live data from Control Center API · Plan catalog uses reference pricing.
        </p>
      )}
    </div>
  );
}
