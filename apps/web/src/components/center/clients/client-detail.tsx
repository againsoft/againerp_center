"use client";

import type { ElementType } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Bot,
  Building2,
  ClipboardList,
  CreditCard,
  ExternalLink,
  KeyRound,
  ListTodo,
  Loader2,
  LogIn,
  Package,
  PauseCircle,
  PlayCircle,
  Server,
} from "lucide-react";
import { CenterPageHeader } from "@/components/center/center-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  centerAgentCommandStatusColors,
  centerAgentCommandTypeLabels,
  centerAgentStatusLabel,
  centerDbStatusColors,
  centerModules,
  centerRecentActivity,
  centerStatusColors,
  formatCenterPlan,
  getCenterAgentCommandsForClient,
  getCenterAgentSyncQueuesForClient,
  type CenterClient,
  type CenterClientSubscription,
  type CenterLicense,
} from "@/lib/mock-data/center";
import { apiLicensesToCenterLicenses } from "@/lib/adapters/center-license-adapter";
import { apiSubscriptionsToCenterSubscriptions } from "@/lib/adapters/center-subscription-adapter";
import { fetchClients } from "@/lib/api/clients";
import { fetchClientModules, updateClientModules, type ApiClientModuleState } from "@/lib/api/modules";
import { fetchLicenses } from "@/lib/api/licenses";
import { fetchServers, type ApiServer } from "@/lib/api/servers";
import { fetchSubscriptions } from "@/lib/api/subscriptions";
import { cn, formatCurrency } from "@/lib/utils";

type DetailTab = "overview" | "modules" | "agent" | "subscription";

const tabs: { key: DetailTab; label: string; icon: ElementType }[] = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "modules", label: "Modules & AI", icon: Package },
  { key: "agent", label: "Agent & Server", icon: Server },
  { key: "subscription", label: "Subscription", icon: CreditCard },
];

type Props = {
  client: CenterClient;
};

export function CenterClientDetail({ client }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as DetailTab | null;
  const activeTab = tabs.some((t) => t.key === tabParam) ? tabParam! : "overview";

  const aiUsagePct =
    client.aiTokensLimit > 0
      ? Math.round((client.aiTokensUsed / client.aiTokensLimit) * 100)
      : 0;

  const clientActivity = centerRecentActivity.filter((a) => a.clientId === client.id);

  function setTab(tab: DetailTab) {
    router.replace(`/center/clients/${client.id}?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <CenterPageHeader
        breadcrumb={`Control Center › Clients › ${client.businessName}`}
        title={client.businessName}
        live
        description={`${client.slug} · ${client.country} · ${formatCenterPlan(client.plan)} plan`}
        actions={
          <>
            <Badge
              variant="secondary"
              className={cn("capitalize", centerStatusColors[client.status])}
            >
              {client.status}
            </Badge>
            <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700">
              <a href={client.adminUrl} target="_blank" rel="noopener noreferrer">
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Enter admin
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/center/monitoring?client=${client.id}`}>
                <Activity className="mr-1.5 h-3.5 w-3.5" />
                Agent health
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-1 border-b pb-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
              activeTab === key
                ? "bg-violet-100 font-medium text-violet-900 dark:bg-violet-950 dark:text-violet-100"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <OverviewTab client={client} activity={clientActivity} aiUsagePct={aiUsagePct} />
      ) : null}
      {activeTab === "modules" ? <ModulesTab client={client} aiUsagePct={aiUsagePct} /> : null}
      {activeTab === "agent" ? <AgentTab client={client} /> : null}
      {activeTab === "subscription" ? <SubscriptionTab client={client} /> : null}
    </div>
  );
}

