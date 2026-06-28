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
  centerRegistrationStatusColors,
  formatCenterPlan,
  type CenterRegistration,
} from "@/lib/mock-data/center";
import { cn } from "@/lib/utils";

type Props = {
  registrations: CenterRegistration[];
  onReview: (registration: CenterRegistration) => void;
};

export function CenterRegistrationsGrid({ registrations, onReview }: Props) {
  return (
    <div className="hidden rounded-lg border bg-card md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Business</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Deploy</TableHead>
            <TableHead>Modules</TableHead>
            <TableHead>AI</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((reg) => (
            <TableRow key={reg.id}>
              <TableCell>
                <button
                  type="button"
                  onClick={() => onReview(reg)}
                  className="text-left font-medium hover:text-violet-700 dark:hover:text-violet-300"
                >
                  {reg.businessName}
                </button>
                <p className="text-xs text-muted-foreground">
                  {new Date(reg.submittedAt).toLocaleDateString()}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{reg.contactName}</p>
                <p className="text-xs text-muted-foreground">{reg.contactEmail}</p>
              </TableCell>
              <TableCell className="text-sm">{reg.industry}</TableCell>
              <TableCell>{formatCenterPlan(reg.requestedPlan)}</TableCell>
              <TableCell className="capitalize text-sm">{reg.deploymentMode}</TableCell>
              <TableCell>{reg.requestedModules.length}</TableCell>
              <TableCell>{reg.wantsAi ? "Yes" : "No"}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn("capitalize", centerRegistrationStatusColors[reg.status])}
                >
                  {reg.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {reg.status === "pending_review" ? (
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" className="h-8" onClick={() => onReview(reg)}>
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      Review
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => onReview(reg)}>
                    View
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CenterRegistrationsMobileCards({ registrations, onReview }: Props) {
  return (
    <div className="space-y-2 md:hidden">
      {registrations.map((reg) => (
        <div key={reg.id} className="rounded-lg border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium">{reg.businessName}</p>
              <p className="text-xs text-muted-foreground">{reg.contactEmail}</p>
            </div>
            <Badge
              variant="secondary"
              className={cn("capitalize", centerRegistrationStatusColors[reg.status])}
            >
              {reg.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{formatCenterPlan(reg.requestedPlan)}</span>
            <span>·</span>
            <span className="capitalize">{reg.deploymentMode}</span>
            <span>·</span>
            <span>{reg.requestedModules.length} modules</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => onReview(reg)}
          >
            {reg.status === "pending_review" ? (
              <>
                <Eye className="mr-1 h-3 w-3" />
                Review
              </>
            ) : (
              <>
                <Eye className="mr-1 h-3 w-3" />
                View
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
