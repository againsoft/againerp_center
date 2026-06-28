/** Admin / back-office URL prefixes — everything else is public storefront. */
export const ADMIN_PATH_PREFIXES = [
  "/login",
  "/dashboard",
  "/catalog",
  "/orders",
  "/customers",
  "/marketing",
  "/inventory",
  "/suppliers",
  "/settings",
  "/seo",
  "/website",
  "/system",
  "/notifications",
  "/ai-os",
  "/reports",
  "/configurator",
  "/media",
  "/center",
] as const;

export function isAdminPath(pathname: string): boolean {
  if (!pathname) return false;
  return ADMIN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Resolve pathname on client when Next router has not hydrated yet. */
export function resolvePathname(pathname: string | null | undefined): string {
  if (pathname) return pathname;
  if (typeof window !== "undefined") return window.location.pathname;
  return "/";
}

/** Public customer-facing website (storefront) — always light theme. */
export function isStorefrontPath(pathname: string | null | undefined): boolean {
  const path = resolvePathname(pathname);
  if (path.startsWith("/api")) return false;
  return !isAdminPath(path);
}
