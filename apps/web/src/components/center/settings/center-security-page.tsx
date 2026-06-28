"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  confirmMfaSetup,
  disableMfa,
  fetchMfaStatus,
  startMfaSetup,
  type MfaSetupResult,
  type MfaStatus,
} from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";

export function CenterSecurityPageContent() {
  const operator = useAuthStore((s) => s.operator);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const [status, setStatus] = useState<MfaStatus | null>(null);
  const [setup, setSetup] = useState<MfaSetupResult | null>(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStatus(await fetchMfaStatus());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load MFA status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleStartSetup() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      setSetup(await startMfaSetup());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start MFA setup");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await confirmMfaSetup(confirmCode);
      setSetup(null);
      setConfirmCode("");
      setMessage("MFA enabled — you will need your authenticator app at next login.");
      await load();
      if (token && operator) {
        setAuth(token, { ...operator, mfa_enabled: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);
    setError(null);
    try {
      await disableMfa(disableCode);
      setDisableCode("");
      setMessage("MFA disabled.");
      await load();
      if (token && operator) {
        setAuth(token, { ...operator, mfa_enabled: false });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to disable MFA");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Settings › Security"
        title="Security & MFA"
        live
        description="TOTP authenticator setup for your operator account. High-risk actions require step-up verification within 5 minutes."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/center/settings">Back to settings</Link>
          </Button>
        }
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm dark:border-red-900 dark:bg-red-950/30">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
          {message}
        </div>
      ) : null}

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-violet-600" />
          <div className="flex-1">
            <h2 className="text-sm font-medium">Multi-factor authentication</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Account: {operator?.email ?? "—"}
            </p>
            {loading ? (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </p>
            ) : status?.enabled ? (
              <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
                MFA is enabled ({status.type ?? "totp"})
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">MFA is not enabled on this account.</p>
            )}
          </div>
        </div>

        {!loading && !status?.enabled && !setup ? (
          <Button size="sm" className="mt-4" onClick={() => void handleStartSetup()} disabled={busy}>
            Enable TOTP MFA
          </Button>
        ) : null}

        {setup ? (
          <div className="mt-4 space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-xs font-medium">1. Add to authenticator app</p>
            <p className="break-all font-mono text-xs text-muted-foreground">{setup.provisioning_uri}</p>
            <p className="text-xs text-muted-foreground">
              Secret (manual entry): <span className="font-mono">{setup.secret}</span>
            </p>
            <p className="text-xs font-medium">2. Enter verification code</p>
            <Input
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ""))}
              className="max-w-[160px] font-mono text-center tracking-widest"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void handleConfirm()} disabled={busy || confirmCode.length < 6}>
                Confirm & enable
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSetup(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {!loading && status?.enabled ? (
          <div className="mt-4 space-y-2 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">Disable MFA</p>
            <Input
              inputMode="numeric"
              maxLength={6}
              placeholder="Current TOTP code"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
              className="max-w-[160px] font-mono text-center tracking-widest"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void handleDisable()}
              disabled={busy || disableCode.length < 6}
            >
              Disable MFA
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-xs text-muted-foreground">
        Step-up MFA is required for registration approval and other high-risk operations when MFA is
        enabled. Approve actions within 5 minutes of verifying your code.
      </div>
    </div>
  );
}
