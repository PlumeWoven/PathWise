import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { h as Route$k, s as supabase, P as PWHeader, V as VerificationBadge, f as statusToTier, B as Button } from "./router-C4GolrgT.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { g as CircleCheck, M as MapPin, h as CalendarDays, C as Clock, i as Star, j as Phone, k as MessageSquare, l as GraduationCap, m as Briefcase, L as Languages, n as BookOpen, Q as Quote, o as ChevronLeft, d as ChevronRight, N as Newspaper, p as Earth } from "../_libs/lucide-react.mjs";
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
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function TutorProfilePage() {
  const {
    tutorId
  } = Route$k.useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = reactExports.useState(void 0);
  const [availability, setAvailability] = reactExports.useState([]);
  const [courses, setCourses] = reactExports.useState([]);
  const [reviews, setReviews] = reactExports.useState([]);
  const [reviewers, setReviewers] = reactExports.useState({});
  const [studentCount, setStudentCount] = reactExports.useState(0);
  const [countries, setCountries] = reactExports.useState(0);
  const [responseMin, setResponseMin] = reactExports.useState(null);
  const [bioExpanded, setBioExpanded] = reactExports.useState(false);
  const [expExpanded, setExpExpanded] = reactExports.useState(false);
  const [courseFilter, setCourseFilter] = reactExports.useState("all");
  const [testimonialIdx, setTestimonialIdx] = reactExports.useState(0);
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb = supabase;
      const [pRes, aRes, cRes, rRes, sRes, threadsRes] = await Promise.all([sb.from("profiles").select("*").eq("id", tutorId).eq("role", "tutor").maybeSingle(), sb.from("tutor_availability").select("day_of_week,start_hour,end_hour,is_blocked").eq("user_id", tutorId).order("day_of_week"), sb.from("courses").select("id,title,thumbnail_url,category,price,discount_price,currency,slug,level").eq("tutor_id", tutorId).eq("status", "published"), sb.from("reviews").select("id,rating,body,created_at,student_id").eq("tutor_id", tutorId).order("created_at", {
        ascending: false
      }).limit(20), sb.from("sessions").select("student_id").eq("tutor_id", tutorId), sb.from("message_threads").select("tutor_response_minutes").eq("tutor_id", tutorId).not("tutor_response_minutes", "is", null).limit(50)]);
      if (cancelled) return;
      setTutor(pRes.data ?? null);
      setAvailability(aRes.data ?? []);
      setCourses(cRes.data ?? []);
      const revs = rRes.data ?? [];
      setReviews(revs);
      const studentIds = new Set((sRes.data ?? []).map((s) => s.student_id).filter(Boolean));
      setStudentCount(studentIds.size);
      setCountries(Math.max(1, Math.min(studentIds.size, Math.round(studentIds.size / 3 + 1))));
      const tt = (threadsRes.data ?? []).map((t) => t.tutor_response_minutes).filter((n) => typeof n === "number");
      setResponseMin(tt.length ? Math.round(tt.reduce((a, b) => a + b, 0) / tt.length) : null);
      const ids = Array.from(new Set(revs.map((r) => r.student_id).filter(Boolean)));
      if (ids.length) {
        const {
          data
        } = await sb.from("profiles").select("id,display_name,full_name,avatar_url").in("id", ids);
        const map = {};
        (data ?? []).forEach((p) => {
          map[p.id] = {
            name: p.display_name || p.full_name || "Student",
            avatar: p.avatar_url ?? null
          };
        });
        setReviewers(map);
      }
      sb.from("profile_views").insert({
        tutor_id: tutorId
      }).then(() => {
      }, () => {
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [tutorId]);
  const ratingAvg = reactExports.useMemo(() => {
    const valid = reviews.filter((r) => r.rating != null);
    if (!valid.length) return 0;
    return valid.reduce((s, r) => s + (r.rating ?? 0), 0) / valid.length;
  }, [reviews]);
  const testimonials = reactExports.useMemo(() => reviews.filter((r) => (r.body ?? "").trim().length > 0).slice(0, 8), [reviews]);
  const memberSince = tutor?.created_at ? new Date(tutor.created_at).toLocaleDateString(void 0, {
    month: "long",
    year: "numeric"
  }) : "";
  reactExports.useEffect(() => {
    if (!tutor) return;
    const name = tutor.display_name || tutor.full_name || "PathWise Tutor";
    if (typeof document !== "undefined") {
      document.title = `${name} — Tutor on PathWise`;
    }
    const id = "tutor-jsonld";
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name,
      description: tutor.bio ?? tutor.headline ?? void 0,
      image: tutor.avatar_url ?? void 0,
      jobTitle: tutor.headline ?? "Tutor",
      ...ratingAvg ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: ratingAvg.toFixed(2),
          reviewCount: reviews.length
        }
      } : {}
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [tutor, ratingAvg, reviews.length]);
  const filteredCourses = reactExports.useMemo(() => {
    if (courseFilter === "all") return courses;
    return courses.filter((c) => (c.category ?? "Other") === courseFilter);
  }, [courses, courseFilter]);
  const categories = reactExports.useMemo(() => Array.from(new Set(courses.map((c) => c.category).filter(Boolean))), [courses]);
  if (tutor === void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-32 text-[var(--pw-ink-2)]", children: "Loading tutor…" })
    ] });
  }
  if (!tutor) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-4xl mx-auto p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This tutor profile isn't available." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/find-tutor", className: "text-[var(--pw-accent)] underline", children: "Browse tutors" })
      ] })
    ] });
  }
  const initials = (tutor.display_name ?? tutor.full_name ?? "T").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const startMessage = async () => {
    const {
      data: u
    } = await supabase.auth.getUser();
    if (!u.user) {
      toast.error("Sign in to message this tutor");
      navigate({
        to: "/login"
      });
      return;
    }
    const sb = supabase;
    const {
      data: existing
    } = await sb.from("message_threads").select("id").eq("tutor_id", tutor.id).eq("student_id", u.user.id).maybeSingle();
    if (!existing) {
      await sb.from("message_threads").insert({
        tutor_id: tutor.id,
        student_id: u.user.id
      });
    }
    toast.success("Conversation opened");
    navigate({
      to: "/dashboard"
    });
  };
  const longBio = (tutor.bio ?? "").length > 360;
  const displayBio = !longBio || bioExpanded ? tutor.bio : (tutor.bio ?? "").slice(0, 360) + "…";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 sm:h-64 w-full bg-cover bg-center", style: {
        backgroundImage: tutor.cover_image_url ? `linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.85) 100%), url(${tutor.cover_image_url})` : "linear-gradient(135deg, #1e1b3a 0%, #0f172a 60%, #2d6a4f 100%)"
      }, "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-5xl mx-auto px-5 sm:px-8 -mt-20 sm:-mt-24 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-[var(--pw-surface)] border border-[var(--pw-border)] shadow-sm p-5 sm:p-7", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-5 sm:gap-7 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative -mt-16 sm:-mt-20 shrink-0", children: [
          tutor.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: tutor.avatar_url, alt: tutor.display_name ?? "Tutor", className: "size-28 sm:size-32 rounded-full object-cover ring-4 ring-[var(--pw-surface)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-28 sm:size-32 rounded-full grid place-items-center text-white font-display text-3xl ring-4 ring-[var(--pw-surface)]", style: {
            background: "var(--pw-accent)"
          }, children: initials }),
          tutor.verification_status === "verified" && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "absolute bottom-1 right-1 size-7 text-[var(--pw-accent-2)] fill-white", "aria-label": "Verified tutor" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl sm:text-3xl leading-tight", children: tutor.display_name ?? tutor.full_name ?? "Tutor" }),
            tutor.verification_status && /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationBadge, { tier: statusToTier(tutor.verification_status) })
          ] }),
          tutor.headline && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)] mt-1", children: tutor.headline }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--pw-ink-2)]", children: [
            tutor.timezone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-3.5" }),
              tutor.timezone
            ] }),
            memberSince && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "size-3.5" }),
              "Member since ",
              memberSince
            ] }),
            responseMin != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[var(--pw-accent-2)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3.5" }),
              " Typically responds in ",
              formatResponse(responseMin)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { value: studentCount.toString(), label: "Students" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { value: courses.length.toString(), label: "Courses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { value: tutor.years_experience != null ? `${tutor.years_experience}y` : "—", label: "Experience" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { value: ratingAvg ? ratingAvg.toFixed(1) : "—", label: `Avg rating · ${reviews.length}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-3.5 fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex sm:flex-col gap-2 w-full sm:w-44 sm:items-stretch", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => navigate({
            to: "/book/$tutorId",
            params: {
              tutorId: tutor.id
            }
          }), className: "flex-1 bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-4 mr-1.5" }),
            " Book a Call"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: startMessage, className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "size-4 mr-1.5" }),
            " Message"
          ] })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-5xl mx-auto px-5 sm:px-8 py-10 grid lg:grid-cols-[1fr_300px] gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-10 min-w-0", children: [
        tutor.bio && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl mb-3", children: "About" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink)] whitespace-pre-wrap leading-relaxed", children: displayBio }),
          longBio && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setBioExpanded((v) => !v), className: "text-[13px] text-[var(--pw-accent)] hover:underline mt-2", children: bioExpanded ? "Show less" : "Read more" })
        ] }),
        tutor.subject_specialties?.length || tutor.specializations?.length || tutor.superpowers?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl", children: "Expertise" }),
          tutor.subject_specialties?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tags, { label: "Subjects", items: tutor.subject_specialties }) : null,
          tutor.specializations?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tags, { label: "Specializations", items: tutor.specializations }) : null,
          tutor.superpowers?.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tags, { label: "Strengths", items: tutor.superpowers }) : null
        ] }) : null,
        tutor.credentials?.length || tutor.education_level || tutor.institution ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "size-5" }),
            " Education & credentials"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-3", children: [
            (tutor.credentials ?? []).map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4", children: [
              c.logo ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.logo, alt: "", className: "size-10 rounded object-contain bg-white border border-[var(--pw-border)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded bg-[var(--pw-accent-soft)] grid place-items-center text-[var(--pw-accent)] font-semibold", children: (c.institution ?? c.title).slice(0, 1).toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-[14px]", children: c.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-ink-2)]", children: [c.institution, c.year].filter(Boolean).join(" · ") })
              ] })
            ] }, i)),
            (!tutor.credentials || tutor.credentials.length === 0) && (tutor.education_level || tutor.institution) && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4 text-[14px]", children: [tutor.education_level, tutor.institution].filter(Boolean).join(" · ") })
          ] })
        ] }) : null,
        tutor.work_experience?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setExpExpanded((v) => !v), className: "w-full flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Briefcase, { className: "size-5" }),
              " Experience"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] text-[var(--pw-ink-2)]", children: expExpanded ? "Hide" : "Show" })
          ] }),
          expExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative border-l-2 border-[var(--pw-border)] pl-5 space-y-4", children: tutor.work_experience.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -left-[27px] top-1.5 size-3 rounded-full bg-[var(--pw-accent)]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[14px] font-medium", children: [
              e.role,
              e.company ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[var(--pw-ink-2)] font-normal", children: [
                " · ",
                e.company
              ] }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-[var(--pw-ink-2)] uppercase tracking-wide", children: [e.start, e.end ?? "Present"].filter(Boolean).join(" – ") }),
            e.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink-2)] mt-1", children: e.description })
          ] }, i)) })
        ] }) : null,
        tutor.languages?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Languages, { className: "size-5" }),
            " Languages"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: tutor.languages.map((l, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-[var(--pw-border)] bg-[var(--pw-surface)] px-3 py-1.5 text-[13px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: l.name }),
            l.level && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[var(--pw-ink-2)] ml-1", children: [
              "· ",
              l.level
            ] })
          ] }, i)) })
        ] }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-5" }),
              " Courses"
            ] }),
            categories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FilterChip, { active: courseFilter === "all", onClick: () => setCourseFilter("all"), children: "All" }),
              categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(FilterChip, { active: courseFilter === c, onClick: () => setCourseFilter(c), children: c }, c))
            ] })
          ] }),
          filteredCourses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-[var(--pw-border)] p-10 text-center text-[var(--pw-ink-2)] text-[14px]", children: "No published courses yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: filteredCourses.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/courses/$slug", params: {
            slug: c.slug ?? c.id
          }, className: "group rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] overflow-hidden hover:shadow-md transition", children: [
            c.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.thumbnail_url, alt: c.title, className: "w-full aspect-[16/9] object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[16/9] bg-[var(--pw-surface-2)] grid place-items-center text-[var(--pw-ink-2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-8" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-[14px] line-clamp-2 group-hover:text-[var(--pw-accent)]", children: c.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-2 text-[12px] text-[var(--pw-ink-2)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-3 fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" }),
                  ratingAvg ? ratingAvg.toFixed(1) : "—"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-[var(--pw-ink)]", children: [
                  c.discount_price ?? c.price ?? "—",
                  " ",
                  c.currency
                ] })
              ] })
            ] })
          ] }, c.id)) })
        ] }),
        reviews.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl", children: "Reviews" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[13px] text-[var(--pw-ink-2)] inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-4 fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" }),
              ratingAvg.toFixed(1),
              " · ",
              reviews.length,
              " reviews"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: reviews.slice(0, 5).map((r) => {
            const a = r.student_id ? reviewers[r.student_id] : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                a?.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: a.avatar, alt: "", className: "size-9 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-full bg-[var(--pw-accent-soft)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] font-medium", children: a?.name ?? "Student" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-[var(--pw-ink-2)]", children: new Date(r.created_at).toLocaleDateString() })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[var(--pw-accent-3)] text-[13px]", children: [
                  "★".repeat(r.rating ?? 0),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-30", children: "★".repeat(5 - (r.rating ?? 0)) })
                ] })
              ] }),
              r.body && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] mt-2", children: r.body })
            ] }, r.id);
          }) }),
          reviews.length > 5 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[13px] text-[var(--pw-ink-2)]", children: [
            "Showing 5 of ",
            reviews.length
          ] }) })
        ] }),
        testimonials.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl bg-gradient-to-br from-[var(--pw-accent-soft)] to-[var(--pw-surface-2)] p-6 sm:p-8 border border-[var(--pw-border)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Quote, { className: "size-7 text-[var(--pw-accent)] mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-display text-xl sm:text-2xl leading-snug min-h-[3em]", children: [
            '"',
            testimonials[testimonialIdx]?.body,
            '"'
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px] text-[var(--pw-ink-2)]", children: [
              "— ",
              testimonials[testimonialIdx]?.student_id && reviewers[testimonials[testimonialIdx].student_id]?.name || "Student"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length), className: "size-8 grid place-items-center rounded-full border border-[var(--pw-border)] bg-[var(--pw-surface)] hover:bg-white", "aria-label": "Previous testimonial", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "size-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[12px] text-[var(--pw-ink-2)] tabular-nums", children: [
                testimonialIdx + 1,
                "/",
                testimonials.length
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTestimonialIdx((i) => (i + 1) % testimonials.length), className: "size-8 grid place-items-center rounded-full border border-[var(--pw-border)] bg-[var(--pw-surface)] hover:bg-white", "aria-label": "Next testimonial", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" }) })
            ] })
          ] })
        ] }),
        tutor.media_mentions?.length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-2xl mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Newspaper, { className: "size-5" }),
            " Featured in"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid sm:grid-cols-2 gap-3", children: tutor.media_mentions.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase text-[var(--pw-ink-2)] tracking-wide", children: m.outlet ?? "Publication" }),
            m.url ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: m.url, target: "_blank", rel: "noopener noreferrer", className: "text-[14px] font-medium hover:text-[var(--pw-accent)]", children: m.title }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[14px] font-medium", children: m.title }),
            m.date && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-[var(--pw-ink-2)] mt-1", children: m.date })
          ] }, i)) })
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-5 lg:sticky lg:top-6 self-start", children: [
        studentCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Earth, { className: "size-6 mx-auto text-[var(--pw-accent-2)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-lg mt-2", children: [
            "Taught ",
            studentCount.toLocaleString(),
            " students"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)]", children: [
            "across ",
            countries,
            " ",
            countries === 1 ? "country" : "countries"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-2xl", children: [
            "$",
            Number(tutor.hourly_rate ?? 0).toFixed(0),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)] font-sans", children: " /hr" })
          ] }),
          tutor.first_session_free && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-accent-2)] mt-1", children: "First session free" }),
          tutor.free_discovery_call && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12px] text-[var(--pw-accent-2)]", children: "Free discovery call" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate({
            to: "/book/$tutorId",
            params: {
              tutorId: tutor.id
            }
          }), className: "w-full mt-3 bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90", children: "Book a Session" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: startMessage, className: "w-full mt-2", children: "Message" })
        ] }),
        availability.filter((a) => !a.is_blocked).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-[14px] mb-3", children: "Weekly availability" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: DAYS.map((d, i) => {
            const slots = availability.filter((a) => a.day_of_week === i && !a.is_blocked);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[12px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono uppercase text-[var(--pw-ink-2)] w-10", children: d }),
              slots.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)] opacity-50", children: "—" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex flex-wrap gap-1 justify-end", children: slots.map((s, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-1.5 py-0.5 rounded bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]", children: [
                String(s.start_hour).padStart(2, "0"),
                "–",
                String(s.end_hour).padStart(2, "0")
              ] }, idx)) })
            ] }, d);
          }) })
        ] }),
        tutor.video_intro_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium text-[13px] px-2 pt-1 pb-2", children: "Video intro" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: tutor.video_intro_url, poster: tutor.video_thumbnail_url ?? void 0, controls: true, className: "w-full rounded-lg" })
        ] })
      ] })
    ] })
  ] });
}
function Stat({
  value,
  label,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-[var(--pw-surface-2)] p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-lg leading-none flex items-center gap-1", children: [
      icon,
      value
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-[var(--pw-ink-2)] mt-1", children: label })
  ] });
}
function Tags({
  label,
  items
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wide text-[var(--pw-ink-2)] mb-1.5", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: items.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] px-2.5 py-1 rounded-full bg-[var(--pw-surface-2)] text-[var(--pw-ink)]", children: s }, s)) })
  ] });
}
function FilterChip({
  active,
  onClick,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `px-2.5 py-1 rounded-full text-[12px] border transition ${active ? "bg-[var(--pw-ink)] text-white border-[var(--pw-ink)]" : "bg-[var(--pw-surface)] border-[var(--pw-border)] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]"}`, children });
}
function formatResponse(min) {
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"}`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"}`;
}
export {
  TutorProfilePage as component
};
