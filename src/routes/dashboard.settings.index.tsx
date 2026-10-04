import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings/")({
  component: DashboardSettingsIndex,
});

function DashboardSettingsIndex() {
  return (
    <div>
      <h1 className="font-display text-2xl uppercase tracking-[-0.025em] leading-none mb-4">
        Settings
      </h1>
      <p className="mb-2 text-[var(--pw-ink-2)]">Choose a setting category:</p>
      <ul className="space-y-1">
        <li>
          <Link
            to="/dashboard/settings/verification"
            className="text-[var(--pw-accent)] underline underline-offset-4 hover:text-[var(--pw-ink)] transition-colors"
          >
            Verification
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard/calendar"
            className="text-[var(--pw-accent)] underline underline-offset-4 hover:text-[var(--pw-ink)] transition-colors"
          >
            Availability (Calendar)
          </Link>
        </li>
        <li>
          <Link
            to="/dashboard/courses"
            className="text-[var(--pw-accent)] underline underline-offset-4 hover:text-[var(--pw-ink)] transition-colors"
          >
            Courses
          </Link>
        </li>
      </ul>
    </div>
  );
}
