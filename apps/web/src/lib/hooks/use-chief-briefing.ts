"use client";

import { useCallback, useEffect, useState } from "react";
import { apiBriefingToCenter } from "@/lib/adapters/center-briefing-adapter";
import { fetchChiefBriefing } from "@/lib/api/ai";
import type { CenterChiefAiBriefing } from "@/lib/mock-data/center";

export function useChiefBriefing() {
  const [briefing, setBriefing] = useState<CenterChiefAiBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const row = await fetchChiefBriefing();
      setBriefing(apiBriefingToCenter(row));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load Chief AI briefing");
      setBriefing(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { briefing, loading, error, refresh: load };
}
