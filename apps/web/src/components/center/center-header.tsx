"use client";

import Link from "next/link";
import { Menu, Moon, Search, Sun } from "lucide-react";
import { CenterCommandSearch } from "@/components/center/center-command-search";
import { CenterNotificationCenter } from "@/components/center/center-notification-center";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";
import { openCenterCommandPalette } from "@/lib/navigation/center-command-palette";

type Props = {
  onMenuClick?: () => void;
};

export function CenterHeader({ onMenuClick }: Props) {
  const { isDark, toggle } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">MoharazNX Platform</p>
          <p className="text-sm font-semibold leading-tight">Control Center</p>
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
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">ERP Admin</Link>
        </Button>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="h-8 w-8 rounded-full bg-violet-600/20 text-center text-xs font-semibold leading-8 text-violet-700 dark:text-violet-300">
            SA
          </div>
          <div className="text-right">
            <p className="text-xs font-medium">Super Admin</p>
            <p className="text-[10px] text-muted-foreground">platform@moharaz.com</p>
          </div>
        </div>
      </div>
    </header>
  );
}
