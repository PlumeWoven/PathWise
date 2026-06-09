import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "·";
}

export type SidebarRole = "tutor" | "student";

type Item = { label: string; icon: string; to?: string; key: string };

const TUTOR_ITEMS: Item[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊", to: "/dashboard" },
  { key: "courses", label: "My Courses", icon: "📚", to: "/dashboard/courses" },
  { key: "calendar", label: "Calendar", icon: "📅", to: "/dashboard/calendar" },
  { key: "messages", label: "Messages", icon: "💬", to: "/dashboard/messages" },
  { key: "earnings", label: "Earnings", icon: "💰", to: "/dashboard/earnings" },
  { key: "analytics", label: "Analytics", icon: "📈", to: "/dashboard/analytics" },
  { key: "settings", label: "Settings", icon: "⚙️", to: "/dashboard/settings" },
];

const STUDENT_ITEMS: Item[] = [
  { key: "dashboard", label: "Dashboard", icon: "📊", to: "/roadmap" },
  { key: "courses", label: "Browse courses", icon: "📚", to: "/find-tutor" },
  { key: "sessions", label: "My sessions", icon: "📅", to: "/sessions" },
  { key: "messages", label: "Messages", icon: "💬" },
  { key: "progress", label: "Progress", icon: "📈" },
  { key: "settings", label: "Settings", icon: "⚙️" },
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
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-md pw-card flex items-center justify-center"
      >
        ☰
      </button>

      {/* Backdrop */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[260px] shrink-0 flex flex-col border-r border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[var(--pw-border)]">
          <Link to="/" className="font-display italic text-[22px] text-[var(--pw-ink)]">PathWise</Link>
          {isDemo && (
            <div className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full bg-[var(--pw-accent)]/15 text-[var(--pw-accent)] font-mono-pw uppercase tracking-wider">
              Demo
            </div>
          )}
        </div>

        {/* User */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-[var(--pw-border)]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, var(--pw-accent), var(--pw-accent-2))" }}
            aria-hidden
          >
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-medium truncate">{user.name}</div>
            {user.subtitle && <div className="text-[11px] text-[var(--pw-ink-2)] truncate">{user.subtitle}</div>}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {items.map((item) => {
            const isActive = activeKey
              ? activeKey === item.key
              : item.to
                ? pathname === item.to || pathname.startsWith(item.to + "/")
                : false;
            const className = `relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${isActive
              ? "bg-[var(--pw-accent-soft)] text-[var(--pw-accent)] font-medium"
              : "text-[var(--pw-ink)] hover:bg-[var(--pw-surface-2)]"
              }`;
            const inner = (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[var(--pw-accent)]" />
                )}
                <span className="text-[16px] leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </>
            );
            if (item.to && !onItemClick) {
              return (
                <Link key={item.key} to={item.to} onClick={() => setOpen(false)} className={className}>
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
              className="w-full text-[13px] py-2 rounded-md pw-border-accent text-[var(--pw-accent)] hover:bg-[var(--pw-accent-soft)]"
            >
              ← Exit Demo
            </button>
          ) : (
            <Link
              to="/"
              className="block text-center text-[13px] py-2 rounded-md text-[var(--pw-ink-2)] hover:bg-[var(--pw-surface-2)]"
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