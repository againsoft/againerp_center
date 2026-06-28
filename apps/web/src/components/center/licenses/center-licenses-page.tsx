"use client";

import Link from "next/link";
import { ClipboardList, Loader2 } from "lucide-react";
import { CenterLicensesList } from "@/components/center/licenses/center-licenses-list";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { apiLicensesToCenterLicenses } from "@/lib/adapters/center-license-adapter";
import { fetchClients } from "@/lib/api/clients";
import { fetchLicenses } from "@/lib/api/licenses";
import type { CenterLicense } from "@/lib/mock-data/center";
import { useCallback, useEffect, useState } from "react";

export function CenterLicensesPageContent() {
  const [licenses, setLicenses] = useState<CenterLicense[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [lics, clients] = await Promise.all([fetchLicenses(), fetchClients()]);
      setLicenses(apiLicensesToCenterLicenses(lics, clients));
    } catch {
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Licenses"
        title="License Center"
        live
        count={licenses.length}
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

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading licenses…
        </div>
      ) : (
        <CenterLicensesList licenses={licenses} />
      )}

      {!loading && (
        <p className="text-xs text-muted-foreground">
          Live data from Control Center API · Full license keys shown only at client creation.
        </p>
      )}
    </div>
  );
}
