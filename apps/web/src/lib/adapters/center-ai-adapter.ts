import type {
  ApiAiRecommendation,
  ApiAiStats,
  ApiClientAiAccess,
  ApiPlatformAiAgent,
} from "@/lib/api/ai";
import type {
  CenterAiAccessStatus,
  CenterAiCreditStatus,
  CenterClientAiAccess,
  CenterAiRecommendation,
  CenterPlatformAiAgent,
  CenterPlatformAiAgentId,
  CenterPlan,
  CenterClientStatus,
} from "@/lib/mock-data/center";

const ACCESS_MAP: Record<string, CenterAiAccessStatus> = {
  active: "active",
  disabled: "disabled",
  suspended: "suspended",
  pending: "pending",
};

const CREDIT_MAP: Record<string, CenterAiCreditStatus> = {
  ok: "ok",
  warning: "warning",
  exceeded: "exceeded",
  none: "none",
};

const AGENT_IDS = new Set([
  "chief",
  "health",
  "recommendation",
  "update",
  "license",
  "monitoring",
  "automation",
]);

export function apiAiStatsToCenter(stats: ApiAiStats) {
  return {
    fleet: stats.fleet,
    enabled: stats.enabled,
    agentsActive: stats.agents_active,
    agentsAllocated: stats.agents_allocated,
    creditPct: stats.credit_pct,
    creditWarnings: stats.credit_warnings,
    recommendations: stats.recommendations,
  };
}

export function apiFleetToCenter(rows: ApiClientAiAccess[]): CenterClientAiAccess[] {
  return rows.map(apiClientAiToCenter);
}

export function apiClientAiToCenter(row: ApiClientAiAccess): CenterClientAiAccess {
  return {
    clientId: row.client_id,
    businessName: row.business_name,
    plan: row.plan as CenterPlan,
    clientStatus: row.client_status as CenterClientStatus,
    aiEnabled: row.ai_enabled,
    accessStatus: ACCESS_MAP[row.access_status] ?? "disabled",
    agentsLimit: row.agents_limit,
    agentsActive: row.agents_active,
    creditsMonthly: row.credits_monthly,
    creditsUsed: row.credits_used,
    creditsStatus: CREDIT_MAP[row.credits_status] ?? "none",
    toolsEnabled: row.tools_enabled,
    lastAiRequest: row.last_ai_request ?? undefined,
    proxyMode: row.proxy_mode === "queued" ? "queued" : "cloud",
  };
}

export function apiRecommendationsToCenter(recs: ApiAiRecommendation[]): CenterAiRecommendation[] {
  return recs.map((rec) => ({
    id: rec.id,
    agent: (AGENT_IDS.has(rec.agent) ? rec.agent : "recommendation") as CenterPlatformAiAgentId,
    title: rec.title,
    detail: rec.detail,
    clientId: rec.client_id,
    clientName: rec.client_name,
    severity: rec.severity as CenterAiRecommendation["severity"],
    dismissed: rec.dismissed,
  }));
}

export function apiPlatformAgentsToCenter(agents: ApiPlatformAiAgent[]): CenterPlatformAiAgent[] {
  return agents.map((agent) => ({
    id: agent.id as CenterPlatformAiAgentId,
    label: agent.label,
    description: agent.description,
    autonomy: agent.autonomy,
    status: agent.status === "active" ? "active" : "idle",
  }));
}
