import { create } from "zustand";
import type { Notification } from "@/api/users";

interface NotifState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (n: Notification[]) => void;
  markRead: (id: string) => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read_at).length,
    }),
  markRead: (id) =>
    set((s) => {
      const updated = s.notifications.map((n) =>
        n.id === id ? { ...n, read_at: new Date().toISOString() } : n
      );
      return { notifications: updated, unreadCount: updated.filter((n) => !n.read_at).length };
    }),
}));
