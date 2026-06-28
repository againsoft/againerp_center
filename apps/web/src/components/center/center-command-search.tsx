"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { openCenterCommandPalette } from "@/lib/navigation/center-command-palette";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function CenterCommandSearch({ className }: Props) {
  return (
    <div className={cn("relative hidden w-full max-w-xs md:block", className)}>
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        readOnly
        placeholder="Search Control Center…"
        className="h-9 cursor-pointer border-violet-200 pl-8 pr-14 text-xs dark:border-violet-900"
        aria-label="Open Control Center command palette"
        onFocus={openCenterCommandPalette}
        onClick={openCenterCommandPalette}
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-input bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
        ⌘K
      </kbd>
    </div>
  );
}
