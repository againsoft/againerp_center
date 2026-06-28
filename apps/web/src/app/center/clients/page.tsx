"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { CenterClientsList } from "@/components/center/clients/center-clients-list";
import { CenterClientFormDialog } from "@/components/center/clients/center-client-form-dialog";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";

export default function CenterClientsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Clients"
        title="ERP Clients"
        description="Fleet registry — subscriptions, modules, agent health, and lifecycle management."
        actions={
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add client
          </Button>
        }
      />

      <CenterClientsList refreshKey={refreshKey} />

      <CenterClientFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
