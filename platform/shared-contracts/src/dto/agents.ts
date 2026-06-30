import type { AgentId, IsoTimestamp, SemVer, ToolId } from "../types/ids.js";

/** Agent lifecycle status — Center Agent Registry */
export const AGENT_STATUS = {
  INSTALLED: "installed",
  ENABLED: "enabled",
  DISABLED: "disabled",
  DEPRECATED: "deprecated",
  UPDATING: "updating",
} as const;

export type AgentStatus = (typeof AGENT_STATUS)[keyof typeof AGENT_STATUS];

/** Platform operator autonomy level (Center specialist agents) */
export type AgentAutonomy =
  | "advisory"
  | "detect_recommend"
  | "human_in_the_loop"
  | "read_only";

/**
 * Authoritative agent manifest — stored in Center; cached read-only in Runtime.
 * Aligns with AI_OS_ARCHITECTURE.md §7 Agent Registry.
 */
export interface AgentManifest {
  readonly id: AgentId;
  readonly name: string;
  readonly version: SemVer;
  readonly description: string;
  readonly permissions: readonly string[];
  readonly tools: readonly ToolId[];
  readonly promptTemplateId: string;
  readonly memoryScopes: readonly string[];
  readonly knowledgeCollections: readonly string[];
  readonly status: AgentStatus;
  readonly dependencies: readonly AgentId[];
  readonly autonomy?: AgentAutonomy;
  readonly configurationSchema?: Record<string, unknown>;
  readonly createdAt: IsoTimestamp;
  readonly updatedAt: IsoTimestamp;
}

/** Tenant-level agent enablement overlay (MoharazNX business config) */
export interface TenantAgentConfig {
  readonly agentId: AgentId;
  readonly enabled: boolean;
  readonly configuration?: Record<string, unknown>;
}

/** Sync payload — Center → Runtime manifest cache */
export interface AgentManifestSync {
  readonly contractVersion: string;
  readonly syncedAt: IsoTimestamp;
  readonly agents: readonly AgentManifest[];
}

/** Minimal agent descriptor for list UIs */
export interface AgentSummary {
  readonly id: AgentId;
  readonly name: string;
  readonly version: SemVer;
  readonly status: AgentStatus;
  readonly description?: string;
}

/** Center platform specialist agents (operator-facing) */
export const PLATFORM_AGENT_IDS = {
  CHIEF: "agent.platform.chief",
  HEALTH: "agent.platform.health",
  RECOMMENDATION: "agent.platform.recommendation",
  UPDATE: "agent.platform.update",
  LICENSE: "agent.platform.license",
  MONITORING: "agent.platform.monitoring",
  AUTOMATION: "agent.platform.automation",
} as const;

/** Tenant business agents (customer-facing via Again AI — invisible to users) */
export const BUSINESS_AGENT_IDS = {
  PRODUCT: "agent.product",
  SALES: "agent.sales",
  SUPPORT: "agent.support",
  PC_BUILDER: "agent.pc-builder",
  ORDER: "agent.order",
  SEO: "agent.seo",
} as const;
