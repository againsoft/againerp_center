"use client";

import { Eye, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  centerClients,
  getCenterModule,
  type CenterModuleDefinition,
} from "@/lib/mock-data/center";

type Props = {
  modules: CenterModuleDefinition[];
  clientCounts: Record<string, number>;
  onView: (mod: CenterModuleDefinition) => void;
};

export function CenterModulesGrid({ modules, clientCounts, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Dependencies</TableHead>
              <TableHead>Clients</TableHead>
              <TableHead>Min ERP</TableHead>
              <TableHead>Platform default</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modules.map((mod) => (
              <TableRow key={mod.id}>
                <TableCell>
                  <p className="font-medium">{mod.label}</p>
                  <p className="max-w-xs truncate text-xs text-muted-foreground">{mod.description}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {mod.tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  {mod.dependencies.length === 0 ? (
                    <span className="text-xs text-muted-foreground">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {mod.dependencies.map((depId) => {
                        const dep = getCenterModule(depId);
                        return (
                          <Badge key={depId} variant="secondary" className="text-[10px]">
                            {dep?.label ?? depId}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {clientCounts[mod.id] ?? 0}
                  <span className="text-muted-foreground"> / {centerClients.length}</span>
                </TableCell>
                <TableCell className="font-mono text-xs">{mod.minErpVersion}</TableCell>
                <TableCell>
                  <Switch checked={mod.platformDefault} disabled aria-label={`${mod.label} default`} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(mod)}>
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
        {modules.map((mod) => (
          <div key={mod.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{mod.label}</p>
                <p className="text-xs text-muted-foreground">{mod.description}</p>
              </div>
              <Badge variant="outline" className="capitalize shrink-0">
                {mod.tier}
              </Badge>
            </div>
            {mod.dependencies.length > 0 ? (
              <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                <GitBranch className="h-3 w-3" />
                Requires {mod.dependencies.length} module{mod.dependencies.length > 1 ? "s" : ""}
              </p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">
              {clientCounts[mod.id] ?? 0}/{centerClients.length} clients · ERP {mod.minErpVersion}
            </p>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(mod)}>
              View module
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
