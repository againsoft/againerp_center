import type { ApiOperator } from "@/lib/api/operators";
import type { CenterOperator, CenterOperatorRole, CenterOperatorStatus } from "@/lib/mock-data/center";

const ROLE_MAP: Record<string, CenterOperatorRole> = {
  super_admin: "super_admin",
  platform_admin: "platform_admin",
  billing_admin: "billing_admin",
  operator: "support_agent",
  support_agent: "support_agent",
  partner_admin: "partner_admin",
  viewer: "read_only",
  read_only: "read_only",
};

function mapRole(role: string): CenterOperatorRole {
  return ROLE_MAP[role] ?? "support_agent";
}

function formatDate(iso: string | null): string | undefined {
  if (!iso) return undefined;
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function apiOperatorToCenter(op: ApiOperator): CenterOperator {
  return {
    id: op.id,
    name: op.name,
    email: op.email,
    role: mapRole(op.role),
    status: (op.status === "disabled" ? "disabled" : "active") as CenterOperatorStatus,
    mfaEnabled: op.mfa_enabled,
    mfaType: op.mfa_type === "totp" ? "totp" : op.mfa_type ? "totp" : undefined,
    lastLogin: formatDate(op.last_login),
    createdAt: formatDate(op.created_at) ?? "—",
  };
}

export function apiOperatorsToCenter(ops: ApiOperator[]): CenterOperator[] {
  return ops.map(apiOperatorToCenter);
}
