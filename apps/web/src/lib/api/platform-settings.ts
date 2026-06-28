import { apiFetch } from "./client";

export type PlatformSetting = {
  key: string;
  value: string | null;
  description: string | null;
  is_secret: boolean;
  group: string;
  label: string;
  configured: boolean;
};

export async function fetchPlatformSettings(): Promise<PlatformSetting[]> {
  return apiFetch<PlatformSetting[]>("/api/v1/platform-settings");
}

export async function upsertPlatformSetting(key: string, value: string): Promise<PlatformSetting> {
  return apiFetch<PlatformSetting>(`/api/v1/platform-settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
}

export async function clearPlatformSetting(key: string): Promise<void> {
  await apiFetch(`/api/v1/platform-settings/${key}`, { method: "DELETE" });
}

export type PageSpeedTestResult = {
  ok: boolean;
  message: string;
  url?: string;
  strategy?: string;
  performance_score?: number;
  analysis_url?: string;
};

export async function testPageSpeedApiKey(): Promise<PageSpeedTestResult> {
  return apiFetch<PageSpeedTestResult>("/api/v1/platform-settings/pagespeed_api_key/test", {
    method: "POST",
  });
}
