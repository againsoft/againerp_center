import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Registration submitted", detail: "Self-service or sales intake" },
  { id: 2, label: "Operator review", detail: "Approve plan, modules, deployment" },
  { id: 3, label: "Client record created", detail: "client_id + subscription pending" },
  { id: 4, label: "Activation bundle issued", detail: "Bootstrap token + install guide" },
  { id: 5, label: "Edge Agent activated", detail: "First heartbeat confirms go-live" },
];

type Props = {
  /** 1–5 — how far onboarding progressed */
  activeStep: number;
  className?: string;
};

export function CenterOnboardingSteps({ activeStep, className }: Props) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <h3 className="mb-3 text-sm font-medium">Onboarding pipeline</h3>
      <ol className="space-y-3">
        {steps.map((step) => {
          const done = step.id < activeStep;
          const current = step.id === activeStep;
          const Icon = done ? CheckCircle2 : current ? Loader2 : Circle;
          return (
            <li key={step.id} className="flex gap-3">
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  done && "text-emerald-600",
                  current && "animate-spin text-violet-600",
                  !done && !current && "text-muted-foreground",
                )}
              />
              <div>
                <p
                  className={cn(
                    "text-sm",
                    current && "font-medium text-violet-700 dark:text-violet-300",
                    done && "text-foreground",
                    !done && !current && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