function OverviewTab({
  client,
  activity,
  aiUsagePct,
}: {
  client: CenterClient;
  activity: typeof centerRecentActivity;
  aiUsagePct: number;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="MRR" value={client.mrr > 0 ? formatCurrency(client.mrr) : "Trial"} />
        <StatCard
          label="Modules"
          value={`${client.modules.length}`}
          sub={`${centerModules.length} available`}
        />
        <StatCard label="Subscription ends" value={client.subscriptionEnds} />
        <StatCard
          label="Agent"
          value={centerAgentStatusLabel[client.dbStatus]}
          sub={`Last heartbeat ${client.lastHeartbeat}`}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium">Contact & account</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact" value={client.contactName} />
            <Field label="Email" value={client.contactEmail} />
            <Field label="Phone" value={client.phone} />
            <Field label="Registered" value={client.registeredAt} />
            <Field label="Deployment" value={client.deploymentMode} capitalize />
            <Field label="Instance ID" value={client.instanceId} mono />
          </dl>
          {client.notes ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
              {client.notes}
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-medium">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recent platform events for this client.</p>
          ) : (
            <div className="space-y-2">
              {activity.map((item) => (
                <div key={item.id} className="rounded-md border px-3 py-2 text-sm">
                  <p>{item.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.time} · {item.actor}
                  </p>
                </div>
              ))}
            </div>
          )}
          <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
            <Link href="/center/audit">Full audit log</Link>
          </Button>
        </div>
      </div>

      {client.aiEnabled ? (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-medium">AI usage snapshot</h2>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Token usage</span>
            <span>{aiUsagePct}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-violet-600"
              style={{ width: `${Math.min(aiUsagePct, 100)}%` }}
            />
          </div>
        </div>
      ) : null}

      <LifecycleActions status={client.status} />
    </>
  );
}

