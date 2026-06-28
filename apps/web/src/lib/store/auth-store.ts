"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Operator = {
  id: string;
  email: string;
  username: string;
  role: string;
  full_name: string | null;
};

type AuthState = {
  token: string | null;
  operator: Operator | null;
  setAuth: (token: string, operator: Operator) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      operator: null,
      setAuth: (token, operator) => {
        localStorage.setItem("center_token", token);
        set({ token, operator });
      },
      clearAuth: () => {
        localStorage.removeItem("center_token");
        set({ token: null, operator: null });
      },
    }),
    { name: "center_auth" },
  ),
);
