"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, PanelLeftClose, Shield } from "lucide-react";
import { centerNavGroups } from "@/lib/navigation/center-nav";
import { getCenterPendingRegistrationCount, centerPlatformNotifications } from "@/lib/mock-data/center";
import { useCenterNotificationStore } from "@/lib/store/center-notification-store";
import { useCenterSidebarStore } from "@/lib/store/center-sidebar-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

function isActive(pathname: string, href: string) {
  if (href === "/center") return pathname === "/center";
  if (href === "/center/settings") {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CenterSidebar({ className, onNavigate }: Props) {
  const pathname = usePathname();
  const collapsed = useCenterSidebarStore((s) => s.collapsed);
  const toggleCollapsed = useCenterSidebarStore((s) => s.toggle);
  const readIds = useCenterNotificationStore((s) => s.readIds);
  const unreadNotifications = centerPlatformNotifications.filter(
    (n) => !readIds.includes(n.id),
  ).length;
  const pendingRegistrations = getCenterPendingRegistrationCount();

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r bg-card/50 transition-[width] duration-200",
        collapsed ? "w-16" : "w-56",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center border-b px-3 py-3",
          collapsed ? "justify-center" : "gap-2",
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
          <Shield className="h-4 w-4" />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Control Center</p>
            <p className="truncate text-[10px] text-muted-foreground">AgainERP Platform</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-2">
        {centerNavGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                let badge: string | undefined = item.badge;

                if (item.href === "/center/registrations" && pendingRegistrations > 0) {
                  badge = String(pendingRegistrations);
                } else if (item.href === "/center/notifications" && unreadNotifications > 0) {
                  badge = unreadNotifications > 9 ? "9+" : String(unreadNotifications);
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.title : undefined}
                    className={cn(
                      "relative flex items-center rounded-md py-2 text-sm transition-colors",
                      collapsed ? "justify-center px-2" : "gap-2 px-2.5",
                      active
                        ? "bg-violet-100 font-medium text-violet-900 dark:bg-violet-950/60 dark:text-violet-100"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed ? (
                      <>
                        <span className="flex-1 truncate">{item.title}</span>
                        {badge ? (
                          <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
                            {badge}
                          </Badge>
                        ) : null}
                      </>
                    ) : badge ? (
                      <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-violet-600 px-0.5 text-[8px] font-medium leading-none text-white">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t p-2">
        {!collapsed ? (
          <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">
            Metadata only · Edge Agent heartbeat · No client business data
          </p>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn("w-full", !collapsed && "justify-start gap-2")}
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
