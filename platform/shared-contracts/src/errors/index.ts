/** Stable error codes — shared across Center API, Runtime, and Client ERP */

export const AI_ERROR_CODES = {
  /** Contract version mismatch */
  CONTRACT_VERSION_UNSUPPORTED: "CONTRACT_VERSION_UNSUPPORTED",
  /** Client not found or inactive in Center fleet */
  CLIENT_NOT_FOUND: "CLIENT_NOT_FOUND",
  /** AI feature not enabled for client plan */
  AI_ACCESS_DENIED: "AI_ACCESS_DENIED",
  /** Monthly AI credits exhausted */
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  /** Provider Gateway could not route request */
  PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
  /** LLM provider returned error */
  PROVIDER_ERROR: "PROVIDER_ERROR",
  /** Request timed out */
  TIMEOUT: "TIMEOUT",
  /** Safety guard blocked request */
  SAFETY_BLOCKED: "SAFETY_BLOCKED",
  /** Tool call requires human approval */
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED",
  /** Agent disabled in registry */
  AGENT_DISABLED: "AGENT_DISABLED",
  /** Invalid or missing auth token */
  UNAUTHORIZED: "UNAUTHORIZED",
  /** Generic internal error */
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type AiErrorCode = (typeof AI_ERROR_CODES)[keyof typeof AI_ERROR_CODES];

export interface PlatformErrorBody {
  readonly code: AiErrorCode;
  readonly message: string;
  readonly detail?: string | Record<string, unknown>;
  readonly correlationId?: string;
  readonly contractVersion?: string;
}

export class PlatformContractError extends Error {
  readonly code: AiErrorCode;
  readonly status: number;
  readonly detail?: string | Record<string, unknown>;
  readonly correlationId?: string;

  constructor(
    code: AiErrorCode,
    message: string,
    options?: {
      status?: number;
      detail?: string | Record<string, unknown>;
      correlationId?: string;
    },
  ) {
    super(message);
    this.name = "PlatformContractError";
    this.code = code;
    this.status = options?.status ?? 500;
    this.detail = options?.detail;
    this.correlationId = options?.correlationId;
  }

  toJSON(): PlatformErrorBody {
    return {
      code: this.code,
      message: this.message,
      detail: this.detail,
      correlationId: this.correlationId,
    };
  }
}

/** Map HTTP status to likely error code */
export function errorCodeFromStatus(status: number): AiErrorCode {
  if (status === 401 || status === 403) return AI_ERROR_CODES.UNAUTHORIZED;
  if (status === 402 || status === 429) return AI_ERROR_CODES.QUOTA_EXCEEDED;
  if (status === 404) return AI_ERROR_CODES.CLIENT_NOT_FOUND;
  if (status === 408 || status === 504) return AI_ERROR_CODES.TIMEOUT;
  if (status === 422) return AI_ERROR_CODES.CONTRACT_VERSION_UNSUPPORTED;
  if (status >= 500) return AI_ERROR_CODES.INTERNAL_ERROR;
  return AI_ERROR_CODES.PROVIDER_ERROR;
}
