"use client";

import { Bot, Shield, Users, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { centerModules, centerPlans } from "@/lib/mock-data/center";
import { formatCurrency } from "@/lib/utils";

export function CenterPlanCatalog() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {centerPlans.map((plan) => (
        <div
          key={plan.id}
          className="flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">{plan.label}</h2>
              <p className="text-xs text-muted-foreground">{plan.description}</p>
            </div>
            {plan.id === "enterprise" ? (
              <Badge className="shrink-0 bg-violet-600 hover:bg-violet-600">Popular</Badge>
            ) : null}
          </div>

          <p className="text-2xl font-bold">
            {plan.priceMonthly > 0 ? formatCurrency(plan.priceMonthly) : "Custom"}
            {plan.priceMonthly > 0 ? (
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            ) : null}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {plan.maxUsers} seats
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              {plan.graceDays}d grace
            </span>
            <span className="flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" />
              {plan.aiIncluded ? `${plan.aiAgentsLimit} agents` : "No AI"}
            </span>
            {plan.aiCreditsMonthly > 0 ? (
              <span className="flex items-center gap-1">
                <Zap className="h-3.5 w-3.5" />
                {(plan.aiCreditsMonthly / 1000).toFixed(0)}k credits
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex-1">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Included modules</p>
            <div className="flex flex-wrap gap-1">
              {plan.includedModules.map((modId) => {
                const mod = centerModules.find((m) => m.id === modId);
                return (
                  <Badge key={modId} variant="secondary" className="text-[10px]">
                    {mod?.label ?? modId}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
