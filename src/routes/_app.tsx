import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { PWHeader } from "../pathwise/Header";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

// Pathless layout: supplies the page shell + sticky header to every `_app.*` route
// so individual pages don't each import and render PWHeader. Guard logic lives in
// dashboard.tsx / RoleGate.tsx — deliberately none here.
function AppLayout() {
  // The landing page has its own full footer; every other page gets the slim one,
  // so Privacy, Terms and Contact are always one tap away.
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <Outlet />
      {pathname !== "/" && <LegalFooter />}
    </div>
  );
}

function LegalFooter() {
  const link = "inline-block py-3.5 -my-3.5 hover:text-pw-accent transition-colors";
  return (
    <footer className="border-t border-[var(--pw-border)] px-5 sm:px-8 py-4 flex flex-wrap items-center gap-x-5 gap-y-2 label-caps text-[var(--pw-ink-2)]">
      <span>© {new Date().getFullYear()} PathWise</span>
      <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
        <Link to="/privacy" className={link}>
          Privacy
        </Link>
        <Link to="/terms" className={link}>
          Terms
        </Link>
        <Link to="/contact" className={link}>
          Contact
        </Link>
      </nav>
    </footer>
  );
}
