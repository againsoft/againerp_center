"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { CenterClientDetail } from "@/components/center/clients/client-detail";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { CenterPageSkeleton } from "@/components/center/center-page-skeleton";
import { Button } from "@/components/ui/button";
import { getCenterClient } from "@/lib/mock-data/center";
import { Building2 } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

function ClientDetailContent({ id }: { id: string }) {
  const client = getCenterClient(id);

  if (!client) {
    return (
      <CenterEmptyState
        icon={Building2}
        title="Client not found"
        description="This client ID is not in the fleet registry."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/clients">Back to clients</Link>
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
