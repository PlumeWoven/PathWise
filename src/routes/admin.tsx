import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { isAdmin } from "../pathwise/roles";

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
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 px-5 sm:px-8 py-6 max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function AdminSidebar() {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const items = [
        { to: "/admin", label: "Dashboard", icon: "📊" },
        { to: "/admin/users", label: "Users", icon: "👥" },
        { to: "/admin/courses", label: "Courses", icon: "📚" },
    ];

    return (
        <aside className="w-64 shrink-0 border-r border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md p-4 min-h-screen">
            <nav className="space-y-1">
                {items.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${pathname === item.to
                                ? "bg-[var(--pw-accent-soft)] text-[var(--pw-accent)] font-medium"
                                : "hover:bg-[var(--pw-surface-2)]"
                            }`}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}