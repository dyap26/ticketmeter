import { Link, useLocation } from "react-router-dom";
import { Home, Search, Bell, Settings } from "lucide-react";
import { useNotifStore } from "@/store/notifStore";

const TABS = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/notifications", icon: Bell, label: "Alerts", badge: true },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const unread = useNotifStore((s) => s.unreadCount);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-4 md:hidden"
      style={{ background: "rgba(7,8,16,0.96)", borderTop: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
    >
      {TABS.map(({ to, icon: Icon, label, badge }) => {
        const active = pathname === to || (to !== "/" && pathname.startsWith(to));
        return (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center justify-center gap-1 py-2.5 relative"
            style={{ color: active ? "var(--c-lime)" : "var(--c-muted)" }}
          >
            <div className="relative">
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              {badge && unread > 0 && (
                <span
                  className="absolute -top-1 -right-1.5 h-3.5 w-3.5 flex items-center justify-center rounded-full text-[8px] font-bold text-black font-data"
                  style={{ background: "var(--c-lime)" }}
                >
                  {unread > 9 ? "9" : unread}
                </span>
              )}
            </div>
            <span
              className="font-display text-[10px] tracking-widest"
              style={{ fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              {label}
            </span>
            {active && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-px"
                style={{ background: "var(--c-lime)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
