import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.login(email, password);
      const me = await authApi.me();
      setUser(me.data);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 42,
    background: "var(--c-surf)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 4,
    padding: "0 14px",
    fontFamily: "'Barlow', sans-serif",
    fontSize: "0.9rem",
    color: "var(--c-text)",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: "0.65rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--c-muted)",
    display: "block",
    marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "2rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--c-text)" }}>
              Ticket<span style={{ color: "var(--c-lime)" }}>Meter</span>
            </span>
          </Link>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.7rem", color: "var(--c-muted)", marginTop: 6 }}>
            Sign in to track events & get alerts
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(184,255,0,0.4)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = "rgba(184,255,0,0.4)"}
              onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"}
            />
          </div>
          {error && (
            <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: "0.8rem", color: "var(--c-red)", margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              height: 44,
              background: loading ? "rgba(184,255,0,0.5)" : "var(--c-lime)",
              color: "#000",
              border: "none",
              borderRadius: 4,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: "0.9rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem", color: "var(--c-muted)" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "var(--c-lime)", fontWeight: 600, textDecoration: "none" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
