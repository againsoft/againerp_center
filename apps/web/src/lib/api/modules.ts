import { apiFetch } from "./client";

export type ApiModule = {
  id: string;
  code: string;
  label: string;
  description: string | null;
  tier: string;
  dependencies: string[];
  min_erp_version: string;
  platform_default: boolean;
  feature_flag_key: string;
  is_core: boolean;
  client_count?: number;
};

export type ApiClientModuleState = ApiModule & {
  enabled: boolean;
  status: string;
  can_enable: boolean;
  can_disable: boolean;
  blocked_reason: string | null;
};

export type ApiModuleStats = {
  tiers: Record<string, number>;
  tier_defaults: Record<string, number>;
  client_counts: Record<string, number>;
  total_clients: number;
  module_count: number;
};

export async function fetchModules(): Promise<ApiModule[]> {
  return apiFetch<ApiModule[]>("/api/v1/modules");
}

export async function fetchModuleStats(): Promise<ApiModuleStats> {
  return apiFetch<ApiModuleStats>("/api/v1/modules/stats");
}

export async function fetchClientModules(clientId: string): Promise<ApiClientModuleState[]> {
  return apiFetch<ApiClientModuleState[]>(`/api/v1/modules/clients/${encodeURIComponent(clientId)}`);
}

export async function updateClientModules(
  clientId: string,
  enabledModules: string[],
): Promise<{ client_id: string; enabled_modules: string[] }> {
  return apiFetch(`/api/v1/modules/clients/${encodeURIComponent(clientId)}`, {
    method: "PUT",
    body: JSON.stringify({ enabled_modules: enabledModules }),
  });
}

export async function enableClientModule(clientId: string, moduleCode: string): Promise<void> {
  await apiFetch(`/api/v1/modules/clients/${encodeURIComponent(clientId)}/${encodeURIComponent(moduleCode)}/enable`, {
    method: "POST",
  });
}

export async function disableClientModule(clientId: string, moduleCode: string): Promise<void> {
  await apiFetch(`/api/v1/modules/clients/${encodeURIComponent(clientId)}/${encodeURIComponent(moduleCode)}/disable`, {
    method: "POST",
  });
}
