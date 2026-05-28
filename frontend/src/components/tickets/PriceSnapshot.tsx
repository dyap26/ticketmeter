import { formatPrice } from "@/utils/formatters";

interface Props { minPrice: number | null; avgPrice: number | null }

export function PriceSnapshot({ minPrice, avgPrice }: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {[
        { label: "Cheapest", value: minPrice, color: "#b8ff00" },
        { label: "Average",  value: avgPrice, color: "#818cf8" },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            background: "var(--c-surf)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 4,
            padding: "12px 14px",
          }}
        >
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: "1.55rem", color, lineHeight: 1 }}>
            {formatPrice(value)}
          </div>
        </div>
      ))}
    </div>
  );
}
