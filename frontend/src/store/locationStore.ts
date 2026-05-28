import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LocationState {
  lat: number;
  lon: number;
  city: string;
  radiusMiles: number;
  setLocation: (lat: number, lon: number, city?: string) => void;
  setRadius: (r: number) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      lat: 34.05,
      lon: -118.24,
      city: "Los Angeles, CA",
      radiusMiles: 50,
      setLocation: (lat, lon, city = "") => set({ lat, lon, city }),
      setRadius: (radiusMiles) => set({ radiusMiles }),
    }),
    { name: "tm-location" }
  )
);
