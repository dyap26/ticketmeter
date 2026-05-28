import { useEffect } from "react";
import { useLocationStore } from "@/store/locationStore";

export function useGeolocation() {
  const setLocation = useLocationStore((s) => s.setLocation);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // keep default
      },
      { timeout: 5000 }
    );
  }, [setLocation]);
}
