"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CenterCommandPalette } from "./center-command-palette";
import { CenterHeader } from "./center-header";
import { CenterSidebar } from "./center-sidebar";

type Props = {
  children: React.ReactNode;
};

export function CenterShell({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <CenterCommandPalette />
      <CenterHeader onMenuClick={() => setMobileOpen(true)} />

      <div className="flex min-h-0 flex-1">
        <div className="hidden md:block">
          <CenterSidebar />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(100vw,14rem)] gap-0 p-0">
          <CenterSidebar
            className="h-full w-full border-0"
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
