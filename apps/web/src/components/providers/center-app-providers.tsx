"use client";

import { Toaster } from "sonner";
import { CenterCommandPalette } from "@/components/center/center-command-palette";

export function CenterAppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="bottom-right" />
      <CenterCommandPalette />
    </>
  );
}
