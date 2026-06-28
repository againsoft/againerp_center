"use client";

import { useCallback, useEffect, useState } from "react";
import { apiKeysToCenter } from "@/lib/adapters/center-api-key-adapter";
import { createApiKey, fetchApiKeys, revokeApiKey } from "@/lib/api/api-keys";
import type { CenterApiKey } from "@/lib/mock-data/center";

export function useApiKeysData() {
  const [keys, setKeys] = useState<CenterApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApiKeys();
      setKeys(apiKeysToCenter(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load API keys");
      setKeys([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revoke = useCallback(
    async (keyId: string) => {
      await revokeApiKey(keyId);
      await load();
    },
    [load],
  );

  const create = useCallback(
    async (body: {
      name: string;
      owner_type?: string;
      owner_label: string;
      scopes?: string[];
    }) => {
      const result = await createApiKey(body);
      await load();
      return result.secret;
    },
    [load],
  );

  return { keys, loading, error, refresh: load, revoke, create };
}
