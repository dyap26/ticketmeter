import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Bell, Star, Trash2, LogOut } from "lucide-react";
import { authApi } from "@/api/auth";
import { usersApi, Entity } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { useLocationStore } from "@/store/locationStore";

const RADII = [25, 50, 100, 200];

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700,
  fontSize: "0.62rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--c-muted)",
  marginBottom: 10,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const cardStyle: React.CSSProperties = {
  background: "var(--c-surf)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  background: "var(--c-surf2)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 4,
  padding: "0 12px",
  fontFamily: "'Barlow', sans-serif",
  fontSize: "0.85rem",
  color: "var(--c-text)",
  outline: "none",
};

export function Settings() {
  const { user, setUser } = useAuthStore();
  const { city, setLocation, radiusMiles, setRadius } = useLocationStore();
  const navigate = useNavigate();

  const [cityInput, setCityInput] = useState(city);
  const [notifEmail, setNotifEmail] = useState(user?.notification_email ?? true);
  const [notifPush, setNotifPush] = useState(user?.notification_push ?? true);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedMsg] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    usersApi.getTrackedEntities().then((r) => setEntities(r.data)).catch(() => {});
  }, [user]);

  const handleSavePrefs = async () => {
    setSaving(true);
    try {
      const res = await authApi.updateMe({
        city: cityInput,
        notification_email: notifEmail,
        notification_push: notifPush,
      });
      setUser(res.data);
      setLocation(useLocationStore.getState().lat, useLocationStore.getState().lon, cityInput);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEntity = async (id: string) => {
    await usersApi.untrackEntity(id).catch(() => {});
    setEntities((prev) => prev.filter((e) => e.id !== id));
  };

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
    navigate("/login");
  };

  if (!user) return null;

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
  };
  const chipActive: React.CSSProperties = {
    background: "var(--c-lime)",
    color: "#000",
    border: "1px solid var(--c-lime)",
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 96px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          color: "var(--c-text)",
          lineHeight: 1,
          marginBottom: 4,
        }}>
          Settings
        </h1>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.68rem", color: "var(--c-muted)" }}>
          {user.email}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Location */}
        <section>
          <div style={sectionLabelStyle}>
            <MapPin style={{ width: 11, height: 11 }} />
            Location
          </div>
          <div style={cardStyle}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <label style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-muted)", display: "block", marginBottom: 8 }}>
                Home City
              </label>
              <input
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                placeholder="e.g. Los Angeles, CA"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.borderColor = "rgba(184,255,0,0.4)"}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>
            <div style={{ padding: "14px 16px" }}>
              <label style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.62rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--c-muted)", display: "block", marginBottom: 10 }}>
                Search Radius
              </label>
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
        </section>

        {/* Notifications */}
        <section>
          <div style={sectionLabelStyle}>
            <Bell style={{ width: 11, height: 11 }} />
            Notifications
          </div>
          <div style={cardStyle}>
            {[
              { label: "Email alerts", value: notifEmail, set: setNotifEmail },
              { label: "Push notifications", value: notifPush, set: setNotifPush },
            ].map(({ label, value, set }, i, arr) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 16px",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                <span style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.85rem", color: "var(--c-text)" }}>
                  {label}
                </span>
                {/* Toggle */}
                <button
                  onClick={() => set(!value)}
                  style={{
                    position: "relative",
                    width: 40,
                    height: 22,
                    borderRadius: 11,
                    border: "none",
                    background: value ? "var(--c-lime)" : "var(--c-surf2)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: 3,
                    left: value ? 21 : 3,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: value ? "#000" : "var(--c-muted)",
                    transition: "left 0.15s",
                  }} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tracked Teams & Artists */}
        <section>
          <div style={sectionLabelStyle}>
            <Star style={{ width: 11, height: 11 }} />
            Tracked Teams &amp; Artists
          </div>
          <div style={cardStyle}>
            {entities.length === 0 ? (
              <div style={{ padding: "20px 16px" }}>
                <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.83rem", color: "var(--c-muted)", margin: 0 }}>
                  No teams or artists tracked yet.
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.65rem", color: "var(--c-muted)", marginTop: 4, opacity: 0.6 }}>
                  Save events to follow their performers.
                </p>
              </div>
            ) : (
              <div>
                {entities.map((e, i) => (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderBottom: i < entities.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.04em", color: "var(--c-text)", margin: 0, marginBottom: 2 }}>
                        {e.name}
                      </p>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "var(--c-muted)", margin: 0 }}>
                        {e.entity_type === "team" ? e.sport_genre : "Artist"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveEntity(e.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-muted)", padding: 4, display: "flex" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--c-red)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--c-muted)")}
                    >
                      <Trash2 style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={handleSavePrefs}
            disabled={saving}
            style={{
              height: 44,
              background: saved ? "rgba(184,255,0,0.8)" : saving ? "rgba(184,255,0,0.5)" : "var(--c-lime)",
              color: "#000",
              border: "none",
              borderRadius: 4,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saved ? "Saved!" : saving ? "Saving…" : "Save Preferences"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              height: 44,
              background: "transparent",
              color: "var(--c-red)",
              border: "1px solid rgba(255,53,53,0.3)",
              borderRadius: 4,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,53,53,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut style={{ width: 14, height: 14 }} />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  );
}
