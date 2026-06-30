"use client";

import { UserPlus } from "lucide-react";
import { CenterRegistrationsList } from "@/components/center/registrations/center-registrations-list";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { centerRegistrations, getCenterPendingRegistrationCount } from "@/lib/mock-data/center";

export default function CenterRegistrationsPage() {
  const pending = getCenterPendingRegistrationCount();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Registrations"
        title="New Business Signups"
        count={centerRegistrations.length}
        description="Review intake before creating client record, subscription, and Edge Agent activation bundle."
        actions={
          <Button size="sm" disabled>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Manual registration
          </Button>
        }
      />

      {pending > 0 ? (
        <p className="text-xs text-amber-700 dark:text-amber-300">
          {pending} pending — approve to start onboarding pipeline (see lifecycle doc Step 05).
        </p>
      ) : null}

      <CenterRegistrationsList />
    </div>
  );
}
