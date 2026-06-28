import type { ApiApiKey } from "@/lib/api/api-keys";
import type {
  CenterApiKey,
  CenterApiKeyOwnerType,
  CenterApiKeyStatus,
} from "@/lib/mock-data/center";

const OWNER_MAP: Record<string, CenterApiKeyOwnerType> = {
  operator: "operator",
  partner: "partner",
  integration: "integration",
};

const STATUS_MAP: Record<string, CenterApiKeyStatus> = {
  active: "active",
  revoked: "revoked",
  expired: "expired",
};

export function apiKeyToCenter(key: ApiApiKey): CenterApiKey {
  return {
    id: key.id,
    name: key.name,
    keyPrefix: key.key_prefix,
    ownerType: OWNER_MAP[key.owner_type] ?? "integration",
    ownerLabel: key.owner_label,
    scopes: key.scopes,
    status: STATUS_MAP[key.status] ?? "active",
    createdAt: key.created_at ?? "—",
    lastUsedAt: key.last_used_at ?? undefined,
    expiresAt: key.expires_at ?? undefined,
  };
}

export function apiKeysToCenter(keys: ApiApiKey[]): CenterApiKey[] {
  return keys.map(apiKeyToCenter);
}
