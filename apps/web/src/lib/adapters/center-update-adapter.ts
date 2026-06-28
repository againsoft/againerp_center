import type {
  ApiClientUpdate,
  ApiErpVersion,
  ApiUpdateRollout,
  ApiUpdateStats,
} from "@/lib/api/updates";
import type {
  CenterClientUpdate,
  CenterClientUpdateStatus,
  CenterErpVersion,
  CenterRolloutStage,
  CenterRolloutStatus,
  CenterUpdateChannel,
  CenterUpdateRollout,
  CenterUpdateType,
} from "@/lib/mock-data/center";

function mapChannel(channel: string): CenterUpdateChannel {
  const c = channel.toLowerCase();
  if (c === "beta") return "beta";
  if (c === "lts") return "lts";
  if (c === "hotfix") return "hotfix";
  return "stable";
}

function mapType(type: string): CenterUpdateType {
  const t = type.toLowerCase();
  if (t === "hotfix") return "hotfix";
  if (t === "minor") return "minor";
  if (t === "major") return "major";
  return "patch";
}

function mapRolloutStage(stage: string): CenterRolloutStage {
  const s = stage.toLowerCase();
  if (s in { canary: 1, early: 1, tier1: 1, tier2: 1, ga: 1, draft: 1 }) {
    return s as CenterRolloutStage;
  }
  return "canary";
}

function mapRolloutStatus(status: string): CenterRolloutStatus {
  const s = status.toLowerCase();
  if (s === "paused") return "paused";
  if (s === "completed") return "completed";
  if (s === "aborted") return "aborted";
  return "active";
}

function mapClientUpdateStatus(status: string): CenterClientUpdateStatus {
  const s = status.toLowerCase();
  if (s === "available") return "available";
  if (s === "scheduled") return "scheduled";
  if (s === "applying") return "applying";
  if (s === "validating") return "validating";
  if (s === "failed") return "failed";
  if (s === "rolling_back") return "rolling_back";
  return "up_to_date";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function apiVersionToCenterVersion(v: ApiErpVersion): CenterErpVersion {
  return {
    id: v.id,
    version: v.version,
    channel: mapChannel(v.channel),
    type: mapType(v.type),
    releasedAt: formatDate(v.released_at),
    agentMinVersion: v.agent_min_version,
    summary: v.summary ?? "",
    rolloutStage: mapRolloutStage(v.rollout_stage),
    isLatest: v.is_latest,
  };
}

export function apiRolloutToCenterRollout(r: ApiUpdateRollout): CenterUpdateRollout {
  return {
    id: r.id,
    name: r.name,
    targetVersion: r.target_version,
    channel: mapChannel(r.channel),
    type: mapType(r.type),
    stage: mapRolloutStage(r.stage),
    status: mapRolloutStatus(r.status),
    startedAt: formatDate(r.started_at),
    soakUntil: formatDate(r.soak_until),
    clientsTotal: r.clients_total,
    clientsComplete: r.clients_complete,
    clientsFailed: r.clients_failed,
    clientsPending: r.clients_pending,
  };
}

export function apiClientUpdateToCenter(u: ApiClientUpdate): CenterClientUpdate {
  return {
    id: u.id,
    clientId: u.client_id,
    businessName: u.business_name ?? u.client_id,
    currentVersion: u.current_version,
    targetVersion: u.target_version,
    channel: mapChannel(u.channel),
    status: mapClientUpdateStatus(u.status),
    autoUpdate: u.auto_update,
    scheduledAt: u.scheduled_label ?? undefined,
    lastAttempt: u.last_attempt ?? undefined,
    errorMessage: u.error_message ?? undefined,
    rolloutId: u.rollout_id ?? undefined,
  };
}

export function apiStatsToCenterUpdateStats(stats: ApiUpdateStats) {
  return {
    upToDate: stats.up_to_date,
    pending: stats.pending,
    failed: stats.failed,
    activeRollouts: stats.active_rollouts,
    latest: stats.latest,
  };
}

export function findRolloutForUpdate(
  update: CenterClientUpdate,
  rollouts: CenterUpdateRollout[],
): CenterUpdateRollout | undefined {
  if (!update.rolloutId) return undefined;
  return rollouts.find((r) => r.id === update.rolloutId);
}
