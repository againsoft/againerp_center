import { apiFetch } from "./client";

export type ApiOperator = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: string;
  mfa_enabled: boolean;
  mfa_type: string | null;
  last_login: string | null;
  created_at: string | null;
};

export async function fetchOperators(): Promise<ApiOperator[]> {
  return apiFetch<ApiOperator[]>("/api/v1/operators");
}

export async function fetchCurrentOperator(): Promise<ApiOperator> {
  return apiFetch<ApiOperator>("/api/v1/operators/me");
}
