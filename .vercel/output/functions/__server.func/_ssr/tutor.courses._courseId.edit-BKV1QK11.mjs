import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { g as useParams, d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as useSensors, d as useSensor, D as DndContext, e as closestCenter, T as TouchSensor, P as PointerSensor } from "../_libs/dnd-kit__core.mjs";
import { S as SortableContext, v as verticalListSortingStrategy, a as arrayMove, u as useSortable } from "../_libs/dnd-kit__sortable.mjs";
import { C as CSS } from "../_libs/dnd-kit__utilities.mjs";
import { u as useAuth, s as supabase, P as PWHeader, B as Button, k as cn } from "./router-C4GolrgT.mjs";
import { T as Textarea } from "./textarea-Cm0GRVr4.mjs";
import { S as Switch$1, a as SwitchThumb } from "../_libs/radix-ui__react-switch.mjs";
import { a as getCourseFull, u as updateCourse, r as reorderLessons, d as deleteLesson, b as updateLesson, e as addLesson, f as deleteSection, h as updateSection, i as reorderSections, j as addSection } from "./courses-Cd8L0VyP.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { O as LoaderCircle, W as ArrowLeft, e as Check, c as Save, Y as ArrowRight, X, P as Plus, U as Upload, Z as Bold, _ as Italic, $ as List, a0 as ListOrdered, a1 as GripVertical, T as Trash2, a2 as ChevronUp, K as ChevronDown } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__zod-adapter.mjs";
import "../_libs/zod.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-scroll-area.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/date-fns.mjs";
import "../_libs/date-fns-tz.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Switch$1,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchThumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Switch$1.displayName;
const STEPS = [{
  id: 1,
  label: "Basic Info"
}, {
  id: 2,
  label: "Content"
}, {
  id: 3,
  label: "Description"
}, {
  id: 4,
  label: "Pricing"
}, {
  id: 5,
  label: "Review & Publish"
}];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const LANGUAGES = ["English", "Romanian", "Russian", "Spanish", "French", "German", "Mandarin"];
const AUDIENCES = ["Students", "Professionals", "Hobbyists", "Career Changers"];
function CourseEditor() {
  const {
    courseId
  } = useParams({
    from: "/tutor/courses/$courseId/edit"
  });
  const {
    supabaseUser,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(1);
  const [course, setCourse] = reactExports.useState(null);
  const [sections, setSections] = reactExports.useState([]);
  const [lessons, setLessons] = reactExports.useState([]);
  const [subjects, setSubjects] = reactExports.useState([]);
  const [savedAt, setSavedAt] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const [dirty, setDirty] = reactExports.useState(false);
  const dirtyRef = reactExports.useRef(false);
  const courseRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (loading) return;
    if (!supabaseUser) {
      navigate({
        to: "/"
      });
      return;
    }
    (async () => {
      try {
        const full = await getCourseFull(courseId);
        if (!full.course) {
          toast.error("Course not found");
          navigate({
            to: "/tutor/courses"
          });
          return;
        }
        if (full.course.tutor_id !== supabaseUser.id) {
          toast.error("Not authorized");
          navigate({
            to: "/tutor/courses"
          });
          return;
        }
        const local = localStorage.getItem(`course-draft-${courseId}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed && parsed.savedAt && parsed.savedAt > new Date(full.course.updated_at).getTime()) {
              setCourse({
                ...full.course,
                ...parsed.course
              });
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
      } catch (e) {
        toast.error(e.message ?? "Failed to load");
      }
    })();
    supabase.from("subjects").select("*").then(({
      data
    }) => setSubjects(data ?? []));
  }, [courseId, supabaseUser, loading, navigate]);
  reactExports.useEffect(() => {
    courseRef.current = course;
  }, [course]);
  const patchCourse = reactExports.useCallback((p) => {
    setCourse((c) => c ? {
      ...c,
      ...p
    } : c);
    setDirty(true);
    dirtyRef.current = true;
  }, []);
  reactExports.useEffect(() => {
    if (!course) return;
    localStorage.setItem(`course-draft-${courseId}`, JSON.stringify({
      savedAt: Date.now(),
      course
    }));
  }, [course, courseId]);
  const saveNow = reactExports.useCallback(async () => {
    const c = courseRef.current;
    if (!c) return;
    if (!dirtyRef.current) return;
    setSaving(true);
    try {
      const {
        id,
        tutor_id,
        created_at,
        updated_at,
        ...patch
      } = c;
      await updateCourse(id, patch);
      setSavedAt(Date.now());
      setDirty(false);
      dirtyRef.current = false;
    } catch (e) {
      toast.error(e.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }, []);
  reactExports.useEffect(() => {
    const t = setInterval(() => {
      if (dirtyRef.current) saveNow();
    }, 3e4);
    return () => clearInterval(t);
  }, [saveNow]);
  if (!course) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-items-center py-32 text-[var(--pw-ink-2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin" }) })
    ] });
  }
  const validation = validateCourse(course, sections, lessons);
  const goPublishReview = async () => {
    await saveNow();
    if (!validation.ok) {
      toast.error("Complete the checklist before submitting");
      return;
    }
    try {
      await updateCourse(course.id, {
        status: "under_review"
      });
      patchCourse({
        status: "under_review"
      });
      toast.success("Submitted for review");
    } catch (e) {
      toast.error(e.message ?? "Submission failed");
    }
  };
  const saveDraft = async () => {
    await saveNow();
    toast.success("Draft saved");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-5xl mx-auto px-5 sm:px-8 pb-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/tutor/courses", className: "text-[13px] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)] inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-3.5" }),
          " All courses"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)] flex items-center gap-2", children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3.5 animate-spin" }),
          " Saving…"
        ] }) : dirty ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Unsaved changes" }) : savedAt ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5 text-[var(--pw-accent-2)]" }),
          " Saved"
        ] }) : null })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md p-4 mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-[var(--pw-surface-2)] overflow-hidden mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-[var(--pw-accent)] transition-all", style: {
          width: `${step / STEPS.length * 100}%`
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-1 overflow-x-auto", children: STEPS.map((s) => {
          const active = s.id === step;
          const done = s.id < step;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setStep(s.id), className: `flex-1 min-w-[110px] text-left text-[12px] px-2 py-1 rounded-md transition-colors ${active ? "text-[var(--pw-accent)] font-medium" : done ? "text-[var(--pw-ink)]" : "text-[var(--pw-ink-2)]"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] uppercase tracking-wide opacity-70", children: [
              "Step ",
              s.id
            ] }),
            s.label
          ] }, s.id);
        }) })
      ] }),
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step1Basic, { course, patch: patchCourse, subjects, userId: supabaseUser.id }),
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step2Content, { course, sections, lessons, setSections, setLessons, userId: supabaseUser.id }),
      step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step3Description, { course, patch: patchCourse }),
      step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step4Pricing, { course, patch: patchCourse }),
      step === 5 && /* @__PURE__ */ jsxRuntimeExports.jsx(Step5Review, { course, sections, lessons, validation, onSaveDraft: saveDraft, onSubmit: goPublishReview }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setStep((s) => Math.max(1, s - 1)), disabled: step === 1, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
          " Back"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: saveNow, disabled: !dirty, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4" }),
            " Save"
          ] }),
          step < STEPS.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setStep((s) => Math.min(STEPS.length, s + 1)), children: [
            "Next ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
          ] }) : null
        ] })
      ] })
    ] })
  ] });
}
function Step1Basic({
  course,
  patch,
  subjects,
  userId
}) {
  const [uploading, setUploading] = reactExports.useState(false);
  const [tagDraft, setTagDraft] = reactExports.useState("");
  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleUpload(f);
  };
  const handleUpload = async (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Image required");
      return;
    }
    setUploading(true);
    try {
      const path = `${userId}/courses/${course.id}/${Date.now()}-${file.name}`;
      const {
        error
      } = await supabase.storage.from("course-assets").upload(path, file, {
        upsert: true
      });
      if (error) throw error;
      const {
        data
      } = supabase.storage.from("course-assets").getPublicUrl(path);
      patch({
        thumbnail_url: data.publicUrl
      });
      toast.success("Thumbnail uploaded");
    } catch (e) {
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
    patch({
      subcategory_tags: [...cur, t]
    });
    setTagDraft("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Basic Info", subtitle: "The essentials students see first.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Course title", hint: `${(course.title ?? "").length}/120`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: course.title, maxLength: 120, onChange: (e) => patch({
      title: e.target.value
    }), placeholder: "Master Python in 6 weeks" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Subtitle (hook)", hint: `${(course.subtitle ?? "").length}/80`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: course.subtitle ?? "", maxLength: 80, onChange: (e) => patch({
      subtitle: e.target.value
    }), placeholder: "A short, punchy line that sells the course" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-[var(--pw-border)] bg-transparent px-3 text-sm", value: course.category ?? "", onChange: (e) => patch({
        category: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choose…" }),
        subjects.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.name, children: s.name }, s.id))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Language of instruction", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 w-full rounded-md border border-[var(--pw-border)] bg-transparent px-3 text-sm", value: course.language ?? "", onChange: (e) => patch({
        language: e.target.value
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choose…" }),
        LANGUAGES.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: l, children: l }, l))
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Subcategory tags", hint: "e.g. Python, React, Calculus", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mb-2", children: (course.subcategory_tags ?? []).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-full bg-[var(--pw-surface-2)] border border-[var(--pw-border)]", children: [
        t,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => patch({
          subcategory_tags: (course.subcategory_tags ?? []).filter((x) => x !== t)
        }), className: "text-[var(--pw-ink-2)] hover:text-[var(--pw-danger)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }) })
      ] }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: tagDraft, onChange: (e) => setTagDraft(e.target.value), onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag();
          }
        }, placeholder: "Add tag and press Enter" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: addTag, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Difficulty level", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: DIFFICULTIES.map((d) => {
      const active = course.difficulty === d;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => patch({
        difficulty: d
      }), className: `px-3 py-2 rounded-md border text-[13px] transition-colors ${active ? "border-[var(--pw-accent)] bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]" : "border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)]"}`, children: d }, d);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Course thumbnail (16:9)", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onDragOver: (e) => e.preventDefault(), onDrop, className: "aspect-[16/9] rounded-lg border-2 border-dashed border-[var(--pw-border)] bg-[var(--pw-surface-2)] grid place-items-center relative overflow-hidden", children: [
      course.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: course.thumbnail_url, alt: "", className: "absolute inset-0 w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-[var(--pw-ink-2)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-8 mx-auto mb-2 opacity-50" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px]", children: "Drag & drop or pick a file" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", onChange: (e) => e.target.files?.[0] && handleUpload(e.target.files[0]), className: "absolute inset-0 opacity-0 cursor-pointer" }),
      uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/30 grid place-items-center text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin" }) })
    ] }) })
  ] });
}
function Step2Content({
  course,
  sections,
  lessons,
  setSections,
  setLessons,
  userId
}) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const totalDuration = reactExports.useMemo(() => lessons.reduce((s, l) => s + (l.duration_minutes ?? 0), 0), [lessons]);
  const handleAddSection = async () => {
    try {
      const sec = await addSection(course.id, sections.length);
      setSections((s) => [...s, sec]);
    } catch (e) {
      toast.error(e.message ?? "Add section failed");
    }
  };
  const handleSectionDragEnd = async (e) => {
    const {
      active,
      over
    } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const next = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
      ...s,
      position: i
    }));
    setSections(next);
    await reorderSections(next.map((s) => ({
      id: s.id,
      position: s.position
    }))).catch((err) => toast.error(err.message ?? "Reorder failed"));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Course Content", subtitle: `${sections.length} sections · ${lessons.length} lessons · ${totalDuration} min total`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: handleSectionDragEnd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SortableContext, { items: sections.map((s) => s.id), strategy: verticalListSortingStrategy, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: sections.map((sec) => /* @__PURE__ */ jsxRuntimeExports.jsx(SectionCard, { section: sec, lessons: lessons.filter((l) => l.section_id === sec.id).sort((a, b) => a.position - b.position), onUpdate: (patch) => {
      setSections((arr) => arr.map((s) => s.id === sec.id ? {
        ...s,
        ...patch
      } : s));
      updateSection(sec.id, patch).catch((e) => toast.error(e.message));
    }, onDelete: async () => {
      await deleteSection(sec.id).catch((e) => toast.error(e.message));
      setSections((arr) => arr.filter((s) => s.id !== sec.id));
      setLessons((arr) => arr.filter((l) => l.section_id !== sec.id));
    }, onAddLesson: async () => {
      const lessonsInSec = lessons.filter((l) => l.section_id === sec.id);
      try {
        const l = await addLesson(course.id, sec.id, lessonsInSec.length);
        setLessons((arr) => [...arr, l]);
      } catch (e) {
        toast.error(e.message);
      }
    }, onLessonUpdate: (id, patch) => {
      setLessons((arr) => arr.map((l) => l.id === id ? {
        ...l,
        ...patch
      } : l));
      updateLesson(id, patch).catch((e) => toast.error(e.message));
    }, onLessonDelete: async (id) => {
      await deleteLesson(id).catch((e) => toast.error(e.message));
      setLessons((arr) => arr.filter((l) => l.id !== id));
    }, onLessonsReorder: async (next) => {
      setLessons((arr) => {
        const others = arr.filter((l) => l.section_id !== sec.id);
        return [...others, ...next];
      });
      await reorderLessons(next.map((l) => ({
        id: l.id,
        position: l.position,
        section_id: l.section_id
      }))).catch((e) => toast.error(e.message));
    }, userId, courseId: course.id }, sec.id)) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: handleAddSection, className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
      " Add Section"
    ] })
  ] });
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
  courseId
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: section.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const onLessonDragEnd = (e) => {
    const {
      active,
      over
    } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    const next = arrayMove(lessons, oldIndex, newIndex).map((l, i) => ({
      ...l,
      position: i
    }));
    onLessonsReorder(next);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, style, className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { ...attributes, ...listeners, className: "cursor-grab text-[var(--pw-ink-2)] touch-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: section.title, onChange: (e) => onUpdate({
        title: e.target.value
      }), className: "font-medium" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onDelete, className: "text-[var(--pw-danger)] p-1.5 rounded hover:bg-[var(--pw-danger)]/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd: onLessonDragEnd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SortableContext, { items: lessons.map((l) => l.id), strategy: verticalListSortingStrategy, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 ml-6", children: lessons.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(LessonCard, { lesson: l, onUpdate: (p) => onLessonUpdate(l.id, p), onDelete: () => onLessonDelete(l.id), userId, courseId }, l.id)) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-6 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: onAddLesson, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }),
      " Add lesson"
    ] }) })
  ] });
}
function LessonCard({
  lesson,
  onUpdate,
  onDelete,
  userId,
  courseId
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: lesson.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };
  const [open, setOpen] = reactExports.useState(false);
  const [uploading, setUploading] = reactExports.useState(false);
  const handleVideoUpload = async (file) => {
    setUploading(true);
    try {
      const path = `${userId}/courses/${courseId}/${lesson.id}/${Date.now()}-${file.name}`;
      const {
        error
      } = await supabase.storage.from("course-assets").upload(path, file, {
        upsert: true
      });
      if (error) throw error;
      const {
        data
      } = supabase.storage.from("course-assets").getPublicUrl(path);
      onUpdate({
        video_url: data.publicUrl
      });
      toast.success("Video uploaded");
    } catch (e) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const updateResource = (i, p) => {
    const next = lesson.resources.map((r, idx) => idx === i ? {
      ...r,
      ...p
    } : r);
    onUpdate({
      resources: next
    });
  };
  const addResource = () => onUpdate({
    resources: [...lesson.resources, {
      type: "link",
      label: "",
      value: ""
    }]
  });
  const removeResource = (i) => onUpdate({
    resources: lesson.resources.filter((_, idx) => idx !== i)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, style, className: "rounded-lg border border-[var(--pw-border)] bg-[var(--pw-bg)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { ...attributes, ...listeners, className: "cursor-grab text-[var(--pw-ink-2)] touch-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "size-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: lesson.title, onChange: (e) => onUpdate({
        title: e.target.value
      }), className: "text-[13px] h-8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: lesson.duration_minutes, onChange: (e) => onUpdate({
        duration_minutes: Number(e.target.value) || 0
      }), className: "w-20 text-[13px] h-8", placeholder: "min" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpen(!open), className: "text-[var(--pw-ink-2)] p-1", children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onDelete, className: "text-[var(--pw-danger)] p-1 hover:bg-[var(--pw-danger)]/10 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3.5" }) })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 pt-0 space-y-3 border-t border-[var(--pw-border)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: lesson.description ?? "", onChange: (e) => onUpdate({
        description: e.target.value
      }), placeholder: "Lesson description", rows: 2 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: lesson.video_url ?? "", onChange: (e) => onUpdate({
          video_url: e.target.value
        }), placeholder: "Video URL or upload", className: "text-[13px] h-8" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex items-center gap-1 text-[12px] cursor-pointer px-2 py-1.5 rounded border border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)]", children: [
          uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-3" }),
          "Upload",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "video/*", className: "hidden", onChange: (e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0]) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-[13px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: lesson.is_free_preview, onCheckedChange: (v) => onUpdate({
          is_free_preview: v
        }) }),
        "Free preview"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] font-medium mb-1.5", children: "Resources" }),
        lesson.resources.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 mb-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: r.type, onChange: (e) => updateResource(i, {
            type: e.target.value
          }), className: "h-8 rounded border border-[var(--pw-border)] bg-transparent text-[12px] px-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "link", children: "Link" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pdf", children: "PDF" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "snippet", children: "Snippet" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.label, onChange: (e) => updateResource(i, {
            label: e.target.value
          }), placeholder: "Label", className: "h-8 text-[12px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: r.value, onChange: (e) => updateResource(i, {
            value: e.target.value
          }), placeholder: "URL or text", className: "h-8 text-[12px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeResource(i), className: "text-[var(--pw-danger)] p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3.5" }) })
        ] }, i)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: addResource, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3" }),
          " Resource"
        ] })
      ] })
    ] })
  ] });
}
function Step3Description({
  course,
  patch
}) {
  const editorRef = reactExports.useRef(null);
  const [prereq, setPrereq] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (course.description ?? "")) {
      editorRef.current.innerHTML = course.description ?? "";
    }
  }, [course.id]);
  const exec = (cmd) => {
    document.execCommand(cmd, false);
    if (editorRef.current) patch({
      description: editorRef.current.innerHTML
    });
  };
  const outcomes = course.learning_outcomes ?? [];
  const setOutcome = (i, v) => {
    const next = [...outcomes];
    next[i] = v;
    patch({
      learning_outcomes: next
    });
  };
  const audience = course.target_audience ?? [];
  const toggleAudience = (a) => patch({
    target_audience: audience.includes(a) ? audience.filter((x) => x !== a) : [...audience, a]
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Description & Details", subtitle: "Tell students what they'll get out of it.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Course description", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-[var(--pw-border)] bg-[var(--pw-surface)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 p-1.5 border-b border-[var(--pw-border)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBtn, { onClick: () => exec("bold"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bold, { className: "size-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBtn, { onClick: () => exec("italic"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Italic, { className: "size-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBtn, { onClick: () => exec("formatBlock"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold", children: "H2" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBtn, { onClick: () => exec("insertUnorderedList"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "size-3.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBtn, { onClick: () => exec("insertOrderedList"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListOrdered, { className: "size-3.5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: editorRef, contentEditable: true, onInput: (e) => patch({
        description: e.target.innerHTML
      }), className: "min-h-[150px] p-3 text-[14px] focus:outline-none prose prose-sm max-w-none", suppressContentEditableWarning: true })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `What you'll learn (${outcomes.filter(Boolean).length}/3 min, 10 max)`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      outcomes.map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: o, onChange: (e) => setOutcome(i, e.target.value), placeholder: `Outcome ${i + 1}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => patch({
          learning_outcomes: outcomes.filter((_, idx) => idx !== i)
        }), className: "text-[var(--pw-danger)] p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
      ] }, i)),
      outcomes.length < 10 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => patch({
        learning_outcomes: [...outcomes, ""]
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }),
        " Add outcome"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Prerequisites", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mb-2", children: (course.prerequisites ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-full bg-[var(--pw-surface-2)] border border-[var(--pw-border)]", children: [
        p,
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => patch({
          prerequisites: (course.prerequisites ?? []).filter((x) => x !== p)
        }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }) })
      ] }, p)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: prereq, onChange: (e) => setPrereq(e.target.value), onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const t = prereq.trim();
          if (t && !(course.prerequisites ?? []).includes(t)) {
            patch({
              prerequisites: [...course.prerequisites ?? [], t]
            });
            setPrereq("");
          }
        }
      }, placeholder: 'e.g. "Basic JavaScript"' }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Target audience", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: AUDIENCES.map((a) => {
      const on = audience.includes(a);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleAudience(a), className: `px-3 py-1.5 rounded-full border text-[12px] ${on ? "border-[var(--pw-accent)] bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]" : "border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)]"}`, children: a }, a);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Estimated completion (weeks)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: course.estimated_weeks ?? "", onChange: (e) => patch({
      estimated_weeks: Number(e.target.value) || null
    }), className: "max-w-[120px]" }) })
  ] });
}
function ToolBtn({
  children,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onMouseDown: (e) => {
    e.preventDefault();
    onClick();
  }, className: "px-2 py-1 rounded hover:bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)]", children });
}
function Step4Pricing({
  course,
  patch
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Pricing & Settings", subtitle: "Set price, discounts, certificate and SEO.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Price", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: course.price ?? "", onChange: (e) => patch({
          price: e.target.value === "" ? null : Number(e.target.value)
        }), placeholder: "0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-9 rounded-md border border-[var(--pw-border)] bg-transparent px-3 text-sm", value: course.currency, onChange: (e) => patch({
          currency: e.target.value
        }), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "MDL", children: "MDL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "USD", children: "USD" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Discount price (optional)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: course.discount_price ?? "", onChange: (e) => patch({
        discount_price: e.target.value === "" ? null : Number(e.target.value)
      }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Discount expiry", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: course.discount_expiry ? course.discount_expiry.slice(0, 16) : "", onChange: (e) => patch({
      discount_expiry: e.target.value ? new Date(e.target.value).toISOString() : null
    }), className: "max-w-[260px]" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 text-[14px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: course.certificate_enabled, onCheckedChange: (v) => patch({
        certificate_enabled: v
      }) }),
      "Issue a certificate of completion"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-[var(--pw-border)] pt-4 mt-2 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-[14px]", children: "SEO" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Meta title", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: course.seo_title ?? "", onChange: (e) => patch({
        seo_title: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Meta description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: course.seo_description ?? "", onChange: (e) => patch({
        seo_description: e.target.value
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "URL slug", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: course.slug ?? "", onChange: (e) => patch({
        slug: e.target.value
      }) }) })
    ] })
  ] });
}
function validateCourse(course, sections, lessons) {
  const checks = [{
    ok: !!course.title?.trim(),
    label: "Title"
  }, {
    ok: !!course.category,
    label: "Category"
  }, {
    ok: !!course.thumbnail_url,
    label: "Thumbnail"
  }, {
    ok: !!course.description?.trim(),
    label: "Description"
  }, {
    ok: (course.learning_outcomes ?? []).filter(Boolean).length >= 3,
    label: "≥ 3 learning outcomes"
  }, {
    ok: course.price != null,
    label: "Price set"
  }, {
    ok: sections.length >= 1 && sections.some((s) => lessons.some((l) => l.section_id === s.id)),
    label: "≥ 1 section with ≥ 1 lesson"
  }];
  return {
    ok: checks.every((c) => c.ok),
    checks
  };
}
function Step5Review({
  course,
  sections,
  lessons,
  validation,
  onSaveDraft,
  onSubmit
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Review & Publish", subtitle: "See exactly what students will see.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] overflow-hidden", children: [
      course.thumbnail_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: course.thumbnail_url, alt: "", className: "w-full aspect-[16/9] object-cover" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl", children: course.title }),
        course.subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[var(--pw-ink-2)] mt-1", children: course.subtitle }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-3 text-[12px]", children: [
          course.category && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill px-2 py-0.5 border border-[var(--pw-border)]", children: course.category }),
          course.difficulty && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill px-2 py-0.5 border border-[var(--pw-border)]", children: course.difficulty }),
          course.language && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill px-2 py-0.5 border border-[var(--pw-border)]", children: course.language })
        ] }),
        course.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-sm max-w-none mt-4", dangerouslySetInnerHTML: {
          __html: course.description
        } }),
        (course.learning_outcomes ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mt-4 mb-2", children: "What you'll learn" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-[13px]", children: (course.learning_outcomes ?? []).filter(Boolean).map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 text-[var(--pw-accent-2)] mt-0.5" }),
            " ",
            o
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mt-4 mb-2", children: "Curriculum" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: sections.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-[var(--pw-border)] rounded", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 bg-[var(--pw-surface-2)] text-[13px] font-medium", children: s.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-[13px]", children: lessons.filter((l) => l.section_id === s.id).map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "px-3 py-1.5 flex justify-between border-t border-[var(--pw-border)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              l.title,
              " ",
              l.is_free_preview && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[10px] text-[var(--pw-accent)]", children: "PREVIEW" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[var(--pw-ink-2)]", children: [
              l.duration_minutes,
              " min"
            ] })
          ] }, l.id)) })
        ] }, s.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] p-4 mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mb-2", children: "Publish checklist" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1 text-[13px]", children: validation.checks.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
        c.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 text-[var(--pw-accent-2)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4 text-[var(--pw-danger)]" }),
        c.label
      ] }, c.label)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onSaveDraft, children: "Save as Draft" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: onSubmit, disabled: !validation.ok || course.status === "under_review", children: course.status === "under_review" ? "Already submitted" : "Submit for Review" })
    ] })
  ] });
}
function Panel({
  title,
  subtitle,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)]/80 backdrop-blur-md p-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink-2)] mt-1", children: subtitle })
    ] }),
    children
  ] });
}
function Field({
  label,
  hint,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[13px] font-medium", children: label }),
      hint && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-[var(--pw-ink-2)]", children: hint })
    ] }),
    children
  ] });
}
export {
  CourseEditor as component
};
