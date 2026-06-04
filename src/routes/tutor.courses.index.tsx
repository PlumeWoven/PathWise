import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Edit3, Eye, Trash2, BookOpen, Loader2 } from "lucide-react";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CourseRow,
  CourseStatus,
  createDraft,
  deleteCourse,
  listMyCourses,
  statusColor,
  statusLabel,
} from "../pathwise/courses";

export const Route = createFileRoute("/tutor/courses/")({
  head: () => ({ meta: [{ title: "My Courses — PathWise" }] }),
  component: CoursesIndex,
});

const TABS: { id: "all" | CourseStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
  { id: "under_review", label: "Under Review" },
];

function CoursesIndex() {
  const { profile, supabaseUser, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | CourseStatus>("all");
  const [courses, setCourses] = useState<CourseRow[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<CourseRow | null>(null);

  useEffect(() => {
    if (!loading && (!supabaseUser || (profile && profile.role !== "tutor" && profile.role !== "both"))) {
      navigate({ to: "/dashboard" });
    }
  }, [loading, supabaseUser, profile, navigate]);

  useEffect(() => {
    if (!supabaseUser) return;
    listMyCourses(supabaseUser.id)
      .then(setCourses)
      .catch((e) => toast.error(e.message ?? "Failed to load courses"));
  }, [supabaseUser]);

  const filtered = useMemo(() => {
    if (!courses) return null;
    return tab === "all" ? courses : courses.filter((c) => c.status === tab);
  }, [courses, tab]);

  const create = async () => {
    if (!supabaseUser) return;
    setCreating(true);
    try {
      const id = await createDraft(supabaseUser.id);
      navigate({ to: "/tutor/courses/$courseId/edit", params: { courseId: id } });
    } catch (e: any) {
      toast.error(e.message ?? "Could not create course");
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteCourse(toDelete.id);
      setCourses((cs) => (cs ? cs.filter((x) => x.id !== toDelete.id) : cs));
      toast.success("Course deleted");
    } catch (e: any) {
      toast.error(e.message ?? "Delete failed");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl">My Courses</h1>
            <p className="text-[14px] text-[var(--pw-ink-2)] mt-1">
              {courses ? `${courses.length} total` : "Loading…"}
            </p>
          </div>
          <Button onClick={create} disabled={creating}>
            {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            New Course
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {TABS.map((t) => {
            const count = t.id === "all" ? courses?.length ?? 0 : courses?.filter((c) => c.status === t.id).length ?? 0;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pw-pill px-3 py-1.5 text-[13px] border transition-colors ${
                  active
                    ? "border-[var(--pw-accent)] bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]"
                    : "border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)]"
                }`}
              >
                {t.label} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {filtered === null ? (
          <div className="grid place-items-center py-20 text-[var(--pw-ink-2)]">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={create} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c) => (
              <CourseTile key={c.id} course={c} onDelete={() => setToDelete(c)} />
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              "{toDelete?.title}" and all its sections and lessons will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function CourseTile({ course, onDelete }: { course: CourseRow; onDelete: () => void }) {
  const updated = new Date(course.updated_at).toLocaleDateString();
  return (
    <div className="group rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md overflow-hidden flex flex-col hover:shadow-[0_15px_30px_-15px_rgba(0,0,0,0.18)] transition-shadow">
      <div className="aspect-[16/9] bg-gradient-to-br from-[var(--pw-accent-soft)] via-[var(--pw-surface-2)] to-[var(--pw-accent-soft)] relative">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-[var(--pw-ink-2)]">
            <BookOpen className="size-10 opacity-40" />
          </div>
        )}
        <span
          className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wide ${statusColor(course.status)}`}
        >
          {statusLabel(course.status)}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-[15px] line-clamp-2">{course.title}</h3>
        <p className="text-[12px] text-[var(--pw-ink-2)] mt-1">Updated {updated}</p>
        <div className="mt-2 text-[13px]">
          {course.price != null ? (
            <span className="font-medium">
              {course.discount_price != null ? (
                <>
                  <span className="text-[var(--pw-accent)]">{course.discount_price} {course.currency}</span>{" "}
                  <span className="line-through text-[var(--pw-ink-2)] text-[12px]">{course.price}</span>
                </>
              ) : (
                <>
                  {course.price} {course.currency}
                </>
              )}
            </span>
          ) : (
            <span className="text-[var(--pw-ink-2)]">No price set</span>
          )}
        </div>
        <div className="mt-3 flex gap-2 border-t border-[var(--pw-border)] pt-3">
          <Link
            to="/tutor/courses/$courseId/edit"
            params={{ courseId: course.id }}
            className="flex-1 inline-flex items-center justify-center gap-1 text-[12px] py-1.5 rounded-md border border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)]"
          >
            <Edit3 className="size-3.5" /> Edit
          </Link>
          {course.slug && (
            <a
              href={`/courses/${course.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1 text-[12px] px-2 py-1.5 rounded-md border border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)]"
            >
              <Eye className="size-3.5" /> Preview
            </a>
          )}
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center gap-1 text-[12px] px-2 py-1.5 rounded-md border border-[var(--pw-border)] text-[var(--pw-danger)] hover:bg-[var(--pw-danger)]/10"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--pw-border)] bg-[var(--pw-surface)]/60 backdrop-blur p-14 text-center">
      <div className="mx-auto size-20 rounded-full grid place-items-center bg-[var(--pw-accent-soft)] text-[var(--pw-accent)] mb-4">
        <BookOpen className="size-10" />
      </div>
      <h2 className="font-display text-2xl">No courses yet</h2>
      <p className="text-[14px] text-[var(--pw-ink-2)] mt-1 mb-5">
        Build a structured course with sections, lessons and pricing.
      </p>
      <Button onClick={onCreate}>
        <Plus className="size-4" /> Create your first course
      </Button>
    </div>
  );
}
