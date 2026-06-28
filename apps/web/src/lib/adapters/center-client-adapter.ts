import type { ApiClient } from "@/lib/api/clients";
import type { CenterClient, CenterClientStatus, CenterPlan } from "@/lib/mock-data/center";

const PLAN_MAP: Record<string, CenterPlan> = {
  starter: "starter",
  pro: "business",
  business: "business",
  enterprise: "enterprise",
  custom: "custom",
};

function mapPlan(plan: string): CenterPlan {
  return PLAN_MAP[plan.toLowerCase()] ?? "starter";
}

function mapStatus(client: ApiClient): CenterClientStatus {
  if (!client.is_active) return "suspended";
  const s = client.status.toLowerCase();
  if (s === "trial") return "trial";
  if (s === "pending") return "pending";
  if (s === "suspended") return "suspended";
  return "active";
}

export function apiClientToCenterClient(client: ApiClient): CenterClient {
  const registeredAt = client.created_at ?? new Date().toISOString();
  const lastHeartbeat = client.updated_at ?? registeredAt;

  return {
    id: client.id,
    businessName: client.name,
    slug: client.slug,
    contactName: "—",
    contactEmail: "—",
    phone: "—",
    status: mapStatus(client),
    plan: mapPlan(client.plan),
    modules: ["catalog", "orders", "customers", "inventory"],
    aiEnabled: false,
    aiAgentsLimit: 0,
    aiTokensUsed: 0,
    aiTokensLimit: 0,
    registeredAt,
    subscriptionEnds: lastHeartbeat,
    serverHost: client.domain ?? client.db_host,
    dbHost: client.db_host,
    dbName: client.db_name,
    dbStatus: client.is_active ? "connected" : "offline",
    adminUrl: client.domain ?? `/${client.slug}/admin`,
    mrr: 0,
    country: "BD",
    deploymentMode: "saas",
    instanceId: client.id,
    agentVersion: "—",
    erpVersion: "1.0.0",
    lastHeartbeat,
    notes: client.notes ?? undefined,
  };
}

export function apiClientsToCenterClients(clients: ApiClient[]): CenterClient[] {
  return clients.map(apiClientToCenterClient);
}
