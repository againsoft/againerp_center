"use client";

import type { CenterAgentConnectivity, CenterAgentQueueType } from "@/lib/mock-data/center";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CenterAgentSyncQueueFilters = {
  search: string;
  connectivity: CenterAgentConnectivity | "all";
  queueType: CenterAgentQueueType | "all";
  clientId?: string;
};

type Props = {
  filters: CenterAgentSyncQueueFilters;
  onChange: (filters: CenterAgentSyncQueueFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterAgentSyncQueuesToolbar({
  filters,
  onChange,
  resultCount,
  totalCount,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="min-w-[180px] flex-1">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Search
        </label>
        <Input
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Client, queue type, summary…"
          className="h-9"
        />
      </div>
      <div className="w-full sm:w-36">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Connectivity
        </label>
        <Select
          value={filters.connectivity}
          onValueChange={(value) =>
            onChange({ ...filters, connectivity: value as CenterAgentSyncQueueFilters["connectivity"] })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="degraded">Degraded</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-36">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Queue type
        </label>
        <Select
          value={filters.queueType}
          onValueChange={(value) =>
            onChange({ ...filters, queueType: value as CenterAgentSyncQueueFilters["queueType"] })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="ai_request">AI proxy</SelectItem>
            <SelectItem value="command">Command</SelectItem>
            <SelectItem value="config">Config sync</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="pb-1 text-xs text-muted-foreground sm:ml-auto">
        {resultCount} of {totalCount} queues
        {filters.clientId ? ` · client ${filters.clientId}` : ""}
      </p>
    </div>
  );
}
