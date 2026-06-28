"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { CenterRegistrationFormDialog } from "@/components/center/registrations/center-registration-form-dialog";
import { CenterRegistrationsList } from "@/components/center/registrations/center-registrations-list";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";

export default function CenterRegistrationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pending, setPending] = useState(0);
  const [total, setTotal] = useState(0);

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Registrations"
        title="New Business Signups"
        live
        count={total || undefined}
        description="Review intake before creating client record, subscription, and Edge Agent activation bundle."
        actions={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Manual registration
          </Button>
        }
      />

      {pending > 0 ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {pending} pending — approve to start onboarding pipeline (lifecycle doc Step 05).
        </p>
      ) : null}

      <CenterRegistrationsList
        refreshKey={refreshKey}
        onStatsChange={({ pending: p, total: t }) => {
          setPending(p);
          setTotal(t);
        }}
      />

      <CenterRegistrationFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />

      <p className="text-xs text-muted-foreground">
        Live data from Control Center API · Approve creates client + subscription + license + agent token.
      </p>
    </div>
  );
}
