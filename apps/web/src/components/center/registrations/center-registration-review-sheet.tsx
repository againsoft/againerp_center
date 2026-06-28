"use client";

import { Bot, Check, Package, X } from "lucide-react";
import { CenterOnboardingSteps } from "@/components/center/registrations/center-onboarding-steps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  centerModules,
  centerPlans,
  centerRegistrationStatusColors,
  formatCenterPlan,
  type CenterRegistration,
} from "@/lib/mock-data/center";
import { cn, formatCurrency } from "@/lib/utils";
import { useState } from "react";

type Props = {
  registration: CenterRegistration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, reason: string) => void;
};

export function CenterRegistrationReviewSheet({
  registration,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: Props) {
  const [rejectReason, setRejectReason] = useState("");
  const [operatorNotes, setOperatorNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!registration) return null;

  const plan = centerPlans.find((p) => p.id === registration.requestedPlan);
  const isPending = registration.status === "pending_review";
  const onboardingStep =
    registration.status === "pending_review"
      ? 2
      : registration.status === "approved"
        ? 3
        : 2;

  function handleClose() {
    setShowRejectForm(false);
    setRejectReason("");
    setOperatorNotes("");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleClose())}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <div className="border-b px-5 py-4">
          <p className="text-xs text-muted-foreground">Registration review</p>
          <h2 className="text-lg font-semibold">{registration.businessName}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={cn("capitalize", centerRegistrationStatusColors[registration.status])}
            >
              {registration.status.replace("_", " ")}
            </Badge>
            <Badge variant="outline">{registration.industry}</Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <CenterOnboardingSteps activeStep={onboardingStep} />

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Business details</h3>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <Field label="Contact" value={registration.contactName} />
              <Field label="Email" value={registration.contactEmail} />
              <Field label="Phone" value={registration.phone} />
              <Field label="Submitted" value={new Date(registration.submittedAt).toLocaleString()} />
              <Field label="Deployment" value={registration.deploymentMode} capitalize />
              <Field label="Region" value={registration.region} />
              {registration.website ? <Field label="Website" value={registration.website} /> : null}
              {registration.employeeCount ? (
                <Field label="Team size" value={registration.employeeCount} />
              ) : null}
              {registration.referralSource ? (
                <Field label="Source" value={registration.referralSource} className="sm:col-span-2" />
              ) : null}
            </dl>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 text-sm font-medium">Requested plan</h3>
            <p className="text-sm font-medium">{formatCenterPlan(registration.requestedPlan)}</p>
            {plan ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(plan.priceMonthly)}/mo · up to {plan.maxUsers} users
              </p>
            ) : null}
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-violet-600" />
              AI OS requested:{" "}
              <strong>{registration.wantsAi ? "Yes" : "No"}</strong>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Package className="h-4 w-4 text-violet-600" />
              Modules ({registration.requestedModules.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {registration.requestedModules.map((modId) => {
                const mod = centerModules.find((m) => m.id === modId);
                return (
                  <Badge key={modId} variant="secondary" className="text-[10px]">
                    {mod?.label ?? modId}
                  </Badge>
                );
              })}
            </div>
          </div>

          {registration.operatorNotes ? (
            <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 text-xs dark:border-violet-900 dark:bg-violet-950/20">
              <p className="font-medium text-violet-800 dark:text-violet-200">Intake notes</p>
              <p className="mt-1 text-muted-foreground">{registration.operatorNotes}</p>
            </div>
          ) : null}

          {registration.status === "rejected" && registration.rejectionReason ? (
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-xs dark:border-red-900 dark:bg-red-950/20">
              <p className="font-medium text-red-800 dark:text-red-200">Rejection reason</p>
              <p className="mt-1">{registration.rejectionReason}</p>
              {registration.reviewedBy ? (
                <p className="mt-2 text-muted-foreground">
                  {registration.reviewedBy} ·{" "}
                  {registration.reviewedAt
                    ? new Date(registration.reviewedAt).toLocaleString()
                    : "—"}
                </p>
              ) : null}
            </div>
          ) : null}

          {registration.status === "approved" && registration.reviewedBy ? (
            <p className="text-xs text-muted-foreground">
              Approved by {registration.reviewedBy} ·{" "}
              {registration.reviewedAt
                ? new Date(registration.reviewedAt).toLocaleString()
                : "—"}
            </p>
          ) : null}

          {isPending && !showRejectForm ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium">Operator notes (optional)</label>
              <Textarea
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                placeholder="Notes for activation team…"
                rows={3}
                className="text-sm"
              />
            </div>
          ) : null}

          {isPending && showRejectForm ? (
            <div>
              <label className="mb-1.5 block text-xs font-medium">Rejection reason</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this registration is declined…"
                rows={3}
                className="text-sm"
              />
            </div>
          ) : null}
        </div>

        {isPending ? (
          <div className="flex flex-wrap gap-2 border-t bg-background p-4">
            {!showRejectForm ? (
              <>
                <Button
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
                  onClick={() => {
                    onApprove(registration.id, operatorNotes || undefined);
                    handleClose();
                  }}
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  Approve & provision
                </Button>
                <Button variant="outline" onClick={() => setShowRejectForm(true)}>
                  <X className="mr-1.5 h-4 w-4" />
                  Reject
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={!rejectReason.trim()}
                  onClick={() => {
                    onReject(registration.id, rejectReason.trim());
                    handleClose();
                  }}
                >
                  Confirm reject
                </Button>
                <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                  Cancel
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="border-t p-4">
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  value,
  capitalize,
  className,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", capitalize && "capitalize")}>{value}</dd>
    </div>
  );
}
