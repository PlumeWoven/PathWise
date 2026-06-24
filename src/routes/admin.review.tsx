import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { isAdmin } from "../pathwise/roles";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CourseRow, updateCourse } from "../pathwise/courses";
import { Loader2, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/review")({
  head: () => ({ meta: [{ title: "Course Review — PathWise" }] }),
  component: AdminReview,
});

function AdminReview() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CourseRow[] | null>(null);

  useEffect(() => {
    if (loading) return;
    // Admin is a JWT claim (app_metadata.role), not a profile role.
    if (!user || !isAdmin(user.app_metadata)) {
      toast.error("Admin access required");
      navigate({ to: "/" });
      return;
    }
    (supabase as any)
      .from("courses")
      .select("*")
      .eq("status", "under_review")
      .order("updated_at", { ascending: false })
      .then(({ data, error }: any) => {
        if (error) toast.error(error.message);
        setItems(data ?? []);
      });
  }, [loading, user, navigate]);

  const decide = async (c: CourseRow, status: "published" | "draft") => {
    try {
      await updateCourse(c.id, { status });
      setItems((arr) => (arr ? arr.filter((x) => x.id !== c.id) : arr));
      toast.success(status === "published" ? "Approved" : "Sent back to draft");
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="max-w-4xl mx-auto px-5 sm:px-8 pb-20">
        <h1 className="font-display text-3xl mb-1">Course Review Queue</h1>
        <p className="text-[14px] text-[var(--pw-ink-2)] mb-6">
          {items ? `${items.length} courses awaiting review` : "Loading…"}
        </p>

        {!items ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="size-6 animate-spin text-[var(--pw-ink-2)]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-[var(--pw-ink-2)]">Nothing to review right now.</div>
        ) : (
          <div className="space-y-3">
            {items.map((c) => (
              <div key={c.id} className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4 flex gap-4 items-center">
                {c.thumbnail_url && <img src={c.thumbnail_url} alt="" className="size-20 rounded object-cover" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.title}</div>
                  <div className="text-[12px] text-[var(--pw-ink-2)] truncate">{c.subtitle}</div>
                  <div className="text-[11px] text-[var(--pw-ink-2)] mt-1">
                    {c.category} · {c.difficulty} · {c.price} {c.currency}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {c.slug && (
                    <a
                      href={`/courses/${c.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[12px] underline text-[var(--pw-ink-2)] text-center"
                    >
                      Preview
                    </a>
                  )}
                  <Button size="sm" onClick={() => decide(c, "published")}>
                    <Check className="size-4" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => decide(c, "draft")}>
                    <X className="size-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
