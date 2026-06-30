import type { ModelId, ProviderId, ToolId } from "../types/ids.js";

/** Canonical LLM provider identifiers — Center Provider Gateway adapters */
export const PROVIDER_IDS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GEMINI: "gemini",
  AZURE_OPENAI: "azure_openai",
  OPENROUTER: "openrouter",
  DEEPSEEK: "deepseek",
  OLLAMA: "ollama",
  LOCAL: "local",
} as const;

export type ProviderIdConst = (typeof PROVIDER_IDS)[keyof typeof PROVIDER_IDS];

export const SUPPORTED_PROVIDER_IDS: readonly ProviderIdConst[] = Object.values(PROVIDER_IDS);

/** Default models per provider (gateway may override via Model Registry) */
export const DEFAULT_MODELS: Record<ProviderIdConst, ModelId> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  gemini: "gemini-2.0-flash",
  azure_openai: "gpt-4o-mini",
  openrouter: "openai/gpt-4o-mini",
  deepseek: "deepseek-chat",
  ollama: "llama3.2",
  local: "llama3.2",
};

export type ProviderConnectionStatus = "connected" | "disconnected" | "degraded" | "unknown";

/** Provider connection metadata — tenant stores ref ID only; keys live in Center vault */
export interface ProviderConnectionRef {
  readonly providerId: ProviderId;
  readonly connectionRefId: string;
  readonly status: ProviderConnectionStatus;
  readonly model?: ModelId;
  readonly label?: string;
}

/** Model catalog entry — authoritative in Center Model Registry */
export interface ModelManifestEntry {
  readonly id: ModelId;
  readonly providerId: ProviderId;
  readonly label: string;
  readonly contextWindow?: number;
  readonly supportsStreaming: boolean;
  readonly supportsStructuredOutput: boolean;
  readonly supportsTools: boolean;
  readonly status: "active" | "deprecated" | "preview";
}

/** Gateway completion request — Runtime → Center Provider Gateway */
export interface GatewayCompletionRequest {
  readonly clientId: string;
  readonly tenantId?: string;
  readonly conversationId?: string;
  readonly providerId?: ProviderId;
  readonly modelId?: ModelId;
  readonly system?: string;
  readonly messages: readonly GatewayMessage[];
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly stream?: boolean;
  readonly responseFormat?: "text" | "json";
  readonly tools?: readonly GatewayToolDefinition[];
}

export type GatewayMessageRole = "system" | "user" | "assistant" | "tool";

export interface GatewayMessage {
  readonly role: GatewayMessageRole;
  readonly content: string;
  readonly name?: string;
  readonly toolCallId?: string;
}

export interface GatewayToolDefinition {
  readonly id: ToolId;
  readonly name: string;
  readonly description: string;
  readonly parameters: Record<string, unknown>;
}

export interface GatewayCompletionResponse {
  readonly content: string;
  readonly providerId: ProviderId;
  readonly modelId: ModelId;
  readonly tokensUsed: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
  };
  readonly finishReason: "stop" | "length" | "tool_calls" | "error";
  readonly structured?: Record<string, unknown>;
}

export interface GatewayStreamChunk {
  readonly delta: string;
  readonly index: number;
  readonly isFinal: boolean;
  readonly providerId?: ProviderId;
  readonly modelId?: ModelId;
}
