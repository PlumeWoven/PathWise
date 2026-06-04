import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../pathwise/auth";
import { createDraft } from "../pathwise/courses";
import { PWHeader } from "../pathwise/Header";

export const Route = createFileRoute("/tutor/courses/new")({
  component: NewCourseRedirect,
});

function NewCourseRedirect() {
  const { supabaseUser, loading } = useAuth();
  const navigate = useNavigate();
  const created = useRef(false);

  useEffect(() => {
    if (loading || created.current) return;
    if (!supabaseUser) {
      navigate({ to: "/" });
      return;
    }
    created.current = true;
    createDraft(supabaseUser.id)
      .then((id) => navigate({ to: "/tutor/courses/$courseId/edit", params: { courseId: id } }))
      .catch((e) => {
        toast.error(e.message ?? "Could not create course");
        navigate({ to: "/tutor/courses" });
      });
  }, [supabaseUser, loading, navigate]);

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <div className="grid place-items-center py-32 text-[var(--pw-ink-2)]">
        <Loader2 className="size-6 animate-spin" />
      </div>
    </div>
  );
}
