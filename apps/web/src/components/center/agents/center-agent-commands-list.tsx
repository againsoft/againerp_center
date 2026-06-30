"use client";

import { CenterEmptyState } from "@/components/center/center-empty-state";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CenterAgentCommandDetailSheet } from "@/components/center/agents/center-agent-command-detail-sheet";
import { CenterAgentCommandsGrid } from "@/components/center/agents/center-agent-commands-grid";
import {
  CenterAgentCommandsToolbar,
  type CenterAgentCommandFilters,
} from "@/components/center/agents/center-agent-commands-toolbar";
import { Button } from "@/components/ui/button";
import {
  centerAgentCommands,
  filterCenterAgentCommands,
  getCenterAgentCommand,
  type CenterAgentCommand,
} from "@/lib/mock-data/center";

const defaultFilters: CenterAgentCommandFilters = {
  search: "",
  status: "all",
  risk: "all",
  type: "all",
};

export function CenterAgentCommandsList() {
  const searchParams = useSearchParams();
  const commandParam = searchParams.get("command");
  const clientParam = searchParams.get("client");

  const [filters, setFilters] = useState<CenterAgentCommandFilters>(defaultFilters);
  const [selected, setSelected] = useState<CenterAgentCommand | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const base = filterCenterAgentCommands(centerAgentCommands, filters);
    if (!clientParam) return base;
    return base.filter((c) => c.clientId === clientParam);
  }, [filters, clientParam]);

  useEffect(() => {
    if (!commandParam) return;
    const cmd = getCenterAgentCommand(commandParam);
    if (cmd) {
      setSelected(cmd);
      setSheetOpen(true);
    }
  }, [commandParam]);

  function openCommand(cmd: CenterAgentCommand) {
    setSelected(cmd);
    setSheetOpen(true);
  }

  return (
    <>
      <CenterAgentCommandsToolbar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        totalCount={centerAgentCommands.length}
      />

      {filtered.length === 0 ? (
        <CenterEmptyState
          title="No commands match your filters"
          action={
            <Button variant="outline" size="sm" onClick={() => setFilters(defaultFilters)}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <CenterAgentCommandsGrid commands={filtered} onView={openCommand} />
      )}

      <CenterAgentCommandDetailSheet
        command={selected}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
