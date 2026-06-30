"use client";

import { Plus } from "lucide-react";
import { CenterClientsList } from "@/components/center/clients/center-clients-list";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { centerClients } from "@/lib/mock-data/center";

export default function CenterClientsPage() {
  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Clients"
        title="ERP Clients"
        count={centerClients.length}
        description="Fleet registry — subscriptions, modules, agent health, and lifecycle management."
        actions={
          <Button size="sm" disabled>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add client
          </Button>
        }
      />

      <CenterClientsList />
    </div>
  );
}
