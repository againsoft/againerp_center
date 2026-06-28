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
import type { CenterClientUpdateStatus, CenterUpdateChannel } from "@/lib/mock-data/center";

export type CenterFleetUpdateFilters = {
  search: string;
  status: CenterClientUpdateStatus | "all";
  channel: CenterUpdateChannel | "all";
};

type Props = {
  filters: CenterFleetUpdateFilters;
  onChange: (filters: CenterFleetUpdateFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterFleetUpdatesToolbar({ filters, onChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients or versions…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-9 pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(status) =>
            onChange({ ...filters, status: status as CenterFleetUpdateFilters["status"] })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="up_to_date">Up to date</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="applying">Applying</SelectItem>
            <SelectItem value="validating">Validating</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="rolling_back">Rolling back</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.channel}
          onValueChange={(channel) =>
            onChange({ ...filters, channel: channel as CenterFleetUpdateFilters["channel"] })
          }
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            <SelectItem value="stable">Stable</SelectItem>
            <SelectItem value="beta">Beta</SelectItem>
            <SelectItem value="lts">LTS</SelectItem>
            <SelectItem value="hotfix">Hotfix</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
