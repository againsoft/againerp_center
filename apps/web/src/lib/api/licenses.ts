import { apiFetch } from "./client";

export type ApiLicense = {
  id: string;
  client_id: string;
  subscription_id: string | null;
  license_key: string;
  status: string;
  plan: string;
  issued_at: string | null;
  expires_at: string | null;
  grace_ends_at: string | null;
  created_at: string | null;
};

export async function fetchLicenses(clientId?: string): Promise<ApiLicense[]> {
  const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : "";
  return apiFetch<ApiLicense[]>(`/api/v1/licenses${qs}`);
}

export async function validateLicenseKey(licenseKey: string): Promise<{ valid: boolean; status?: string; reason?: string }> {
  return apiFetch("/api/v1/licenses/validate", {
    method: "POST",
    body: JSON.stringify({ license_key: licenseKey }),
  });
}
