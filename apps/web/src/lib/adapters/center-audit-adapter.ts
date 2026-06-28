import type { ApiAuditLog } from "@/lib/api/audit";
import type { ApiClient } from "@/lib/api/clients";
import type {
  CenterAuditActorType,
  CenterAuditLogEntry,
  CenterAuditResourceType,
} from "@/lib/mock-data/center";

const RESOURCE_TYPES = new Set<string>([
  "client",
  "registration",
  "subscription",
  "license",
  "module",
  "update",
  "backup",
  "billing",
  "operator",
  "agent",
  "settings",
]);

function mapResourceType(resource: string | null): CenterAuditResourceType {
  if (resource && RESOURCE_TYPES.has(resource)) {
    return resource as CenterAuditResourceType;
  }
  return "client";
}

function mapActorType(entry: ApiAuditLog): CenterAuditActorType {
  if (entry.operator_id || entry.operator_email) return "operator";
  if (entry.action.includes("agent")) return "agent";
  return "system";
}

export function apiAuditLogToCenterAuditLog(
  entry: ApiAuditLog,
  clientMap: Map<string, ApiClient>,
): CenterAuditLogEntry {
  const resourceType = mapResourceType(entry.resource);
  let clientId: string | undefined;
  let clientName: string | undefined;

  if (resourceType === "client" && entry.resource_id) {
    clientId = entry.resource_id;
    clientName = clientMap.get(entry.resource_id)?.name;
  }

  return {
    id: String(entry.id),
    timestamp: entry.created_at ?? new Date().toISOString(),
    actorType: mapActorType(entry),
    actorId: entry.operator_id ?? "system",
    actorLabel: entry.operator_email ?? "System",
    action: entry.action,
    resourceType,
    resourceId: entry.resource_id ?? "—",
    clientId,
    clientName,
    correlationId: entry.resource_id ?? String(entry.id),
    ipAddress: entry.ip_address ?? undefined,
  };
}

export function apiAuditLogsToCenterAuditLogs(
  logs: ApiAuditLog[],
  clients: ApiClient[],
): CenterAuditLogEntry[] {
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  return logs.map((l) => apiAuditLogToCenterAuditLog(l, clientMap));
}

export function computeAuditStats(logs: CenterAuditLogEntry[]) {
  const operator = logs.filter((l) => l.actorType === "operator").length;
  const system = logs.filter((l) => l.actorType === "system").length;
  const agent = logs.filter((l) => l.actorType === "agent").length;
  const security = logs.filter((l) =>
    l.action.includes("revoke") || l.action.includes("delete") || l.action.includes("auth"),
  ).length;
  return { total: logs.length, operator, system, agent, security };
}
