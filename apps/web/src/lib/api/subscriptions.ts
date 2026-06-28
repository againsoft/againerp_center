import { apiFetch } from "./client";

export type ApiSubscription = {
  id: string;
  client_id: string;
  plan: string;
  status: string;
  billing_cycle: string;
  seats_purchased: number;
  ai_credits_monthly: number;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  created_at: string | null;
};

export async function fetchSubscriptions(clientId?: string): Promise<ApiSubscription[]> {
  const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : "";
  return apiFetch<ApiSubscription[]>(`/api/v1/subscriptions${qs}`);
}
