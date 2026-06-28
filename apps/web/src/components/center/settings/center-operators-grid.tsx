"use client";

import { Eye, ShieldCheck } from "lucide-react";
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
  centerOperatorRoleLabels,
  centerOperatorStatusColors,
  type CenterOperator,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  operators: CenterOperator[];
  onView: (operator: CenterOperator) => void;
};

export function CenterOperatorsGrid({ operators, onView }: Props) {
  return (
    <>
      <div className="hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operator</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>MFA</TableHead>
              <TableHead>Last login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators.map((op) => (
              <TableRow key={op.id}>
                <TableCell>
                  <p className="font-medium">{op.name}</p>
                  <p className="text-xs text-muted-foreground">{op.email}</p>
                </TableCell>
                <TableCell className="text-sm">{centerOperatorRoleLabels[op.role]}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn("capitalize", centerOperatorStatusColors[op.status])}
                  >
                    {op.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {op.mfaEnabled ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {op.mfaType ?? "enabled"}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-700 dark:text-amber-300">Pending setup</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{op.lastLogin ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="h-8" onClick={() => onView(op)}>
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
        {operators.map((op) => (
          <div key={op.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{op.name}</p>
                <p className="text-xs text-muted-foreground">{centerOperatorRoleLabels[op.role]}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn("capitalize shrink-0", centerOperatorStatusColors[op.status])}
              >
                {op.status}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => onView(op)}>
              View operator
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
