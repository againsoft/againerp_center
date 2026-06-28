import type { ApiClient } from "@/lib/api/clients";
import type { ApiLicense } from "@/lib/api/licenses";
import type { CenterLicense, CenterLicenseStatus, CenterPlan } from "@/lib/mock-data/center";

const PLAN_MAP: Record<string, CenterPlan> = {
  starter: "starter",
  business: "business",
  professional: "business",
  pro: "business",
  enterprise: "enterprise",
  custom: "custom",
};

const GRACE_DAYS = 7;

function mapPlan(plan: string): CenterPlan {
  return PLAN_MAP[plan.toLowerCase()] ?? "starter";
}

function maskLicenseKey(key: string): string {
  const parts = key.split("-");
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}-****-****`;
  return "AGP-****-****-****";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function resolveStatus(lic: ApiLicense): CenterLicenseStatus {
  if (lic.status === "revoked") return "revoked";
  const now = Date.now();
  const expires = lic.expires_at ? new Date(lic.expires_at).getTime() : null;
  const graceEnd = lic.grace_ends_at ? new Date(lic.grace_ends_at).getTime() : null;
  if (expires && now > expires) {
    if (graceEnd && now <= graceEnd) return "grace";
    return "expired";
  }
  return "active";
}

export function apiLicenseToCenterLicense(
  lic: ApiLicense,
  clientMap: Map<string, ApiClient>,
): CenterLicense {
  const client = clientMap.get(lic.client_id);
  const plan = mapPlan(lic.plan);
  return {
    id: lic.id,
    clientId: lic.client_id,
    businessName: client?.name ?? lic.client_id,
    plan,
    status: resolveStatus(lic),
    licenseKeyMasked: maskLicenseKey(lic.license_key),
    issuedAt: formatDate(lic.issued_at),
    expiresAt: formatDate(lic.expires_at),
    graceDays: GRACE_DAYS,
    graceEndsAt: lic.grace_ends_at ? formatDate(lic.grace_ends_at) : undefined,
    instanceId: lic.client_id,
    modulesCount: plan === "enterprise" ? 12 : plan === "business" ? 6 : 4,
    aiEnabled: plan !== "starter",
    lastSyncedAt: "Pending agent",
  };
}

export function apiLicensesToCenterLicenses(
  licenses: ApiLicense[],
  clients: ApiClient[],
): CenterLicense[] {
  const clientMap = new Map(clients.map((c) => [c.id, c]));
  return licenses.map((l) => apiLicenseToCenterLicense(l, clientMap));
}
