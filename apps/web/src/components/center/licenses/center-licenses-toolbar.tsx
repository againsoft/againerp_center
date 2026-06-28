"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  centerLicenses as defaultLicenses,
  type CenterLicense,
  type CenterLicenseStatus,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

export type CenterLicenseFilters = {
  search: string;
  status: CenterLicenseStatus | "all";
};

type Props = {
  filters: CenterLicenseFilters;
  onChange: (next: CenterLicenseFilters) => void;
  resultCount: number;
  licenses?: CenterLicense[];
};

const tabs: { key: CenterLicenseStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "grace", label: "Grace" },
  { key: "revoked", label: "Revoked" },
  { key: "expired", label: "Expired" },
];

function countStatus(licenses: CenterLicense[], status: CenterLicenseStatus | "all") {
  if (status === "all") return licenses.length;
  return licenses.filter((l) => l.status === status).length;
}

export function CenterLicensesToolbar({
  filters,
  onChange,
  resultCount,
  licenses = defaultLicenses,
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
            placeholder="Search client, key prefix, instance…"
            className="h-9 pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{resultCount}</strong> of{" "}
          {licenses.length} licenses
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
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
            <span className="ml-1 opacity-70">({countStatus(licenses, tab.key)})</span>
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
