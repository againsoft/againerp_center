/**
 * Platform permission scopes — referenced by AgentManifest.permissions.
 * Center enforces; Runtime and client ERP declare required scopes only.
 */

/** Operator RBAC scopes (Center console) */
export const OPERATOR_SCOPES = {
  FLEET_READ: "fleet:read",
  FLEET_WRITE: "fleet:write",
  AI_READ: "ai:read",
  AI_WRITE: "ai:write",
  BILLING_READ: "billing:read",
  BILLING_WRITE: "billing:write",
  AUDIT_READ: "audit:read",
} as const;

/** Agent tool execution scopes (tenant business layer) */
export const AGENT_TOOL_SCOPES = {
  ORDER_READ: "order:read",
  ORDER_WRITE: "order:write",
  CATALOG_READ: "catalog:read",
  CATALOG_WRITE: "catalog:write",
  CUSTOMER_READ: "customer:read",
  INVENTORY_READ: "inventory:read",
} as const;

export type OperatorScope = (typeof OPERATOR_SCOPES)[keyof typeof OPERATOR_SCOPES];
export type AgentToolScope = (typeof AGENT_TOOL_SCOPES)[keyof typeof AGENT_TOOL_SCOPES];
export type PlatformPermission = OperatorScope | AgentToolScope | string;
