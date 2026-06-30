/** Routes wired to Control Center API + PostgreSQL (not mock-only UI). */

export const CENTER_LIVE_ROUTES = new Set([
  "/center",
  "/clients",
  "/registrations",
  "/subscriptions",
  "/licenses",
  "/billing",
  "/modules",
  "/updates",
  "/agents",
  "/monitoring",
  "/backups",
  "/ai-access",
  "/notifications",
  "/audit",
  "/settings/security",
  "/settings/operators",
  "/settings/integrations",
  "/settings/api-keys",
]);

export function isCenterLiveRoute(href: string): boolean {
  if (CENTER_LIVE_ROUTES.has(href)) return true;
  if (href.startsWith("/clients/")) return true;
  return false;
}
