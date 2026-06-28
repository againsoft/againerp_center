import { apiFetch } from "./client";

export type ApiApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  owner_type: string;
  owner_id: string | null;
  owner_label: string;
  scopes: string[];
  status: string;
  created_at: string | null;
  last_used_at: string | null;
  expires_at: string | null;
};

export type ApiApiKeyCreateResult = {
  key: ApiApiKey;
  secret: string;
};

export async function fetchApiKeys(): Promise<ApiApiKey[]> {
  return apiFetch<ApiApiKey[]>("/api/v1/api-keys");
}

export async function createApiKey(body: {
  name: string;
  owner_type?: string;
  owner_label: string;
  owner_id?: string;
  scopes?: string[];
  expires_days?: number;
}): Promise<ApiApiKeyCreateResult> {
  return apiFetch<ApiApiKeyCreateResult>("/api/v1/api-keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function revokeApiKey(keyId: string): Promise<ApiApiKey> {
  return apiFetch<ApiApiKey>(`/api/v1/api-keys/${keyId}/revoke`, { method: "POST" });
}
