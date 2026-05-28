import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { eventsApi, EventSummary } from "@/api/events";
import { EventCard } from "@/components/events/EventCard";
import { SearchBar } from "@/components/search/SearchBar";
import { EventFilters } from "@/components/events/EventFilters";
import { useLocationStore } from "@/store/locationStore";

function SkeletonCard() {
  return (
    <div style={{ background: "var(--c-surf)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, overflow: "hidden" }}>
      <div style={{ height: 138, background: "var(--c-surf2)" }} />
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 14, borderRadius: 2, background: "var(--c-surf2)", width: "80%" }} />
        <div style={{ height: 10, borderRadius: 2, background: "var(--c-surf2)", width: "55%" }} />
      </div>
    </div>
  );
}

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const { lat, lon, radiusMiles } = useLocationStore();

  const doSearch = (q: string) => {
    setQuery(q);
    setSearchParams(q ? { q } : {});
    if (!q && !category) { setEvents([]); return; }
    setLoading(true);
    eventsApi.list({ lat, lon, radius_miles: radiusMiles, q: q || undefined, category: category || undefined })
      .then((r) => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, []);

  useEffect(() => {
    if (query || category) doSearch(query);
  }, [category]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px 96px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: "var(--c-text)",
          lineHeight: 1,
          marginBottom: 4,
        }}>
          Search Events
        </h1>
        {query && (
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--c-muted)" }}>
            Results for <span style={{ color: "var(--c-lime)" }}>"{query}"</span>
          </p>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
        <SearchBar onSearch={doSearch} defaultValue={query} autoFocus />
        <EventFilters category={category} onCategoryChange={setCategory} />
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !query && !category ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <div style={{ marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--c-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--c-muted)" }}>
            Search for events, teams, or artists
          </p>
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "3rem", letterSpacing: "0.04em", color: "var(--c-surf2)", marginBottom: 12 }}>
            0
          </div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-muted)" }}>
            No results{query ? ` for "${query}"` : ""}
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "var(--c-muted)", marginTop: 6, opacity: 0.6 }}>
            Try a different search or broaden your radius
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "var(--c-muted)", marginBottom: 12 }}>
            {events.length} result{events.length !== 1 ? "s" : ""}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {events.map((ev) => <EventCard key={ev.id} event={ev} />)}
          </div>
        </>
      )}
    </div>
  );
}
