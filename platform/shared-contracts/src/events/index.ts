import type { AgentId, ClientId, ConversationId, IsoTimestamp, ProviderId, TenantId } from "../types/ids.js";

/** Base envelope for platform domain events */
export interface PlatformEventEnvelope<TType extends string, TPayload> {
  readonly id: string;
  readonly type: TType;
  readonly contractVersion: string;
  readonly occurredAt: IsoTimestamp;
  readonly clientId?: ClientId;
  readonly tenantId?: TenantId;
  readonly correlationId?: string;
  readonly payload: TPayload;
}

/** AI usage event — Center metering → billing */
export interface AiUsageEventPayload {
  readonly conversationId?: ConversationId;
  readonly agentIds?: readonly AgentId[];
  readonly providerId: ProviderId;
  readonly modelId: string;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly totalTokens: number;
  readonly creditsDeducted?: number;
  readonly module?: string;
}

export type AiUsageEvent = PlatformEventEnvelope<"ai.usage.recorded", AiUsageEventPayload>;

/** Agent manifest updated on Center — Runtime should refresh cache */
export interface AgentManifestUpdatedPayload {
  readonly agentId: AgentId;
  readonly version: string;
  readonly status: string;
}

export type AgentManifestUpdatedEvent = PlatformEventEnvelope<
  "ai.agent.manifest_updated",
  AgentManifestUpdatedPayload
>;

/** Edge Agent heartbeat — existing Center protocol */
export interface HeartbeatEventPayload {
  readonly instanceId: string;
  readonly agentVersion?: string;
  readonly erpVersion?: string;
  readonly cpuPercent?: number;
  readonly memoryPercent?: number;
  readonly diskPercent?: number;
  readonly status: string;
}

export type HeartbeatEvent = PlatformEventEnvelope<
  "agent.heartbeat.received",
  HeartbeatEventPayload
>;

/** Client lifecycle */
export interface ClientActivatedPayload {
  readonly clientId: ClientId;
  readonly plan: string;
}

export type ClientActivatedEvent = PlatformEventEnvelope<
  "client.activated",
  ClientActivatedPayload
>;

export type PlatformEvent =
  | AiUsageEvent
  | AgentManifestUpdatedEvent
  | HeartbeatEvent
  | ClientActivatedEvent;
