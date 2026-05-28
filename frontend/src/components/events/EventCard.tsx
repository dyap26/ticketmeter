import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import type { EventSummary } from "@/api/events";
import { formatPrice, timeUntil, magnitudeLabel } from "@/utils/formatters";
import { format, parseISO } from "date-fns";

interface Props { event: EventSummary }

const MAG_COLORS: Record<string, string> = {
  preseason: "rgba(255,255,255,0.12)",
  regular:   "rgba(100,130,255,0.15)",
  postseason:"rgba(255,170,0,0.18)",
  championship:"rgba(255,215,0,0.22)",
};
const MAG_TEXT: Record<string, string> = {
  preseason: "#6b7280",
  regular:   "#818cf8",
  postseason:"#ffaa00",
  championship:"#ffd700",
};

function scoreColor(s: number) {
  if (s < 30) return "var(--c-red)";
  if (s < 65) return "var(--c-amber)";
  return "var(--c-lime)";
}
function scoreLabel(s: number) {
  if (s < 30) return "BUY NOW";
  if (s < 65) return "NEUTRAL";
  return "WAIT";
}
function scoreBorderColor(s: number) {
  if (s < 30) return "var(--c-red)";
  if (s < 65) return "var(--c-amber)";
  return "var(--c-lime)";
}

export function EventCard({ event }: Props) {
  const color = event.buy_score != null ? scoreColor(event.buy_score) : "var(--c-mid)";
  const borderColor = event.buy_score != null ? scoreBorderColor(event.buy_score) : "transparent";

  const dateStr = format(parseISO(event.event_datetime), "MMM d").toUpperCase();
  const dayStr  = format(parseISO(event.event_datetime), "EEE").toUpperCase();

  return (
    <Link to={`/events/${event.id}`} className="group block" style={{ textDecoration: "none" }}>
      <article
        className="relative overflow-hidden transition-all duration-200 group-hover:-translate-y-0.5"
        style={{
          background: "var(--c-surf)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 6,
          boxShadow: `inset 3px 0 0 ${borderColor}`,
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 138 }}>
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: "var(--c-surf2)" }}>
              🎫
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,8,16,0.92) 0%, rgba(7,8,16,0.3) 55%, transparent 100%)" }} />

          {/* Magnitude badge — bottom left */}
          <span
            className="absolute bottom-2 left-2 font-display badge-magnitude"
            style={{
              background: MAG_COLORS[event.magnitude] || "rgba(255,255,255,0.1)",
              color: MAG_TEXT[event.magnitude] || "var(--c-mid)",
              backdropFilter: "blur(6px)",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              padding: "2px 7px",
              borderRadius: 3,
            }}
          >
            {magnitudeLabel(event.magnitude).toUpperCase()}
          </span>

          {/* Score pill — top right */}
          {event.buy_score != null && (
            <div
              className="absolute top-2 right-2 flex flex-col items-center"
              style={{
                background: "rgba(7,8,16,0.82)",
                border: `1px solid ${color}`,
                borderRadius: 4,
                padding: "3px 8px",
                backdropFilter: "blur(8px)",
                minWidth: 42,
              }}
            >
              <span
                className="font-data leading-none"
                style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: "1.25rem", color, lineHeight: 1 }}
              >
                {event.buy_score}
              </span>
              <span
                className="font-display"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.52rem", letterSpacing: "0.08em", color, lineHeight: 1.2, textTransform: "uppercase" }}
              >
                {scoreLabel(event.buy_score)}
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="px-3 pt-2 pb-3 space-y-1.5">
          <h3
            className="font-display leading-tight line-clamp-2 group-hover:text-lime transition-colors"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "1.05rem", letterSpacing: "0.01em", color: "var(--c-text)" }}
          >
            {event.title.toUpperCase()}
          </h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              {/* Date */}
              <div className="font-data text-muted-arena" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "var(--c-muted)" }}>
                {dayStr} {dateStr} · {timeUntil(event.event_datetime)}
              </div>
              {/* Venue */}
              {event.venue_name && (
                <div className="flex items-center gap-1" style={{ color: "var(--c-mid)", fontSize: "0.72rem" }}>
                  {event.distance_miles != null && (
                    <>
                      <MapPin className="h-2.5 w-2.5 shrink-0" />
                      <span className="font-data" style={{ fontFamily: "'DM Mono', monospace" }}>{event.distance_miles}mi</span>
                      <span className="opacity-40">·</span>
                    </>
                  )}
                  <span className="truncate">{event.venue_name}</span>
                </div>
              )}
            </div>

            {/* Price */}
            {event.min_price != null && (
              <div className="text-right shrink-0">
                <div className="font-data text-arena font-medium" style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.9rem", color: "var(--c-text)" }}>
                  {formatPrice(event.min_price)}
                </div>
                <div style={{ fontSize: "0.6rem", color: "var(--c-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>min</div>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
