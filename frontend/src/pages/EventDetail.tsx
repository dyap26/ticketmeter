import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Bookmark, BookmarkCheck, Calendar, MapPin, ExternalLink } from "lucide-react";
import { eventsApi, type EventDetail as EventDetailType } from "@/api/events";
import { usersApi } from "@/api/users";
import { useEventPrices } from "@/hooks/useEventPrices";
import { BuyMeter } from "@/components/tickets/BuyMeter";
import { PriceGraph } from "@/components/tickets/PriceGraph";
import { PlatformLinks } from "@/components/tickets/PlatformLinks";
import { PriceSnapshot } from "@/components/tickets/PriceSnapshot";
import { useAuthStore } from "@/store/authStore";
import { formatDate, magnitudeLabel, timeUntil } from "@/utils/formatters";

const MAG_TEXT: Record<string, string> = {
  preseason: "#6b7280",
  regular:   "#818cf8",
  postseason:"#ffaa00",
  championship:"#ffd700",
};
const MAG_BG: Record<string, string> = {
  preseason: "rgba(107,114,128,0.15)",
  regular:   "rgba(129,140,248,0.15)",
  postseason:"rgba(255,170,0,0.15)",
  championship:"rgba(255,215,0,0.18)",
};

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "var(--c-surf)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 6, padding: "16px 18px", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function Loader() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 96px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[200, 80, 80, 300].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 6, background: "var(--c-surf)", border: "1px solid rgba(255,255,255,0.07)" }} />
        ))}
      </div>
    </div>
  );
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventDetailType | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const { user } = useAuthStore();
  const { history, prediction, buyLinks, news, loading } = useEventPrices(id!);

  useEffect(() => {
    eventsApi.get(id!).then(r => setEvent(r.data)).catch(() => {}).finally(() => setEventLoading(false));
  }, [id]);

  const toggleSave = async () => {
    if (!user) return;
    if (saved) { await usersApi.untrackEvent(id!).catch(() => {}); setSaved(false); }
    else { await usersApi.trackEvent(id!).catch(() => {}); setSaved(true); }
  };

  if (eventLoading) return <Loader />;
  if (!event) return (
    <div style={{ textAlign: "center", padding: "80px 16px" }}>
      <p style={{ color: "var(--c-muted)", marginBottom: 16 }}>Event not found.</p>
      <Link to="/" style={{ color: "var(--c-lime)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.8rem" }}>
        ← Back
      </Link>
    </div>
  );

  const magColor = MAG_TEXT[event.magnitude] || "var(--c-mid)";
  const magBg    = MAG_BG[event.magnitude]   || "rgba(255,255,255,0.06)";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 96px" }}>
      {/* Back + Save */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--c-muted)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}>
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back
        </Link>
        <button onClick={toggleSave} style={{ background: "none", border: "none", cursor: "pointer", color: saved ? "var(--c-lime)" : "var(--c-muted)", display: "flex", alignItems: "center", gap: 5 }}>
          {saved ? <BookmarkCheck style={{ width: 18, height: 18 }} /> : <Bookmark style={{ width: 18, height: 18 }} />}
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {saved ? "Saved" : "Save"}
          </span>
        </button>
      </div>

      {/* Hero */}
      <div style={{ position: "relative", height: 220, borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
        {event.image_url && (
          <img src={event.image_url} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,8,16,0.97) 0%, rgba(7,8,16,0.5) 55%, rgba(7,8,16,0.2) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px" }}>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 3, background: magBg, color: magColor }}>
              {magnitudeLabel(event.magnitude).toUpperCase()}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(1.4rem, 4vw, 2.1rem)", letterSpacing: "0.02em", textTransform: "uppercase", color: "#fff", lineHeight: 1.05, maxWidth: 560 }}>
            {event.title}
          </h1>
        </div>
      </div>

      {/* Meta */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "var(--c-mid)" }}>
          <Calendar style={{ width: 12, height: 12 }} />
          <span>{formatDate(event.event_datetime)}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ color: "var(--c-muted)" }}>{timeUntil(event.event_datetime)}</span>
        </div>
        {event.venue_name && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'Barlow', sans-serif", fontSize: "0.78rem", color: "var(--c-mid)" }}>
            <MapPin style={{ width: 12, height: 12 }} />
            {event.venue_name}{event.venue_city ? `, ${event.venue_city}` : ""}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Price snapshot */}
        <PriceSnapshot minPrice={event.min_price} avgPrice={event.avg_price} />

        {/* Buy Meter */}
        {loading ? (
          <div style={{ height: 220, borderRadius: 6, background: "var(--c-surf)", border: "1px solid rgba(255,255,255,0.07)" }} />
        ) : prediction ? (
          <BuyMeter prediction={prediction} />
        ) : null}

        {/* Price Graph */}
        <Section>
          {loading || !history ? (
            <div style={{ height: 200, background: "var(--c-surf2)", borderRadius: 4 }} />
          ) : (
            <PriceGraph data={history} bestWindowStart={prediction?.best_window_start} bestWindowEnd={prediction?.best_window_end} />
          )}
        </Section>

        {/* Buy links */}
        {!loading && <Section><PlatformLinks links={buyLinks} /></Section>}

        {/* News */}
        {news.length > 0 && (
          <Section>
            <SectionLabel>Related News</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {news.map((a, i) => (
                <a
                  key={i}
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    background: "var(--c-surf2)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 4,
                    textDecoration: "none",
                    transition: "border-color 0.12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(184,255,0,0.2)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: "0.83rem", color: "var(--c-text)", lineHeight: 1.35, marginBottom: 4 }}>
                      {a.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {a.source && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "var(--c-muted)" }}>{a.source}</span>}
                      {a.sentiment_score != null && (
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.06em", color: a.sentiment_score > 0.3 ? "var(--c-lime)" : a.sentiment_score < -0.2 ? "var(--c-red)" : "var(--c-muted)", textTransform: "uppercase" }}>
                          {a.sentiment_score > 0.3 ? "↑ Positive" : a.sentiment_score < -0.2 ? "↓ Negative" : "Neutral"}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink style={{ width: 13, height: 13, color: "var(--c-muted)", flexShrink: 0, marginTop: 2 }} />
                </a>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
