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
import type { CenterOperatorRole, CenterOperatorStatus } from "@/lib/mock-data/center";

export type CenterOperatorFilters = {
  search: string;
  role: CenterOperatorRole | "all";
  status: CenterOperatorStatus | "all";
};

type Props = {
  filters: CenterOperatorFilters;
  onChange: (filters: CenterOperatorFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterOperatorsToolbar({ filters, onChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search operators…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-9 pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.role}
          onValueChange={(role) => onChange({ ...filters, role: role as CenterOperatorFilters["role"] })}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="platform_admin">Platform Admin</SelectItem>
            <SelectItem value="support_agent">Support Agent</SelectItem>
            <SelectItem value="billing_admin">Billing Admin</SelectItem>
            <SelectItem value="read_only">Read Only</SelectItem>
            <SelectItem value="partner_admin">Partner Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(status) =>
            onChange({ ...filters, status: status as CenterOperatorFilters["status"] })
          }
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="invited">Invited</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
