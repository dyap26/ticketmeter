import { useState, useEffect } from "react";
import { MapPin, RotateCcw } from "lucide-react";
import { eventsApi, type EventSummary } from "@/api/events";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { SearchBar } from "@/components/search/SearchBar";
import { useLocationStore } from "@/store/locationStore";
import { useGeolocation } from "@/hooks/useGeolocation";

function SkeletonCard() {
  return (
    <div style={{ background: "var(--c-surf)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ height: 138, background: "var(--c-surf2)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)", animation: "shimmer 1.6s infinite" }} />
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 14, borderRadius: 2, background: "var(--c-surf2)", width: "80%" }} />
        <div style={{ height: 10, borderRadius: 2, background: "var(--c-surf2)", width: "55%" }} />
      </div>
    </div>
  );
}

export function Home() {
  useGeolocation();
  const { lat, lon, radiusMiles, city } = useLocationStore();
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  const fetch = () => {
    setLoading(true);
    eventsApi.list({ lat, lon, radius_miles: radiusMiles, category: category || undefined, q: search || undefined })
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(fetch, [lat, lon, radiusMiles, category, search]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px 96px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            color: "var(--c-text)",
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          Events Near You
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "var(--c-muted)" }}>
          <MapPin style={{ width: 11, height: 11 }} />
          <span>{city || "Detecting location…"}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{radiusMiles} mi radius</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <SearchBar onSearch={setSearch} defaultValue={search} />
        <EventFilters category={category} onCategoryChange={setCategory} />
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎫</div>
          <p style={{ color: "var(--c-muted)", fontFamily: "'Barlow', sans-serif", marginBottom: 14 }}>No events found in this area.</p>
          <button
            onClick={fetch}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--c-lime)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <RotateCcw style={{ width: 13, height: 13 }} /> Retry
          </button>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "var(--c-muted)", marginBottom: 12 }}>
            {events.length} event{events.length !== 1 ? "s" : ""} found
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {events.map(ev => <EventCard key={ev.id} event={ev} />)}
          </div>
        </>
      )}
    </div>
  );
}
