import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PWHeader } from "../pathwise/Header";
import { useAuth } from "../pathwise/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  CourseRow,
  CourseStatus,
  LessonResource,
  LessonRow,
  SectionRow,
  addLesson,
  addSection,
  deleteLesson,
  deleteSection,
  getCourseFull,
  reorderLessons,
  reorderSections,
  updateCourse,
  updateLesson,
  updateSection,
} from "../pathwise/courses";

export const Route = createFileRoute("/tutor/courses/$courseId/edit")({
  head: () => ({ meta: [{ title: "Edit Course — PathWise" }] }),
  component: CourseEditor,
});

const STEPS = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Content" },
  { id: 3, label: "Description" },
  { id: 4, label: "Pricing" },
  { id: 5, label: "Review & Publish" },
];

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const LANGUAGES = ["English", "Romanian", "Russian", "Spanish", "French", "German", "Mandarin"];
const AUDIENCES = ["Students", "Professionals", "Hobbyists", "Career Changers"];

function CourseEditor() {
  const { courseId } = useParams({ from: "/tutor/courses/$courseId/edit" });
  const { supabaseUser, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [course, setCourse] = useState<CourseRow | null>(null);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; category: string | null }[]>([]);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const courseRef = useRef<CourseRow | null>(null);

  // Hydrate
  useEffect(() => {
    if (loading) return;
    if (!supabaseUser) {
      navigate({ to: "/" });
      return;
    }
    (async () => {
      try {
        const full = await getCourseFull(courseId);
        if (!full.course) {
          toast.error("Course not found");
          navigate({ to: "/tutor/courses" });
          return;
        }
        if (full.course.tutor_id !== supabaseUser.id) {
          toast.error("Not authorized");
          navigate({ to: "/tutor/courses" });
          return;
        }
        // Try local draft (newer)
        const local = localStorage.getItem(`course-draft-${courseId}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed && parsed.savedAt && parsed.savedAt > new Date(full.course.updated_at).getTime()) {
              setCourse({ ...full.course, ...parsed.course });
            } else {
              setCourse(full.course);
            }
          } catch {
            setCourse(full.course);
          }
        } else {
          setCourse(full.course);
        }
        setSections(full.sections);
        setLessons(full.lessons);
      } catch (e: any) {
        toast.error(e.message ?? "Failed to load");
      }
    })();
    (supabase as any).from("subjects").select("*").then(({ data }: any) => setSubjects(data ?? []));
  }, [courseId, supabaseUser, loading, navigate]);

  // Track latest course
  useEffect(() => {
    courseRef.current = course;
  }, [course]);

  const patchCourse = useCallback(
    (p: Partial<CourseRow>) => {
      setCourse((c) => (c ? { ...c, ...p } : c));
      setDirty(true);
      dirtyRef.current = true;
    },
    []
  );

  // Mirror to localStorage
  useEffect(() => {
    if (!course) return;
    localStorage.setItem(
      `course-draft-${courseId}`,
      JSON.stringify({ savedAt: Date.now(), course })
    );
  }, [course, courseId]);

  const saveNow = useCallback(async () => {
    const c = courseRef.current;
    if (!c) return;
    if (!dirtyRef.current) return;
    setSaving(true);
    try {
      const { id, tutor_id, created_at, updated_at, ...patch } = c;
      await updateCourse(id, patch);
      setSavedAt(Date.now());
      setDirty(false);
      dirtyRef.current = false;
    } catch (e: any) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }, []);

  // Auto-save every 30s
  useEffect(() => {
    const t = setInterval(() => {
      if (dirtyRef.current) saveNow();
    }, 30000);
    return () => clearInterval(t);
  }, [saveNow]);

  if (!course) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)]">
        <PWHeader />
        <div className="grid place-items-center py-32 text-[var(--pw-ink-2)]">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </div>
    );
  }

  const validation = validateCourse(course, sections, lessons);

  const goPublishReview = async () => {
    await saveNow();
    if (!validation.ok) {
      toast.error("Complete the checklist before submitting");
      return;
    }
    try {
      await updateCourse(course.id, { status: "under_review" });
      patchCourse({ status: "under_review" });
      toast.success("Submitted for review");
    } catch (e: any) {
      toast.error(e.message ?? "Submission failed");
    }
  };

  const saveDraft = async () => {
    await saveNow();
    toast.success("Draft saved");
  };

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />
      <main className="max-w-5xl mx-auto px-5 sm:px-8 pb-20">
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link to="/tutor/courses" className="text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] inline-flex items-center gap-1">
            <ArrowLeft className="size-3.5" /> All courses
          </Link>
          <div className="text-[12px] text-[var(--pw-ink-2)] flex items-center gap-2">
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving…
              </>
            ) : dirty ? (
              <>Unsaved changes</>
            ) : savedAt ? (
              <>
                <Check className="size-3.5 text-[var(--pw-accent-2)]" /> Saved
              </>
            ) : null}
          </div>
        </div>

        {/* Stepper / progress */}
        <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md p-4 mb-5">
          <div className="h-1.5 rounded-full bg-[var(--pw-surface-2)] overflow-hidden mb-3">
            <div
              className="h-full bg-[var(--pw-accent)] transition-all"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-1 overflow-x-auto">
            {STEPS.map((s) => {
              const active = s.id === step;
              const done = s.id < step;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`flex-1 min-w-[110px] text-left text-[12px] px-2 py-1 rounded-md transition-colors ${
                    active
                      ? "text-[var(--pw-accent)] font-medium"
                      : done
                      ? "text-[var(--pw-ink)]"
                      : "text-[var(--pw-ink-2)]"
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wide opacity-70">Step {s.id}</div>
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {step === 1 && <Step1Basic course={course} patch={patchCourse} subjects={subjects} userId={supabaseUser!.id} />}
        {step === 2 && (
          <Step2Content
            course={course}
            sections={sections}
            lessons={lessons}
            setSections={setSections}
            setLessons={setLessons}
            userId={supabaseUser!.id}
          />
        )}
        {step === 3 && <Step3Description course={course} patch={patchCourse} />}
        {step === 4 && <Step4Pricing course={course} patch={patchCourse} />}
        {step === 5 && (
          <Step5Review
            course={course}
            sections={sections}
            lessons={lessons}
            validation={validation}
            onSaveDraft={saveDraft}
            onSubmit={goPublishReview}
          />
        )}

        {/* Footer nav */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            <ArrowLeft className="size-4" /> Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={saveNow} disabled={!dirty}>
              <Save className="size-4" /> Save
            </Button>
            {step < STEPS.length ? (
              <Button onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}>
                Next <ArrowRight className="size-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------- Step 1 ---------- */

function Step1Basic({
  course,
  patch,
  subjects,
  userId,
}: {
  course: CourseRow;
  patch: (p: Partial<CourseRow>) => void;
  subjects: { id: string; name: string; category: string | null }[];
  userId: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleUpload(f);
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Image required");
      return;
    }
    setUploading(true);
    try {
      const path = `${userId}/courses/${course.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("course-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("course-assets").getPublicUrl(path);
      patch({ thumbnail_url: data.publicUrl });
      toast.success("Thumbnail uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    const cur = course.subcategory_tags ?? [];
    if (cur.includes(t)) return;
    patch({ subcategory_tags: [...cur, t] });
    setTagDraft("");
  };

  return (
    <Panel title="Basic Info" subtitle="The essentials students see first.">
      <Field label="Course title" hint={`${(course.title ?? "").length}/120`}>
        <Input
          value={course.title}
          maxLength={120}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Master Python in 6 weeks"
        />
      </Field>
      <Field label="Subtitle (hook)" hint={`${(course.subtitle ?? "").length}/80`}>
        <Input
          value={course.subtitle ?? ""}
          maxLength={80}
          onChange={(e) => patch({ subtitle: e.target.value })}
          placeholder="A short, punchy line that sells the course"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Category">
          <select
            className="h-9 w-full rounded-md border border-[var(--pw-border)] bg-transparent px-3 text-sm"
            value={course.category ?? ""}
            onChange={(e) => patch({ category: e.target.value })}
          >
            <option value="">Choose…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Language of instruction">
          <select
            className="h-9 w-full rounded-md border border-[var(--pw-border)] bg-transparent px-3 text-sm"
            value={course.language ?? ""}
            onChange={(e) => patch({ language: e.target.value })}
          >
            <option value="">Choose…</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Subcategory tags" hint="e.g. Python, React, Calculus">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(course.subcategory_tags ?? []).map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-full bg-[var(--pw-surface-2)] border border-[var(--pw-border)]">
              {t}
              <button
                onClick={() => patch({ subcategory_tags: (course.subcategory_tags ?? []).filter((x) => x !== t) })}
                className="text-[var(--pw-ink-2)] hover:text-[var(--pw-danger)]"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add tag and press Enter"
          />
          <Button type="button" variant="outline" onClick={addTag}>
            <Plus className="size-4" />
          </Button>
        </div>
      </Field>

      <Field label="Difficulty level">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DIFFICULTIES.map((d) => {
            const active = course.difficulty === d;
            return (
              <button
                key={d}
                onClick={() => patch({ difficulty: d })}
                className={`px-3 py-2 rounded-md border text-[13px] transition-colors ${
                  active
                    ? "border-[var(--pw-accent)] bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]"
                    : "border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)]"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Course thumbnail (16:9)">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="aspect-[16/9] rounded-lg border-2 border-dashed border-[var(--pw-border)] bg-[var(--pw-surface-2)] grid place-items-center relative overflow-hidden"
        >
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="text-center text-[var(--pw-ink-2)]">
              <Upload className="size-8 mx-auto mb-2 opacity-50" />
              <div className="text-[13px]">Drag & drop or pick a file</div>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/30 grid place-items-center text-white">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
        </div>
      </Field>
    </Panel>
  );
}

/* ---------- Step 2 ---------- */

function Step2Content({
  course,
  sections,
  lessons,
  setSections,
  setLessons,
  userId,
}: {
  course: CourseRow;
  sections: SectionRow[];
  lessons: LessonRow[];
  setSections: React.Dispatch<React.SetStateAction<SectionRow[]>>;
  setLessons: React.Dispatch<React.SetStateAction<LessonRow[]>>;
  userId: string;
}) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const totalDuration = useMemo(() => lessons.reduce((s, l) => s + (l.duration_minutes ?? 0), 0), [lessons]);

  const handleAddSection = async () => {
    try {
      const sec = await addSection(course.id, sections.length);
      setSections((s) => [...s, sec]);
    } catch (e: any) {
      toast.error(e.message ?? "Add section failed");
    }
  };

  const handleSectionDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const next = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, position: i }));
    setSections(next);
    await reorderSections(next.map((s) => ({ id: s.id, position: s.position }))).catch((err) =>
      toast.error(err.message ?? "Reorder failed")
    );
  };

  return (
    <Panel
      title="Course Content"
      subtitle={`${sections.length} sections · ${lessons.length} lessons · ${totalDuration} min total`}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sections.map((sec) => (
              <SectionCard
                key={sec.id}
                section={sec}
                lessons={lessons.filter((l) => l.section_id === sec.id).sort((a, b) => a.position - b.position)}
                onUpdate={(patch) => {
                  setSections((arr) => arr.map((s) => (s.id === sec.id ? { ...s, ...patch } : s)));
                  updateSection(sec.id, patch).catch((e) => toast.error(e.message));
                }}
                onDelete={async () => {
                  await deleteSection(sec.id).catch((e) => toast.error(e.message));
                  setSections((arr) => arr.filter((s) => s.id !== sec.id));
                  setLessons((arr) => arr.filter((l) => l.section_id !== sec.id));
                }}
                onAddLesson={async () => {
                  const lessonsInSec = lessons.filter((l) => l.section_id === sec.id);
                  try {
                    const l = await addLesson(course.id, sec.id, lessonsInSec.length);
                    setLessons((arr) => [...arr, l]);
                  } catch (e: any) {
                    toast.error(e.message);
                  }
                }}
                onLessonUpdate={(id, patch) => {
                  setLessons((arr) => arr.map((l) => (l.id === id ? { ...l, ...patch } : l)));
                  updateLesson(id, patch).catch((e) => toast.error(e.message));
                }}
                onLessonDelete={async (id) => {
                  await deleteLesson(id).catch((e) => toast.error(e.message));
                  setLessons((arr) => arr.filter((l) => l.id !== id));
                }}
                onLessonsReorder={async (next) => {
                  setLessons((arr) => {
                    const others = arr.filter((l) => l.section_id !== sec.id);
                    return [...others, ...next];
                  });
                  await reorderLessons(
                    next.map((l) => ({ id: l.id, position: l.position, section_id: l.section_id }))
                  ).catch((e) => toast.error(e.message));
                }}
                userId={userId}
                courseId={course.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="outline" onClick={handleAddSection} className="mt-4">
        <Plus className="size-4" /> Add Section
      </Button>
    </Panel>
  );
}

function SectionCard({
  section,
  lessons,
  onUpdate,
  onDelete,
  onAddLesson,
  onLessonUpdate,
  onLessonDelete,
  onLessonsReorder,
  userId,
  courseId,
}: {
  section: SectionRow;
  lessons: LessonRow[];
  onUpdate: (p: Partial<SectionRow>) => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onLessonUpdate: (id: string, p: Partial<LessonRow>) => void;
  onLessonDelete: (id: string) => void;
  onLessonsReorder: (next: LessonRow[]) => void;
  userId: string;
  courseId: string;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const onLessonDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    const next = arrayMove(lessons, oldIndex, newIndex).map((l, i) => ({ ...l, position: i }));
    onLessonsReorder(next);
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <button {...attributes} {...listeners} className="cursor-grab text-[var(--pw-ink-2)] touch-none">
          <GripVertical className="size-4" />
        </button>
        <Input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="font-medium"
        />
        <button onClick={onDelete} className="text-[var(--pw-danger)] p-1.5 rounded hover:bg-[var(--pw-danger)]/10">
          <Trash2 className="size-4" />
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onLessonDragEnd}>
        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 ml-6">
            {lessons.map((l) => (
              <LessonCard
                key={l.id}
                lesson={l}
                onUpdate={(p) => onLessonUpdate(l.id, p)}
                onDelete={() => onLessonDelete(l.id)}
                userId={userId}
                courseId={courseId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="ml-6 mt-2">
        <Button variant="outline" size="sm" onClick={onAddLesson}>
          <Plus className="size-3.5" /> Add lesson
        </Button>
      </div>
    </div>
  );
}

function LessonCard({
  lesson,
  onUpdate,
  onDelete,
  userId,
  courseId,
}: {
  lesson: LessonRow;
  onUpdate: (p: Partial<LessonRow>) => void;
  onDelete: () => void;
  userId: string;
  courseId: string;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    try {
      const path = `${userId}/courses/${courseId}/${lesson.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("course-assets").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("course-assets").getPublicUrl(path);
      onUpdate({ video_url: data.publicUrl });
      toast.success("Video uploaded");
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const updateResource = (i: number, p: Partial<LessonResource>) => {
    const next = lesson.resources.map((r, idx) => (idx === i ? { ...r, ...p } : r));
    onUpdate({ resources: next });
  };
  const addResource = () => onUpdate({ resources: [...lesson.resources, { type: "link", label: "", value: "" }] });
  const removeResource = (i: number) => onUpdate({ resources: lesson.resources.filter((_, idx) => idx !== i) });

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg)]">
      <div className="flex items-center gap-2 p-2">
        <button {...attributes} {...listeners} className="cursor-grab text-[var(--pw-ink-2)] touch-none">
          <GripVertical className="size-3.5" />
        </button>
        <Input value={lesson.title} onChange={(e) => onUpdate({ title: e.target.value })} className="text-[13px] h-8" />
        <Input
          type="number"
          min={0}
          value={lesson.duration_minutes}
          onChange={(e) => onUpdate({ duration_minutes: Number(e.target.value) || 0 })}
          className="w-20 text-[13px] h-8"
          placeholder="min"
        />
        <button onClick={() => setOpen(!open)} className="text-[var(--pw-ink-2)] p-1">
          {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
        <button onClick={onDelete} className="text-[var(--pw-danger)] p-1 hover:bg-[var(--pw-danger)]/10 rounded">
          <Trash2 className="size-3.5" />
        </button>
      </div>
      {open && (
        <div className="p-3 pt-0 space-y-3 border-t border-[var(--pw-border)]">
          <Textarea
            value={lesson.description ?? ""}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Lesson description"
            rows={2}
          />
          <div className="flex items-center gap-2">
            <Input
              value={lesson.video_url ?? ""}
              onChange={(e) => onUpdate({ video_url: e.target.value })}
              placeholder="Video URL or upload"
              className="text-[13px] h-8"
            />
            <label className="inline-flex items-center gap-1 text-[12px] cursor-pointer px-2 py-1.5 rounded border border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)]">
              {uploading ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
              Upload
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-[13px]">
            <Switch
              checked={lesson.is_free_preview}
              onCheckedChange={(v) => onUpdate({ is_free_preview: v })}
            />
            Free preview
          </label>
          <div>
            <div className="text-[12px] font-medium mb-1.5">Resources</div>
            {lesson.resources.map((r, i) => (
              <div key={i} className="flex gap-1.5 mb-1.5">
                <select
                  value={r.type}
                  onChange={(e) => updateResource(i, { type: e.target.value as any })}
                  className="h-8 rounded border border-[var(--pw-border)] bg-transparent text-[12px] px-2"
                >
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="snippet">Snippet</option>
                </select>
                <Input value={r.label} onChange={(e) => updateResource(i, { label: e.target.value })} placeholder="Label" className="h-8 text-[12px]" />
                <Input value={r.value} onChange={(e) => updateResource(i, { value: e.target.value })} placeholder="URL or text" className="h-8 text-[12px]" />
                <button onClick={() => removeResource(i)} className="text-[var(--pw-danger)] p-1">
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addResource}>
              <Plus className="size-3" /> Resource
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Step 3 ---------- */

function Step3Description({ course, patch }: { course: CourseRow; patch: (p: Partial<CourseRow>) => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [prereq, setPrereq] = useState("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (course.description ?? "")) {
      editorRef.current.innerHTML = course.description ?? "";
    }
  }, [course.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (cmd: string) => {
    document.execCommand(cmd, false);
    if (editorRef.current) patch({ description: editorRef.current.innerHTML });
  };

  const outcomes = course.learning_outcomes ?? [];
  const setOutcome = (i: number, v: string) => {
    const next = [...outcomes];
    next[i] = v;
    patch({ learning_outcomes: next });
  };

  const audience = course.target_audience ?? [];
  const toggleAudience = (a: string) =>
    patch({ target_audience: audience.includes(a) ? audience.filter((x) => x !== a) : [...audience, a] });

  return (
    <Panel title="Description & Details" subtitle="Tell students what they'll get out of it.">
      <Field label="Course description">
        <div className="rounded-md border border-[var(--pw-border)] bg-[var(--pw-surface)]">
          <div className="flex gap-1 p-1.5 border-b border-[var(--pw-border)]">
            <ToolBtn onClick={() => exec("bold")}><Bold className="size-3.5" /></ToolBtn>
            <ToolBtn onClick={() => exec("italic")}><Italic className="size-3.5" /></ToolBtn>
            <ToolBtn onClick={() => exec("formatBlock")}>
              <span className="text-[11px] font-bold">H2</span>
            </ToolBtn>
            <ToolBtn onClick={() => exec("insertUnorderedList")}><List className="size-3.5" /></ToolBtn>
            <ToolBtn onClick={() => exec("insertOrderedList")}><ListOrdered className="size-3.5" /></ToolBtn>
          </div>
          <div
            ref={editorRef}
            contentEditable
            onInput={(e) => patch({ description: (e.target as HTMLDivElement).innerHTML })}
            className="min-h-[150px] p-3 text-[14px] focus:outline-none prose prose-sm max-w-none"
            suppressContentEditableWarning
          />
        </div>
      </Field>

      <Field label={`What you'll learn (${outcomes.filter(Boolean).length}/3 min, 10 max)`}>
        <div className="space-y-2">
          {outcomes.map((o, i) => (
            <div key={i} className="flex gap-2">
              <Input value={o} onChange={(e) => setOutcome(i, e.target.value)} placeholder={`Outcome ${i + 1}`} />
              <button
                onClick={() => patch({ learning_outcomes: outcomes.filter((_, idx) => idx !== i) })}
                className="text-[var(--pw-danger)] p-2"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {outcomes.length < 10 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => patch({ learning_outcomes: [...outcomes, ""] })}
            >
              <Plus className="size-3.5" /> Add outcome
            </Button>
          )}
        </div>
      </Field>

      <Field label="Prerequisites">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {(course.prerequisites ?? []).map((p) => (
            <span key={p} className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-full bg-[var(--pw-surface-2)] border border-[var(--pw-border)]">
              {p}
              <button onClick={() => patch({ prerequisites: (course.prerequisites ?? []).filter((x) => x !== p) })}>
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={prereq}
            onChange={(e) => setPrereq(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const t = prereq.trim();
                if (t && !(course.prerequisites ?? []).includes(t)) {
                  patch({ prerequisites: [...(course.prerequisites ?? []), t] });
                  setPrereq("");
                }
              }
            }}
            placeholder='e.g. "Basic JavaScript"'
          />
        </div>
      </Field>

      <Field label="Target audience">
        <div className="flex flex-wrap gap-2">
          {AUDIENCES.map((a) => {
            const on = audience.includes(a);
            return (
              <button
                key={a}
                onClick={() => toggleAudience(a)}
                className={`px-3 py-1.5 rounded-full border text-[12px] ${
                  on
                    ? "border-[var(--pw-accent)] bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]"
                    : "border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)]"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Estimated completion (weeks)">
        <Input
          type="number"
          min={1}
          value={course.estimated_weeks ?? ""}
          onChange={(e) => patch({ estimated_weeks: Number(e.target.value) || null })}
          className="max-w-[120px]"
        />
      </Field>
    </Panel>
  );
}

function ToolBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="px-2 py-1 rounded hover:bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)]"
    >
      {children}
    </button>
  );
}

/* ---------- Step 4 ---------- */

function Step4Pricing({ course, patch }: { course: CourseRow; patch: (p: Partial<CourseRow>) => void }) {
  return (
    <Panel title="Pricing & Settings" subtitle="Set price, discounts, certificate and SEO.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Price">
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              value={course.price ?? ""}
              onChange={(e) => patch({ price: e.target.value === "" ? null : Number(e.target.value) })}
              placeholder="0"
            />
            <select
              className="h-9 rounded-md border border-[var(--pw-border)] bg-transparent px-3 text-sm"
              value={course.currency}
              onChange={(e) => patch({ currency: e.target.value })}
            >
              <option value="MDL">MDL</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </Field>
        <Field label="Discount price (optional)">
          <Input
            type="number"
            min={0}
            value={course.discount_price ?? ""}
            onChange={(e) => patch({ discount_price: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </Field>
      </div>

      <Field label="Discount expiry">
        <Input
          type="datetime-local"
          value={course.discount_expiry ? course.discount_expiry.slice(0, 16) : ""}
          onChange={(e) => patch({ discount_expiry: e.target.value ? new Date(e.target.value).toISOString() : null })}
          className="max-w-[260px]"
        />
      </Field>

      <label className="flex items-center gap-3 text-[14px]">
        <Switch
          checked={course.certificate_enabled}
          onCheckedChange={(v) => patch({ certificate_enabled: v })}
        />
        Issue a certificate of completion
      </label>

      <div className="border-t border-[var(--pw-border)] pt-4 mt-2 space-y-4">
        <h3 className="font-medium text-[14px]">SEO</h3>
        <Field label="Meta title">
          <Input value={course.seo_title ?? ""} onChange={(e) => patch({ seo_title: e.target.value })} />
        </Field>
        <Field label="Meta description">
          <Textarea
            rows={2}
            value={course.seo_description ?? ""}
            onChange={(e) => patch({ seo_description: e.target.value })}
          />
        </Field>
        <Field label="URL slug">
          <Input value={course.slug ?? ""} onChange={(e) => patch({ slug: e.target.value })} />
        </Field>
      </div>
    </Panel>
  );
}

/* ---------- Step 5 ---------- */

function validateCourse(course: CourseRow, sections: SectionRow[], lessons: LessonRow[]) {
  const checks = [
    { ok: !!course.title?.trim(), label: "Title" },
    { ok: !!course.category, label: "Category" },
    { ok: !!course.thumbnail_url, label: "Thumbnail" },
    { ok: !!course.description?.trim(), label: "Description" },
    { ok: (course.learning_outcomes ?? []).filter(Boolean).length >= 3, label: "≥ 3 learning outcomes" },
    { ok: course.price != null, label: "Price set" },
    {
      ok: sections.length >= 1 && sections.some((s) => lessons.some((l) => l.section_id === s.id)),
      label: "≥ 1 section with ≥ 1 lesson",
    },
  ];
  return { ok: checks.every((c) => c.ok), checks };
}

function Step5Review({
  course,
  sections,
  lessons,
  validation,
  onSaveDraft,
  onSubmit,
}: {
  course: CourseRow;
  sections: SectionRow[];
  lessons: LessonRow[];
  validation: ReturnType<typeof validateCourse>;
  onSaveDraft: () => void;
  onSubmit: () => void;
}) {
  return (
    <Panel title="Review & Publish" subtitle="See exactly what students will see.">
      <div className="rounded-xl border border-[var(--pw-border)] overflow-hidden">
        {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="w-full aspect-[16/9] object-cover" />}
        <div className="p-5">
          <h2 className="font-display text-2xl">{course.title}</h2>
          {course.subtitle && <p className="text-[var(--pw-ink-2)] mt-1">{course.subtitle}</p>}
          <div className="flex flex-wrap gap-2 mt-3 text-[12px]">
            {course.category && <span className="pw-pill px-2 py-0.5 border border-[var(--pw-border)]">{course.category}</span>}
            {course.difficulty && <span className="pw-pill px-2 py-0.5 border border-[var(--pw-border)]">{course.difficulty}</span>}
            {course.language && <span className="pw-pill px-2 py-0.5 border border-[var(--pw-border)]">{course.language}</span>}
          </div>
          {course.description && (
            <div
              className="prose prose-sm max-w-none mt-4"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          )}
          {(course.learning_outcomes ?? []).length > 0 && (
            <>
              <h3 className="font-medium mt-4 mb-2">What you'll learn</h3>
              <ul className="space-y-1 text-[13px]">
                {(course.learning_outcomes ?? []).filter(Boolean).map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="size-4 text-[var(--pw-accent-2)] mt-0.5" /> {o}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h3 className="font-medium mt-4 mb-2">Curriculum</h3>
          <div className="space-y-2">
            {sections.map((s) => (
              <div key={s.id} className="border border-[var(--pw-border)] rounded">
                <div className="px-3 py-2 bg-[var(--pw-surface-2)] text-[13px] font-medium">{s.title}</div>
                <ul className="text-[13px]">
                  {lessons
                    .filter((l) => l.section_id === s.id)
                    .map((l) => (
                      <li key={l.id} className="px-3 py-1.5 flex justify-between border-t border-[var(--pw-border)]">
                        <span>
                          {l.title} {l.is_free_preview && <span className="ml-1 text-[10px] text-[var(--pw-accent)]">PREVIEW</span>}
                        </span>
                        <span className="text-[var(--pw-ink-2)]">{l.duration_minutes} min</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--pw-border)] p-4 mt-4">
        <h3 className="font-medium mb-2">Publish checklist</h3>
        <ul className="space-y-1 text-[13px]">
          {validation.checks.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              {c.ok ? (
                <Check className="size-4 text-[var(--pw-accent-2)]" />
              ) : (
                <X className="size-4 text-[var(--pw-danger)]" />
              )}
              {c.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={onSaveDraft}>
          Save as Draft
        </Button>
        <Button onClick={onSubmit} disabled={!validation.ok || course.status === "under_review"}>
          {course.status === "under_review" ? "Already submitted" : "Submit for Review"}
        </Button>
      </div>
    </Panel>
  );
}

/* ---------- shared ---------- */

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md p-6 space-y-5">
      <div>
        <h2 className="font-display text-xl">{title}</h2>
        {subtitle && <p className="text-[13px] text-[var(--pw-ink-2)] mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium">{label}</label>
        {hint && <span className="text-[11px] text-[var(--pw-ink-2)]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
