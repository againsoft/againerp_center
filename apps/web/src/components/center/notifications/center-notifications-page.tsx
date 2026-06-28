"use client";

import { useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { CenterNotificationsList } from "@/components/center/notifications/center-notifications-list";
import {
  CenterNotificationsToolbar,
  type CenterNotificationFilters,
} from "@/components/center/notifications/center-notifications-toolbar";
import { Button } from "@/components/ui/button";
import {
  centerPlatformNotifications,
  filterCenterPlatformNotifications,
  getCenterNotificationStats,
} from "@/lib/mock-data/center";
import { useCenterNotificationStore } from "@/lib/store/center-notification-store";

const defaultFilters: CenterNotificationFilters = {
  search: "",
  category: "all",
  severity: "all",
  unreadOnly: false,
};

export function CenterNotificationsPageContent() {
  const readIds = useCenterNotificationStore((s) => s.readIds);
  const markAllRead = useCenterNotificationStore((s) => s.markAllRead);
  const stats = getCenterNotificationStats(readIds);
  const [filters, setFilters] = useState<CenterNotificationFilters>(defaultFilters);

  const filtered = useMemo(
    () => filterCenterPlatformNotifications(centerPlatformNotifications, { ...filters, readIds }),
    [filters, readIds],
  );

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Notifications"
        title="Platform Notifications"
        count={stats.total}
        description={`${stats.unread} unread · operational alerts across fleet, billing, agents, and security.`}
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={stats.unread === 0}
            onClick={markAllRead}
          >
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Mark all read
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Unread" value={stats.unread} />
        <StatCard label="Critical unread" value={stats.critical} tone="text-red-600" />
        <StatCard label="Total" value={stats.total} />
      </div>

      <CenterNotificationsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerPlatformNotifications.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No notifications match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterNotificationsList notifications={filtered} readIds={readIds} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "text-violet-600",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
