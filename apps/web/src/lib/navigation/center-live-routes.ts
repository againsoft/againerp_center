/** Routes wired to Control Center API + PostgreSQL (not mock-only UI). */

export const CENTER_LIVE_ROUTES = new Set([
  "/center",
  "/center/clients",
  "/center/registrations",
  "/center/subscriptions",
  "/center/licenses",
  "/center/billing",
  "/center/modules",
  "/center/updates",
  "/center/agents",
  "/center/monitoring",
  "/center/backups",
  "/center/ai-access",
  "/center/notifications",
  "/center/audit",
  "/center/settings/security",
  "/center/settings/operators",
  "/center/settings/integrations",
  "/center/settings/api-keys",
]);

export function isCenterLiveRoute(href: string): boolean {
  if (CENTER_LIVE_ROUTES.has(href)) return true;
  if (href.startsWith("/center/clients/")) return true;
  return false;
}
