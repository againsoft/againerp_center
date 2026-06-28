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
import type { CenterBackupStatus, CenterBackupStorageTarget } from "@/lib/mock-data/center";

export type CenterBackupFilters = {
  search: string;
  status: CenterBackupStatus | "all";
  storage: CenterBackupStorageTarget | "all";
};

type Props = {
  filters: CenterBackupFilters;
  onChange: (filters: CenterBackupFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterBackupsToolbar({ filters, onChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-9 pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(status) =>
            onChange({ ...filters, status: status as CenterBackupFilters["status"] })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.storage}
          onValueChange={(storage) =>
            onChange({ ...filters, storage: storage as CenterBackupFilters["storage"] })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Storage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All storage</SelectItem>
            <SelectItem value="local">Client local</SelectItem>
            <SelectItem value="client_s3">Client S3</SelectItem>
            <SelectItem value="platform_assisted">Platform assisted</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
