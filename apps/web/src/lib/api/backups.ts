import { apiFetch } from "./client";

export type ApiBackupStats = {
  verified: number;
  overdue: number;
  pending_verify: number;
  total_metadata_mb: number;
  fleet: number;
};

export type ApiClientBackupStatus = {
  client_id: string;
  business_name: string;
  plan: string;
  last_backup_at: string;
  last_backup_type: string;
  status: string;
  size_mb: number;
  retention_days: number;
  schedule_label: string;
  storage_target: string;
  verification_enabled: boolean;
  next_scheduled: string;
  hours_since_backup: number;
  policy_max_age_hours: number;
  checksum_masked: string;
  error_message: string | null;
};

export type ApiBackupRecord = {
  id: string;
  client_id: string;
  business_name: string | null;
  type: string;
  status: string;
  started_at: string | null;
  started_label: string;
  completed_at: string | null;
  completed_label: string | null;
  size_mb: number;
  checksum_masked: string;
  storage_target: string;
  verified_at: string | null;
  error_message: string | null;
};

export async function fetchBackupStats(): Promise<ApiBackupStats> {
  return apiFetch<ApiBackupStats>("/api/v1/backups/stats");
}

export async function fetchBackupFleet(): Promise<ApiClientBackupStatus[]> {
  return apiFetch<ApiClientBackupStatus[]>("/api/v1/backups/fleet");
}

export async function fetchBackupRuns(clientId?: string): Promise<ApiBackupRecord[]> {
  const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : "";
  return apiFetch<ApiBackupRecord[]>(`/api/v1/backups/runs${qs}`);
}

export async function triggerClientBackup(
  clientId: string,
  backupType = "full",
): Promise<ApiBackupRecord> {
  return apiFetch<ApiBackupRecord>(`/api/v1/backups/clients/${encodeURIComponent(clientId)}/trigger`, {
    method: "POST",
    body: JSON.stringify({ backup_type: backupType }),
  });
}

export async function verifyBackupRun(recordId: string): Promise<ApiBackupRecord> {
  return apiFetch<ApiBackupRecord>(`/api/v1/backups/runs/${encodeURIComponent(recordId)}/verify`, {
    method: "POST",
  });
}
