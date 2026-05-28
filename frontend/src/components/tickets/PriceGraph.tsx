import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { PriceHistoryResponse } from "@/api/events";
import { formatDateShort } from "@/utils/formatters";
import { format, parseISO } from "date-fns";

interface Props {
  data: PriceHistoryResponse;
  bestWindowStart?: string | null;
  bestWindowEnd?: string | null;
}

interface ChartPoint {
  date: string;
  min?: number | null;
  avg?: number | null;
  min_est?: number;
  avg_est?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--c-surf2)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 4,
      padding: "8px 11px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      minWidth: 130,
    }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.08em", color: "var(--c-mid)", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 2, background: p.color, flexShrink: 0 }} />
          <span style={{ color: "var(--c-mid)" }}>{p.name}:</span>
          <span style={{ color: "var(--c-text)", marginLeft: "auto" }}>${Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function PriceGraph({ data, bestWindowStart, bestWindowEnd }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");

  const combined: ChartPoint[] = [
    ...data.historical.map((h) => ({ date: h.date, min: h.min, avg: h.avg })),
    ...data.predicted.map((p) => ({ date: p.date, min_est: p.min_est, avg_est: p.avg_est })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-mid)" }}>
          Price History & Forecast
        </span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {[
            { color: "#818cf8", label: "Historical" },
            { color: "#b8ff00", label: "Predicted", dashed: true },
          ].map(({ color, label, dashed }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="18" height="6">
                <line
                  x1="0" y1="3" x2="18" y2="3"
                  stroke={color} strokeWidth="2"
                  strokeDasharray={dashed ? "4 2" : "0"}
                />
              </svg>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: "0.62rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--c-muted)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={combined} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradMin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradMinEst" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#b8ff00" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#b8ff00" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.05)" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={formatDateShort}
            tick={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fill: "var(--c-muted)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `$${v}`}
            tick={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fill: "var(--c-muted)" }}
            tickLine={false}
            axisLine={false}
            width={38}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />

          {/* Today marker */}
          <ReferenceLine
            x={today}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="3 3"
            label={{ value: "NOW", position: "top", fontSize: 8, fill: "var(--c-muted)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: "0.06em" }}
          />

          {/* Best window shading */}
          {bestWindowStart && (
            <ReferenceLine x={bestWindowStart} stroke="rgba(184,255,0,0.3)" strokeDasharray="2 3" />
          )}
          {bestWindowEnd && (
            <ReferenceLine x={bestWindowEnd} stroke="rgba(184,255,0,0.3)" strokeDasharray="2 3" />
          )}

          <Area type="monotone" dataKey="min" name="Min" stroke="#818cf8" strokeWidth={2} fill="url(#gradMin)" dot={false} connectNulls />
          <Area type="monotone" dataKey="avg" name="Avg" stroke="#6366f1" strokeWidth={1.5} fill="none" dot={false} connectNulls strokeDasharray="0" strokeOpacity={0.6} />
          <Area type="monotone" dataKey="min_est" name="Est. Min" stroke="#b8ff00" strokeWidth={1.5} fill="url(#gradMinEst)" dot={false} connectNulls strokeDasharray="5 3" />
          <Area type="monotone" dataKey="avg_est" name="Est. Avg" stroke="#b8ff00" strokeWidth={1} fill="none" dot={false} connectNulls strokeDasharray="4 4" strokeOpacity={0.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
