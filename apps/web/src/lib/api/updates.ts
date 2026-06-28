import { apiFetch } from "./client";

export type ApiErpVersion = {
  id: string;
  version: string;
  channel: string;
  type: string;
  released_at: string | null;
  agent_min_version: string;
  summary: string | null;
  rollout_stage: string;
  is_latest: boolean;
};

export type ApiUpdateRollout = {
  id: string;
  name: string;
  target_version: string;
  channel: string;
  type: string;
  stage: string;
  status: string;
  started_at: string | null;
  soak_until: string | null;
  clients_total: number;
  clients_complete: number;
  clients_failed: number;
  clients_pending: number;
};

export type ApiClientUpdate = {
  id: string;
  client_id: string;
  business_name: string | null;
  current_version: string;
  target_version: string | null;
  channel: string;
  status: string;
  auto_update: boolean;
  scheduled_at: string | null;
  scheduled_label: string | null;
  last_attempt: string | null;
  error_message: string | null;
  rollout_id: string | null;
};

export type ApiUpdateStats = {
  up_to_date: number;
  pending: number;
  failed: number;
  active_rollouts: number;
  latest: string;
};

export async function fetchUpdateStats(): Promise<ApiUpdateStats> {
  return apiFetch<ApiUpdateStats>("/api/v1/updates/stats");
}

export async function fetchErpVersions(): Promise<ApiErpVersion[]> {
  return apiFetch<ApiErpVersion[]>("/api/v1/updates/versions");
}

export async function fetchUpdateRollouts(status?: string): Promise<ApiUpdateRollout[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<ApiUpdateRollout[]>(`/api/v1/updates/rollouts${qs}`);
}

export async function fetchFleetUpdates(opts?: {
  clientId?: string;
  status?: string;
  channel?: string;
}): Promise<ApiClientUpdate[]> {
  const params = new URLSearchParams();
  if (opts?.clientId) params.set("client_id", opts.clientId);
  if (opts?.status) params.set("status", opts.status);
  if (opts?.channel) params.set("channel", opts.channel);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<ApiClientUpdate[]>(`/api/v1/updates/fleet${qs}`);
}

export async function createRollout(body: {
  name: string;
  erp_version_id: string;
  stage?: string;
}): Promise<ApiUpdateRollout> {
  return apiFetch<ApiUpdateRollout>("/api/v1/updates/rollouts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function advanceRollout(rolloutId: string): Promise<ApiUpdateRollout> {
  return apiFetch<ApiUpdateRollout>(`/api/v1/updates/rollouts/${encodeURIComponent(rolloutId)}/advance`, {
    method: "POST",
  });
}

export async function pauseRollout(rolloutId: string): Promise<ApiUpdateRollout> {
  return apiFetch<ApiUpdateRollout>(`/api/v1/updates/rollouts/${encodeURIComponent(rolloutId)}/pause`, {
    method: "POST",
  });
}

export async function pushClientUpdate(clientId: string): Promise<ApiClientUpdate> {
  return apiFetch<ApiClientUpdate>(`/api/v1/updates/fleet/${encodeURIComponent(clientId)}/push`, {
    method: "POST",
  });
}

export async function rollbackClientUpdate(clientId: string): Promise<ApiClientUpdate> {
  return apiFetch<ApiClientUpdate>(`/api/v1/updates/fleet/${encodeURIComponent(clientId)}/rollback`, {
    method: "POST",
  });
}
