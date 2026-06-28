"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiNotificationsToCenter,
  computeNotificationStats,
} from "@/lib/adapters/center-notification-adapter";
import { fetchNotifications } from "@/lib/api/notifications";
import type { CenterPlatformNotification } from "@/lib/mock-data/center";
import { useCenterNotificationStore } from "@/lib/store/center-notification-store";

type NotificationsContextValue = {
  notifications: CenterPlatformNotification[];
  stats: { total: number; unread: number; critical: number };
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const readIds = useCenterNotificationStore((s) => s.readIds);
  const [notifications, setNotifications] = useState<CenterPlatformNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchNotifications();
      setNotifications(apiNotificationsToCenter(rows));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(
    () => computeNotificationStats(notifications, readIds),
    [notifications, readIds],
  );

  const value = useMemo(
    () => ({ notifications, stats, loading, error, refresh: load }),
    [notifications, stats, loading, error, load],
  );

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  );
}

export function useNotificationsData() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotificationsData must be used within NotificationsProvider");
  }
  return ctx;
}
