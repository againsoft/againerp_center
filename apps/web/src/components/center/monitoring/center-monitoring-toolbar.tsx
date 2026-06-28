"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CenterDbStatus, CenterDeploymentMode } from "@/lib/mock-data/center";

export type CenterMonitoringFilters = {
  search: string;
  agentStatus: CenterDbStatus | "all";
  deployment: CenterDeploymentMode | "all";
};

type Props = {
  filters: CenterMonitoringFilters;
  onChange: (filters: CenterMonitoringFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterMonitoringToolbar({ filters, onChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search fleet…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-9 pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.agentStatus}
          onValueChange={(agentStatus) =>
            onChange({ ...filters, agentStatus: agentStatus as CenterMonitoringFilters["agentStatus"] })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Agent status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            <SelectItem value="connected">Online</SelectItem>
            <SelectItem value="degraded">Degraded</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.deployment}
          onValueChange={(deployment) =>
            onChange({ ...filters, deployment: deployment as CenterMonitoringFilters["deployment"] })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Deployment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modes</SelectItem>
            <SelectItem value="saas">SaaS</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
