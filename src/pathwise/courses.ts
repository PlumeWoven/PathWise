import { supabase } from "@/integrations/supabase/client";

export type CourseStatus = "draft" | "published" | "under_review" | "archived";

export interface CourseRow {
  id: string;
  tutor_id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  subcategory_tags: string[] | null;
  difficulty: string | null;
  language: string | null;
  thumbnail_url: string | null;
  description: string | null;
  learning_outcomes: string[] | null;
  prerequisites: string[] | null;
  target_audience: string[] | null;
  estimated_weeks: number | null;
  price: number | null;
  currency: string;
  discount_price: number | null;
  discount_expiry: string | null;
  certificate_enabled: boolean;
  seo_title: string | null;
  seo_description: string | null;
  slug: string | null;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

export interface SectionRow {
  id: string;
  course_id: string;
  title: string;
  position: number;
}

export interface LessonResource {
  type: "pdf" | "link" | "snippet";
  label: string;
  value: string;
}

export interface LessonRow {
  id: string;
  section_id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number;
  is_free_preview: boolean;
  position: number;
  resources: LessonResource[];
}

const c = supabase as any;

export async function listMyCourses(tutorId: string): Promise<CourseRow[]> {
  const { data, error } = await c
    .from("courses")
    .select("*")
    .eq("tutor_id", tutorId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CourseRow[];
}

export async function createDraft(tutorId: string): Promise<string> {
  const { data, error } = await c
    .from("courses")
    .insert({
      tutor_id: tutorId,
      title: "Untitled course",
      status: "draft",
      currency: "MDL",
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function getCourseFull(id: string) {
  const [{ data: course, error: e1 }, { data: sections, error: e2 }, { data: lessons, error: e3 }] =
    await Promise.all([
      c.from("courses").select("*").eq("id", id).maybeSingle(),
      c.from("course_sections").select("*").eq("course_id", id).order("position"),
      c.from("course_lessons").select("*").eq("course_id", id).order("position"),
    ]);
  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;
  return {
    course: (course ?? null) as CourseRow | null,
    sections: (sections ?? []) as SectionRow[],
    lessons: (lessons ?? []) as LessonRow[],
  };
}

export async function getCourseBySlug(slug: string) {
  const { data, error } = await c.from("courses").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as CourseRow | null;
}

export async function updateCourse(id: string, patch: Partial<CourseRow>) {
  const { error } = await c.from("courses").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteCourse(id: string) {
  const { error } = await c.from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function addSection(courseId: string, position: number): Promise<SectionRow> {
  const { data, error } = await c
    .from("course_sections")
    .insert({ course_id: courseId, title: "New section", position })
    .select("*")
    .single();
  if (error) throw error;
  return data as SectionRow;
}

export async function updateSection(id: string, patch: Partial<SectionRow>) {
  const { error } = await c.from("course_sections").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteSection(id: string) {
  const { error } = await c.from("course_sections").delete().eq("id", id);
  if (error) throw error;
}

export async function addLesson(
  courseId: string,
  sectionId: string,
  position: number
): Promise<LessonRow> {
  const { data, error } = await c
    .from("course_lessons")
    .insert({
      course_id: courseId,
      section_id: sectionId,
      title: "New lesson",
      duration_minutes: 0,
      position,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as LessonRow;
}

export async function updateLesson(id: string, patch: Partial<LessonRow>) {
  const { error } = await c.from("course_lessons").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteLesson(id: string) {
  const { error } = await c.from("course_lessons").delete().eq("id", id);
  if (error) throw error;
}

export async function reorderSections(items: { id: string; position: number }[]) {
  await Promise.all(items.map((it) => c.from("course_sections").update({ position: it.position }).eq("id", it.id)));
}

export async function reorderLessons(items: { id: string; position: number; section_id: string }[]) {
  await Promise.all(
    items.map((it) =>
      c.from("course_lessons").update({ position: it.position, section_id: it.section_id }).eq("id", it.id)
    )
  );
}

export function statusColor(s: CourseStatus): string {
  switch (s) {
    case "published":
      return "bg-[var(--pw-accent-2)]/10 text-[var(--pw-accent-2)] border-[var(--pw-accent-2)]/30";
    case "under_review":
      return "bg-[var(--pw-accent-3)]/15 text-[#7a5800] border-[var(--pw-accent-3)]/40";
    case "archived":
      return "bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)] border-[var(--pw-border)]";
    default:
      return "bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)] border-[var(--pw-border)]";
  }
}

export function statusLabel(s: CourseStatus): string {
  return s === "under_review" ? "Under Review" : s.charAt(0).toUpperCase() + s.slice(1);
}
