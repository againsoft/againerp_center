"use client";

import { useState } from "react";
import { CenterBackupRunsTable } from "@/components/center/backups/center-backup-runs-table";
import { CenterBackupsList } from "@/components/center/backups/center-backups-list";
import type { CenterBackupRecord, CenterClientBackupStatus } from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

const views = [
  { key: "fleet" as const, label: "Fleet status" },
  { key: "runs" as const, label: "Recent runs" },
];

type Props = {
  fleet: CenterClientBackupStatus[];
  runs: CenterBackupRecord[];
  loading?: boolean;
  onTriggerBackup: (clientId: string) => Promise<void>;
  onVerifyRun: (recordId: string) => Promise<void>;
  getClientRuns: (clientId: string) => CenterBackupRecord[];
};

export function CenterBackupsView({
  fleet,
  runs,
  loading,
  onTriggerBackup,
  onVerifyRun,
  getClientRuns,
}: Props) {
  const [view, setView] = useState<"fleet" | "runs">("fleet");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b pb-1">
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              view === v.key
                ? "bg-violet-100 font-medium text-violet-900 dark:bg-violet-950 dark:text-violet-100"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "fleet" ? (
        <CenterBackupsList
          fleet={fleet}
          loading={loading}
          onTriggerBackup={onTriggerBackup}
          onVerifyRun={onVerifyRun}
          getClientRuns={getClientRuns}
        />
      ) : (
        <CenterBackupRunsTable runs={runs} loading={loading} />
      )}
    </div>
  );
}
