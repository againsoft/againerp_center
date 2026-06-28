"use client";

import { CenterBackupStats } from "@/components/center/backups/center-backup-stats";
import { CenterBackupsView } from "@/components/center/backups/center-backups-view";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { getCenterBackupStats } from "@/lib/mock-data/center";

export function CenterBackupsPageContent() {
  const stats = getCenterBackupStats();

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Backups"
        title="Backup Status"
        count={stats.fleet}
        description="Policy, verification, and retention metadata — backup files never leave client infrastructure."
      />

      <CenterBackupStats />
      <CenterBackupsView />
    </div>
  );
}
