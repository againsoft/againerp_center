import { apiFetch } from "./client";

export type ApiAgentConsoleStats = {
  pending_commands: number;
  succeeded_commands: number;
  failed_or_expired: number;
  pending_activations: number;
  offline_agents: number;
  queued_items: number;
  diagnostics_ready: number;
  diagnostics_pending: number;
};

export type ApiAgentCommand = {
  id: string;
  client_id: string;
  business_name: string;
  type: string;
  risk: string;
  status: string;
  issued_at: string | null;
  expires_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  issued_by: string;
  payload_summary: string;
  result_summary: string | null;
  signature_valid: boolean;
  correlation_id: string;
};

export type ApiActivationBundle = {
  id: string;
  client_id: string;
  business_name: string;
  status: string;
  created_at: string | null;
  expires_at: string | null;
  activated_at: string | null;
  bootstrap_token_prefix: string;
  created_by: string;
};

export type ApiAgentSyncQueue = {
  id: string;
  client_id: string;
  business_name: string;
  connectivity: string;
  queue_type: string;
  pending_count: number;
  oldest_queued_at: string | null;
  grace_active: boolean;
  grace_expires_at: string | null;
  last_flush_at: string | null;
  summary: string;
};

export type ApiAgentDiagnostic = {
  id: string;
  client_id: string;
  business_name: string;
  command_id: string | null;
  status: string;
  requested_at: string | null;
  requested_by: string;
  bundle_size_mb: number | null;
  uploaded_at: string | null;
  expires_at: string | null;
  bundle_prefix: string;
};

export async function fetchAgentConsoleStats(): Promise<ApiAgentConsoleStats> {
  return apiFetch<ApiAgentConsoleStats>("/api/v1/agents/stats");
}

export async function fetchAgentCommands(clientId?: string): Promise<ApiAgentCommand[]> {
  const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : "";
  return apiFetch<ApiAgentCommand[]>(`/api/v1/agents/commands${qs}`);
}

export async function fetchActivationBundles(clientId?: string): Promise<ApiActivationBundle[]> {
  const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : "";
  return apiFetch<ApiActivationBundle[]>(`/api/v1/agents/activations${qs}`);
}

export async function fetchAgentSyncQueues(): Promise<ApiAgentSyncQueue[]> {
  return apiFetch<ApiAgentSyncQueue[]>("/api/v1/agents/sync-queues");
}

export async function fetchAgentDiagnostics(clientId?: string): Promise<ApiAgentDiagnostic[]> {
  const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : "";
  return apiFetch<ApiAgentDiagnostic[]>(`/api/v1/agents/diagnostics${qs}`);
}

export async function requestAgentDiagnostics(clientId: string): Promise<ApiAgentDiagnostic> {
  return apiFetch<ApiAgentDiagnostic>("/api/v1/agents/diagnostics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId }),
  });
}

export async function createActivationBundle(clientId: string): Promise<{ bundle: ApiActivationBundle; bootstrap_token: string }> {
  return apiFetch("/api/v1/agents/activations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId }),
  });
}
