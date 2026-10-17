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
    // Flex column: the footer's mt-auto pins it to the bottom of the screen on short pages
    // and keeps it after the content on long ones, so it never floats mid-screen.
    <div className="flex min-h-dvh flex-col bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <Outlet />
      {pathname !== "/" && <LegalFooter />}
    </div>
  );
}

function LegalFooter() {
  const link = "inline-block py-4 -my-4 hover:text-pw-accent transition-colors";
  return (
    <footer className="mt-auto border-t border-[var(--pw-border)] px-6 sm:px-8 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 label-caps text-[var(--pw-ink-2)]">
      <span>© {new Date().getFullYear()} PathWise</span>
      <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
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
