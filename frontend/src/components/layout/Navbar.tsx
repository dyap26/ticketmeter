import { Link, useLocation } from "react-router-dom";
import { Bell, Settings, Search, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNotifStore } from "@/store/notifStore";
import { authApi } from "@/api/auth";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const { user, setUser } = useAuthStore();
  const unread = useNotifStore((s) => s.unreadCount);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const logout = async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
    navigate("/login");
  };

  const navLink = (to: string, label: string) => {
    const active = pathname === to || (to !== "/" && pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={`font-display font-700 text-sm tracking-widest uppercase transition-colors ${
          active ? "text-arena" : "text-muted-arena hover:text-mid"
        }`}
        style={{ fontWeight: 700, letterSpacing: "0.1em" }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-arena"
      style={{ background: "rgba(7,8,16,0.92)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="container flex h-12 items-center justify-between max-w-7xl mx-auto px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span
            className="font-display text-xl text-arena"
            style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}
          >
            Ticket
            <span className="text-lime">Meter</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLink("/", "Events")}
          {navLink("/search", "Search")}
          {user && navLink("/settings", "Settings")}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link to="/search" className="md:hidden flex items-center justify-center w-9 h-9 text-muted-arena hover:text-arena">
            <Search className="h-4 w-4" />
          </Link>

          {user ? (
            <>
              <Link
                to="/notifications"
                className="relative flex items-center justify-center w-9 h-9 text-muted-arena hover:text-arena"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold text-black font-data"
                    style={{ background: "var(--c-lime)", lineHeight: 1 }}
                  >
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <Link to="/settings" className="md:hidden flex items-center justify-center w-9 h-9 text-muted-arena hover:text-arena">
                <Settings className="h-4 w-4" />
              </Link>
              <button
                onClick={logout}
                className="hidden md:flex items-center justify-center w-9 h-9 text-muted-arena hover:text-red-sig"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="font-display text-sm text-muted-arena hover:text-arena"
                style={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="font-display text-sm px-3 py-1 rounded text-black"
                style={{
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  background: "var(--c-lime)",
                }}
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
