import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <main className="max-w-4xl mx-auto px-5 sm:px-8 pb-20">
        <h1 className="font-display text-3xl uppercase tracking-[-0.025em] leading-none mb-2">
          Course Review Queue
        </h1>
        <p className="text-[0.875rem] text-[var(--pw-ink-2)] mb-8">
          {items ? `${items.length} courses awaiting review` : "Loading…"}
        </p>

        {!items ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="size-6 animate-spin text-[var(--pw-ink-2)]" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-[var(--pw-ink-2)]">
            Nothing to review right now.
          </div>
        ) : (
          <div className="divide-y divide-[var(--pw-border)] border-y border-[var(--pw-border)]">
            {items.map((c) => (
              <div key={c.id} className="group py-6 flex gap-4 items-center">
                {c.thumbnail_url && (
                  <img src={c.thumbnail_url} alt="" className="size-20 object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl leading-snug transition-colors group-hover:text-pw-accent">
                    {c.title}
                  </div>
                  <div className="text-[0.75rem] text-[var(--pw-ink-2)] truncate">{c.subtitle}</div>
                  <div className="label-caps text-[var(--pw-ink-2)] mt-2">
                    {c.category} · {c.difficulty} · {c.price} {c.currency}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {c.slug && (
                    <a
                      href={`/courses/${c.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="label-caps text-[var(--pw-ink-2)] hover:text-pw-accent transition-colors text-center"
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
