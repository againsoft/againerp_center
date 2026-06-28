import type { ApiHealthSnapshot, ApiMetricPoint, ApiMonitoringAgent } from "@/lib/api/monitoring";
import type {
  CenterAgentHeartbeat,
  CenterAgentMetricPoint,
  CenterDbStatus,
  CenterDeploymentMode,
  CenterMonitoringAlert,
} from "@/lib/mock-data/center";

export type MonitoringStats = {
  online: number;
  degraded: number;
  offline: number;
  pending: number;
  activeAlerts: number;
  avgLatency: number;
};

function mapAgentStatus(status: string): CenterDbStatus {
  if (status === "connected") return "connected";
  if (status === "degraded") return "degraded";
  if (status === "offline") return "offline";
  return "pending";
}

function mapDeployment(mode: string): CenterDeploymentMode {
  if (mode === "hybrid" || mode === "enterprise") return mode;
  return "saas";
}

function formatHeartbeat(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Now";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function apiAgentToHeartbeat(agent: ApiMonitoringAgent): CenterAgentHeartbeat {
  const status = mapAgentStatus(agent.agent_status);
  const offline = status === "offline" || status === "pending";
  return {
    clientId: agent.client_id,
    businessName: agent.business_name,
    instanceId: agent.instance_id,
    deploymentMode: mapDeployment(agent.deployment_mode),
    serverHost: agent.server_host ?? "—",
    agentStatus: status,
    lastHeartbeat: formatHeartbeat(agent.last_heartbeat_at),
    agentVersion: agent.agent_version ?? "—",
    erpVersion: agent.erp_version ?? "—",
    cpuPercent: offline ? 0 : Math.round(agent.cpu_percent ?? 0),
    ramPercent: offline ? 0 : Math.round(agent.memory_percent ?? 0),
    diskPercent: offline ? 0 : Math.round(agent.disk_percent ?? 0),
    apiLatencyP95Ms: 0,
    dockerHealthy: offline ? 0 : 1,
    dockerTotal: offline ? 0 : 1,
    dbReachable: status === "connected" || status === "degraded",
    dbLatencyMs: 0,
    redisReachable: status === "connected" || status === "degraded",
    queuePendingJobs: 0,
  };
}

export function computeMonitoringStats(agents: ApiMonitoringAgent[]): MonitoringStats {
  const heartbeats = agents.map(apiAgentToHeartbeat);
  const online = heartbeats.filter((h) => h.agentStatus === "connected").length;
  const degraded = heartbeats.filter((h) => h.agentStatus === "degraded").length;
  const offline = heartbeats.filter((h) => h.agentStatus === "offline").length;
  const pending = heartbeats.filter((h) => h.agentStatus === "pending").length;
  const alerts = deriveMonitoringAlerts(agents);
  return {
    online,
    degraded,
    offline,
    pending,
    activeAlerts: alerts.length,
    avgLatency: 0,
  };
}

export function deriveMonitoringAlerts(agents: ApiMonitoringAgent[]): CenterMonitoringAlert[] {
  const alerts: CenterMonitoringAlert[] = [];

  for (const agent of agents) {
    if (agent.health_status === "critical") {
      alerts.push({
        id: `mon-critical-${agent.client_id}`,
        severity: "critical",
        rule: "health.critical",
        title: `${agent.business_name} — critical resources`,
        detail: "CPU, memory, or disk exceeded critical thresholds on last heartbeat",
        clientId: agent.client_id,
        clientName: agent.business_name,
        time: relativeTime(agent.last_heartbeat_at),
        acknowledged: false,
      });
    } else if (agent.agent_status === "offline" && agent.last_heartbeat_at) {
      alerts.push({
        id: `mon-offline-${agent.client_id}`,
        severity: "warning",
        rule: "agent.offline",
        title: `${agent.business_name} agent offline`,
        detail: "No heartbeat received in the last 5 minutes",
        clientId: agent.client_id,
        clientName: agent.business_name,
        time: relativeTime(agent.last_heartbeat_at),
        acknowledged: false,
      });
    } else if (agent.agent_status === "degraded") {
      alerts.push({
        id: `mon-degraded-${agent.client_id}`,
        severity: "warning",
        rule: "health.degraded",
        title: `${agent.business_name} agent degraded`,
        detail: "Elevated resource usage reported by Edge Agent",
        clientId: agent.client_id,
        clientName: agent.business_name,
        time: relativeTime(agent.last_heartbeat_at),
        acknowledged: false,
      });
    } else if (agent.agent_status === "pending") {
      alerts.push({
        id: `mon-pending-${agent.client_id}`,
        severity: "info",
        rule: "agent.pending",
        title: `${agent.business_name} — awaiting first heartbeat`,
        detail: "Start Edge Agent with the token from client creation",
        clientId: agent.client_id,
        clientName: agent.business_name,
        time: "Now",
        acknowledged: false,
      });
    }
  }

  return alerts;
}

export function snapshotsToMetricSeries(snapshots: ApiHealthSnapshot[]): CenterAgentMetricPoint[] {
  return snapshots.map((s) => {
    const label = s.recorded_at
      ? new Date(s.recorded_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : "—";
    return {
      label,
      cpu: Math.round(s.cpu_percent ?? 0),
      ram: Math.round(s.memory_percent ?? 0),
      disk: Math.round(s.disk_percent ?? 0),
      apiP95: 0,
    };
  });
}

export function apiFleetSeriesToMetricPoints(series: ApiMetricPoint[]): CenterAgentMetricPoint[] {
  return series.map((p) => ({
    label: p.label,
    cpu: p.cpu,
    ram: p.ram,
    disk: p.disk,
    apiP95: p.apiP95,
  }));
}
