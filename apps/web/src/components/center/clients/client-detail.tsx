"use client";

import type { ElementType } from "react";
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
} from "@/lib/mock-data/center";
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
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Package className="h-4 w-4 text-violet-600" />
          Module entitlements
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {centerModules.map((mod) => {
            const enabled = client.modules.includes(mod.id);
            return (
              <div
                key={mod.id}
                className={cn(
                  "flex items-center justify-between rounded-md border px-3 py-2",
                  enabled
                    ? "border-violet-200 bg-violet-50/50 dark:border-violet-900 dark:bg-violet-950/20"
                    : "opacity-60",
                )}
              >
                <div>
                  <p className="text-sm font-medium">{mod.label}</p>
                  <p className="text-[10px] text-muted-foreground">{mod.tier}</p>
                </div>
                <Switch checked={enabled} disabled aria-label={`${mod.label} module`} />
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Toggles sync to Edge Agent on save (prototype — disabled).
        </p>
        <Button variant="outline" size="sm" className="mt-2" disabled>
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
  const clientCommands = getCenterAgentCommandsForClient(client.id).slice(0, 4);
  const clientQueues = getCenterAgentSyncQueuesForClient(client.id);
  const pendingQueueItems = clientQueues.reduce((sum, q) => sum + q.pendingCount, 0);

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4 text-violet-600" />
          Edge Agent
        </h2>
        <dl className="space-y-2 text-sm">
          <Row label="Agent status">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerDbStatusColors[client.dbStatus])}
            >
              {centerAgentStatusLabel[client.dbStatus]}
            </Badge>
          </Row>
          <Row label="Last heartbeat" value={client.lastHeartbeat} />
          <Row label="Agent version" value={client.agentVersion} mono />
          <Row label="ERP version" value={client.erpVersion} mono />
          <Row label="Instance ID" value={client.instanceId} mono />
          {pendingQueueItems > 0 ? (
            <Row label="Offline queue" value={`${pendingQueueItems} item(s) buffered`} />
          ) : null}
        </dl>
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
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium">
          <CreditCard className="h-4 w-4 text-violet-600" />
          Subscription
        </h2>
        <dl className="space-y-2 text-sm">
          <Row label="Plan" value={formatCenterPlan(client.plan)} />
          <Row label="Status" value={client.status} capitalize />
          <Row label="MRR" value={client.mrr > 0 ? formatCurrency(client.mrr) : "Trial / unpaid"} />
          <Row label="Period ends" value={client.subscriptionEnds} />
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
          <Row label="License state" value={client.status === "suspended" ? "Revoked" : "Active"} />
          <Row label="Grace period" value={client.status === "trial" ? "14 days" : "—"} />
          <Row label="Modules licensed" value={`${client.modules.length} modules`} />
          <Row label="AI entitlement" value={client.aiEnabled ? "Included" : "Not included"} />
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
