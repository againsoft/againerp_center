import { apiFetch } from "./client";

export type ApiServer = {
  id: string;
  client_id: string;
  client_name: string | null;
  instance_id: string;
  hostname: string | null;
  agent_version: string | null;
  erp_version: string | null;
  os_info: string | null;
  health_status: string;
  is_online: boolean;
  last_heartbeat_at: string | null;
  created_at: string | null;
};

export async function fetchServers(clientId?: string): Promise<ApiServer[]> {
  const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : "";
  return apiFetch<ApiServer[]>(`/api/v1/servers${qs}`);
}
