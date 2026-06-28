"use client";

import type { CenterDiagnosticStatus } from "@/lib/mock-data/center";
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

export type CenterAgentDiagnosticFilters = {
  search: string;
  status: CenterDiagnosticStatus | "all";
  clientId?: string;
};

type Props = {
  filters: CenterAgentDiagnosticFilters;
  onChange: (filters: CenterAgentDiagnosticFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterAgentDiagnosticsToolbar({
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
          placeholder="Client, bundle prefix, requester…"
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
            onChange({ ...filters, status: value as CenterAgentDiagnosticFilters["status"] })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="collecting">Collecting</SelectItem>
            <SelectItem value="uploading">Uploading</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button size="sm" disabled>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Request bundle
      </Button>
      <p className="pb-1 text-xs text-muted-foreground sm:ml-auto">
        {resultCount} of {totalCount} bundles
        {filters.clientId ? ` · client ${filters.clientId}` : ""}
      </p>
    </div>
  );
}
