import { apiFetch } from "./client";

export type AuthOperator = {
  id: string;
  email: string;
  username: string;
  role: string;
  full_name: string | null;
  mfa_enabled?: boolean;
  mfa_type?: string | null;
};

export type LoginResult = {
  mfa_required: boolean;
  token?: string;
  mfa_token?: string;
  operator?: AuthOperator | { email: string; full_name: string | null };
};

export type MfaStatus = {
  enabled: boolean;
  type: string | null;
  pending_setup: boolean;
};

export type MfaSetupResult = {
  secret: string;
  provisioning_uri: string;
  issuer: string;
};

export async function login(email: string, password: string): Promise<LoginResult> {
  return apiFetch<LoginResult>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function verifyMfaLogin(mfaToken: string, code: string): Promise<{ token: string; operator: AuthOperator }> {
  return apiFetch("/api/v1/auth/mfa/verify", {
    method: "POST",
    body: JSON.stringify({ mfa_token: mfaToken, code }),
  });
}

export async function fetchMfaStatus(): Promise<MfaStatus> {
  return apiFetch<MfaStatus>("/api/v1/auth/mfa/status");
}

export async function startMfaSetup(): Promise<MfaSetupResult> {
  return apiFetch<MfaSetupResult>("/api/v1/auth/mfa/setup", { method: "POST" });
}

export async function confirmMfaSetup(code: string): Promise<{ ok: boolean; mfa: MfaStatus }> {
  return apiFetch("/api/v1/auth/mfa/confirm", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function disableMfa(code: string): Promise<{ ok: boolean; mfa: MfaStatus }> {
  return apiFetch("/api/v1/auth/mfa/disable", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function stepUpMfa(code: string): Promise<{ token: string; step_up_valid_minutes: number }> {
  return apiFetch("/api/v1/auth/step-up", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function fetchAuthMe(): Promise<AuthOperator> {
  return apiFetch<AuthOperator>("/api/v1/auth/me");
}
