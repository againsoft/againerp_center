import type {
  ApiActivationBundle,
  ApiAgentCommand,
  ApiAgentConsoleStats,
  ApiAgentDiagnostic,
  ApiAgentSyncQueue,
} from "@/lib/api/agents";
import type {
  CenterActivationBundle,
  CenterActivationBundleStatus,
  CenterAgentCommand,
  CenterAgentCommandRisk,
  CenterAgentCommandStatus,
  CenterAgentCommandType,
  CenterAgentConnectivity,
  CenterAgentDiagnostic,
  CenterAgentQueueType,
  CenterAgentSyncQueue,
  CenterDiagnosticStatus,
} from "@/lib/mock-data/center";

export function apiConsoleStatsToCenter(stats: ApiAgentConsoleStats) {
  return {
    pendingCommands: stats.pending_commands,
    succeededToday: stats.succeeded_commands,
    failedOrExpired: stats.failed_or_expired,
    pendingActivations: stats.pending_activations,
    offlineAgents: stats.offline_agents,
    queuedItems: stats.queued_items,
    diagnosticsReady: stats.diagnostics_ready,
    diagnosticsPending: stats.diagnostics_pending,
  };
}

export function apiCommandToCenter(cmd: ApiAgentCommand): CenterAgentCommand {
  return {
    id: cmd.id,
    clientId: cmd.client_id,
    businessName: cmd.business_name,
    type: cmd.type as CenterAgentCommandType,
    risk: cmd.risk as CenterAgentCommandRisk,
    status: cmd.status as CenterAgentCommandStatus,
    issuedAt: cmd.issued_at ?? "",
    expiresAt: cmd.expires_at ?? "",
    deliveredAt: cmd.delivered_at ?? undefined,
    completedAt: cmd.completed_at ?? undefined,
    issuedBy: cmd.issued_by,
    payloadSummary: cmd.payload_summary,
    resultSummary: cmd.result_summary ?? undefined,
    signatureValid: cmd.signature_valid,
    correlationId: cmd.correlation_id,
  };
}

export function apiCommandsToCenter(cmds: ApiAgentCommand[]): CenterAgentCommand[] {
  return cmds.map(apiCommandToCenter);
}

export function apiBundleToCenter(bundle: ApiActivationBundle): CenterActivationBundle {
  return {
    id: bundle.id,
    clientId: bundle.client_id,
    businessName: bundle.business_name,
    status: bundle.status as CenterActivationBundleStatus,
    createdAt: bundle.created_at ?? "",
    expiresAt: bundle.expires_at ?? "",
    activatedAt: bundle.activated_at ?? undefined,
    bootstrapTokenPrefix: bundle.bootstrap_token_prefix,
    createdBy: bundle.created_by,
  };
}

export function apiBundlesToCenter(bundles: ApiActivationBundle[]): CenterActivationBundle[] {
  return bundles.map(apiBundleToCenter);
}

export function apiSyncQueueToCenter(row: ApiAgentSyncQueue): CenterAgentSyncQueue {
  return {
    id: row.id,
    clientId: row.client_id,
    businessName: row.business_name,
    connectivity: row.connectivity as CenterAgentConnectivity,
    queueType: row.queue_type as CenterAgentQueueType,
    pendingCount: row.pending_count,
    oldestQueuedAt: row.oldest_queued_at ?? "",
    graceActive: row.grace_active,
    graceExpiresAt: row.grace_expires_at ?? undefined,
    lastFlushAt: row.last_flush_at ?? undefined,
    summary: row.summary,
  };
}

export function apiSyncQueuesToCenter(rows: ApiAgentSyncQueue[]): CenterAgentSyncQueue[] {
  return rows.map(apiSyncQueueToCenter);
}

export function apiDiagnosticToCenter(diag: ApiAgentDiagnostic): CenterAgentDiagnostic {
  return {
    id: diag.id,
    clientId: diag.client_id,
    businessName: diag.business_name,
    commandId: diag.command_id ?? undefined,
    status: diag.status as CenterDiagnosticStatus,
    requestedAt: diag.requested_at ?? "",
    requestedBy: diag.requested_by,
    bundleSizeMb: diag.bundle_size_mb ?? undefined,
    uploadedAt: diag.uploaded_at ?? undefined,
    expiresAt: diag.expires_at ?? "",
    bundlePrefix: diag.bundle_prefix,
  };
}

export function apiDiagnosticsToCenter(rows: ApiAgentDiagnostic[]): CenterAgentDiagnostic[] {
  return rows.map(apiDiagnosticToCenter);
}
