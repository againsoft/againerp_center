"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  centerClients,
  type CenterClientStatus,
  type CenterDbStatus,
  type CenterPlan,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

export type CenterClientFilters = {
  search: string;
  status: CenterClientStatus | "all";
  plan: CenterPlan | "all";
  agent: CenterDbStatus | "all";
};

type Props = {
  filters: CenterClientFilters;
  onChange: (next: CenterClientFilters) => void;
  resultCount: number;
};

const statusTabs: { key: CenterClientStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "trial", label: "Trial" },
  { key: "suspended", label: "Suspended" },
];

function countByStatus(status: CenterClientStatus | "all") {
  if (status === "all") return centerClients.length;
  return centerClients.filter((c) => c.status === status).length;
}

export function CenterClientsToolbar({ filters, onChange, resultCount }: Props) {
  const hasFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.plan !== "all" ||
    filters.agent !== "all";

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search business, contact, or slug…"
            className="h-9 pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{resultCount}</strong> of{" "}
          {centerClients.length} clients
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange({ ...filters, status: tab.key })}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              filters.status === tab.key
                ? "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {tab.label}
            <span className="ml-1 opacity-70">({countByStatus(tab.key)})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.plan}
          onChange={(e) =>
            onChange({ ...filters, plan: e.target.value as CenterPlan | "all" })
          }
          className="h-8 rounded-md border bg-background px-2 text-xs"
        >
          <option value="all">All plans</option>
          <option value="starter">Starter</option>
          <option value="business">Business</option>
          <option value="enterprise">Enterprise</option>
          <option value="custom">Custom</option>
        </select>
        <select
          value={filters.agent}
          onChange={(e) =>
            onChange({ ...filters, agent: e.target.value as CenterDbStatus | "all" })
          }
          className="h-8 rounded-md border bg-background px-2 text-xs"
        >
          <option value="all">All agent status</option>
          <option value="connected">Agent online</option>
          <option value="degraded">Agent degraded</option>
          <option value="offline">Agent offline</option>
        </select>
        {hasFilters ? (
          <button
            type="button"
            onClick={() =>
              onChange({ search: "", status: "all", plan: "all", agent: "all" })
            }
            className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
