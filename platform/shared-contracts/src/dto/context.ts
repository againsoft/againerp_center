import type { ConversationId, SessionId, TenantId, UserId } from "../types/ids.js";
import type { PageContext } from "./conversation.js";

/** Context layer types — AI_OS §8 Context System */
export const CONTEXT_LAYER_TYPES = {
  GLOBAL: "global",
  BUSINESS: "business",
  USER: "user",
  CONVERSATION: "conversation",
  PAGE: "page",
  RUNTIME: "runtime",
} as const;

export type ContextLayerType =
  (typeof CONTEXT_LAYER_TYPES)[keyof typeof CONTEXT_LAYER_TYPES];

export interface ContextLayer {
  readonly type: ContextLayerType;
  readonly data: Record<string, unknown>;
  readonly priority: number;
}

/** Merged context payload passed to orchestrator / gateway */
export interface ContextStack {
  readonly layers: readonly ContextLayer[];
  readonly merged: Record<string, unknown>;
  readonly builtAt: string;
}

export interface ContextAssemblyRequest {
  readonly tenantId: TenantId;
  readonly userId?: UserId;
  readonly conversationId?: ConversationId;
  readonly sessionId?: SessionId;
  readonly pageContext?: PageContext;
  readonly runtimeState?: Record<string, unknown>;
}

/** Memory scope types — AI_OS §10 */
export const MEMORY_TYPES = {
  SESSION: "session",
  CONVERSATION: "conversation",
  LONG_TERM: "long_term",
  SUMMARY: "summary",
  BUSINESS: "business",
  CUSTOMER: "customer",
} as const;

export type MemoryType = (typeof MEMORY_TYPES)[keyof typeof MEMORY_TYPES];

export interface MemoryRecord {
  readonly id: string;
  readonly type: MemoryType;
  readonly tenantId: TenantId;
  readonly userId?: UserId;
  readonly conversationId?: ConversationId;
  readonly sessionId?: SessionId;
  readonly content: Record<string, unknown>;
  readonly createdAt: string;
  readonly expiresAt?: string;
}

/** Prompt layer identifiers — AI_OS §9 */
export const PROMPT_LAYERS = {
  GLOBAL: "global",
  BUSINESS: "business",
  AGENT: "agent",
  RUNTIME: "runtime",
} as const;

export type PromptLayerId = (typeof PROMPT_LAYERS)[keyof typeof PROMPT_LAYERS];

export interface PromptTemplateRef {
  readonly id: string;
  readonly layer: PromptLayerId;
  readonly version: string;
}
