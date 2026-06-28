"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Building2 } from "lucide-react";
import { CenterClientDetail } from "@/components/center/clients/client-detail";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { CenterPageSkeleton } from "@/components/center/center-page-skeleton";
import { Button } from "@/components/ui/button";
import { fetchClient } from "@/lib/api/clients";
import { apiClientToCenterClient } from "@/lib/adapters/center-client-adapter";
import { getCenterClient, type CenterClient } from "@/lib/mock-data/center";

type Props = { params: Promise<{ id: string }> };

function ClientDetailContent({ id }: { id: string }) {
  const [client, setClient] = useState<CenterClient | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const apiClient = await fetchClient(id);
        if (!cancelled) setClient(apiClientToCenterClient(apiClient));
      } catch {
        const mock = getCenterClient(id);
        if (!cancelled) setClient(mock ?? null);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (client === undefined) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading client…
      </div>
    );
  }

  if (!client) {
    return (
      <CenterEmptyState
        icon={Building2}
        title="Client not found"
        description="This client ID is not in the fleet registry."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/center/clients">Back to clients</Link>
          </Button>
        }
      />
    );
  }

  return <CenterClientDetail client={client} />;
}

export default function CenterClientDetailPage({ params }: Props) {
  const { id } = use(params);

  return (
    <Suspense fallback={<CenterPageSkeleton variant="detail" />}>
      <ClientDetailContent id={id} />
    </Suspense>
  );
}
