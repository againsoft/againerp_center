"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CenterEmptyState } from "@/components/center/center-empty-state";
import { fetchServers, type ApiServer } from "@/lib/api/servers";
import { cn } from "@/lib/utils";

function formatHeartbeat(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const healthColors: Record<string, string> = {
  healthy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  degraded: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  unknown: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

type Props = {
  clientId?: string;
};

export function CenterAgentFleetList({ clientId }: Props) {
  const [servers, setServers] = useState<ApiServer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setServers(await fetchServers(clientId));
    } catch {
      setServers([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const onlineCount = useMemo(() => servers.filter((s) => s.is_online).length, [servers]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading fleet agents…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {onlineCount} of {servers.length} agent{servers.length !== 1 ? "s" : ""} online
        (heartbeat within 5 min) · auto-refreshes every 30s
      </p>

      {servers.length === 0 ? (
        <CenterEmptyState
          title="No agents registered yet"
          description="Start the Edge Agent on a client server with the token from client creation. Heartbeats appear here automatically."
        />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Instance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Last heartbeat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/center/clients/${s.client_id}?tab=agent`}
                      className="font-medium hover:text-violet-700 dark:hover:text-violet-300"
                    >
                      {s.client_name ?? s.client_id}
                    </Link>
                    {s.hostname ? (
                      <p className="text-[10px] text-muted-foreground">{s.hostname}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.instance_id}</TableCell>
                  <TableCell>
                    <Badge variant={s.is_online ? "default" : "secondary"} className="text-[10px]">
                      {s.is_online ? "Online" : "Offline"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("capitalize text-[10px]", healthColors[s.health_status] ?? healthColors.unknown)}
                    >
                      {s.health_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{s.agent_version ?? "—"}</TableCell>
                  <TableCell className="text-xs tabular-nums">{formatHeartbeat(s.last_heartbeat_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export function useAgentFleetStats() {
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0 });

  useEffect(() => {
    void (async () => {
      try {
        const servers = await fetchServers();
        const online = servers.filter((s) => s.is_online).length;
        setStats({ total: servers.length, online, offline: servers.length - online });
      } catch {
        setStats({ total: 0, online: 0, offline: 0 });
      }
    })();
  }, []);

  return stats;
}
