"use client";

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
  centerApiKeyStatusColors,
  type CenterApiKey,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  keys: CenterApiKey[];
  onView: (key: CenterApiKey) => void;
};

export function CenterApiKeysGrid({ keys, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key prefix</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Scopes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell className="font-mono text-xs">{key.keyPrefix}…</TableCell>
                <TableCell>
                  <p className="text-sm">{key.ownerLabel}</p>
                  <p className="text-[10px] capitalize text-muted-foreground">{key.ownerType}</p>
                </TableCell>
                <TableCell>
                  <div className="flex max-w-[180px] flex-wrap gap-1">
                    {key.scopes.slice(0, 2).map((scope) => (
                      <Badge key={scope} variant="secondary" className="text-[10px]">
                        {scope}
                      </Badge>
                    ))}
                    {key.scopes.length > 2 ? (
                      <Badge variant="outline" className="text-[10px]">
                        +{key.scopes.length - 2}
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", centerApiKeyStatusColors[key.status])}
                  >
                    {key.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{key.lastUsedAt ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(key)}>
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
        {keys.map((key) => (
          <div key={key.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{key.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{key.keyPrefix}…</p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize shrink-0", centerApiKeyStatusColors[key.status])}
              >
                {key.status}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(key)}>
              View key
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
