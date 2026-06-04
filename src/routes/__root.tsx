import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "../pathwise/auth";
import { LoginModal } from "../pathwise/LoginModal";
import { Toaster } from "sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
      { name: "description", content: "PathWise is a learning platform that matches students with tutors and courses via a gamified experience." },
      { name: "author", content: "PathWise" },
      { property: "og:title", content: "PathWise — Personalized Tutor Matching & Roadmaps" },
      { property: "og:description", content: "PathWise is a learning platform that matches students with tutors and courses via a gamified experience." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PathWise" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@PathWise" },
      { name: "twitter:title", content: "PathWise — Personalized Tutor Matching & Roadmaps" },
      { name: "twitter:description", content: "PathWise is a learning platform that matches students with tutors and courses via a gamified experience." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/0b66be4e-82c3-40a8-978d-a89642e10306" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/0b66be4e-82c3-40a8-978d-a89642e10306" },
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

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
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
    <AuthProvider>
      <Outlet />
      <LoginModal />
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}
