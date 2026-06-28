"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  centerActivationBundleStatusColors,
  type CenterActivationBundle,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  bundles: CenterActivationBundle[];
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CenterActivationBundlesGrid({ bundles }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Token prefix</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created by</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundles.map((bundle) => (
              <TableRow key={bundle.id}>
                <TableCell>
                  <Link
                    href={`/center/clients/${bundle.clientId}`}
                    className="text-sm hover:text-violet-700 dark:hover:text-violet-300"
                  >
                    {bundle.businessName}
                  </Link>
                  <p className="font-mono text-[10px] text-muted-foreground">{bundle.id}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{bundle.bootstrapTokenPrefix}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize text-[10px]",
                      centerActivationBundleStatusColors[bundle.status],
                    )}
                  >
                    {bundle.status}
                  </Badge>
                  {bundle.activatedAt ? (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      Activated {formatTime(bundle.activatedAt)}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell className="text-xs tabular-nums">{formatTime(bundle.createdAt)}</TableCell>
                <TableCell className="text-xs tabular-nums">{formatTime(bundle.expiresAt)}</TableCell>
                <TableCell className="max-w-[140px] truncate text-xs">{bundle.createdBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-2 md:hidden">
        {bundles.map((bundle) => (
          <div key={bundle.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{bundle.businessName}</p>
                <p className="font-mono text-xs text-muted-foreground">{bundle.bootstrapTokenPrefix}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "capitalize text-[10px]",
                  centerActivationBundleStatusColors[bundle.status],
                )}
              >
                {bundle.status}
              </Badge>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Expires {formatTime(bundle.expiresAt)} · by {bundle.createdBy}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
