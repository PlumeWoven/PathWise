import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Edit, Eye, Trash2, LayoutDashboard } from "lucide-react";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TutorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // Detect if rendered outside the dashboard layout (i.e. via the bare /tutor/courses/ route)
  // The dashboard layout wraps this page at /dashboard/courses.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isBareRoute = !pathname.startsWith("/dashboard/");

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("tutor_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Failed to load courses");
        console.error(error);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    })();
  }, [user]);

  const deleteCourse = async (courseId: string) => {
    if (!confirm("Delete this course permanently?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) {
      toast.error("Failed to delete course");
    } else {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success("Course deleted");
    }
  };

  if (loading)
    return <div className="p-8 text-center text-[var(--pw-ink-2)]">Loading courses...</div>;

  return (
    <div>
      {isBareRoute && (
        <div className="mb-4 flex items-center gap-2">
          <Link
            to="/dashboard/courses"
            className="label-caps inline-flex items-center gap-1.5 text-[var(--pw-accent)] hover:text-[var(--pw-ink)] transition-colors"
          >
            <LayoutDashboard className="size-3.5" />
            Back to Dashboard
          </Link>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl uppercase tracking-[-0.025em] leading-none">
          My Courses
        </h1>
        <Link to="/dashboard/courses/new" className="pw-btn-primary flex items-center gap-1">
          <Plus className="size-4" /> New Course
        </Link>
      </div>
      {courses.length === 0 ? (
        <div className="pw-card p-12 text-center text-[var(--pw-ink-2)]">
          You haven't created any courses yet.
          <Link
            to="/dashboard/courses/new"
            className="block mt-2 text-[var(--pw-accent)] underline underline-offset-4 hover:text-[var(--pw-ink)] transition-colors"
          >
            Create your first course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="pw-card group p-4 hover:border-[var(--pw-ink)] transition-colors"
            >
              {course.thumbnail_url && (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-32 object-cover mb-3"
                />
              )}
              <h3 className="font-display text-lg leading-tight transition-colors group-hover:text-pw-accent">
                {course.title}
              </h3>
              <p className="text-sm text-[var(--pw-ink-2)] mt-1 line-clamp-2">
                {course.subtitle || "No description"}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`label-caps rounded-full border px-2.5 py-0.5 ${course.status === "published" ? "border-[var(--pw-secondary)] text-[var(--pw-secondary)]" : "border-[var(--pw-accent-3)] text-[var(--pw-accent-3)]"}`}
                >
                  {course.status}
                </span>
                <div className="flex gap-2">
                  <Link
                    to="/dashboard/courses/$courseId/edit"
                    params={{ courseId: course.id }}
                    className="p-1 text-[var(--pw-ink-2)] hover:text-pw-accent transition-colors"
                  >
                    <Edit className="size-4" />
                  </Link>
                  <Link
                    to="/courses/$slug"
                    params={{ slug: course.slug || course.id }}
                    className="p-1 text-[var(--pw-ink-2)] hover:text-pw-accent transition-colors"
                  >
                    <Eye className="size-4" />
                  </Link>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="p-1 text-[var(--pw-danger)] hover:bg-[var(--pw-surface-2)] transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/tutor/courses/")({
  component: TutorCoursesPage,
});

// Named export for dashboard reuse
