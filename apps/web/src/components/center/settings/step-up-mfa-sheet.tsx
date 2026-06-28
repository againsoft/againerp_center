"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { stepUpMfa } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth-store";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: () => void | Promise<void>;
  title?: string;
  description?: string;
};

export function StepUpMfaSheet({
  open,
  onOpenChange,
  onVerified,
  title = "Step-up verification",
  description = "Enter your authenticator code to confirm this high-risk action. Valid for 5 minutes.",
}: Props) {
  const updateToken = useAuthStore((s) => s.updateToken);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await stepUpMfa(code);
      updateToken(result.token);
      setCode("");
      onOpenChange(false);
      await onVerified();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-sm" title={title}>
        <SheetTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-violet-600" />
          {title}
        </SheetTitle>
        <SheetDescription>{description}</SheetDescription>
        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="font-mono text-center text-lg tracking-widest"
            autoFocus
          />
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function isStepUpRequired(err: unknown): boolean {
  return err instanceof ApiError && err.status === 403 && err.message.toLowerCase().includes("step-up");
}
