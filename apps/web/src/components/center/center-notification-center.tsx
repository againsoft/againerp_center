"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  centerNotificationCategoryLabels,
  centerNotificationSeverityColors,
  centerPlatformNotifications,
} from "@/lib/mock-data/center";
import { useCenterNotificationStore } from "@/lib/store/center-notification-store";
import { cn } from "@/lib/utils";

export function CenterNotificationCenter() {
  const readIds = useCenterNotificationStore((s) => s.readIds);
  const markRead = useCenterNotificationStore((s) => s.markRead);
  const markAllRead = useCenterNotificationStore((s) => s.markAllRead);

  const notifications = useMemo(
    () =>
      [...centerPlatformNotifications].sort((a, b) => {
        const aRead = readIds.includes(a.id);
        const bRead = readIds.includes(b.id);
        if (aRead !== bRead) return aRead ? 1 : -1;
        return 0;
      }),
    [readIds],
  );

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;
  const preview = notifications.slice(0, 6);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 shrink-0"
          aria-label="Platform notifications"
          title="Platform notifications"
        >
          <Bell className="h-4 w-4" aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-0.5 text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Platform alerts</DropdownMenuLabel>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="text-[10px] font-medium text-violet-600 hover:underline"
              onClick={markAllRead}
            >
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {preview.length === 0 ? (
          <DropdownMenuItem disabled className="py-3 text-xs text-muted-foreground">
            No notifications
          </DropdownMenuItem>
        ) : (
          preview.map((item) => {
            const read = readIds.includes(item.id);
            return (
              <DropdownMenuItem key={item.id} asChild className="cursor-pointer p-0">
                <Link
                  href={item.href}
                  className="flex w-full flex-col gap-1 px-2 py-2"
                  onClick={() => markRead(item.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={cn("text-sm", read ? "font-medium" : "font-semibold")}>
                      {item.title}
                    </span>
                    {!read ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                    ) : null}
                  </div>
                  <span className="line-clamp-2 text-[11px] text-muted-foreground">{item.body}</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px] capitalize", centerNotificationSeverityColors[item.severity])}
                    >
                      {item.severity}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {centerNotificationCategoryLabels[item.category]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{item.time}</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/center/notifications" className="w-full cursor-pointer">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
