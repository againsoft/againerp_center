import { apiFetch } from "./client";

export type ApiClient = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  db_host: string;
  db_port: number;
  db_name: string;
  db_user: string;
  api_url: string | null;
  plan: string;
  status: string;
  is_active: boolean;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  agent_token?: string;
};

export type CreateClientPayload = {
  name: string;
  slug: string;
  domain?: string;
  db_host: string;
  db_port: number;
  db_name: string;
  db_user: string;
  db_password: string;
  api_url?: string;
  plan: string;
  notes?: string;
};

export async function fetchClients(): Promise<ApiClient[]> {
  return apiFetch<ApiClient[]>("/api/v1/clients");
}

export async function fetchClient(id: string): Promise<ApiClient> {
  return apiFetch<ApiClient>(`/api/v1/clients/${id}`);
}

export async function createClient(payload: CreateClientPayload): Promise<ApiClient> {
  return apiFetch<ApiClient>("/api/v1/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteClient(id: string): Promise<void> {
  await apiFetch(`/api/v1/clients/${id}`, { method: "DELETE" });
}

export async function testClientConnection(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/v1/clients/${id}/test-connection`, { method: "POST" });
}
