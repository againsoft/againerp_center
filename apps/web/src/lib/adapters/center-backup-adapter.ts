import type { ApiBackupRecord, ApiBackupStats, ApiClientBackupStatus } from "@/lib/api/backups";
import type {
  CenterBackupRecord,
  CenterBackupStatus,
  CenterBackupStorageTarget,
  CenterBackupType,
  CenterClientBackupStatus,
  CenterPlan,
} from "@/lib/mock-data/center";

const PLAN_MAP: Record<string, CenterPlan> = {
  starter: "starter",
  business: "business",
  professional: "business",
  enterprise: "enterprise",
  custom: "custom",
};

function mapPlan(plan: string): CenterPlan {
  return PLAN_MAP[plan.toLowerCase()] ?? "starter";
}

function mapStatus(status: string): CenterBackupStatus {
  const s = status.toLowerCase();
  if (s === "verified") return "verified";
  if (s === "completed") return "completed";
  if (s === "running") return "running";
  if (s === "failed") return "failed";
  if (s === "overdue") return "overdue";
  return "completed";
}

function mapStorage(target: string): CenterBackupStorageTarget {
  if (target === "client_s3") return "client_s3";
  if (target === "platform_assisted") return "platform_assisted";
  return "local";
}

function mapType(type: string): CenterBackupType {
  const t = type.toLowerCase();
  if (t === "incremental") return "incremental";
  if (t === "media") return "media";
  if (t === "config") return "config";
  if (t === "pre_update") return "pre_update";
  return "full";
}

export function apiFleetStatusToCenter(s: ApiClientBackupStatus): CenterClientBackupStatus {
  return {
    clientId: s.client_id,
    businessName: s.business_name,
    plan: mapPlan(s.plan),
    lastBackupAt: s.last_backup_at,
    lastBackupType: mapType(s.last_backup_type),
    status: mapStatus(s.status),
    sizeMb: s.size_mb,
    retentionDays: s.retention_days,
    scheduleLabel: s.schedule_label,
    storageTarget: mapStorage(s.storage_target),
    verificationEnabled: s.verification_enabled,
    nextScheduled: s.next_scheduled,
    hoursSinceBackup: s.hours_since_backup,
    policyMaxAgeHours: s.policy_max_age_hours,
    checksumMasked: s.checksum_masked,
    errorMessage: s.error_message ?? undefined,
  };
}

export function apiRecordToCenter(r: ApiBackupRecord): CenterBackupRecord {
  return {
    id: r.id,
    clientId: r.client_id,
    businessName: r.business_name ?? r.client_id,
    type: mapType(r.type),
    status: mapStatus(r.status),
    startedAt: r.started_label,
    completedAt: r.completed_label ?? undefined,
    sizeMb: r.size_mb,
    checksumMasked: r.checksum_masked,
    storageTarget: mapStorage(r.storage_target),
    verifiedAt: r.verified_at ? new Date(r.verified_at).toLocaleString() : undefined,
    errorMessage: r.error_message ?? undefined,
  };
}

export function apiStatsToCenter(stats: ApiBackupStats) {
  return {
    verified: stats.verified,
    overdue: stats.overdue,
    pendingVerify: stats.pending_verify,
    totalMetadataMb: stats.total_metadata_mb,
    fleet: stats.fleet,
  };
}

export function apiFleetToCenter(statuses: ApiClientBackupStatus[]): CenterClientBackupStatus[] {
  return statuses.map(apiFleetStatusToCenter);
}

export function apiRunsToCenter(runs: ApiBackupRecord[]): CenterBackupRecord[] {
  return runs.map(apiRecordToCenter);
}
