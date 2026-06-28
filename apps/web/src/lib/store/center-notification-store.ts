"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CenterNotificationStore = {
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids?: string[]) => void;
  isRead: (id: string) => boolean;
};

export const useCenterNotificationStore = create<CenterNotificationStore>()(
  persist(
    (set, get) => ({
      readIds: [],

      markRead: (id) =>
        set((state) => ({
          readIds: state.readIds.includes(id) ? state.readIds : [...state.readIds, id],
        })),

      markAllRead: (ids) =>
        set((state) => ({
          readIds: ids ? [...new Set([...state.readIds, ...ids])] : state.readIds,
        })),

      isRead: (id) => get().readIds.includes(id),
    }),
    { name: "center-platform-notifications" },
  ),
);
