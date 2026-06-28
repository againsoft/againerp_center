"use client";

import { CenterModuleTierStats } from "@/components/center/modules/center-module-tier-stats";
import { CenterModulesList } from "@/components/center/modules/center-modules-list";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { centerModules } from "@/lib/mock-data/center";

export function CenterModulesPageContent() {
  const withDeps = centerModules.filter((m) => m.dependencies.length > 0).length;

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Modules"
        title="ERP Module Catalog"
        count={centerModules.length}
        description={`Platform-wide module definitions — ${withDeps} with dependencies. Enable per client from client detail or subscription plan.`}
      />

      <CenterModuleTierStats />
      <CenterModulesList />
    </div>
  );
}
