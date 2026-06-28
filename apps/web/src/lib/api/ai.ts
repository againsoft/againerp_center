import { apiFetch } from "./client";

export type ApiAiStats = {
  fleet: number;
  enabled: number;
  agents_active: number;
  agents_allocated: number;
  credit_pct: number;
  credit_warnings: number;
  recommendations: number;
};

export type ApiClientAiAccess = {
  client_id: string;
  business_name: string;
  plan: string;
  client_status: string;
  ai_enabled: boolean;
  access_status: string;
  agents_limit: number;
  agents_active: number;
  credits_monthly: number;
  credits_used: number;
  credits_status: string;
  tools_enabled: string[];
  last_ai_request: string | null;
  proxy_mode: string;
};

export type ApiAiRecommendation = {
  id: string;
  agent: string;
  title: string;
  detail: string;
  client_id?: string;
  client_name?: string;
  severity: string;
  dismissed: boolean;
};

export type ApiPlatformAiAgent = {
  id: string;
  label: string;
  description: string;
  autonomy: string;
  status: string;
};

export type ApiChiefBriefingInsight = {
  id: string;
  source: string;
  text: string;
  href: string | null;
  href_label: string | null;
};

export type ApiChiefAiBriefing = {
  generated_at: string;
  summary: string;
  insights: ApiChiefBriefingInsight[];
  credit_note: string | null;
};

export async function fetchAiStats(): Promise<ApiAiStats> {
  return apiFetch<ApiAiStats>("/api/v1/ai/stats");
}

export async function fetchAiFleet(): Promise<ApiClientAiAccess[]> {
  return apiFetch<ApiClientAiAccess[]>("/api/v1/ai/fleet");
}

export async function fetchAiRecommendations(): Promise<ApiAiRecommendation[]> {
  return apiFetch<ApiAiRecommendation[]>("/api/v1/ai/recommendations");
}

export async function fetchPlatformAiAgents(): Promise<ApiPlatformAiAgent[]> {
  return apiFetch<ApiPlatformAiAgent[]>("/api/v1/ai/agents");
}

export async function fetchChiefBriefing(): Promise<ApiChiefAiBriefing> {
  return apiFetch<ApiChiefAiBriefing>("/api/v1/ai/briefing");
}

export async function fetchClientAiAccess(clientId: string): Promise<ApiClientAiAccess> {
  return apiFetch<ApiClientAiAccess>(`/api/v1/ai/clients/${clientId}`);
}
