import { apiFetch } from "./client";

export type ApiPlatformNotification = {
  id: string;
  category: string;
  severity: string;
  title: string;
  body: string;
  href: string;
  time: string;
  created_at: string | null;
};

export async function fetchNotifications(): Promise<ApiPlatformNotification[]> {
  return apiFetch<ApiPlatformNotification[]>("/api/v1/notifications");
}
