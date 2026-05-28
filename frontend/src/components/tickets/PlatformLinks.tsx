import { ArrowUpRight } from "lucide-react";
import type { BuyLink } from "@/api/events";
import { formatPrice } from "@/utils/formatters";

interface Props { links: BuyLink[] }

const PLATFORM_ACCENT: Record<string, string> = {
  seatgeek:    "#00d4ff",
  ticketmaster:"#026cdf",
  gametime:    "#a855f7",
};

export function PlatformLinks({ links }: Props) {
  if (!links.length) return null;

  return (
    <div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-mid)", marginBottom: 8 }}>
        Buy Tickets
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {links.map((link, i) => {
          const accent = PLATFORM_ACCENT[link.platform] || "#888";
          const isBest = i === 0;
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: isBest ? "rgba(184,255,0,0.05)" : "var(--c-surf)",
                border: `1px solid ${isBest ? "rgba(184,255,0,0.2)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 4,
                textDecoration: "none",
                transition: "border-color 0.12s",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = accent + "55")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = isBest ? "rgba(184,255,0,0.2)" : "rgba(255,255,255,0.07)")}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {/* Platform color dot */}
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: accent, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.03em", color: "var(--c-text)" }}>
                    {link.display_name}
                  </div>
                  {isBest && (
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-lime)" }}>
                      Cheapest
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: "0.95rem", color: isBest ? "var(--c-lime)" : "var(--c-text)" }}>
                  {formatPrice(link.min_price)}
                </span>
                <ArrowUpRight style={{ width: 14, height: 14, color: "var(--c-muted)" }} />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
