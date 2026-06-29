import { NextRequest, NextResponse } from "next/server";

/** Runtime API proxy — reads env at request time (fixes Vercel build-time rewrite issue). */
function apiBaseUrl(): string {
  return (
    process.env.API_PROXY_TARGET?.replace(/\/$/, "") ||
    process.env.API_BASE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL === "1"
      ? "https://againerpcenter-production.up.railway.app"
      : "http://127.0.0.1:8001")
  );
}

async function proxy(req: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const path = pathSegments.join("/");
  const target = `${apiBaseUrl()}/api/v1/${path}${req.nextUrl.search}`;

  const headers = new Headers();
  for (const [key, value] of req.headers.entries()) {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "connection" || lower === "content-length") continue;
    headers.set(key, value);
  }

  let body: string | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.text();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream API unreachable";
    return NextResponse.json(
      { detail: `API proxy error: ${message}. Set API_PROXY_TARGET on Vercel.` },
      { status: 502 },
    );
  }

  const contentType = upstream.headers.get("content-type") ?? "application/json";
  const text = await upstream.text();

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": contentType },
  });
}

type RouteCtx = { params: Promise<{ path: string[] }> };

async function handler(req: NextRequest, ctx: RouteCtx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
