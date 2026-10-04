import { createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--pw-bg)] px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--pw-border)] bg-[var(--pw-surface-2)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-[var(--pw-danger)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-[-0.025em] text-[var(--pw-ink)]">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[var(--pw-ink-2)]">
          An unexpected error occurred. Please try again.
        </p>
        {import.meta.env.DEV && error instanceof Error && error.message && (
          <pre className="mt-4 max-h-40 overflow-auto border border-[var(--pw-border)] bg-[var(--pw-surface-2)] p-3 text-left font-mono text-xs text-[var(--pw-danger)]">
            {error.message}
          </pre>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="pw-btn-primary px-4 py-2"
          >
            Try again
          </button>
          <a href="/" className="pw-btn-secondary px-4 py-2">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
