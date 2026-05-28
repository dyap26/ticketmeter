import { useState } from "react";
import { usersApi } from "@/api/users";
import { useAuthStore } from "@/store/authStore";

const VAPID_PUBLIC_KEY = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const { user } = useAuthStore();
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setError("Push notifications not supported in this browser");
      return;
    }
    if (!user) {
      setError("Sign in to enable push notifications");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY ? (urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource) : undefined,
      });
      await usersApi.registerPush(JSON.stringify(sub));
      setSubscribed(true);
    } catch (e: any) {
      setError(e.message || "Failed to subscribe");
    }
  };

  return { subscribe, subscribed, error };
}
