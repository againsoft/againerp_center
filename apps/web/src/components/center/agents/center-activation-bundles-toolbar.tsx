"use client";

import type { CenterActivationBundleStatus } from "@/lib/mock-data/center";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export type CenterActivationBundleFilters = {
  search: string;
  status: CenterActivationBundleStatus | "all";
};

type Props = {
  filters: CenterActivationBundleFilters;
  onChange: (filters: CenterActivationBundleFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterActivationBundlesToolbar({
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
          placeholder="Client, token prefix…"
          className="h-9"
        />
      </div>
      <div className="w-full sm:w-40">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Status
        </label>
        <Select
          value={filters.status}
          onValueChange={(value) =>
            onChange({ ...filters, status: value as CenterActivationBundleFilters["status"] })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="activated">Activated</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" disabled className="sm:mb-0">
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Generate bundle
      </Button>
      <p className="pb-1 text-xs text-muted-foreground sm:ml-auto">
        {resultCount} of {totalCount} bundles
      </p>
    </div>
  );
}
