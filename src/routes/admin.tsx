import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { isAdmin } from "../pathwise/roles";
import { Icon, type IconName } from "@/components/Icon";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/" });
      return;
    }
    // Check the JWT claim (app_metadata.role) – not the profile role
    if (!isAdmin(user.app_metadata)) {
      navigate({ to: "/dashboard" });
    }
  }, [loading, user, navigate]);

  if (loading || !user || !isAdmin(user.app_metadata)) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)] flex items-center justify-center text-[var(--pw-ink-2)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <div className="md:flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 px-5 sm:px-8 py-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items: { to: string; label: string; icon: IconName }[] = [
    { to: "/admin", label: "Dashboard", icon: "dashboard" },
    { to: "/admin/users", label: "Users", icon: "users" },
    { to: "/admin/courses", label: "Courses", icon: "books" },
    { to: "/admin/sessions", label: "Sessions", icon: "calendar" },
  ];

  return (
    // Phones: a horizontal, scrollable row above the page. md+: the sidebar column.
    <aside className="md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md p-2 md:p-4 md:min-h-screen">
      <nav className="flex md:block gap-1 overflow-x-auto md:space-y-1">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`label-caps flex shrink-0 items-center gap-2 px-3 py-3 whitespace-nowrap transition-colors ${
              pathname === item.to
                ? "bg-[var(--pw-accent-soft)] text-pw-accent"
                : "text-[var(--pw-ink-2)] hover:text-pw-accent"
            }`}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
