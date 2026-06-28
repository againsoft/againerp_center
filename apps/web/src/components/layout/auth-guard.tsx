"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      setChecking(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const me = await apiFetch<{
          id: string;
          email: string;
          username: string;
          role: string;
          full_name: string | null;
        }>("/api/v1/auth/me");
        if (!cancelled) {
          setAuth(token, me);
          setChecking(false);
        }
      } catch {
        if (!cancelled) {
          clearAuth();
          router.replace("/login");
          setChecking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, router, clearAuth, setAuth]);

  if (!token || checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Verifying session…
      </div>
    );
  }

  return <>{children}</>;
};
