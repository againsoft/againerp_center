"use client";

import Link from "next/link";
import { Activity, Database, Download, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  centerAgentStatusLabel,
  centerDbStatusColors,
  getCenterAgentMetricSeries,
  type CenterAgentHeartbeat,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";
import { CenterMonitoringMetricsChart } from "@/components/center/monitoring/center-monitoring-metrics-chart";

type Props = {
  heartbeat: CenterAgentHeartbeat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function MetricRow({
  label,
  value,
  percent,
  warn = 80,
  critical = 90,
}: {
  label: string;
  value: string;
  percent?: number;
  warn?: number;
  critical?: number;
}) {
  const tone =
    percent == null
      ? ""
      : percent >= critical
        ? "bg-red-500"
        : percent >= warn
          ? "bg-amber-500"
          : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      {percent != null && percent > 0 ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className={cn("h-full rounded-full", tone)} style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
      ) : null}
    </div>
  );
}

export function CenterMonitoringDetailSheet({ heartbeat: hb, open, onOpenChange }: Props) {
  if (!hb) return null;

  const offline = hb.agentStatus === "offline";
  const metricSeries = getCenterAgentMetricSeries(hb.clientId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Edge Agent telemetry</p>
          <h2 className="text-lg font-semibold">{hb.businessName}</h2>
          <p className="font-mono text-xs text-muted-foreground">{hb.instanceId}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerDbStatusColors[hb.agentStatus])}
            >
              Agent {centerAgentStatusLabel[hb.agentStatus]}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {hb.deploymentMode}
            </Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
              <Server className="h-3.5 w-3.5" />
              Agent identity
            </h3>
            <dl className="space-y-2 text-sm">
              <Row label="Server host" value={hb.serverHost} />
              <Row label="Last heartbeat" value={hb.lastHeartbeat} />
              <Row label="Agent version" value={hb.agentVersion} mono />
              <Row label="ERP version" value={hb.erpVersion} mono />
            </dl>
            <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0 text-violet-600">
              <Link href={`/center/clients/${hb.clientId}?tab=agent`}>Open client agent tab</Link>
            </Button>
          </div>

          {offline ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm dark:border-red-900 dark:bg-red-950/20">
              Agent offline — no recent heartbeat. Metrics unavailable until agent reconnects.
            </div>
          ) : (
            <>
              <div className="rounded-lg border p-4">
                <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
                  <Activity className="h-3.5 w-3.5" />
                  Infrastructure (agent-reported)
                </h3>
                <div className="space-y-3">
                  <MetricRow label="CPU" value={`${hb.cpuPercent}%`} percent={hb.cpuPercent} />
                  <MetricRow label="RAM" value={`${hb.ramPercent}%`} percent={hb.ramPercent} />
                  <MetricRow
                    label="Disk"
                    value={`${hb.diskPercent}%`}
                    percent={hb.diskPercent}
                    warn={70}
                  />
                  <MetricRow label="API latency p95" value={`${hb.apiLatencyP95Ms} ms`} />
                </div>
              </div>

              <CenterMonitoringMetricsChart
                series={metricSeries}
                title="24-hour trend"
                subtitle="CPU and RAM from hourly heartbeat samples"
                height={180}
              />

              <div className="rounded-lg border p-4">
                <h3 className="mb-3 flex items-center gap-1.5 text-sm font-medium">
                  <Database className="h-3.5 w-3.5" />
                  Services (agent-reported)
                </h3>
                <dl className="space-y-2 text-sm">
                  <Row
                    label="Docker containers"
                    value={`${hb.dockerHealthy}/${hb.dockerTotal} healthy`}
                  />
                  <Row label="Database reachable" value={hb.dbReachable ? "Yes" : "No"} />
                  <Row label="DB round-trip" value={`${hb.dbLatencyMs} ms`} />
                  <Row label="Redis reachable" value={hb.redisReachable ? "Yes" : "No"} />
                  <Row label="Queue pending jobs" value={String(hb.queuePendingJobs)} />
                </dl>
              </div>
            </>
          )}

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Metrics arrive via Edge Agent heartbeat — Control Center never queries client PostgreSQL
            directly. DB reachability is reported by the agent on the client host.
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t p-4">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/center/agents?tab=diagnostics&client=${hb.clientId}`}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Request diagnostics
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("text-right font-medium", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}
