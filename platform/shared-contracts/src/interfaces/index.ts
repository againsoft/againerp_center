/**
 * Cross-package interface contracts — re-exported from DTO modules.
 * Add pure interfaces here when splitting DTOs from behavioral types.
 */
export type {
  AgentManifest,
  TenantAgentConfig,
  AgentManifestSync,
  AgentSummary,
  AgentStatus,
  AgentAutonomy,
} from "../dto/agents.js";

export type {
  ConversationRequest,
  ConversationResponse,
  ConversationTurn,
  ConversationSession,
  PageContext,
  PromptStack,
} from "../dto/conversation.js";

export type {
  ContextLayer,
  ContextStack,
  ContextAssemblyRequest,
  MemoryRecord,
  PromptTemplateRef,
} from "../dto/context.js";

export type {
  GatewayCompletionRequest,
  GatewayCompletionResponse,
  GatewayMessage,
  GatewayStreamChunk,
  ModelManifestEntry,
  ProviderConnectionRef,
} from "../protocols/providers.js";

export type { PlatformErrorBody } from "../errors/index.js";
