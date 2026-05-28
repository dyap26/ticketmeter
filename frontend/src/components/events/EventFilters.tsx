import { useState } from "react";
import { MapPin, SlidersHorizontal } from "lucide-react";
import { useLocationStore } from "@/store/locationStore";

interface Props {
  category: string;
  onCategoryChange: (c: string) => void;
}

const CATEGORIES = [
  { value: "", label: "All Events" },
  { value: "sport", label: "Sports" },
  { value: "concert", label: "Concerts" },
];
const RADII = [25, 50, 100, 200];

const chipBase: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  fontSize: "0.72rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "5px 14px",
  borderRadius: 3,
  border: "1px solid rgba(255,255,255,0.1)",
  cursor: "pointer",
  background: "transparent",
  color: "var(--c-muted)",
  transition: "all 0.12s",
};

const chipActive: React.CSSProperties = {
  background: "var(--c-lime)",
  color: "#000",
  border: "1px solid var(--c-lime)",
};

export function EventFilters({ category, onCategoryChange }: Props) {
  const { city, radiusMiles, setLocation, setRadius } = useLocationStore();
  const [cityInput, setCityInput] = useState(city);
  const [open, setOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(useLocationStore.getState().lat, useLocationStore.getState().lon, cityInput);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => onCategoryChange(c.value)}
            style={{ ...chipBase, ...(category === c.value ? chipActive : {}) }}
          >
            {c.label}
          </button>
        ))}
        <button
          onClick={() => setOpen(!open)}
          style={{
            ...chipBase,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            ...(open ? { color: "var(--c-lime)", borderColor: "rgba(184,255,0,0.3)" } : {}),
          }}
        >
          <SlidersHorizontal style={{ width: 11, height: 11 }} />
          Filters
        </button>
      </div>

      {open && (
        <div style={{ background: "var(--c-surf)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Location input */}
          <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <MapPin style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "var(--c-muted)" }} />
              <input
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                placeholder="Enter city..."
                style={{
                  width: "100%",
                  background: "var(--c-surf2)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 4,
                  padding: "7px 10px 7px 30px",
                  fontFamily: "'Barlow', sans-serif",
                  fontSize: "0.83rem",
                  color: "var(--c-text)",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                ...chipBase,
                padding: "7px 14px",
                borderColor: "rgba(255,255,255,0.12)",
                color: "var(--c-text)",
              }}
            >
              Set
            </button>
          </form>

          {/* Radius */}
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: 8 }}>
              Search Radius
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {RADII.map(r => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  style={{ ...chipBase, ...(radiusMiles === r ? chipActive : {}) }}
                >
                  {r} mi
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
