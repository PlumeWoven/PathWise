import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../pathwise/auth";
import { createDraft } from "../pathwise/courses";

export const Route = createFileRoute("/_app/tutor/courses/new")({
  component: NewCourseRedirect,
});

function NewCourseRedirect() {
  const { supabaseUser, loading } = useAuth();
  const navigate = useNavigate();
  const created = useRef(false);
  const failedRef = useRef(false);

  useEffect(() => {
    // ── Never retry if we already failed once this mount ──
    if (loading || created.current || failedRef.current) return;
    if (!supabaseUser) {
      navigate({ to: "/" });
      return;
    }
    created.current = true;
    createDraft(supabaseUser.id)
      .then((id) =>
        navigate({ to: "/tutor/courses/$courseId/edit", params: { courseId: id } }),
      )
      .catch((e: any) => {
        failedRef.current = true;
        // Distinguish 409 (conflict — unique constraint, RLS, FK) from 4xx/5xx.
        // PostgrestError.code is the HTTP status as a string (e.g. "409").
        const code = e?.code ?? e?.status;
        const message =
          code === 409 || code === "409"
            ? "Could not create course — a conflict occurred (duplicate title or permissions). Please try again."
            : e?.message ?? "Could not create course";
        toast.error(message);
        // Use replace:true so pressing backspace skips the failed page.
        // Without this, every failed attempt adds an entry to browser history
        // and backspace returns the user to /tutor/courses/new, retrying the POST.
        navigate({ to: "/dashboard/courses", replace: true });
      });
  }, [supabaseUser, loading, navigate]);

  return (
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <div className="grid place-items-center py-32 text-[var(--pw-ink-2)]">
        <Loader2 className="size-6 animate-spin" />
      </div>
    </div>
  );
}
