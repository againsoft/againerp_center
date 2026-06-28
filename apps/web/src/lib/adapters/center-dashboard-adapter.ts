import type { ApiAuditLog } from "@/lib/api/audit";
import type { ApiClient } from "@/lib/api/clients";
import type { ApiServer } from "@/lib/api/servers";
import type { ApiSubscription } from "@/lib/api/subscriptions";
import type {
  CenterClientStatus,
  CenterDashboardActivity,
  CenterDashboardAlert,
  CenterDbStatus,
} from "@/lib/mock-data/center";

export type DashboardStats = {
  total: number;
  active: number;
  suspended: number;
  mrr: number;
  aiEnabled: number;
  pendingRegs: number;
  agentsOnline: number;
  agentsAlert: number;
  activeSubscriptions: number;
  licenses: number;
};

export type DashboardFleetItem = {
  id: string;
  businessName: string;
  status: CenterClientStatus;
  agentStatus: CenterDbStatus;
  href: string;
};

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mapClientStatus(client: ApiClient): CenterClientStatus {
  if (!client.is_active) return "suspended";
  const s = client.status.toLowerCase();
  if (s === "trial") return "trial";
  if (s === "pending") return "pending";
  if (s === "suspended") return "suspended";
  return "active";
}

function agentStatusForClient(clientId: string, servers: ApiServer[]): CenterDbStatus {
  const server = servers.find((s) => s.client_id === clientId);
  if (!server) return "pending";
  if (!server.is_online) return "offline";
  if (server.health_status === "critical" || server.health_status === "degraded") return "degraded";
  return "connected";
}

function actionCategory(action: string): CenterDashboardActivity["category"] {
  if (action.includes("license")) return "license";
  if (action.includes("subscription") || action.includes("billing")) return "billing";
  if (action.includes("client") || action.includes("registration")) return "registration";
  if (action.includes("agent") || action.includes("module")) return "module";
  if (action.includes("update")) return "update";
  if (action.includes("ai")) return "ai";
  return "agent";
}

export function computeDashboardStats(
  clients: ApiClient[],
  servers: ApiServer[],
  subscriptions: ApiSubscription[],
  licenseCount: number,
): DashboardStats {
  const total = clients.length;
  const active = clients.filter((c) => c.is_active && !["suspended"].includes(c.status.toLowerCase())).length;
  const suspended = clients.filter((c) => !c.is_active || c.status.toLowerCase() === "suspended").length;
  const agentsOnline = servers.filter((s) => s.is_online).length;
  const agentsAlert = total - agentsOnline;
  const aiEnabled = clients.filter((c) => !["starter"].includes(c.plan.toLowerCase())).length;
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active" || s.status === "trial").length;

  return {
    total,
    active,
    suspended,
    mrr: 0,
    aiEnabled,
    pendingRegs: 0,
    agentsOnline,
    agentsAlert: Math.max(0, agentsAlert),
    activeSubscriptions,
    licenses: licenseCount,
  };
}

export function auditToActivity(
  logs: ApiAuditLog[],
  clientMap: Map<string, ApiClient>,
): CenterDashboardActivity[] {
  return logs.slice(0, 8).map((log) => {
    const clientId =
      log.resource === "client" && log.resource_id ? log.resource_id : undefined;
    const client = clientId ? clientMap.get(clientId) : undefined;
    return {
      id: String(log.id),
      time: relativeTime(log.created_at),
      client: client?.name ?? log.operator_email ?? "System",
      clientId,
      action: log.detail ? `${log.action} — ${log.detail}` : log.action,
      actor: log.operator_email ?? "System",
      category: actionCategory(log.action),
    };
  });
}

export function deriveDashboardAlerts(
  clients: ApiClient[],
  servers: ApiServer[],
  pendingRegistrations = 0,
): CenterDashboardAlert[] {
  const alerts: CenterDashboardAlert[] = [];
  const clientMap = new Map(clients.map((c) => [c.id, c]));

  if (pendingRegistrations > 0) {
    alerts.push({
      id: "alert-pending-regs",
      severity: "warning",
      title: `${pendingRegistrations} registration${pendingRegistrations > 1 ? "s" : ""} awaiting review`,
      detail: "Approve signups to provision clients and issue agent tokens",
      href: "/center/registrations",
      time: "Now",
    });
  }

  for (const server of servers) {
    const name = server.client_name ?? clientMap.get(server.client_id)?.name ?? server.client_id;
    if (server.health_status === "critical") {
      alerts.push({
        id: `alert-critical-${server.id}`,
        severity: "critical",
        title: `${name} — critical health`,
        detail: `CPU/memory/disk thresholds exceeded on ${server.hostname ?? server.instance_id}`,
        href: `/center/clients/${server.client_id}?tab=agent`,
        time: relativeTime(server.last_heartbeat_at),
      });
    } else if (!server.is_online && server.last_heartbeat_at) {
      alerts.push({
        id: `alert-offline-${server.id}`,
        severity: "warning",
        title: `${name} agent offline`,
        detail: `No heartbeat in 5+ minutes — last seen ${relativeTime(server.last_heartbeat_at)}`,
        href: `/center/clients/${server.client_id}?tab=agent`,
        time: relativeTime(server.last_heartbeat_at),
      });
    } else if (server.health_status === "degraded") {
      alerts.push({
        id: `alert-degraded-${server.id}`,
        severity: "warning",
        title: `${name} agent degraded`,
        detail: "Resource usage elevated — review monitoring",
        href: `/center/monitoring?client=${server.client_id}`,
        time: relativeTime(server.last_heartbeat_at),
      });
    }
  }

  const clientsWithoutAgent = clients.filter(
    (c) => !servers.some((s) => s.client_id === c.id),
  );
  if (clientsWithoutAgent.length > 0) {
    alerts.push({
      id: "alert-no-agent",
      severity: "info",
      title: `${clientsWithoutAgent.length} client${clientsWithoutAgent.length > 1 ? "s" : ""} without agent`,
      detail: "Start Edge Agent with token from client creation",
      href: "/center/agents?tab=fleet",
      time: "Now",
    });
  }

  return alerts.slice(0, 4);
}

export function buildFleetHealthItems(
  clients: ApiClient[],
  servers: ApiServer[],
): DashboardFleetItem[] {
  return clients
    .map((c) => ({
      id: c.id,
      businessName: c.name,
      status: mapClientStatus(c),
      agentStatus: agentStatusForClient(c.id, servers),
      href: `/center/clients/${c.id}?tab=agent`,
    }))
    .sort((a, b) => {
      const order: Record<CenterDbStatus, number> = {
        offline: 0,
        degraded: 1,
        pending: 2,
        connected: 3,
      };
      return order[a.agentStatus] - order[b.agentStatus];
    });
}
