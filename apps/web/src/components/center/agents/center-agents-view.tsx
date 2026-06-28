"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CenterActivationBundlesList } from "@/components/center/agents/center-activation-bundles-list";
import { CenterAgentCommandsList } from "@/components/center/agents/center-agent-commands-list";
import { CenterAgentDiagnosticsList } from "@/components/center/agents/center-agent-diagnostics-list";
import { CenterAgentSyncQueuesList } from "@/components/center/agents/center-agent-sync-queues-list";
import { cn } from "@/lib/utils";

const views = [
  { key: "commands" as const, label: "Command queue" },
  { key: "activations" as const, label: "Activation bundles" },
  { key: "sync" as const, label: "Offline sync queues" },
  { key: "diagnostics" as const, label: "Diagnostics" },
];

type AgentView = (typeof views)[number]["key"];

const bannerCopy: Record<AgentView, string> = {
  commands:
    "Commands are JWS-signed envelopes delivered on the next agent heartbeat. Agents verify signatures, reject expired or duplicate command IDs, and report results on subsequent heartbeats.",
  activations:
    "Activation bundles provide one-time bootstrap tokens and CSR templates for new Edge Agent install. Tokens expire in 24 hours and are single-use.",
  sync: "When agents lose connectivity, updates, AI proxy requests, and commands queue locally. License grace keeps ERP running until grace expires — then read-only mode.",
  diagnostics:
    "Diagnostics bundles are collected by the agent on operator request — redacted docker logs and config only. No remote shell; download requires MFA in production.",
};

function isAgentView(value: string | null): value is AgentView {
  return views.some((v) => v.key === value);
}

export function CenterAgentsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [view, setView] = useState<AgentView>(
    isAgentView(tabParam) ? tabParam : "commands",
  );

  useEffect(() => {
    if (isAgentView(tabParam)) setView(tabParam);
  }, [tabParam]);

  function selectView(next: AgentView) {
    setView(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`/center/agents?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-violet-200 bg-violet-50/50 px-4 py-3 text-xs text-muted-foreground dark:border-violet-900 dark:bg-violet-950/20">
        {bannerCopy[view]}
      </div>

      <div className="flex flex-wrap gap-1 border-b pb-1">
        {views.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => selectView(v.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              view === v.key
                ? "bg-violet-100 font-medium text-violet-900 dark:bg-violet-950 dark:text-violet-100"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "commands" ? <CenterAgentCommandsList /> : null}
      {view === "activations" ? <CenterActivationBundlesList /> : null}
      {view === "sync" ? <CenterAgentSyncQueuesList /> : null}
      {view === "diagnostics" ? <CenterAgentDiagnosticsList /> : null}
    </div>
  );
}
