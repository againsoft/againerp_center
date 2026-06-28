"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CenterSidebarStore = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

export const useCenterSidebarStore = create<CenterSidebarStore>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    { name: "center-sidebar-collapsed" },
  ),
);
