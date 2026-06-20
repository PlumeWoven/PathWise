import { s as supabase } from "./router-C4GolrgT.mjs";
const c = supabase;
async function createDraft(tutorId) {
  const { data, error } = await c.from("courses").insert({
    tutor_id: tutorId,
    title: "Untitled course",
    status: "draft",
    currency: "MDL"
  }).select("id").single();
  if (error) throw error;
  return data.id;
}
async function getCourseFull(id) {
  const [{ data: course, error: e1 }, { data: sections, error: e2 }, { data: lessons, error: e3 }] = await Promise.all([
    c.from("courses").select("*").eq("id", id).maybeSingle(),
    c.from("course_sections").select("*").eq("course_id", id).order("position"),
    c.from("course_lessons").select("*").eq("course_id", id).order("position")
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  if (e3) throw e3;
  return {
    course: course ?? null,
    sections: sections ?? [],
    lessons: lessons ?? []
  };
}
async function getCourseBySlug(slug) {
  const { data, error } = await c.from("courses").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}
async function updateCourse(id, patch) {
  const { error } = await c.from("courses").update(patch).eq("id", id);
  if (error) throw error;
}
async function addSection(courseId, position) {
  const { data, error } = await c.from("course_sections").insert({ course_id: courseId, title: "New section", position }).select("*").single();
  if (error) throw error;
  return data;
}
async function updateSection(id, patch) {
  const { error } = await c.from("course_sections").update(patch).eq("id", id);
  if (error) throw error;
}
async function deleteSection(id) {
  const { error } = await c.from("course_sections").delete().eq("id", id);
  if (error) throw error;
}
async function addLesson(courseId, sectionId, position) {
  const { data, error } = await c.from("course_lessons").insert({
    course_id: courseId,
    section_id: sectionId,
    title: "New lesson",
    duration_minutes: 0,
    position
  }).select("*").single();
  if (error) throw error;
  return data;
}
async function updateLesson(id, patch) {
  const { error } = await c.from("course_lessons").update(patch).eq("id", id);
  if (error) throw error;
}
async function deleteLesson(id) {
  const { error } = await c.from("course_lessons").delete().eq("id", id);
  if (error) throw error;
}
async function reorderSections(items) {
  await Promise.all(items.map((it) => c.from("course_sections").update({ position: it.position }).eq("id", it.id)));
}
async function reorderLessons(items) {
  await Promise.all(
    items.map(
      (it) => c.from("course_lessons").update({ position: it.position, section_id: it.section_id }).eq("id", it.id)
    )
  );
}
export {
  getCourseFull as a,
  updateLesson as b,
  createDraft as c,
  deleteLesson as d,
  addLesson as e,
  deleteSection as f,
  getCourseBySlug as g,
  updateSection as h,
  reorderSections as i,
  addSection as j,
  reorderLessons as r,
  updateCourse as u
};