function ModulesTab({ client, aiUsagePct }: { client: CenterClient; aiUsagePct: number }) {
  const [moduleStates, setModuleStates] = useState<ApiClientModuleState[]>([]);
  const [draftEnabled, setDraftEnabled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const states = await fetchClientModules(client.id);
        if (!cancelled) {
          setModuleStates(states);
          setDraftEnabled(new Set(states.filter((s) => s.enabled).map((s) => s.code)));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load modules");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [client.id]);

  const dirty = useMemo(() => {
    const current = new Set(moduleStates.filter((s) => s.enabled).map((s) => s.code));
    if (current.size !== draftEnabled.size) return true;
    for (const code of draftEnabled) {
      if (!current.has(code)) return true;
    }
    return false;
  }, [moduleStates, draftEnabled]);

  function toggleModule(code: string, next: boolean) {
    setDraftEnabled((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(code);
      else copy.delete(code);
      return copy;
    });
    setSaveMessage(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaveMessage(null);
    try {
      const result = await updateClientModules(client.id, [...draftEnabled]);
      setDraftEnabled(new Set(result.enabled_modules));
      const states = await fetchClientModules(client.id);
      setModuleStates(states);
      setSaveMessage("Module entitlements saved — Edge Agent sync queued.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save modules");
    } finally {
      setSaving(false);
    }
  }

  const displayModules: ApiClientModuleState[] = moduleStates;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Package className="h-4 w-4 text-violet-600" />
          Module entitlements
        </h2>

        {error ? (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs dark:border-red-900 dark:bg-red-950/30">
            {error}
          </div>
        ) : null}
        {saveMessage ? (
          <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs dark:border-emerald-900 dark:bg-emerald-950/30">
            {saveMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading module entitlements…
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {displayModules.map((mod) => {
              const code = mod.code;
              const enabled = draftEnabled.has(code);
              const locked = mod.is_core || (enabled && !mod.can_disable);
              return (
                <div
                  key={code}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2",
                    enabled
                      ? "border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20"
                      : "opacity-80",
                  )}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-medium">{mod.label}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{mod.tier}</p>
                    {mod.blocked_reason && !enabled ? (
                      <p className="text-[10px] text-amber-700 dark:text-amber-300">{mod.blocked_reason}</p>
                    ) : null}
                  </div>
                  <Switch
                    checked={enabled}
                    disabled={locked && enabled}
                    onCheckedChange={(next) => toggleModule(code, next)}
                    aria-label={`${mod.label} module`}
                  />
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground">
          Toggles sync to Edge Agent on save. Core modules (catalog, orders, customers) cannot be disabled.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          disabled={!dirty || saving || loading}
          onClick={() => void handleSave()}
        >
          {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          Save module changes
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Bot className="h-4 w-4 text-violet-600" />
          AI OS access
        </h2>
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div>
            <p className="text-sm font-medium">AI OS enabled</p>
            <p className="text-xs text-muted-foreground">
              Agents limit: {client.aiAgentsLimit || "—"}
            </p>
          </div>
          <Switch checked={client.aiEnabled} disabled />
        </div>
        {client.aiEnabled ? (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs">
              <span>Monthly token credits</span>
              <span>{aiUsagePct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-violet-600"
                style={{ width: `${Math.min(aiUsagePct, 100)}%` }}
              />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {(client.aiTokensUsed / 1000).toFixed(0)}k / {(client.aiTokensLimit / 1000).toFixed(0)}k
              tokens
            </p>
          </div>
        ) : null}
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/center/ai-access">Fleet AI settings</Link>
        </Button>
      </div>
    </div>
  );
}

function AgentTab({ client }: { client: CenterClient }) {
  const [server, setServer] = useState<ApiServer | null>(null);
  const [loading, setLoading] = useState(true);
  const clientCommands = getCenterAgentCommandsForClient(client.id).slice(0, 4);
  const clientQueues = getCenterAgentSyncQueuesForClient(client.id);
  const pendingQueueItems = clientQueues.reduce((sum, q) => sum + q.pendingCount, 0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const servers = await fetchServers(client.id);
        if (!cancelled) setServer(servers[0] ?? null);
      } catch {
        if (!cancelled) setServer(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [client.id]);

  const agentOnline = server?.is_online ?? false;
  const lastHeartbeat = server?.last_heartbeat_at
    ? new Date(server.last_heartbeat_at).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : client.lastHeartbeat;
  const agentVersion = server?.agent_version ?? client.agentVersion;
  const erpVersion = server?.erp_version ?? client.erpVersion;
  const instanceId = server?.instance_id ?? client.instanceId;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4 text-violet-600" />
          Edge Agent
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading agent status…</p>
        ) : (
        <dl className="space-y-2 text-sm">
          <Row label="Agent status">
            <Badge
              variant="secondary"
              className={cn(
                "capitalize",
                agentOnline
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
              )}
            >
              {agentOnline ? "Online" : server ? "Offline" : "Not registered"}
            </Badge>
          </Row>
          {server?.health_status ? (
            <Row label="Health" value={server.health_status} capitalize />
          ) : null}
          <Row label="Last heartbeat" value={lastHeartbeat} />
          <Row label="Agent version" value={agentVersion} mono />
          <Row label="ERP version" value={erpVersion} mono />
          <Row label="Instance ID" value={instanceId} mono />
          {pendingQueueItems > 0 ? (
            <Row label="Offline queue" value={`${pendingQueueItems} item(s) buffered`} />
          ) : null}
        </dl>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Health metrics from agent heartbeat — Control Center never connects to client database
          directly.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/center/monitoring?client=${client.id}`}>Open monitoring</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/center/agents?tab=commands&client=${client.id}`}>Command queue</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/center/agents?tab=sync&client=${client.id}`}>Sync queues</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Server className="h-4 w-4 text-violet-600" />
          Server metadata
        </h2>
        <dl className="space-y-2 text-sm">
          <Row label="Server host" value={client.serverHost} mono />
          <Row label="Deployment" value={client.deploymentMode} capitalize />
          <Row label="DB host (client-owned)" value={client.dbHost} mono />
          <Row label="Database name" value={client.dbName} mono />
          <Row label="Admin URL">
            <a
              href={client.adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
            >
              Open
              <ExternalLink className="h-3 w-3" />
            </a>
          </Row>
        </dl>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href={`/center/agents?tab=diagnostics&client=${client.id}`}>Diagnostics bundles</Link>
        </Button>
      </div>

      {clientCommands.length > 0 ? (
        <div className="rounded-lg border bg-card p-4 lg:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <ListTodo className="h-4 w-4 text-violet-600" />
            Recent commands
          </h2>
          <div className="space-y-2">
            {clientCommands.map((cmd) => (
              <div
                key={cmd.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2"
              >
                <div>
                  <p className="font-mono text-xs">{centerAgentCommandTypeLabels[cmd.type]}</p>
                  <p className="text-[10px] text-muted-foreground">{cmd.payloadSummary}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn("capitalize text-[10px]", centerAgentCommandStatusColors[cmd.status])}
                >
                  {cmd.status}
                </Badge>
              </div>
            ))}
          </div>
          <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
            <Link href={`/center/agents?tab=commands&client=${client.id}`}>View all commands</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SubscriptionTab({ client }: { client: CenterClient }) {
  const [subscription, setSubscription] = useState<CenterClientSubscription | null>(null);
  const [license, setLicense] = useState<CenterLicense | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [subs, lics, clients] = await Promise.all([
          fetchSubscriptions(client.id),
          fetchLicenses(client.id),
          fetchClients(),
        ]);
        if (!cancelled) {
          const mappedSubs = apiSubscriptionsToCenterSubscriptions(subs, clients);
          const mappedLics = apiLicensesToCenterLicenses(lics, clients);
          setSubscription(mappedSubs[0] ?? null);
          setLicense(mappedLics[0] ?? null);
        }
      } catch {
        if (!cancelled) {
          setSubscription(null);
          setLicense(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [client.id]);

  if (loading) {
    return (
      <p className="py-8 text-sm text-muted-foreground">Loading subscription & license…</p>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <CreditCard className="h-4 w-4 text-violet-600" />
          Subscription
        </h2>
        <dl className="space-y-2 text-sm">
          <Row label="Plan" value={formatCenterPlan(subscription?.plan ?? client.plan)} />
          <Row label="Status" value={subscription?.status ?? client.status} capitalize />
          <Row label="Billing cycle" value={subscription?.billingCycle ?? "—"} capitalize />
          <Row label="Seats" value={subscription ? `0/${subscription.seatsLimit}` : "—"} />
          <Row label="Period ends" value={subscription?.periodEnd ?? client.subscriptionEnds} />
          <Row label="Registered" value={client.registeredAt} />
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/center/subscriptions">Manage plans</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/center/billing">Billing history</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <KeyRound className="h-4 w-4 text-violet-600" />
          License
        </h2>
        <dl className="space-y-2 text-sm">
          <Row label="License state" value={license?.status ?? (client.status === "suspended" ? "Revoked" : "Active")} capitalize />
          <Row label="License key" value={license?.licenseKeyMasked ?? "—"} mono />
          <Row label="Expires" value={license?.expiresAt ?? "—"} />
          <Row label="Grace ends" value={license?.graceEndsAt ?? "—"} />
          <Row label="Modules licensed" value={`${client.modules.length} modules`} />
          <Row label="AI entitlement" value={(license?.aiEnabled ?? client.aiEnabled) ? "Included" : "Not included"} />
        </dl>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href="/center/licenses">License center</Link>
        </Button>
      </div>

      <LifecycleActions status={client.status} className="lg:col-span-2" />
    </div>
  );
}

function LifecycleActions({
  status,
  className,
}: {
  status: CenterClient["status"];
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <h2 className="mb-3 text-sm font-medium">Lifecycle actions</h2>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={status === "suspended"}>
          <PauseCircle className="mr-1.5 h-3.5 w-3.5" />
          Suspend client
        </Button>
        <Button variant="outline" size="sm" disabled={status !== "trial"}>
          <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
          Extend trial
        </Button>
        <Button variant="outline" size="sm" disabled>
          Reissue license
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        High-risk actions require MFA in production (UI Step 13).
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-semibold capitalize">{value}</p>
      {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("text-sm font-medium", mono && "font-mono text-xs", capitalize && "capitalize")}>
        {value}
      </dd>
    </div>
  );
}

function Row({
  label,
  value,
  children,
  mono,
  capitalize,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right", mono && "font-mono text-xs", capitalize && "capitalize")}>
        {children ?? value}
      </dd>
    </div>
  );
}
