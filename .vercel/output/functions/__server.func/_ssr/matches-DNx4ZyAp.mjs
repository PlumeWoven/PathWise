import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { d as Route$r, u as useAuth, s as supabase, P as PWHeader, r as recordProfileView } from "./router-C4GolrgT.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
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
import "../_libs/lucide-react.mjs";
import "../_libs/date-fns.mjs";
import "../_libs/date-fns-tz.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const VIBE_TAGS = ["Motivational", "Patient", "Strict", "Fun", "Methodical", "Creative"];
function matchColor(pct) {
  if (pct >= 80) return "var(--pw-accent-2)";
  if (pct >= 60) return "var(--pw-warn, #d97706)";
  return "var(--pw-ink-2)";
}
const WEIGHTS = { learningStyle: 0.3, subject: 0.25, availability: 0.2, budget: 0.15, rating: 0.1 };
const SUBJECT_ALIASES = {
  math: ["math", "mathematics", "algebra", "geometry", "calculus", "statistics"],
  science: ["science", "sciences", "physics", "chemistry", "biology"],
  languages: ["language", "languages", "english", "spanish", "french", "esl"],
  coding: ["coding", "programming", "python", "javascript", "computer science"],
  test_prep: ["test", "sat", "act", "gre", "gmat", "ielts", "toefl"],
  music: ["music", "piano", "guitar", "violin", "voice"],
  writing: ["writing", "literature", "essay"],
  art: ["art", "drawing", "painting"]
};
function normalize(s) {
  return s.toLowerCase().trim();
}
function subjectScore(t, subject) {
  if (!subject) return 0.6;
  const key = normalize(subject);
  const aliases = SUBJECT_ALIASES[key] ?? [key];
  const haystack = [
    ...t.subject_specialties ?? [],
    ...t.specializations ?? []
  ].map(normalize);
  if (haystack.length === 0) return 0.4;
  const directHit = haystack.some((h) => aliases.some((a) => h.includes(a)));
  if (directHit) return 1;
  const meta = `${t.headline ?? ""} ${t.bio ?? ""}`.toLowerCase();
  if (aliases.some((a) => meta.includes(a))) return 0.7;
  return 0.2;
}
function learningStyleScore(t, style, vibes) {
  const sp = (t.superpowers ?? []).map(normalize);
  let score = 0.5;
  if (style) {
    const styleHints = {
      visual: ["visual", "diagram", "drawing", "creative", "demonstration"],
      auditory: ["explainer", "storytelling", "verbal", "discussion"],
      kinesthetic: ["hands-on", "interactive", "project", "practical"]
    };
    const hints = styleHints[normalize(style)] ?? [];
    if (hints.length && sp.some((s) => hints.some((h) => s.includes(h)))) score = 0.95;
    else if (sp.length > 0) score = 0.65;
  }
  if (vibes && vibes.length) {
    const matched = vibes.filter((v) => sp.some((s) => s.includes(normalize(v)))).length;
    if (matched > 0) score = Math.min(1, score + 0.1 * matched);
  }
  return score;
}
function budgetScore(t, max) {
  if (!max || max <= 0) return 0.7;
  const rate = Number(t.hourly_rate ?? 0);
  if (!rate) return 0.5;
  if (rate <= max * 0.7) return 1;
  if (rate <= max) return 0.85;
  if (rate <= max * 1.15) return 0.5;
  return 0.15;
}
function ratingScore(avg, count) {
  if (count === 0) return 0.5;
  const normalized = avg / 5;
  const confidence = Math.min(1, count / 10);
  return normalized * (0.7 + 0.3 * confidence);
}
function availabilityScore(hasAvail, availableThisWeek) {
  if (hasAvail === void 0) return 0.6;
  if (!hasAvail) return 0.2;
  return availableThisWeek ? 1 : 0.85;
}
function computeMatch(t, prefs, rating, hasAvailability) {
  const parts = {
    learningStyle: learningStyleScore(t, prefs.learning_style, prefs.vibes),
    subject: subjectScore(t, prefs.subject),
    availability: availabilityScore(hasAvailability, prefs.availableThisWeek),
    budget: budgetScore(t, prefs.budget_max),
    rating: ratingScore(rating.avg, rating.count)
  };
  const total = parts.learningStyle * WEIGHTS.learningStyle + parts.subject * WEIGHTS.subject + parts.availability * WEIGHTS.availability + parts.budget * WEIGHTS.budget + parts.rating * WEIGHTS.rating;
  return { total, parts };
}
function MatchCard({ data, onBook, onMessage, onView }) {
  const [open, setOpen] = reactExports.useState(false);
  const { tutor: t, match, rating, packageDiscount, course } = data;
  const pct = Math.round(match.total * 100);
  const color = matchColor(pct);
  const initials = (t.display_name ?? "T").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.25 },
      className: "pw-card overflow-hidden",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 flex gap-5 flex-col sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex sm:block items-center gap-4 sm:gap-0", children: t.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: t.avatar_url, alt: t.display_name ?? "Tutor", className: "w-20 h-20 rounded-full object-cover flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "w-20 h-20 rounded-full flex items-center justify-center text-white font-display text-2xl flex-shrink-0",
            style: { background: "var(--pw-accent)" },
            children: initials
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => onView?.(t.id),
                className: "font-display text-[18px] leading-tight text-left hover:text-[var(--pw-accent)] transition-colors",
                children: t.display_name ?? "Tutor"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "span",
              {
                className: "pw-pill text-[11px] px-2.5 py-0.5 font-medium ml-auto sm:ml-0",
                style: { background: color, color: "white" },
                "aria-label": `${pct}% match`,
                children: [
                  pct,
                  "% Match"
                ]
              }
            )
          ] }),
          t.headline && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink-2)] mt-0.5 line-clamp-2", children: t.headline }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3 text-[12px] text-[var(--pw-ink-2)] font-mono-pw", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "var(--pw-accent)" }, children: [
              "★".repeat(Math.round(rating.avg)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-border)]", children: "★".repeat(5 - Math.round(rating.avg)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              rating.avg.toFixed(1),
              " · (",
              rating.count,
              " review",
              rating.count === 1 ? "" : "s",
              ")"
            ] })
          ] }),
          t.subject_specialties && t.subject_specialties.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-1.5", children: t.subject_specialties.slice(0, 4).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pw-pill text-[11px] px-2.5 py-0.5", style: { background: "var(--pw-surface-2)" }, children: s }, s)) }),
          course && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-3 pw-border rounded-lg p-2", children: [
            course.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: course.thumbnail_url, alt: course.title, className: "w-12 h-12 rounded object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded bg-[var(--pw-surface-2)] flex items-center justify-center text-lg", children: "📚" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[10px] uppercase pw-tracking-wide text-[var(--pw-ink-2)]", children: "Featured course" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] font-medium truncate", children: course.title })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setOpen((v) => !v),
              className: "mt-3 text-[12px] text-[var(--pw-accent)] hover:underline underline-offset-2",
              "aria-expanded": open,
              children: [
                open ? "Hide" : "Show",
                " match breakdown"
              ]
            }
          ),
          open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { label: "Subject expertise", pct: Math.round(match.parts.subject * 100) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { label: "Learning style", pct: Math.round(match.parts.learningStyle * 100) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { label: "Availability", pct: Math.round(match.parts.availability * 100) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { label: "Budget fit", pct: Math.round(match.parts.budget * 100) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { label: "Rating", pct: Math.round(match.parts.rating * 100) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:text-right sm:w-44 flex sm:flex-col items-start sm:items-end gap-2 justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-[22px] leading-none", children: [
              "$",
              Number(t.hourly_rate ?? 0).toFixed(0),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)]", children: " /hr" })
            ] }),
            packageDiscount && packageDiscount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] mt-0.5", style: { color: "var(--pw-accent-2)" }, children: [
              "Save ",
              packageDiscount,
              "% with package"
            ] }),
            t.first_session_free && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-[var(--pw-ink-2)] mt-0.5", children: "First session free" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex sm:flex-col gap-2 w-full sm:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onView?.(t.id),
                className: "pw-btn-outline px-4 py-2 text-[13px] font-medium flex-1",
                children: "View profile"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onBook?.(t.id),
                className: "pw-btn-primary px-4 py-2 text-[13px] font-medium flex-1",
                children: "Book trial"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => onMessage?.(t.id),
                className: "pw-btn-outline px-4 py-2 text-[13px] font-medium flex-1",
                children: "Message"
              }
            )
          ] })
        ] })
      ] })
    }
  );
}
function Bar({ label, pct }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono-pw", children: [
        pct,
        "%"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 mt-1 rounded-full overflow-hidden bg-[var(--pw-surface-2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-full", style: { width: `${pct}%`, background: "var(--pw-accent)" } }) })
  ] });
}
const SORTS = [{
  id: "best",
  label: "Best Match"
}, {
  id: "rating",
  label: "Highest Rated"
}, {
  id: "reviews",
  label: "Most Reviews"
}, {
  id: "price_asc",
  label: "Price: Low to High"
}, {
  id: "price_desc",
  label: "Price: High to Low"
}];
const PAGE_SIZE = 8;
function MatchesPage() {
  const search = Route$r.useSearch();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [tutors, setTutors] = reactExports.useState([]);
  const [reviewsByTutor, setReviewsByTutor] = reactExports.useState(/* @__PURE__ */ new Map());
  const [availabilityByTutor, setAvailabilityByTutor] = reactExports.useState(/* @__PURE__ */ new Set());
  const [packagesByTutor, setPackagesByTutor] = reactExports.useState(/* @__PURE__ */ new Map());
  const [coursesByTutor, setCoursesByTutor] = reactExports.useState(/* @__PURE__ */ new Map());
  const [loading, setLoading] = reactExports.useState(true);
  const [visible, setVisible] = reactExports.useState(PAGE_SIZE);
  const [filterOpen, setFilterOpen] = reactExports.useState(false);
  const [savedPrefs, setSavedPrefs] = reactExports.useState({});
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (user?.id) {
          const {
            data
          } = await supabase.from("user_learning_profiles").select("subject, learning_style, experience_level, budget_max").eq("user_id", user.id).maybeSingle();
          if (data && !cancelled) setSavedPrefs(data);
        } else {
          try {
            const cached = localStorage.getItem("pathwise_find_tutor_answers");
            if (cached) setSavedPrefs(JSON.parse(cached));
          } catch {
          }
        }
        const effectiveSubject = search.subject ?? savedPrefs.subject;
        let tutorQuery = supabase.from("profiles").select("id, display_name, avatar_url, headline, bio, hourly_rate, subject_specialties, specializations, superpowers, video_intro_url, verification_status, free_discovery_call, first_session_free").eq("role", "tutor").limit(200);
        if (effectiveSubject) {
          tutorQuery = tutorQuery.contains("subject_specialties", [effectiveSubject]);
        }
        const [tutorsRes, reviewsRes, availRes, packagesRes, coursesRes] = await Promise.all([tutorQuery, supabase.from("reviews").select("tutor_id, rating"), supabase.from("tutor_availability").select("user_id"), supabase.from("tutor_packages").select("user_id, discount_percent, enabled"), supabase.from("courses").select("tutor_id, title, thumbnail_url, status").eq("status", "published")]);
        if (cancelled) return;
        let tutorRows = tutorsRes.data ?? [];
        if (tutorRows.length === 0 && effectiveSubject) {
          const {
            data: fallback
          } = await supabase.from("profiles").select("id, display_name, avatar_url, headline, bio, hourly_rate, subject_specialties, specializations, superpowers, video_intro_url, verification_status, free_discovery_call, first_session_free").eq("role", "tutor").limit(200);
          tutorRows = fallback ?? [];
        }
        setTutors(tutorRows);
        const rmap = /* @__PURE__ */ new Map();
        const tmp = /* @__PURE__ */ new Map();
        (reviewsRes.data ?? []).forEach((r) => {
          if (!r.tutor_id || r.rating == null) return;
          const cur = tmp.get(r.tutor_id) ?? {
            sum: 0,
            n: 0
          };
          cur.sum += Number(r.rating);
          cur.n += 1;
          tmp.set(r.tutor_id, cur);
        });
        tmp.forEach((v, k) => rmap.set(k, {
          avg: v.sum / v.n,
          count: v.n
        }));
        setReviewsByTutor(rmap);
        const avail = /* @__PURE__ */ new Set();
        (availRes.data ?? []).forEach((a) => a.user_id && avail.add(a.user_id));
        setAvailabilityByTutor(avail);
        const pkg = /* @__PURE__ */ new Map();
        (packagesRes.data ?? []).forEach((p) => {
          if (!p.enabled) return;
          const cur = pkg.get(p.user_id) ?? 0;
          pkg.set(p.user_id, Math.max(cur, Number(p.discount_percent ?? 0)));
        });
        setPackagesByTutor(pkg);
        const cmap = /* @__PURE__ */ new Map();
        (coursesRes.data ?? []).forEach((c) => {
          if (!c.tutor_id) return;
          if (!cmap.has(c.tutor_id)) cmap.set(c.tutor_id, {
            title: c.title,
            thumbnail_url: c.thumbnail_url
          });
        });
        setCoursesByTutor(cmap);
      } catch (err) {
        console.error("[matches]", err);
        toast.error("Couldn't load tutors. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, search.subject]);
  const prefs = reactExports.useMemo(() => ({
    subject: search.subject ?? savedPrefs.subject,
    budget_max: search.budget ?? savedPrefs.budget_max,
    learning_style: search.style ?? savedPrefs.learning_style,
    experience_level: search.level ?? savedPrefs.experience_level,
    vibes: search.vibes,
    availableThisWeek: search.availableThisWeek
  }), [search, savedPrefs]);
  const scored = reactExports.useMemo(() => {
    const list = tutors.map((t) => {
      const rating = reviewsByTutor.get(t.id) ?? {
        avg: 0,
        count: 0
      };
      const score = computeMatch(t, prefs, rating, availabilityByTutor.has(t.id));
      return {
        tutor: t,
        score,
        rating,
        packageDiscount: packagesByTutor.get(t.id),
        course: coursesByTutor.get(t.id) ?? null
      };
    });
    return list.filter((s) => {
      const rate = Number(s.tutor.hourly_rate ?? 0);
      if (rate < search.priceMin) return false;
      if (search.priceMax > 0 && rate > search.priceMax && rate !== 0) return false;
      if (search.minRating > 0 && s.rating.avg < search.minRating) return false;
      if (search.availableThisWeek && !availabilityByTutor.has(s.tutor.id)) return false;
      return true;
    });
  }, [tutors, reviewsByTutor, availabilityByTutor, packagesByTutor, coursesByTutor, prefs, search]);
  const sorted = reactExports.useMemo(() => {
    const copy = [...scored];
    switch (search.sort) {
      case "rating":
        copy.sort((a, b) => b.rating.avg - a.rating.avg);
        break;
      case "reviews":
        copy.sort((a, b) => b.rating.count - a.rating.count);
        break;
      case "price_asc":
        copy.sort((a, b) => Number(a.tutor.hourly_rate ?? 9999) - Number(b.tutor.hourly_rate ?? 9999));
        break;
      case "price_desc":
        copy.sort((a, b) => Number(b.tutor.hourly_rate ?? 0) - Number(a.tutor.hourly_rate ?? 0));
        break;
      default:
        copy.sort((a, b) => b.score.total - a.score.total);
    }
    return copy.slice(0, 20);
  }, [scored, search.sort]);
  const visibleList = sorted.slice(0, visible);
  const updateSearch = (patch) => {
    navigate({
      to: "/matches",
      search: (prev) => ({
        ...prev,
        ...patch
      })
    });
  };
  const handleBook = (tutorId) => {
    if (user) {
      void supabase.from("lead_events").insert({
        tutor_id: tutorId,
        student_id: user.id,
        stage: "trial"
      });
      void recordProfileView(tutorId, user.id);
    }
    navigate({
      to: "/book/$tutorId",
      params: {
        tutorId
      }
    });
  };
  const handleMessage = (tutorId) => {
    if (!user) {
      toast.info("Sign in to message tutors.");
      return;
    }
    toast.success("Message thread opened.");
    void supabase.from("lead_events").insert({
      tutor_id: tutorId,
      student_id: user.id,
      stage: "message"
    });
  };
  const chips = [];
  if (prefs.subject) chips.push({
    key: "subject",
    label: `Subject: ${prefs.subject}`,
    clear: () => updateSearch({
      subject: void 0
    })
  });
  if (prefs.budget_max) chips.push({
    key: "budget",
    label: `Budget ≤ $${prefs.budget_max}/hr`,
    clear: () => updateSearch({
      budget: void 0,
      priceMax: 200
    })
  });
  if (prefs.experience_level) chips.push({
    key: "level",
    label: `Level: ${prefs.experience_level}`,
    clear: () => updateSearch({
      level: void 0
    })
  });
  if (prefs.learning_style) chips.push({
    key: "style",
    label: `Style: ${prefs.learning_style}`,
    clear: () => updateSearch({
      style: void 0
    })
  });
  if (search.minRating > 0) chips.push({
    key: "rating",
    label: `Min ${search.minRating}★`,
    clear: () => updateSearch({
      minRating: 0
    })
  });
  if (search.availableThisWeek) chips.push({
    key: "avail",
    label: "Available this week",
    clear: () => updateSearch({
      availableThisWeek: false
    })
  });
  search.vibes.forEach((v) => chips.push({
    key: `vibe-${v}`,
    label: v,
    clear: () => updateSearch({
      vibes: search.vibes.filter((x) => x !== v)
    })
  }));
  const clearAll = () => navigate({
    to: "/matches",
    search: {
      sort: search.sort,
      minRating: 0,
      priceMin: 0,
      priceMax: 200,
      vibes: [],
      availableThisWeek: false
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "px-5 sm:px-8 pb-24 max-w-6xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/find-tutor", className: "underline-offset-2 hover:underline", children: "Find a tutor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2", children: "→" }),
          "Your matches"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-[28px] sm:text-[34px] leading-tight mt-2", children: [
          "We found ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            color: "var(--pw-accent)"
          }, children: loading ? "…" : sorted.length }),
          " tutors based on your learning profile"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[14px] text-[var(--pw-ink-2)] max-w-2xl", children: "Each card shows a match score (Learning Style 30%, Subject 25%, Availability 20%, Budget 15%, Rating 10%)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/find-tutor", className: "pw-btn-primary inline-flex items-center px-5 py-2.5 text-[14px] font-medium", children: "Find my tutor →" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px] text-[var(--pw-ink-2)] self-center", children: "Take a 60-second quiz to refine your matches" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setFilterOpen((v) => !v), className: "lg:hidden pw-btn-outline px-4 py-2 text-[13px]", children: [
          filterOpen ? "Hide" : "Show",
          " filters"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-[13px] ml-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: "Sort by" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: search.sort, onChange: (e) => updateSearch({
            sort: e.target.value
          }), className: "pw-border rounded-md px-3 py-1.5 text-[13px] bg-white", children: SORTS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s.id, children: s.label }, s.id)) })
        ] })
      ] }),
      chips.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-2", children: [
        chips.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: c.clear, className: "pw-pill text-[12px] px-3 py-1 inline-flex items-center gap-1.5 hover:bg-[var(--pw-surface-2)]", children: [
          c.label,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: "×" })
        ] }, c.key)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearAll, className: "text-[12px] text-[var(--pw-accent)] hover:underline ml-1", children: "Clear all" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: `${filterOpen ? "block" : "hidden"} lg:block`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilterSidebar, { search, update: updateSearch, onClear: clearAll }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pw-card h-44 animate-pulse bg-[var(--pw-surface-2)]" }, i)) }) : sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(NoResults, { onClear: clearAll }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: visibleList.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(MatchCard, { data: {
            tutor: s.tutor,
            match: s.score,
            rating: s.rating,
            packageDiscount: s.packageDiscount,
            course: s.course
          }, onBook: handleBook, onMessage: handleMessage, onView: (id) => navigate({
            to: "/tutor/$tutorId",
            params: {
              tutorId: id
            }
          }) }, s.tutor.id)) }),
          visible < sorted.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVisible((v) => v + PAGE_SIZE), className: "pw-btn-outline px-6 py-2.5 text-[14px]", children: [
            "Load more (",
            sorted.length - visible,
            " remaining)"
          ] }) })
        ] }) })
      ] })
    ] })
  ] });
}
function FilterSidebar({
  search,
  update,
  onClear
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-5 space-y-5 sticky top-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[18px]", children: "Filters" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Price range", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)]", children: [
        "$",
        search.priceMin,
        " – $",
        search.priceMax,
        "/hr"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 0, max: 300, step: 5, value: search.priceMax, onChange: (e) => update({
        priceMax: Number(e.target.value)
      }), className: "w-full mt-2" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Availability", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-[13px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: search.availableThisWeek, onChange: (e) => update({
        availableThisWeek: e.target.checked
      }) }),
      "Available this week"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Minimum rating", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap", children: [0, 3, 4, 4.5].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => update({
      minRating: r
    }), className: "pw-pill text-[12px] px-3 py-1", style: {
      background: search.minRating === r ? "var(--pw-accent)" : "var(--pw-surface)",
      color: search.minRating === r ? "white" : "inherit",
      borderColor: search.minRating === r ? "var(--pw-accent)" : "var(--pw-border)"
    }, children: r === 0 ? "Any" : `${r}★+` }, r)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Vibe", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: VIBE_TAGS.map((v) => {
      const vibes = search.vibes;
      const active = vibes.includes(v);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => update({
        vibes: active ? vibes.filter((x) => x !== v) : [...vibes, v]
      }), className: "pw-pill text-[12px] px-3 py-1", style: {
        background: active ? "var(--pw-accent)" : "var(--pw-surface)",
        color: active ? "white" : "inherit",
        borderColor: active ? "var(--pw-accent)" : "var(--pw-border)"
      }, children: v }, v);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClear, className: "pw-btn-outline w-full text-[13px] px-4 py-2", children: "Clear all filters" })
  ] });
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono-pw text-[11px] uppercase pw-tracking-wide text-[var(--pw-ink-2)] mb-2", children: title }),
    children
  ] });
}
function NoResults({
  onClear
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pw-card p-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl", children: "🔍" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[22px] mt-3", children: "No exact matches found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[14px] text-[var(--pw-ink-2)] mt-2 max-w-md mx-auto", children: "But here's what we can do to widen your search:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClear, className: "pw-btn-outline px-4 py-2 text-[13px]", children: "Clear all filters" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/find-tutor", className: "pw-btn-outline px-4 py-2 text-[13px] text-center", children: "Try related subjects" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast.success("Alert created — we'll email you when matches join."), className: "pw-btn-outline px-4 py-2 text-[13px]", children: "Create alert" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast.success("Added to waitlist."), className: "pw-btn-outline px-4 py-2 text-[13px]", children: "Join waitlist" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast.success("Alert created — we'll notify you when matching tutors join."), className: "pw-btn-primary mt-5 px-6 py-2.5 text-[13px]", children: "Notify me when matching tutors join" })
  ] });
}
export {
  MatchesPage as component
};
