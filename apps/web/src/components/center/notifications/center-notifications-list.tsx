"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  centerNotificationCategoryLabels,
  centerNotificationSeverityColors,
  type CenterPlatformNotification,
} from "@/lib/mock-data/center";
import { useCenterNotificationStore } from "@/lib/store/center-notification-store";
import { cn } from "@/lib/utils";

type Props = {
  notifications: CenterPlatformNotification[];
  readIds: string[];
};

export function CenterNotificationsList({ notifications, readIds }: Props) {
  const markRead = useCenterNotificationStore((s) => s.markRead);

  return (
    <div className="space-y-2">
      {notifications.map((notification) => {
        const read = readIds.includes(notification.id);
        return (
          <Link
            key={notification.id}
            href={notification.href}
            onClick={() => markRead(notification.id)}
            className={cn(
              "block rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40",
              !read && "border-violet-200 dark:border-violet-900",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={cn("text-sm", read ? "font-medium" : "font-semibold")}>
                  {notification.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{notification.body}</p>
              </div>
              {!read ? (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] capitalize",
                  centerNotificationSeverityColors[notification.severity],
                )}
              >
                {notification.severity}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {centerNotificationCategoryLabels[notification.category]}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{notification.time}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
