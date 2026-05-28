import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, BellOff } from "lucide-react";
import { usersApi } from "@/api/users";
import { useNotifStore } from "@/store/notifStore";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow, parseISO } from "date-fns";

const TYPE_META: Record<string, { label: string; color: string; bg: string; symbol: string }> = {
  cheapest:     { label: "New Low Price",    color: "var(--c-lime)",  bg: "rgba(184,255,0,0.08)",  symbol: "↓" },
  flash_sale:   { label: "Flash Sale",       color: "var(--c-amber)", bg: "rgba(255,170,0,0.08)",  symbol: "⚡" },
  last_minute:  { label: "Last Minute",      color: "var(--c-red)",   bg: "rgba(255,53,53,0.08)",  symbol: "⏱" },
  target_price: { label: "Price Target Hit", color: "#818cf8",        bg: "rgba(129,140,248,0.08)", symbol: "🎯" },
};

export function Notifications() {
  const { user } = useAuthStore();
  const { notifications, setNotifications, markRead } = useNotifStore();

  useEffect(() => {
    if (!user) return;
    usersApi.getNotifications().then((r) => setNotifications(r.data)).catch(() => {});
  }, [user]);

  const handleRead = async (id: string) => {
    await usersApi.markNotifRead(id).catch(() => {});
    markRead(id);
  };

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
        <BellOff style={{ width: 40, height: 40, color: "var(--c-muted)", margin: "0 auto 16px" }} />
        <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: 12 }}>
          Sign in to see alerts
        </p>
        <Link to="/login" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-lime)", textDecoration: "none" }}>
          Sign In →
        </Link>
      </div>
    );
  }

  const unread = notifications.filter(n => !n.read_at).length;

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 96px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: "var(--c-text)",
          lineHeight: 1,
        }}>
          Alerts
        </h1>
        {unread > 0 && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.68rem",
            color: "var(--c-lime)",
            background: "rgba(184,255,0,0.1)",
            padding: "3px 8px",
            borderRadius: 2,
            border: "1px solid rgba(184,255,0,0.2)",
          }}>
            {unread} unread
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <Bell style={{ width: 40, height: 40, color: "var(--c-muted)", margin: "0 auto 16px", opacity: 0.4 }} />
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-muted)", marginBottom: 6 }}>
            No alerts yet
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--c-muted)", opacity: 0.6 }}>
            Save events to get price drop alerts
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] || { label: n.type, color: "var(--c-muted)", bg: "rgba(255,255,255,0.04)", symbol: "🔔" };
            return (
              <Link
                key={n.id}
                to={`/events/${n.event_id}`}
                onClick={() => !n.read_at && handleRead(n.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "14px 16px",
                  background: n.read_at ? "var(--c-surf)" : meta.bg,
                  border: `1px solid ${n.read_at ? "rgba(255,255,255,0.06)" : meta.color + "33"}`,
                  borderRadius: 5,
                  textDecoration: "none",
                  opacity: n.read_at ? 0.6 : 1,
                  transition: "opacity 0.12s",
                }}
              >
                {/* Symbol */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 3,
                  background: n.read_at ? "rgba(255,255,255,0.04)" : meta.bg,
                  border: `1px solid ${n.read_at ? "rgba(255,255,255,0.06)" : meta.color + "44"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "0.9rem",
                  color: meta.color,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900,
                }}>
                  {meta.symbol}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: n.read_at ? "var(--c-muted)" : meta.color,
                    }}>
                      {meta.label}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", color: "var(--c-muted)" }}>
                        {formatDistanceToNow(parseISO(n.sent_at), { addSuffix: true })}
                      </span>
                      {!n.read_at && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.color, flexShrink: 0, display: "block" }} />
                      )}
                    </div>
                  </div>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.83rem", color: "var(--c-text)", margin: 0, lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
