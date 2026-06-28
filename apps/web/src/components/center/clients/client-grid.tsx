"use client";

import Link from "next/link";
import { Activity, ExternalLink, LogIn, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  centerClients,
  centerDbStatusColors,
  centerStatusColors,
  formatCenterPlan,
  type CenterClient,
} from "@/lib/mock-data/center";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  clients?: CenterClient[];
  className?: string;
};

export function CenterClientGrid({ clients = centerClients, className }: Props) {
  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Modules</TableHead>
            <TableHead>AI</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Heartbeat</TableHead>
            <TableHead className="text-right">MRR</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <Link
                  href={`/center/clients/${client.id}`}
                  className="font-medium hover:text-violet-700 dark:hover:text-violet-300"
                >
                  {client.businessName}
                </Link>
                <p className="text-xs text-muted-foreground">{client.contactEmail}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{client.slug}</p>
              </TableCell>
              <TableCell>
                <span className="text-sm">{formatCenterPlan(client.plan)}</span>
                <p className="text-[10px] capitalize text-muted-foreground">
                  {client.deploymentMode}
                </p>
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn("capitalize", centerStatusColors[client.status])}
                >
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">{client.modules.length}</span>
                <span className="text-xs text-muted-foreground"> enabled</span>
              </TableCell>
              <TableCell>
                {client.aiEnabled ? (
                  <Badge className="bg-violet-600 hover:bg-violet-600">On</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">Off</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn("capitalize", centerDbStatusColors[client.dbStatus])}
                >
                  {centerAgentStatusLabel[client.dbStatus]}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{client.lastHeartbeat}</TableCell>
              <TableCell className="text-right">
                {client.mrr > 0 ? formatCurrency(client.mrr) : "—"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/center/clients/${client.id}`}>View details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/center/monitoring?client=${client.id}`}>
                        <Activity className="mr-2 h-3.5 w-3.5" />
                        Agent health
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href={client.adminUrl} target="_blank" rel="noopener noreferrer">
                        <LogIn className="mr-2 h-3.5 w-3.5" />
                        Open client admin
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CenterClientMobileCards({ clients = centerClients }: Props) {
  return (
    <div className="space-y-2 md:hidden">
      {clients.map((client) => (
        <div key={client.id} className="rounded-lg border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={`/center/clients/${client.id}`}
                className="font-medium hover:text-violet-700"
              >
                {client.businessName}
              </Link>
              <p className="text-xs text-muted-foreground">{client.contactEmail}</p>
            </div>
            <Badge
              variant="secondary"
              className={cn("capitalize", centerStatusColors[client.status])}
            >
              {client.status}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{formatCenterPlan(client.plan)}</span>
            <span>·</span>
            <span>{client.modules.length} modules</span>
            <span>·</span>
            <span className="capitalize">agent {centerAgentStatusLabel[client.dbStatus]}</span>
          </div>
          <div className="mt-2 flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/center/clients/${client.id}`}>Details</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <a href={client.adminUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3 w-3" />
                Admin
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
