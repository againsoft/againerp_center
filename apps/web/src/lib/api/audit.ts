import { apiFetch } from "./client";

export type ApiAuditLog = {
  id: number;
  operator_id: string | null;
  operator_email: string | null;
  action: string;
  resource: string | null;
  resource_id: string | null;
  detail: string | null;
  ip_address: string | null;
  created_at: string | null;
};

export async function fetchAuditLogs(resource?: string, limit = 200): Promise<ApiAuditLog[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (resource) params.set("resource", resource);
  return apiFetch<ApiAuditLog[]>(`/api/v1/audit/?${params}`);
}
