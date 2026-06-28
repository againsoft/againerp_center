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
import type { CenterAiCreditStatus } from "@/lib/mock-data/center";

export type CenterAiAccessFilters = {
  search: string;
  aiEnabled: "all" | "yes" | "no";
  creditStatus: CenterAiCreditStatus | "all";
};

type Props = {
  filters: CenterAiAccessFilters;
  onChange: (filters: CenterAiAccessFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterAiAccessToolbar({ filters, onChange, resultCount, totalCount }: Props) {
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
          value={filters.aiEnabled}
          onValueChange={(aiEnabled) =>
            onChange({ ...filters, aiEnabled: aiEnabled as CenterAiAccessFilters["aiEnabled"] })
          }
        >
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder="AI access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All clients</SelectItem>
            <SelectItem value="yes">AI enabled</SelectItem>
            <SelectItem value="no">AI disabled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.creditStatus}
          onValueChange={(creditStatus) =>
            onChange({ ...filters, creditStatus: creditStatus as CenterAiAccessFilters["creditStatus"] })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Credits" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All credit states</SelectItem>
            <SelectItem value="ok">OK</SelectItem>
            <SelectItem value="warning">Near limit</SelectItem>
            <SelectItem value="exceeded">Exceeded</SelectItem>
            <SelectItem value="none">No AI credits</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
