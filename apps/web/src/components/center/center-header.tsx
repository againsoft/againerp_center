"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, Moon, Search, Shield, Sun } from "lucide-react";
import { CenterCommandSearch } from "@/components/center/center-command-search";
import { CenterNotificationCenter } from "@/components/center/center-notification-center";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";
import { openCenterCommandPalette } from "@/lib/navigation/center-command-palette";
import { useAuthStore } from "@/lib/store/auth-store";

type Props = {
  onMenuClick?: () => void;
};

function initials(name: string | null | undefined, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function CenterHeader({ onMenuClick }: Props) {
  const { isDark, toggle } = useTheme();
  const router = useRouter();
  const operator = useAuthStore((s) => s.operator);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  const displayName = operator?.full_name || operator?.username || "Operator";
  const displayEmail = operator?.email ?? "admin@againerp.com";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white">
          <Shield className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold leading-tight">Control Center</h1>
          <p className="truncate text-[10px] text-muted-foreground">AgainERP Platform</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:justify-center">
        <CenterCommandSearch className="max-w-sm flex-1" />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 md:hidden"
          onClick={openCenterCommandPalette}
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4" />
        </Button>
        <CenterNotificationCenter />
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Logout
        </Button>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-8 w-8 rounded-full bg-violet-600/20 text-center text-xs font-semibold leading-8 text-violet-700 dark:text-violet-300">
            {initials(operator?.full_name, displayEmail)}
          </div>
          <div className="text-right">
            <p className="text-xs font-medium">{displayName}</p>
            <p className="text-[10px] text-muted-foreground">{displayEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
