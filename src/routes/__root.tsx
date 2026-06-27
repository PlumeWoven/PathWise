import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "../pathwise/auth";
import { DarkModeProvider } from "../pathwise/DarkMode";
import { LoginModal } from "../pathwise/LoginModal";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--pw-bg)] px-4">
      <div className="pw-card max-w-md text-center py-10 px-8">
        <div className="font-display italic text-[24px] text-[var(--pw-ink)]">PathWise</div>
        <h1 className="font-display text-7xl font-bold text-[var(--pw-ink)] mt-4">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-[var(--pw-ink)]">Page not found</h2>
        <p className="mt-2 text-sm text-[var(--pw-ink-2)]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="pw-btn-primary inline-flex items-center justify-center px-8 py-3 text-[15px] font-medium"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PathWise — Personalized Tutor Matching & Roadmaps" },
      {
        name: "description",
        content:
          "PathWise is a learning platform that matches students with tutors and courses via a gamified experience.",
      },
      { name: "author", content: "PathWise" },
      { property: "og:title", content: "PathWise — Personalized Tutor Matching & Roadmaps" },
      {
        property: "og:description",
        content:
          "PathWise is a learning platform that matches students with tutors and courses via a gamified experience.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PathWise" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@PathWise" },
      { name: "twitter:title", content: "PathWise — Personalized Tutor Matching & Roadmaps" },
      {
        name: "twitter:description",
        content:
          "PathWise is a learning platform that matches students with tutors and courses via a gamified experience.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/0b66be4e-82c3-40a8-978d-a89642e10306",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/0b66be4e-82c3-40a8-978d-a89642e10306",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

// Runs synchronously in the document <head> BEFORE React hydrates so the
// correct `dark` class is on <html> for the very first paint. Without this,
// SSR ships HTML with no `dark` class and users get a flash of light theme
// (or, on Vercel where hydration is sensitive, the toggle appears broken).
const themeBootstrapScript = `
(function () {
  try {
    var stored = localStorage.getItem('pw-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (stored !== 'light' && prefersDark);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Outlet />
        <LoginModal />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </DarkModeProvider>
  );
}
