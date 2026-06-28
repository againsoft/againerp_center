"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  centerRegistrations as defaultRegistrations,
  type CenterRegistrationStatus,
  type CenterRegistration,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

export type CenterRegistrationFilters = {
  search: string;
  status: CenterRegistrationStatus | "all";
};

type Props = {
  filters: CenterRegistrationFilters;
  onChange: (next: CenterRegistrationFilters) => void;
  resultCount: number;
  registrations?: CenterRegistration[];
};

const statusTabs: { key: CenterRegistrationStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending_review", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function countByStatus(
  registrations: CenterRegistration[],
  status: CenterRegistrationStatus | "all",
) {
  if (status === "all") return registrations.length;
  return registrations.filter((r) => r.status === status).length;
}

export function CenterRegistrationsToolbar({
  filters,
  onChange,
  resultCount,
  registrations = defaultRegistrations,
}: Props) {
  const hasFilters = filters.search || filters.status !== "all";

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search business, contact, industry…"
            className="h-9 pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{resultCount}</strong> of{" "}
          {registrations.length} registrations
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1">
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
            <span className="ml-1 opacity-70">({countByStatus(registrations, tab.key)})</span>
          </button>
        ))}
        {hasFilters ? (
          <button
            type="button"
            onClick={() => onChange({ search: "", status: "all" })}
            className="ml-2 inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
