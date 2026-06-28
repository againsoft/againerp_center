"use client";

import { useEffect, useState } from "react";
import {
  Zap, Key, Mail, MessageSquare, Settings2, CheckCircle2,
  XCircle, Eye, EyeOff, Save, Trash2, Loader2, ExternalLink, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CenterPageHeader } from "@/components/center/center-page-header";
import {
  fetchPlatformSettings,
  upsertPlatformSetting,
  clearPlatformSetting,
  testPageSpeedApiKey,
  type PlatformSetting,
} from "@/lib/api/platform-settings";

const GROUP_META: Record<string, { label: string; icon: React.ElementType; color: string; docs?: string }> = {
  integrations: { label: "External Integrations", icon: Zap, color: "text-amber-500", docs: "https://console.cloud.google.com/" },
  email: { label: "Email (SMTP)", icon: Mail, color: "text-blue-500" },
  sms: { label: "SMS Gateway", icon: MessageSquare, color: "text-green-500" },
  general: { label: "General", icon: Settings2, color: "text-muted-foreground" },
};

const KEY_DOCS: Record<string, string> = {
  pagespeed_api_key: "https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com",
  openai_api_key: "https://platform.openai.com/api-keys",
};

function SettingRow({ setting, onSaved }: { setting: PlatformSetting; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; score?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await upsertPlatformSetting(setting.key, value.trim());
      setValue("");
      setEditing(false);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleClear() {
    setClearing(true);
    setError(null);
    setTestResult(null);
    try {
      await clearPlatformSetting(setting.key);
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Clear failed");
    } finally {
      setClearing(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setError(null);
    setTestResult(null);
    try {
      const result = await testPageSpeedApiKey();
      setTestResult({
        ok: result.ok,
        message: result.message,
        score: result.performance_score,
      });
    } catch (e) {
      setTestResult({
        ok: false,
        message: e instanceof Error ? e.message : "Test failed",
      });
    } finally {
      setTesting(false);
    }
  }

  const docsUrl = KEY_DOCS[setting.key];

  return (
    <div className="rounded-lg border border-input bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{setting.label}</span>
            {setting.configured ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Configured
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                <XCircle className="h-3 w-3" /> Not set
              </span>
            )}
            {setting.is_secret && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                Secret
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{setting.description}</p>
          {setting.configured && setting.value && (
            <div className="mt-2 flex items-center gap-1.5">
              <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono tracking-wider">
                {showValue ? setting.value : setting.value}
              </code>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {docsUrl && (
            <a href={docsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-muted-foreground underline-offset-2 hover:underline">
              Docs <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {setting.configured && (
            <Button variant="ghost" size="sm" onClick={handleClear} disabled={clearing}
              className="h-7 px-2 text-xs text-destructive hover:text-destructive">
              {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            </Button>
          )}
          {setting.key === "pagespeed_api_key" && setting.configured && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => void handleTest()} disabled={testing}>
              {testing ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-1 h-3.5 w-3.5" />}
              Test
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7 text-xs"
            onClick={() => { setEditing((p) => !p); setValue(""); setError(null); setTestResult(null); }}>
            {setting.configured ? "Update" : "Configure"}
          </Button>
        </div>
      </div>

      {testResult && (
        <p className={cn("mt-2 text-[11px]", testResult.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
          {testResult.ok ? "✓" : "✗"} {testResult.message}
          {testResult.ok && testResult.score != null ? ` (sample score: ${testResult.score})` : ""}
        </p>
      )}

      {editing && (
        <div className="mt-3 space-y-2 border-t border-input pt-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type={setting.is_secret && !showValue ? "password" : "text"}
                placeholder={`Enter ${setting.label}…`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleSave()}
                className="h-8 pr-8 text-xs font-mono"
                autoFocus
              />
              {setting.is_secret && (
                <button type="button" onClick={() => setShowValue((p) => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showValue ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
            <Button size="sm" className="h-8 text-xs" onClick={() => void handleSave()}
              disabled={saving || !value.trim()}>
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
              Save
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs"
              onClick={() => { setEditing(false); setValue(""); }}>
              Cancel
            </Button>
          </div>
          {error && <p className="text-[11px] text-destructive">{error}</p>}
          {setting.is_secret && (
            <p className="flex items-start gap-1 text-[11px] text-muted-foreground">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              Encrypted at rest — value is never shown again after saving.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function CenterIntegrationsPageContent() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPlatformSettings();
      setSettings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const groups = Object.entries(GROUP_META).map(([groupKey, meta]) => ({
    ...meta,
    groupKey,
    items: settings.filter((s) => s.group === groupKey),
  })).filter((g) => g.items.length > 0);

  const configured = settings.filter((s) => s.configured).length;

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb="Control Center › Settings › Integrations"
        title="Integrations & API Keys"
        live
        count={settings.length}
        description="Configure third-party API keys used across all client stores — PageSpeed, Email, SMS, AI and more."
      />

      {/* Summary bar */}
      {!loading && settings.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-input bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", configured === settings.length ? "bg-emerald-500" : configured > 0 ? "bg-amber-500" : "bg-muted-foreground")} />
            <span className="text-xs font-medium">{configured} / {settings.length} configured</span>
          </div>
          {configured < settings.length && (
            <p className="text-xs text-muted-foreground">
              {settings.length - configured} integration{settings.length - configured > 1 ? "s" : ""} not set up yet
            </p>
          )}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && groups.map((group) => {
        const Icon = group.icon;
        return (
          <div key={group.groupKey} className="rounded-xl border border-input bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Icon className={cn("h-4 w-4", group.color)} />
              <h2 className="text-sm font-semibold">{group.label}</h2>
            </div>
            <div className="space-y-2">
              {group.items.map((s) => (
                <SettingRow key={s.key} setting={s} onSaved={load} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
