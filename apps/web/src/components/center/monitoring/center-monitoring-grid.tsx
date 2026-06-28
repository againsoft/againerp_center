"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  centerAgentStatusLabel,
  centerDbStatusColors,
  type CenterAgentHeartbeat,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  heartbeats: CenterAgentHeartbeat[];
  onView: (heartbeat: CenterAgentHeartbeat) => void;
};

function MetricBar({ value, warn = 80, critical = 90 }: { value: number; warn?: number; critical?: number }) {
  const tone =
    value >= critical ? "bg-red-500" : value >= warn ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="text-xs tabular-nums">{value}%</span>
    </div>
  );
}

export function CenterMonitoringGrid({ heartbeats, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Last heartbeat</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>RAM</TableHead>
              <TableHead>Disk</TableHead>
              <TableHead>API p95</TableHead>
              <TableHead>Docker</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {heartbeats.map((hb) => (
              <TableRow key={hb.clientId}>
                <TableCell>
                  <Link
                    href={`/center/clients/${hb.clientId}?tab=agent`}
                    className="font-medium hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {hb.businessName}
                  </Link>
                  <p className="font-mono text-[10px] text-muted-foreground">{hb.instanceId}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", centerDbStatusColors[hb.agentStatus])}
                  >
                    {centerAgentStatusLabel[hb.agentStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{hb.lastHeartbeat}</TableCell>
                <TableCell>
                  {hb.agentStatus === "offline" ? "—" : <MetricBar value={hb.cpuPercent} />}
                </TableCell>
                <TableCell>
                  {hb.agentStatus === "offline" ? "—" : <MetricBar value={hb.ramPercent} />}
                </TableCell>
                <TableCell>
                  {hb.agentStatus === "offline" ? "—" : <MetricBar value={hb.diskPercent} warn={70} />}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {hb.agentStatus === "offline" ? "—" : `${hb.apiLatencyP95Ms}ms`}
                </TableCell>
                <TableCell className="text-sm">
                  {hb.agentStatus === "offline"
                    ? "—"
                    : `${hb.dockerHealthy}/${hb.dockerTotal}`}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(hb)}>
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    Metrics
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {heartbeats.map((hb) => (
          <div key={hb.clientId} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{hb.businessName}</p>
                <p className="text-xs text-muted-foreground">{hb.lastHeartbeat}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize shrink-0", centerDbStatusColors[hb.agentStatus])}
              >
                {centerAgentStatusLabel[hb.agentStatus]}
              </Badge>
            </div>
            {hb.agentStatus !== "offline" ? (
              <p className="mt-2 text-xs text-muted-foreground">
                CPU {hb.cpuPercent}% · RAM {hb.ramPercent}% · p95 {hb.apiLatencyP95Ms}ms
              </p>
            ) : null}
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(hb)}>
              View metrics
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
