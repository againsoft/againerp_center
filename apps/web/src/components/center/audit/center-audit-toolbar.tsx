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
import type { CenterAuditActorType, CenterAuditResourceType } from "@/lib/mock-data/center";

export type CenterAuditFilters = {
  search: string;
  actorType: CenterAuditActorType | "all";
  resourceType: CenterAuditResourceType | "all";
};

type Props = {
  filters: CenterAuditFilters;
  onChange: (filters: CenterAuditFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterAuditToolbar({ filters, onChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search action, actor, client…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-9 pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.actorType}
          onValueChange={(actorType) =>
            onChange({ ...filters, actorType: actorType as CenterAuditFilters["actorType"] })
          }
        >
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue placeholder="Actor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actors</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.resourceType}
          onValueChange={(resourceType) =>
            onChange({ ...filters, resourceType: resourceType as CenterAuditFilters["resourceType"] })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All resources</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="registration">Registration</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="license">License</SelectItem>
            <SelectItem value="module">Module</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="backup">Backup</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="ai">AI</SelectItem>
            <SelectItem value="security">Security</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
