import { useAuthStore } from "@/lib/store/auth-store";

function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().token ?? localStorage.getItem("center_token");
}

const LOCAL_API_URL = "http://127.0.0.1:8100";
const PRODUCTION_API_URL = "https://moharaznx-production.up.railway.app";

function isLocalApiUrl(url: string): boolean {
  return url === LOCAL_API_URL || url === "http://localhost:8000";
}

/** FastAPI base URL — no trailing slash. Empty string = same-origin (Next.js dev proxy). */
export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith(".vercel.app")) {
      return PRODUCTION_API_URL;
    }
    // Local dev — same origin; next.config rewrites /api/v1 → Center API :8100
    if (host === "localhost" || host === "127.0.0.1") {
      return "";
    }
  }

  if (configured && !isLocalApiUrl(configured)) {
    return configured;
  }

  if (process.env.VERCEL === "1") {
    return PRODUCTION_API_URL;
  }

  return configured || LOCAL_API_URL;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAuthToken();
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as {
        detail?: string | { msg?: string; loc?: (string | number)[] }[];
      };
      if (typeof body.detail === "string") {
        detail = body.detail;
      } else if (Array.isArray(body.detail)) {
        detail = body.detail
          .map((item) => {
            const field = item.loc
              ?.filter((part): part is string => typeof part === "string" && part !== "body")
              .join(".");
            const msg = item.msg ?? JSON.stringify(item);
            return field ? `${field}: ${msg}` : msg;
          })
          .join(" · ");
      }
    } catch {
      try {
        const text = (await res.text()).trim();
        if (text) detail = text;
      } catch {
        /* ignore */
      }
    }
    if (
      res.status >= 500 &&
      (detail === "Internal Server Error" || detail === "Bad Gateway")
    ) {
      detail =
        "API server is not running. Start Docker (postgres + api) or set API_PROXY_TARGET to a live API.";
    }
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !path.includes("/auth/login") &&
      !window.location.pathname.startsWith("/login")
    ) {
      useAuthStore.getState().clearAuth();
      const next = encodeURIComponent(window.location.pathname);
      window.location.assign(`/login?next=${next}`);
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
