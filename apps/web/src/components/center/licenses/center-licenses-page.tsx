"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { CenterLicensesList } from "@/components/center/licenses/center-licenses-list";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { centerLicenses } from "@/lib/mock-data/center";

export function CenterLicensesPageContent() {
  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Licenses"
        title="License Center"
        count={centerLicenses.length}
        description="Signed entitlements synced to Edge Agent — keys masked, JWS signed by License Service."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/center/subscriptions">
              <ClipboardList className="mr-1.5 h-3.5 w-3.5" />
              Subscription plans
            </Link>
          </Button>
        }
      />
      <CenterLicensesList />
    </div>
  );
}
