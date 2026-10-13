import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { useAuth } from "@/pathwise/auth";

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
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isActive = (item: Item) =>
    activeKey
      ? activeKey === item.key
      : item.to
        ? pathname === item.to || pathname.startsWith(item.to + "/")
        : false;
  const current = items.find(isActive)?.label ?? "Dashboard";

  // Below lg the sidebar is a drawer: Esc closes it, like the backdrop and the × button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)] flex">
      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[rgba(0,0,0,0.6)]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar – removed duplicate logo, solid background */}
      {/* Closed below lg it is also invisible, so its links leave the Tab order. */}
      <aside
        id="dashboard-nav"
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-[16.25rem] shrink-0 flex flex-col border-r border-[var(--pw-border)] bg-[var(--pw-bg)] transition-[transform,visibility] ${
          open ? "translate-x-0" : "-translate-x-full max-lg:invisible lg:translate-x-0"
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
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="lg:hidden ml-auto -mr-2 grid size-11 shrink-0 place-items-center text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto">
          {items.map((item) => {
            const active = isActive(item);
            const className = `pw-nav-item relative border-b border-[var(--pw-border)] ${active ? "is-active" : ""}`;
            const inner = (
              <>
                {active && (
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
            <button
              onClick={async () => {
                await logout();
                navigate({ to: "/" });
              }}
              className="block w-full text-center label-caps py-2 text-[var(--pw-ink-2)] hover:text-[var(--pw-accent)] transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {banner}
        {/* Below lg: the drawer opens from here, in the page flow (it used to be a fixed
            button covering the header's logo). Its label says which section you're in. */}
        <div className="lg:hidden px-5 sm:px-8 pt-4">
          <button
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="dashboard-nav"
            className="pw-pill min-h-11 px-3 inline-flex items-center gap-2"
          >
            <Icon name="menu" className="h-4 w-4" />
            {current}
            <span className="sr-only">, open dashboard menu</span>
          </button>
        </div>
        <main className="px-5 sm:px-8 pt-6 pb-24 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
