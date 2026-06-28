"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  centerLicenseStatusColors,
  formatCenterPlan,
  type CenterLicense,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  licenses: CenterLicense[];
  onView: (license: CenterLicense) => void;
};

export function CenterLicensesGrid({ licenses, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>License key</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Grace</TableHead>
              <TableHead>Agent sync</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {licenses.map((lic) => (
              <TableRow key={lic.id}>
                <TableCell>
                  <Link
                    href={`/center/clients/${lic.clientId}?tab=subscription`}
                    className="font-medium hover:text-violet-700"
                  >
                    {lic.businessName}
                  </Link>
                  <p className="font-mono text-[10px] text-muted-foreground">{lic.instanceId}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{lic.licenseKeyMasked}</TableCell>
                <TableCell>{formatCenterPlan(lic.plan)}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", centerLicenseStatusColors[lic.status])}
                  >
                    {lic.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{lic.expiresAt}</TableCell>
                <TableCell className="text-sm">
                  {lic.graceEndsAt ? lic.graceEndsAt : `${lic.graceDays}d`}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{lic.lastSyncedAt}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(lic)}>
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {licenses.map((lic) => (
          <div key={lic.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{lic.businessName}</p>
                <p className="font-mono text-xs text-muted-foreground">{lic.licenseKeyMasked}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize", centerLicenseStatusColors[lic.status])}
              >
                {lic.status}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Expires {lic.expiresAt} · sync {lic.lastSyncedAt}
            </p>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(lic)}>
              View license
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}