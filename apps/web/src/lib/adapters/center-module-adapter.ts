import type { ApiClientModuleState, ApiModule, ApiModuleStats } from "@/lib/api/modules";
import type { CenterModuleDefinition, CenterModuleId } from "@/lib/mock-data/center";

const MODULE_IDS = new Set<string>([
  "catalog",
  "orders",
  "customers",
  "inventory",
  "marketing",
  "suppliers",
  "ai-os",
  "configurator",
  "reports",
  "seo",
  "media",
]);

function mapTier(tier: string): CenterModuleDefinition["tier"] {
  if (tier === "growth") return "growth";
  if (tier === "premium") return "premium";
  return "core";
}

export function apiModuleToCenterModule(mod: ApiModule): CenterModuleDefinition {
  const deps = mod.dependencies.filter((d): d is CenterModuleId => MODULE_IDS.has(d));
  return {
    id: mod.code as CenterModuleId,
    label: mod.label,
    description: mod.description ?? "",
    tier: mapTier(mod.tier),
    dependencies: deps,
    minErpVersion: mod.min_erp_version,
    platformDefault: mod.platform_default,
    featureFlagKey: mod.feature_flag_key,
  };
}

export function apiModulesToCenterModules(modules: ApiModule[]): CenterModuleDefinition[] {
  return modules.map(apiModuleToCenterModule);
}

export function apiStatsToTierStats(stats: ApiModuleStats) {
  return {
    core: { count: stats.tiers.core ?? 0, defaults: stats.tier_defaults.core ?? 0 },
    growth: { count: stats.tiers.growth ?? 0, defaults: stats.tier_defaults.growth ?? 0 },
    premium: { count: stats.tiers.premium ?? 0, defaults: stats.tier_defaults.premium ?? 0 },
    clientCounts: stats.client_counts,
    totalClients: stats.total_clients,
    moduleCount: stats.module_count,
  };
}

export function clientModuleStatesToEnabledIds(states: ApiClientModuleState[]): CenterModuleId[] {
  return states.filter((s) => s.enabled).map((s) => s.code as CenterModuleId);
}
