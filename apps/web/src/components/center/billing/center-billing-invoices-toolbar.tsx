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
import type { CenterInvoiceStatus } from "@/lib/mock-data/center";

export type CenterBillingInvoiceFilters = {
  search: string;
  status: CenterInvoiceStatus | "all";
};

type Props = {
  filters: CenterBillingInvoiceFilters;
  onChange: (filters: CenterBillingInvoiceFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterBillingInvoicesToolbar({ filters, onChange, resultCount, totalCount }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search invoices…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-9 pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.status}
          onValueChange={(status) =>
            onChange({ ...filters, status: status as CenterBillingInvoiceFilters["status"] })
          }
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="past_due">Past due</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="uncollectible">Uncollectible</SelectItem>
            <SelectItem value="void">Void</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {resultCount} of {totalCount}
        </span>
      </div>
    </div>
  );
}
