"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { login, verifyMfaLogin, type AuthOperator } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";

const DEMO_EMAIL = "admin@againerp.com";
const DEMO_PASSWORD = "Admin@1234";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaEmail, setMfaEmail] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function completeLogin(token: string, operator: AuthOperator) {
    setAuth(token, operator);
    router.push("/center");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(email, password);
      if (data.mfa_required && data.mfa_token) {
        setMfaToken(data.mfa_token);
        setMfaEmail(data.operator?.email ?? email);
        return;
      }
      if (data.token && data.operator && "id" in data.operator) {
        await completeLogin(data.token, data.operator as AuthOperator);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await verifyMfaLogin(mfaToken, mfaCode);
      await completeLogin(data.token, data.operator);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
    } finally {
      setLoading(false);
    }
  }

  const mfaStep = Boolean(mfaToken);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">AgainERP</h1>
            <p className="text-sm text-gray-400">Control Center</p>
          </div>
        </div>

        {!mfaStep ? (
          <form onSubmit={(e) => void handleLogin(e)} className="space-y-4 rounded-2xl border border-white/10 bg-gray-900 p-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@againerp.com"
                required
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? <p className="rounded-lg bg-red-950/50 px-3 py-2 text-xs text-red-400">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => void handleMfaVerify(e)} className="space-y-4 rounded-2xl border border-white/10 bg-gray-900 p-6">
            <div>
              <p className="text-sm font-medium text-white">Two-factor authentication</p>
              <p className="mt-1 text-xs text-gray-400">
                Enter the 6-digit code from your authenticator app for {mfaEmail}.
              </p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              required
              autoFocus
              className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-center font-mono text-lg tracking-widest text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
            {error ? <p className="rounded-lg bg-red-950/50 px-3 py-2 text-xs text-red-400">{error}</p> : null}
            <button
              type="submit"
              disabled={loading || mfaCode.length < 6}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Verify & sign in
            </button>
            <button
              type="button"
              className="w-full text-xs text-gray-500 hover:text-gray-300"
              onClick={() => {
                setMfaToken(null);
                setMfaCode("");
                setError(null);
              }}
            >
              ← Back to password
            </button>
          </form>
        )}

        {!mfaStep ? (
          <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-950/30 p-4">
            <p className="text-xs font-semibold text-violet-300">Default credentials</p>
            <dl className="mt-2 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-mono text-gray-200">{DEMO_EMAIL}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-gray-500">Password</dt>
                <dd className="font-mono text-gray-200">{DEMO_PASSWORD}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_EMAIL);
                setPassword(DEMO_PASSWORD);
                setError(null);
              }}
              className="mt-3 w-full rounded-lg border border-violet-500/30 px-3 py-2 text-xs font-medium text-violet-300 transition hover:bg-violet-500/10"
            >
              Use these credentials
            </button>
          </div>
        ) : null}

        <p className="mt-6 text-center text-xs text-gray-600">
          AgainERP Control Center — MFA supported (TOTP)
        </p>
      </div>
    </div>
  );
}
