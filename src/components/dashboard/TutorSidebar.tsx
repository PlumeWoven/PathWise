import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "·";
}

export type SidebarRole = "tutor" | "student";

type Item = { label: string; icon: IconName; to?: string; key: string };

const TUTOR_ITEMS: Item[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", to: "/dashboard" },
  { key: "courses", label: "My Courses", icon: "books", to: "/dashboard/courses" },
  { key: "calendar", label: "Calendar", icon: "calendar", to: "/dashboard/calendar" },
  { key: "messages", label: "Messages", icon: "messages", to: "/dashboard/messages" },
  // Earnings and Analytics are hidden until payments exist (pages are placeholders).
  { key: "settings", label: "Settings", icon: "settings", to: "/dashboard/settings" },
];

const STUDENT_ITEMS: Item[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard", to: "/roadmap" },
  { key: "courses", label: "Browse courses", icon: "books", to: "/find-tutor" },
  { key: "sessions", label: "My sessions", icon: "calendar", to: "/sessions" },
  { key: "messages", label: "Messages", icon: "messages" },
  { key: "progress", label: "Progress", icon: "growth" },
  { key: "settings", label: "Settings", icon: "settings" },
];

interface DashboardShellProps {
  role?: SidebarRole;
  user: { name: string; avatar?: string; subtitle?: string };
  isDemo?: boolean;
  banner?: ReactNode;
  onExit?: () => void;
  activeKey?: string;
  onItemClick?: (key: string) => void;
  children: ReactNode;
}

export function DashboardShell({
  role = "tutor",
  user,
  isDemo,
  banner,
  onExit,
  activeKey,
  onItemClick,
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);
  const items = role === "tutor" ? TUTOR_ITEMS : STUDENT_ITEMS;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)] flex">
      {/* Mobile toggle */}
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 pw-card p-0 flex items-center justify-center"
      >
        <Icon name="menu" label="Toggle menu" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[rgba(10,12,14,0.6)]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar – removed duplicate logo, solid background */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[16.25rem] shrink-0 flex flex-col border-r border-[var(--pw-border)] bg-[var(--pw-bg)] transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* User profile (now at the top) */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-[var(--pw-border)]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-display text-[0.8125rem] font-semibold bg-[var(--pw-ink)] text-[var(--pw-bg)] shrink-0"
            aria-hidden
          >
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <div className="text-[0.875rem] font-medium truncate">{user.name}</div>
            {user.subtitle && (
              <div className="text-[0.6875rem] text-[var(--pw-ink-2)] truncate">{user.subtitle}</div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = activeKey
              ? activeKey === item.key
              : item.to
                ? pathname === item.to || pathname.startsWith(item.to + "/")
                : false;
            const className = `pw-nav-item relative border-b border-[var(--pw-border)] ${isActive ? "is-active" : ""}`;
            const inner = (
              <>
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--pw-accent)]" />
                )}
                <Icon name={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </>
            );
            if (item.to && !onItemClick) {
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={className}
                >
                  {inner}
                </Link>
              );
            }
            return (
              <button
                key={item.key}
                onClick={() => {
                  onItemClick?.(item.key);
                  setOpen(false);
                }}
                className={className}
              >
                {inner}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--pw-border)]">
          {isDemo ? (
            <button
              onClick={onExit}
              className="w-full label-caps py-2 pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)] transition-colors"
            >
              ← Exit Demo
            </button>
          ) : (
            <Link
              to="/"
              className="block text-center label-caps py-2 text-[var(--pw-ink-2)] hover:text-[var(--pw-accent)] transition-colors"
            >
              Sign out
            </Link>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {banner}
        <main className="px-5 sm:px-8 pt-14 lg:pt-6 pb-24 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
