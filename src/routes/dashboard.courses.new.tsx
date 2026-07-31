import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../pathwise/auth";
import { createDraft } from "../pathwise/courses";

export const Route = createFileRoute("/dashboard/courses/new")({
  head: () => ({ meta: [{ title: "New Course — PathWise" }] }),
  component: NewCourseRedirect,
});

// Creates a draft, then hands off to the editor. Living under /dashboard keeps
// the tutor inside DashboardShell the whole way through — the old
// /tutor/courses/new sat in the bare `_app` shell, so creating a course visibly
// threw you out of the dashboard.
function NewCourseRedirect() {
  const { supabaseUser, loading } = useAuth();
  const navigate = useNavigate();
  const created = useRef(false);
  const failedRef = useRef(false);

  useEffect(() => {
    // ── Never retry if we already failed once this mount ──
    if (loading || created.current || failedRef.current) return;
    // DashboardLayout already gates on auth; this is a belt-and-braces check for
    // the brief window before the session resolves.
    if (!supabaseUser) return;
    created.current = true;
    createDraft(supabaseUser.id)
      .then((id) =>
        navigate({
          to: "/dashboard/courses/$courseId/edit",
          params: { courseId: id },
          replace: true,
        }),
      )
      .catch((e: unknown) => {
        failedRef.current = true;
        // PostgrestError.code is the Postgres SQLSTATE, not an HTTP status —
        // 23505 is unique_violation, which PostgREST surfaces as a 409. Course
        // drafts now carry their own unique slug, so this should be unreachable.
        const err = e as { code?: string; message?: string } | null;
        const message =
          err?.code === "23505"
            ? "Could not create course — that URL is already taken. Please try again."
            : (err?.message ?? "Could not create course");
        toast.error(message);
        // replace:true so backspace doesn't return here and re-fire the insert.
        navigate({ to: "/dashboard/courses", replace: true });
      });
  }, [supabaseUser, loading, navigate]);

  return (
    <div className="grid place-items-center py-32 text-[var(--pw-ink-2)]">
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}
