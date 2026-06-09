import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function TutorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-8 text-center">Loading courses...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl">My Courses</h1>
        <Link to="/tutor/courses/new" className="pw-btn-primary flex items-center gap-1">
          <Plus className="size-4" /> New Course
        </Link>
      </div>
      {courses.length === 0 ? (
        <div className="pw-card p-12 text-center text-[var(--pw-ink-2)]">
          You haven't created any courses yet.
          <Link to="/tutor/courses/new" className="block mt-2 text-[var(--pw-accent)] underline">Create your first course</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="pw-card p-4">
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-32 object-cover rounded-md mb-3" />
              )}
              <h3 className="font-medium text-lg">{course.title}</h3>
              <p className="text-sm text-[var(--pw-ink-2)] mt-1 line-clamp-2">{course.subtitle || "No description"}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-full ${course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {course.status}
                </span>
                <div className="flex gap-2">
                  <Link to="/tutor/courses/$courseId/edit" params={{ courseId: course.id }} className="p-1 hover:bg-[var(--pw-surface-2)] rounded">
                    <Edit className="size-4" />
                  </Link>
                  <Link to="/courses/$slug" params={{ slug: course.slug || course.id }} className="p-1 hover:bg-[var(--pw-surface-2)] rounded">
                    <Eye className="size-4" />
                  </Link>
                  <button onClick={() => deleteCourse(course.id)} className="p-1 hover:bg-red-100 rounded text-red-600">
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