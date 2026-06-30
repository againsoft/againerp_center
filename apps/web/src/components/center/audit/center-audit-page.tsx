"use client";

import { Suspense } from "react";
import { CenterAuditList } from "@/components/center/audit/center-audit-list";
import { CenterAuditStats } from "@/components/center/audit/center-audit-stats";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { getCenterAuditStats } from "@/lib/mock-data/center";

export function CenterAuditPageContent() {
  const stats = getCenterAuditStats();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Audit Log"
        title="Audit Log"
        count={stats.total}
        description="Immutable operator, system, and agent action history — partitioned monthly, archived after 12 months."
      />

      <CenterAuditStats />

      <Suspense fallback={null}>
        <CenterAuditList />
      </Suspense>
    </div>
  );
}
