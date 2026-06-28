"use client";

import type {
  CenterDashboardAlertSeverity,
  CenterNotificationCategory,
} from "@/lib/mock-data/center";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type CenterNotificationFilters = {
  search: string;
  category: CenterNotificationCategory | "all";
  severity: CenterDashboardAlertSeverity | "all";
  unreadOnly: boolean;
};

type Props = {
  filters: CenterNotificationFilters;
  onChange: (filters: CenterNotificationFilters) => void;
  resultCount: number;
  totalCount: number;
};

export function CenterNotificationsToolbar({
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
          placeholder="Title, body, category…"
          className="h-9"
        />
      </div>
      <div className="w-full sm:w-36">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Category
        </label>
        <Select
          value={filters.category}
          onValueChange={(value) =>
            onChange({ ...filters, category: value as CenterNotificationFilters["category"] })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="registration">Registration</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-32">
        <label className="mb-1 block text-[10px] font-medium uppercase text-muted-foreground">
          Severity
        </label>
        <Select
          value={filters.severity}
          onValueChange={(value) =>
            onChange({ ...filters, severity: value as CenterNotificationFilters["severity"] })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2 pb-1">
        <Switch
          id="unread-only"
          checked={filters.unreadOnly}
          onCheckedChange={(unreadOnly) => onChange({ ...filters, unreadOnly })}
        />
        <Label htmlFor="unread-only" className="text-xs">
          Unread only
        </Label>
      </div>
      <p className="pb-1 text-xs text-muted-foreground sm:ml-auto">
        {resultCount} of {totalCount} notifications
      </p>
    </div>
  );
}
