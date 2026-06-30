"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { centerPlatformNotifications } from "@/lib/mock-data/center";

type CenterNotificationStore = {
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  isRead: (id: string) => boolean;
  unreadCount: () => number;
};

export const useCenterNotificationStore = create<CenterNotificationStore>()(
  persist(
    (set, get) => ({
      readIds: [],

      markRead: (id) =>
        set((state) => ({
          readIds: state.readIds.includes(id) ? state.readIds : [...state.readIds, id],
        })),

      markAllRead: () =>
        set({ readIds: centerPlatformNotifications.map((notification) => notification.id) }),

      isRead: (id) => get().readIds.includes(id),

      unreadCount: () =>
        centerPlatformNotifications.filter((notification) => !get().readIds.includes(notification.id))
          .length,
    }),
    { name: "center-platform-notifications" },
  ),
);
