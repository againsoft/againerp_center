export {
  CONTRACT_VERSION,
  CONTRACT_VERSION_HEADER,
  CLIENT_ID_HEADER,
  CORRELATION_ID_HEADER,
  isSupportedContractVersion,
  type ContractVersion,
} from "./protocols/version.js";

export type {
  ClientId,
  AgentId,
  ConversationId,
  SessionId,
  TenantId,
  UserId,
  ToolId,
  ModelId,
  ProviderId,
  CorrelationId,
  SemVer,
  IsoTimestamp,
  LanguageCode,
  IntentId,
  PluginId,
  InstanceId,
} from "./types/ids.js";

export {
  PROVIDER_IDS,
  SUPPORTED_PROVIDER_IDS,
  DEFAULT_MODELS,
  type ProviderIdConst,
  type ProviderConnectionStatus,
  type ProviderConnectionRef,
  type ModelManifestEntry,
  type GatewayCompletionRequest,
  type GatewayMessageRole,
  type GatewayMessage,
  type GatewayToolDefinition,
  type GatewayCompletionResponse,
  type GatewayStreamChunk,
} from "./protocols/providers.js";

export {
  AGENT_STATUS,
  PLATFORM_AGENT_IDS,
  BUSINESS_AGENT_IDS,
  type AgentStatus,
  type AgentAutonomy,
  type AgentManifest,
  type TenantAgentConfig,
  type AgentManifestSync,
  type AgentSummary,
} from "./dto/agents.js";

export {
  CONVERSATION_MODULE_IDS,
  type ConversationModuleId,
  type ConversationRole,
  type ConversationTurn,
  type PromptStack,
  type ConversationRequest,
  type ConversationResponse,
  type AgentSelection,
  type BuildUpgrade,
  type BuildAlternative,
  type PageContext,
  type ConversationSession,
  type ConversationStreamChunk,
  type BuildSelection,
  type CenterAiRequest,
  type CenterAiResponse,
} from "./dto/conversation.js";

export {
  CONTEXT_LAYER_TYPES,
  MEMORY_TYPES,
  PROMPT_LAYERS,
  type ContextLayerType,
  type ContextLayer,
  type ContextStack,
  type ContextAssemblyRequest,
  type MemoryType,
  type MemoryRecord,
  type PromptLayerId,
  type PromptTemplateRef,
} from "./dto/context.js";

export {
  type PlatformEventEnvelope,
  type AiUsageEventPayload,
  type AiUsageEvent,
  type AgentManifestUpdatedPayload,
  type AgentManifestUpdatedEvent,
  type HeartbeatEventPayload,
  type HeartbeatEvent,
  type ClientActivatedPayload,
  type ClientActivatedEvent,
  type PlatformEvent,
} from "./events/index.js";

export {
  AI_ERROR_CODES,
  PlatformContractError,
  errorCodeFromStatus,
  type AiErrorCode,
  type PlatformErrorBody,
} from "./errors/index.js";

export {
  OPERATOR_SCOPES,
  AGENT_TOOL_SCOPES,
  type OperatorScope,
  type AgentToolScope,
  type PlatformPermission,
} from "./permissions/index.js";
