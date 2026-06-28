"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "default";
  showIcon?: boolean;
};

/** Entry point from ERP admin → Control Center (`/center`). */
export function CenterPlatformLink({ className, size = "sm", showIcon = true }: Props) {
  const pathname = usePathname();

  if (pathname?.startsWith("/center")) return null;

  return (
    <Button
      asChild
      variant="outline"
      size={size}
      className={cn(
        "border-violet-300 bg-violet-50/50 text-violet-800 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-200 dark:hover:bg-violet-950/50",
        className,
      )}
    >
      <Link href="/center">
        {showIcon ? <Shield className="mr-1.5 h-3.5 w-3.5" aria-hidden /> : null}
        Control Center
      </Link>
    </Button>
  );
}
