/**
 * Cross-language identifier conventions (plain strings — no TS brands).
 * Formats are stable for JSON Schema + Python Pydantic generation.
 */

/** Center fleet client ID — e.g. `cli_abc123` */
export type ClientId = string;

/** Agent registry ID — e.g. `agent.product.v2` */
export type AgentId = string;

/** Conversation thread ID */
export type ConversationId = string;

/** Browser or app session ID */
export type SessionId = string;

/** Tenant / business ID (MoharazNX instance) */
export type TenantId = string;

/** Authenticated user ID */
export type UserId = string;

/** Registered tool ID — e.g. `tool.order.create` */
export type ToolId = string;

/** LLM model ID — e.g. `gpt-4o-mini` */
export type ModelId = string;

/** LLM provider ID — see providers.ts */
export type ProviderId = string;

/** Request correlation ID (UUID) */
export type CorrelationId = string;

/** Semantic version — e.g. `1.2.3` */
export type SemVer = string;

/** ISO 8601 UTC timestamp */
export type IsoTimestamp = string;

/** BCP 47 language tag — e.g. `en`, `bn` */
export type LanguageCode = string;

/** Intent classification ID */
export type IntentId = string;

/** Plugin manifest ID */
export type PluginId = string;

/** Edge Agent instance ID */
export type InstanceId = string;
