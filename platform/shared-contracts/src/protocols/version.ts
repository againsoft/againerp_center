/**
 * Platform contract semver — bump on breaking DTO/event changes.
 * @see docs/PLATFORM_ECOSYSTEM_AUDIT.md — Compatibility Matrix
 */
export const CONTRACT_VERSION = "1.0.0" as const;

/** HTTP header: `X-Contract-Version: 1.0.0` */
export const CONTRACT_VERSION_HEADER = "X-Contract-Version" as const;

/** HTTP header: `X-Client-Id` — tenant client ID from Center fleet registry */
export const CLIENT_ID_HEADER = "X-Client-Id" as const;

/** HTTP header: `X-Correlation-Id` — request tracing across Center ↔ Runtime */
export const CORRELATION_ID_HEADER = "X-Correlation-Id" as const;

export type ContractVersion = typeof CONTRACT_VERSION;

/** Parse and validate a contract version string */
export function isSupportedContractVersion(version: string): version is ContractVersion {
  return version === CONTRACT_VERSION;
}
