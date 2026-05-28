import { useEffect, useState, useRef } from "react";
import type { PredictionResponse } from "@/api/events";

interface Props { prediction: PredictionResponse }

const R = 82;           // gauge radius
const STROKE = 13;      // track stroke width
const HALF_CIRC = Math.PI * R; // ≈ 257.6 — semicircle circumference

function scoreColor(s: number) {
  if (s < 30) return "#ff3535";
  if (s < 65) return "#ffaa00";
  return "#b8ff00";
}
function scoreBg(s: number) {
  if (s < 30) return "rgba(255,53,53,0.09)";
  if (s < 65) return "rgba(255,170,0,0.09)";
  return "rgba(184,255,0,0.09)";
}
function scoreLabel(s: number) {
  if (s < 30) return "BUY NOW";
  if (s < 65) return "NEUTRAL";
  return "WAIT";
}
function scoreSubtext(s: number) {
  if (s < 30) return "Prices are rising — act soon";
  if (s < 65) return "Monitor for changes";
  return "Prices expected to drop";
}

// Needle angle: score 0 → points LEFT, 100 → points RIGHT, 50 → points UP
function needleAngle(score: number) {
  const θ = Math.PI * (1 - score / 100); // radians, 0=right, π=left
  const x = Math.cos(θ) * (R - 10);
  const y = -Math.sin(θ) * (R - 10);    // negate because SVG Y is down
  return { x, y };
}

export function BuyMeter({ prediction }: Props) {
  const { score, recommendation, confidence, reasoning, best_window_start, best_window_end } = prediction;
  const [animScore, setAnimScore] = useState(0);
  const [displayNum, setDisplayNum] = useState(0);
  const animRef = useRef<number>(0);

  // Animate arc fill + number count-up on mount
  useEffect(() => {
    const start = performance.now();
    const duration = 1300;

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(eased * score);
      setAnimScore(current);
      setDisplayNum(current);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    }

    const id = requestAnimationFrame(tick);
    animRef.current = id;
    return () => cancelAnimationFrame(animRef.current);
  }, [score]);

  const color = scoreColor(score);
  const activeLength = (animScore / 100) * HALF_CIRC;
  const dashOffset = HALF_CIRC - activeLength;

  const { x: nx, y: ny } = needleAngle(animScore);

  // Arc path: left (-R,0) → right (R,0) through the TOP (sweep-flag=0 = counterclockwise in SVG = upward)
  const arc = `M ${-R} 0 A ${R} ${R} 0 0 0 ${R} 0`;

  return (
    <div
      className="rounded overflow-hidden"
      style={{ background: scoreBg(score), border: `1px solid ${color}22` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-3 pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span
          className="font-display"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--c-mid)" }}
        >
          When to Buy
        </span>
        <span
          className="font-data"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--c-muted)" }}
        >
          {Math.round(confidence * 100)}% confidence
        </span>
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center px-4 py-3">
        <svg
          viewBox="-110 -100 220 115"
          style={{ width: "100%", maxWidth: 280, display: "block", overflow: "visible" }}
          aria-label={`When-to-buy score: ${score} — ${recommendation}`}
        >
          <defs>
            {/* Gradient spans the full arc left→right */}
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#ff3535" />
              <stop offset="45%"  stopColor="#ff7a00" />
              <stop offset="70%"  stopColor="#ffaa00" />
              <stop offset="100%" stopColor="#b8ff00" />
            </linearGradient>

            {/* Glow filter for needle */}
            <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track (background arc) */}
          <path
            d={arc}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Active arc — animated via dashoffset */}
          <path
            d={arc}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={HALF_CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: "none" }}
          />

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((pct) => {
            const θ = Math.PI * (1 - pct / 100);
            const outerR = R + STROKE / 2 + 5;
            const innerR = R + STROKE / 2 + 11;
            return (
              <line
                key={pct}
                x1={Math.cos(θ) * outerR} y1={-Math.sin(θ) * outerR}
                x2={Math.cos(θ) * innerR} y2={-Math.sin(θ) * innerR}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />
            );
          })}

          {/* Needle */}
          <line
            x1="0" y1="0"
            x2={nx} y2={ny}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#needleGlow)"
          />
          {/* Needle base dot */}
          <circle cx="0" cy="0" r="5" fill={color} />
          <circle cx="0" cy="0" r="3" fill="var(--c-surf)" />

          {/* Center score number */}
          <text
            x="0" y="-26"
            textAnchor="middle"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "2.6rem",
              fontWeight: 500,
              fill: color,
            }}
          >
            {displayNum}
          </text>

          {/* Recommendation label */}
          <text
            x="0" y="-8"
            textAnchor="middle"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "0.75rem",
              fontWeight: 700,
              fill: color,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {scoreLabel(score)}
          </text>

          {/* Axis labels */}
          <text x={-R - STROKE / 2 - 3} y="16" textAnchor="end"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.55rem", fontWeight: 700, fill: "#ff3535", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            BUY
          </text>
          <text x={R + STROKE / 2 + 3} y="16" textAnchor="start"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.55rem", fontWeight: 700, fill: "#b8ff00", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            WAIT
          </text>
        </svg>

        {/* Subtext */}
        <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.8rem", color: "var(--c-mid)", textAlign: "center", marginTop: -4 }}>
          {scoreSubtext(score)}
        </p>
      </div>

      {/* Reasoning */}
      {reasoning.length > 0 && (
        <div
          className="px-4 pb-3 space-y-1.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "0.75rem" }}
        >
          {reasoning.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span style={{ color, fontSize: "0.6rem", marginTop: 3, flexShrink: 0 }}>◆</span>
              <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.75rem", color: "var(--c-mid)", lineHeight: 1.4 }}>{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Best window */}
      {best_window_start && best_window_end && (
        <div
          className="mx-4 mb-3 px-3 py-2 rounded"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--c-muted)" }}>
            Best Buy Window
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.8rem", color: "var(--c-text)", marginTop: 2 }}>
            {best_window_start} — {best_window_end}
          </div>
        </div>
      )}
    </div>
  );
}
