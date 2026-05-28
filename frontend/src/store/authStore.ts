import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/api/auth";

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      isAuthenticated: () => get().user !== null,
    }),
    { name: "tm-auth" }
  )
);
