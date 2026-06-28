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
import type { CenterModuleDefinition } from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

export type CenterModuleFilters = {
  search: string;
  tier: CenterModuleDefinition["tier"] | "all";
  platformDefault: "all" | "yes" | "no";
};

type Props = {
  filters: CenterModuleFilters;
  onChange: (filters: CenterModuleFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterModulesToolbar({ filters, onChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search modules…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-9 pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.tier}
          onValueChange={(tier) =>
            onChange({ ...filters, tier: tier as CenterModuleFilters["tier"] })
          }
        >
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder="Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="growth">Growth</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.platformDefault}
          onValueChange={(platformDefault) =>
            onChange({ ...filters, platformDefault: platformDefault as CenterModuleFilters["platformDefault"] })
          }
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All modules</SelectItem>
            <SelectItem value="yes">Platform default</SelectItem>
            <SelectItem value="no">Optional add-on</SelectItem>
          </SelectContent>
        </Select>

        <span className={cn("text-xs text-muted-foreground")}>
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
