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
import type { CenterApiKeyOwnerType, CenterApiKeyStatus } from "@/lib/mock-data/center";

export type CenterApiKeyFilters = {
  search: string;
  status: CenterApiKeyStatus | "all";
  ownerType: CenterApiKeyOwnerType | "all";
};

type Props = {
  filters: CenterApiKeyFilters;
  onChange: (filters: CenterApiKeyFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterApiKeysToolbar({ filters, onChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search keys…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-9 pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(status) =>
            onChange({ ...filters, status: status as CenterApiKeyFilters["status"] })
          }
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.ownerType}
          onValueChange={(ownerType) =>
            onChange({ ...filters, ownerType: ownerType as CenterApiKeyFilters["ownerType"] })
          }
        >
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="integration">Integration</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
