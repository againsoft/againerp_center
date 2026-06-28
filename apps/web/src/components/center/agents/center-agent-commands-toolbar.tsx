"use client";

import type {
  CenterAgentCommandRisk,
  CenterAgentCommandStatus,
  CenterAgentCommandType,
} from "@/lib/mock-data/center";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CenterAgentCommandFilters = {
  search: string;
  status: CenterAgentCommandStatus | "all";
  risk: CenterAgentCommandRisk | "all";
  type: CenterAgentCommandType | "all";
};

type Props = {
  filters: CenterAgentCommandFilters;
  onChange: (filters: CenterAgentCommandFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterAgentCommandsToolbar({ filters, onChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[180px] flex-1">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Search
        </label>
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Client, command type, issuer…"
          className="h-9"
        />
      </div>
      <div className="w-full sm:w-36">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Status
        </label>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ ...filters, status: value as CenterAgentCommandFilters["status"] })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="succeeded">Succeeded</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-32">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Risk
        </label>
        <Select
          value={filters.risk}
          onValueChange={(value) =>
            onChange({ ...filters, risk: value as CenterAgentCommandFilters["risk"] })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-44">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Type
        </label>
        <Select
          value={filters.type}
          onValueChange={(value) =>
            onChange({ ...filters, type: value as CenterAgentCommandFilters["type"] })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="update.apply">Update apply</SelectItem>
            <SelectItem value="backup.run">Backup run</SelectItem>
            <SelectItem value="module.enable">Module enable</SelectItem>
            <SelectItem value="config.reload">Config reload</SelectItem>
            <SelectItem value="agent.restart">Agent restart</SelectItem>
            <SelectItem value="diagnostics.collect">Diagnostics</SelectItem>
            <SelectItem value="container.restart">Container restart</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="pb-1 text-xs text-muted-foreground sm:ml-auto">
        {resultCount} of {totalCount} commands
      </p>
    </div>
  );
}
