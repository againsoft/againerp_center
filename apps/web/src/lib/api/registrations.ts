import { apiFetch } from "./client";

export type ApiRegistration = {
  id: string;
  business_name: string;
  contact_name: string;
  contact_email: string;
  phone: string | null;
  requested_plan: string;
  requested_modules: string[];
  wants_ai: boolean;
  industry: string | null;
  deployment_mode: string;
  region: string | null;
  website: string | null;
  employee_count: string | null;
  referral_source: string | null;
  status: string;
  operator_notes: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  client_id: string | null;
  submitted_at: string | null;
};

export type CreateRegistrationPayload = {
  business_name: string;
  contact_name: string;
  contact_email: string;
  phone?: string;
  requested_plan: string;
  requested_modules?: string[];
  wants_ai?: boolean;
  industry?: string;
  deployment_mode?: string;
  region?: string;
  website?: string;
  employee_count?: string;
  referral_source?: string;
  operator_notes?: string;
};

export type ApproveRegistrationResult = {
  registration: ApiRegistration;
  client_id: string;
  client_slug: string;
  agent_token: string;
};

export async function fetchRegistrations(status?: string): Promise<ApiRegistration[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<ApiRegistration[]>(`/api/v1/registrations${qs}`);
}

export async function createRegistration(payload: CreateRegistrationPayload): Promise<ApiRegistration> {
  return apiFetch<ApiRegistration>("/api/v1/registrations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function approveRegistration(
  id: string,
  operatorNotes?: string,
): Promise<ApproveRegistrationResult> {
  return apiFetch<ApproveRegistrationResult>(`/api/v1/registrations/${id}/approve`, {
    method: "POST",
    body: JSON.stringify({ operator_notes: operatorNotes }),
  });
}

export async function rejectRegistration(id: string, reason: string): Promise<ApiRegistration> {
  return apiFetch<ApiRegistration>(`/api/v1/registrations/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
