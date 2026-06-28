import { apiFetch } from "./client";

export type ApiMonitoringAgent = {
  client_id: string;
  business_name: string;
  instance_id: string;
  deployment_mode: string;
  server_host: string | null;
  agent_status: string;
  last_heartbeat_at: string | null;
  agent_version: string | null;
  erp_version: string | null;
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
  uptime_seconds: number | null;
  health_status: string;
  is_online: boolean;
};

export type ApiHealthSnapshot = {
  id: number;
  client_id: string;
  cpu_percent: number | null;
  memory_percent: number | null;
  disk_percent: number | null;
  status: string;
  recorded_at: string | null;
};

export type ApiMetricPoint = {
  label: string;
  cpu: number;
  ram: number;
  disk: number;
  apiP95: number;
};

export async function fetchMonitoringAgents(): Promise<ApiMonitoringAgent[]> {
  return apiFetch<ApiMonitoringAgent[]>("/api/v1/monitoring/agents");
}

export async function fetchHealthSnapshots(clientId?: string, limit = 48): Promise<ApiHealthSnapshot[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (clientId) params.set("client_id", clientId);
  return apiFetch<ApiHealthSnapshot[]>(`/api/v1/monitoring/snapshots?${params}`);
}

export async function fetchFleetMetricSeries(limit = 24): Promise<ApiMetricPoint[]> {
  return apiFetch<ApiMetricPoint[]>(`/api/v1/monitoring/fleet-series?limit=${limit}`);
}
