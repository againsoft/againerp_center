import type { ApiPlatformNotification } from "@/lib/api/notifications";
import type {
  CenterDashboardAlertSeverity,
  CenterNotificationCategory,
  CenterPlatformNotification,
} from "@/lib/mock-data/center";

const CATEGORIES = new Set<CenterNotificationCategory>([
  "agent",
  "registration",
  "billing",
  "security",
  "update",
  "system",
]);

const SEVERITIES = new Set<CenterDashboardAlertSeverity>(["critical", "warning", "info"]);

function mapCategory(value: string): CenterNotificationCategory {
  return CATEGORIES.has(value as CenterNotificationCategory)
    ? (value as CenterNotificationCategory)
    : "system";
}

function mapSeverity(value: string): CenterDashboardAlertSeverity {
  return SEVERITIES.has(value as CenterDashboardAlertSeverity)
    ? (value as CenterDashboardAlertSeverity)
    : "info";
}

export function apiNotificationToCenter(row: ApiPlatformNotification): CenterPlatformNotification {
  return {
    id: row.id,
    category: mapCategory(row.category),
    severity: mapSeverity(row.severity),
    title: row.title,
    body: row.body,
    href: row.href,
    time: row.time,
  };
}

export function apiNotificationsToCenter(rows: ApiPlatformNotification[]): CenterPlatformNotification[] {
  return rows.map(apiNotificationToCenter);
}

export function computeNotificationStats(
  notifications: CenterPlatformNotification[],
  readIds: string[] = [],
) {
  const total = notifications.length;
  const unread = notifications.filter((n) => !readIds.includes(n.id)).length;
  const critical = notifications.filter(
    (n) => n.severity === "critical" && !readIds.includes(n.id),
  ).length;
  return { total, unread, critical };
}
