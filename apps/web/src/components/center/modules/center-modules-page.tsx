"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { CenterModuleTierStats } from "@/components/center/modules/center-module-tier-stats";
import { CenterModulesList } from "@/components/center/modules/center-modules-list";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { useModulesData } from "@/lib/hooks/use-modules-data";

export function CenterModulesPageContent() {
  const { modules, stats, loading, error, refresh } = useModulesData();
  const withDeps = modules.filter((m) => m.dependencies.length > 0).length;

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Modules"
        title="ERP Module Catalog"
        live
        count={loading ? undefined : modules.length}
        description={
          loading
            ? "Loading platform module registry…"
            : `Platform-wide module definitions — ${withDeps} with dependencies. Enable per client from client detail or subscription plan.`
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          {error}
        </div>
      ) : null}

      <CenterModuleTierStats stats={stats} loading={loading} />
      <CenterModulesList modules={modules} stats={stats} loading={loading} />
    </div>
  );
}
