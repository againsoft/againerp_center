import type { ClientId, ConversationId, SessionId, TenantId, UserId } from "../types/ids.js";

/** Conversational business module identifiers */
export const CONVERSATION_MODULE_IDS = {
  PC_BUILDER: "pc_builder",
  LAPTOP_BUILDER: "laptop_builder",
  SERVER_BUILDER: "server_builder",
  NAS_BUILDER: "nas_builder",
  NETWORKING_BUILDER: "networking_builder",
  CCTV_BUILDER: "cctv_builder",
  WORKSTATION_BUILDER: "workstation_builder",
  STOREFRONT_CHAT: "storefront_chat",
  ADMIN_ASSISTANT: "admin_assistant",
} as const;

export type ConversationModuleId =
  (typeof CONVERSATION_MODULE_IDS)[keyof typeof CONVERSATION_MODULE_IDS];

export type ConversationRole = "user" | "assistant" | "system";

export interface ConversationTurn {
  readonly role: ConversationRole;
  readonly content: string;
  readonly at?: string;
}

/** Layered prompt stack — business + module layers (global layer from Center) */
export interface PromptStack {
  readonly system?: string;
  readonly global?: string;
  readonly module?: string;
  readonly client?: string;
}

/**
 * Runtime → Center conversation request.
 * Used by `/agent/v1/conversation` (Edge Agent queue + direct runtime).
 * Supersedes ad-hoc `CenterAiRequest` in MoharazNX.
 */
export interface ConversationRequest {
  readonly contractVersion: string;
  readonly clientId: ClientId;
  readonly tenantId?: TenantId;
  readonly conversationId?: ConversationId;
  readonly sessionId?: SessionId;
  readonly userId?: UserId;
  readonly module: ConversationModuleId;
  readonly prompt: string;
  readonly messages: readonly Pick<ConversationTurn, "role" | "content">[];
  readonly promptStack: PromptStack;
  readonly sessionMemory: Record<string, unknown>;
  readonly pageContext?: PageContext;
  readonly catalogSummary?: string;
  readonly currentBuild?: readonly BuildSelection[];
  readonly metadata?: Record<string, unknown>;
}

export interface BuildSelection {
  readonly stepId: string;
  readonly productId: string;
}

/** Center → Runtime structured conversation response */
export interface ConversationResponse {
  readonly contractVersion: string;
  readonly conversationId?: ConversationId;
  readonly intent?: Record<string, unknown>;
  readonly selections?: readonly AgentSelection[];
  readonly explanation?: string;
  readonly upgrades?: readonly BuildUpgrade[];
  readonly alternatives?: readonly BuildAlternative[];
  readonly followUpQuestion?: string;
  readonly providerId?: string;
  readonly modelId?: string;
  readonly tokensUsed?: number;
}

export interface AgentSelection {
  readonly stepId: string;
  readonly productId: string;
  readonly reason: string;
}

export interface BuildUpgrade {
  readonly stepId: string;
  readonly upgradeProductId: string;
  readonly benefit: string;
}

export interface BuildAlternative {
  readonly stepId: string;
  readonly productId: string;
  readonly tradeoff: string;
}

/** Page context injected by client UI — AI_OS §8 */
export interface PageContext {
  readonly surface: string;
  readonly page: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ConversationSession {
  readonly id: ConversationId;
  readonly module: ConversationModuleId;
  readonly turns: readonly ConversationTurn[];
  readonly memory: Record<string, unknown>;
  readonly lastBuildAt?: string;
}

/** SSE stream chunk for `/ai/v1/stream` */
export interface ConversationStreamChunk {
  readonly conversationId: ConversationId;
  readonly delta: string;
  readonly index: number;
  readonly isFinal: boolean;
}

/**
 * @deprecated Use ConversationRequest — alias for MoharazNX migration
 */
export type CenterAiRequest = Omit<ConversationRequest, "contractVersion" | "clientId"> & {
  contractVersion?: string;
  clientId?: ClientId;
};

/**
 * @deprecated Use ConversationResponse
 */
export type CenterAiResponse = ConversationResponse;
