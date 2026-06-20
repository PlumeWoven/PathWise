import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase, P as PWHeader, B as Button, D as DEFAULT_FAQ, k as cn } from "./router-C4GolrgT.mjs";
import { g as useParams, L as Link } from "../_libs/tanstack__react-router.mjs";
import { g as getCourseBySlug } from "./courses-Cd8L0VyP.mjs";
import { R as Root2, L as List, T as Trigger, C as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { R as Root2$1, I as Item, H as Header, T as Trigger2, C as Content2 } from "../_libs/radix-ui__react-accordion.mjs";
import { T as Textarea } from "./textarea-Cm0GRVr4.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/lovable.dev__cloud-auth-js.mjs";
import { d as ChevronRight, t as Users, C as Clock, n as BookOpen, u as ChartColumn, G as Globe, v as Calendar, H as Heart, w as ShieldCheck, A as Award, x as Share2, b as Copy, y as Twitter, z as Linkedin, F as Facebook, e as Check, I as Play, J as Lock, i as Star, K as ChevronDown } from "../_libs/lucide-react.mjs";
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
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-collapsible.mjs";
const Tabs = Root2;
const TabsList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content.displayName;
const Accordion = Root2$1;
const AccordionItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger2,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = Trigger2.displayName;
const AccordionContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = Content2.displayName;
function PublicCoursePage() {
  const {
    slug
  } = useParams({
    from: "/courses/$slug"
  });
  const [course, setCourse] = reactExports.useState(void 0);
  const [sections, setSections] = reactExports.useState([]);
  const [lessons, setLessons] = reactExports.useState([]);
  const [tutor, setTutor] = reactExports.useState(null);
  const [reviews, setReviews] = reactExports.useState([]);
  const [related, setRelated] = reactExports.useState([]);
  const [studentCount, setStudentCount] = reactExports.useState(0);
  const [me, setMe] = reactExports.useState(null);
  const [wishlisted, setWishlisted] = reactExports.useState(false);
  const [reviewsShown, setReviewsShown] = reactExports.useState(5);
  const [tab, setTab] = reactExports.useState("overview");
  const [draftRating, setDraftRating] = reactExports.useState(5);
  const [draftBody, setDraftBody] = reactExports.useState("");
  const [previewLesson, setPreviewLesson] = reactExports.useState(null);
  reactExports.useEffect(() => {
    supabase.auth.getUser().then(({
      data
    }) => setMe(data.user ? {
      id: data.user.id
    } : null));
  }, []);
  reactExports.useEffect(() => {
    if (!course) return;
    try {
      const list = JSON.parse(localStorage.getItem("pw_wishlist") ?? "[]");
      setWishlisted(list.includes(course.id));
    } catch {
    }
  }, [course]);
  const toggleWishlist = () => {
    if (!course) return;
    try {
      const list = JSON.parse(localStorage.getItem("pw_wishlist") ?? "[]");
      const next = list.includes(course.id) ? list.filter((x) => x !== course.id) : [...list, course.id];
      localStorage.setItem("pw_wishlist", JSON.stringify(next));
      setWishlisted(next.includes(course.id));
      toast.success(next.includes(course.id) ? "Saved to wishlist" : "Removed from wishlist");
    } catch {
    }
  };
  reactExports.useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await getCourseBySlug(slug);
      if (cancelled) return;
      setCourse(c);
      if (!c) return;
      const sb = supabase;
      const [secs, less, prof, revs, rel, students] = await Promise.all([sb.from("course_sections").select("*").eq("course_id", c.id).order("position"), sb.from("course_lessons").select("*").eq("course_id", c.id).order("position"), sb.from("profiles").select("*").eq("id", c.tutor_id).maybeSingle(), sb.from("reviews").select("*").eq("tutor_id", c.tutor_id).order("created_at", {
        ascending: false
      }), c.category ? sb.from("courses").select("*").eq("status", "published").eq("category", c.category).neq("id", c.id).limit(8) : Promise.resolve({
        data: []
      }), sb.from("sessions").select("student_id", {
        count: "exact",
        head: false
      }).eq("tutor_id", c.tutor_id)]);
      if (cancelled) return;
      setSections(secs.data ?? []);
      setLessons(less.data ?? []);
      setTutor(prof.data ?? null);
      setReviews(revs.data ?? []);
      setRelated(rel.data ?? []);
      const uniq = new Set((students.data ?? []).map((s) => s.student_id).filter(Boolean));
      setStudentCount(uniq.size);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);
  reactExports.useEffect(() => {
    if (!course) return;
    const title = `${course.seo_title || course.title} — PathWise`;
    const desc = course.seo_description || course.subtitle || course.title;
    document.title = title;
    setMeta("description", desc);
    setMeta("og:title", title, true);
    setMeta("og:description", desc, true);
    setMeta("og:type", "website", true);
    if (course.thumbnail_url) setMeta("og:image", course.thumbnail_url, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    if (course.thumbnail_url) setMeta("twitter:image", course.thumbnail_url);
    const ld = {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: desc,
      provider: {
        "@type": "Organization",
        name: "PathWise",
        sameAs: typeof window !== "undefined" ? window.location.origin : void 0
      },
      ...course.thumbnail_url ? {
        image: course.thumbnail_url
      } : {},
      ...tutor ? {
        instructor: {
          "@type": "Person",
          name: tutor.display_name || tutor.full_name
        }
      } : {}
    };
    let s = document.getElementById("ld-course");
    if (!s) {
      s = document.createElement("script");
      s.id = "ld-course";
      s.type = "application/ld+json";
      document.head.appendChild(s);
    }
    s.textContent = JSON.stringify(ld);
  }, [course, tutor]);
  const totalMin = reactExports.useMemo(() => lessons.reduce((s, l) => s + (l.duration_minutes ?? 0), 0), [lessons]);
  const ratingAvg = reactExports.useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length;
  }, [reviews]);
  const ratingDist = reactExports.useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating && r.rating >= 1 && r.rating <= 5) d[r.rating - 1]++;
    });
    return d;
  }, [reviews]);
  if (course === void 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-32 text-[var(--pw-ink-2)]", children: "Loading…" })
    ] });
  }
  if (!course || course.status !== "published") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-32", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl", children: "Course not available" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[var(--pw-ink-2)] mt-2", children: "This course may not be published yet." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/find-tutor", className: "text-[var(--pw-accent)] underline mt-4 inline-block", children: "Browse tutors" })
      ] })
    ] });
  }
  const finalPrice = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price != null && course.price != null && course.discount_price < course.price;
  const discountPct = hasDiscount && course.price ? Math.round((1 - course.discount_price / course.price) * 100) : 0;
  const updatedDate = new Date(course.updated_at).toLocaleDateString(void 0, {
    month: "short",
    year: "numeric"
  });
  const submitReview = async () => {
    if (!me) {
      toast.error("Sign in to leave a review");
      return;
    }
    if (!course.tutor_id) return;
    const {
      error
    } = await supabase.from("reviews").insert({
      student_id: me.id,
      tutor_id: course.tutor_id,
      rating: draftRating,
      body: draftBody
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Review submitted");
    setDraftBody("");
    const {
      data
    } = await supabase.from("reviews").select("*").eq("tutor_id", course.tutor_id).order("created_at", {
      ascending: false
    });
    setReviews(data ?? []);
  };
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const share = (network) => {
    if (network === "copy") {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
      return;
    }
    const text = encodeURIComponent(course.title);
    const u = encodeURIComponent(shareUrl);
    const map = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${u}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`
    };
    window.open(map[network], "_blank", "noopener,noreferrer");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PWHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden", children: [
      course.thumbnail_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-cover bg-center opacity-30", style: {
        backgroundImage: `url(${course.thumbnail_url})`
      }, "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b3a] to-[#0b1226]", "aria-hidden": true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-12 text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "text-[12px] text-white/70 flex items-center gap-1.5 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "hover:text-white", children: "Home" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/find-tutor", className: "hover:text-white", children: "Courses" }),
          course.category && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: course.category })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-white truncate max-w-[40ch]", children: course.title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-10 mt-6 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl sm:text-5xl leading-tight", children: course.title }),
            course.subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/80 text-[16px] sm:text-[18px] mt-3 max-w-2xl", children: course.subtitle }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 mt-4 text-[13px]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Stars, { value: ratingAvg }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: ratingAvg ? ratingAvg.toFixed(1) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white/60", children: [
                  "(",
                  reviews.length,
                  " reviews)"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 text-white/80", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-3.5" }),
                " ",
                studentCount,
                " students"
              ] })
            ] }),
            tutor && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/tutor/$tutorId", params: {
              tutorId: tutor.id
            }, className: "mt-4 inline-flex items-center gap-2 text-[13px] text-white/90 hover:text-white", children: [
              tutor.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: tutor.avatar_url, alt: "", className: "size-8 rounded-full object-cover ring-2 ring-white/20" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-full bg-white/10" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Created by ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "underline", children: tutor.display_name || tutor.full_name })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-white/80", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3.5" }), label: `${totalMin} min` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-3.5" }), label: `${lessons.length} lessons` }),
              course.difficulty && /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "size-3.5" }), label: course.difficulty }),
              course.language && /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "size-3.5" }), label: course.language }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-3.5" }), label: `Updated ${updatedDate}` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center gap-3 lg:hidden", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/book/$tutorId", params: {
                tutorId: course.tutor_id
              }, className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90", children: "Enroll Now" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleWishlist, "aria-label": "Add to wishlist", className: "size-10 grid place-items-center rounded-md border border-white/20 hover:bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `size-4 ${wishlisted ? "fill-[var(--pw-accent)] text-[var(--pw-accent)]" : ""}` }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "hidden lg:block sticky top-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-white/10 bg-white text-[var(--pw-ink)] shadow-2xl overflow-hidden", children: [
            course.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: course.thumbnail_url, alt: course.title, className: "w-full aspect-[16/9] object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[16/9] bg-[var(--pw-surface-2)] grid place-items-center text-[var(--pw-ink-2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-10" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3", children: [
                finalPrice != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-3xl font-semibold", children: [
                  finalPrice,
                  " ",
                  course.currency
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[var(--pw-ink-2)]", children: "Contact for pricing" }),
                hasDiscount && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-[var(--pw-ink-2)] text-[14px]", children: course.price }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] font-semibold text-[var(--pw-accent)] bg-[var(--pw-accent-soft)] px-1.5 py-0.5 rounded", children: [
                    "-",
                    discountPct,
                    "%"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/book/$tutorId", params: {
                tutorId: course.tutor_id
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full mt-4 bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90", children: "Enroll Now" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleWishlist, className: "w-full mt-2 inline-flex items-center justify-center gap-2 h-10 rounded-md border border-[var(--pw-border)] text-[14px] hover:bg-[var(--pw-surface-2)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `size-4 ${wishlisted ? "fill-[var(--pw-accent)] text-[var(--pw-accent)]" : ""}` }),
                wishlisted ? "Wishlisted" : "Add to Wishlist"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 text-[12px] text-[var(--pw-ink-2)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-4 text-[var(--pw-accent-2)]" }),
                "14-day money-back guarantee"
              ] }),
              course.certificate_enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2 text-[12px] text-[var(--pw-ink-2)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "size-4 text-[var(--pw-accent-3)]" }),
                "Certificate of completion"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-[var(--pw-border)]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] uppercase tracking-wide text-[var(--pw-ink-2)] mb-2 flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "size-3" }),
                  " Share"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShareBtn, { onClick: () => share("copy"), label: "Copy link", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-4" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShareBtn, { onClick: () => share("twitter"), label: "Share on Twitter", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, { className: "size-4" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShareBtn, { onClick: () => share("linkedin"), label: "Share on LinkedIn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Linkedin, { className: "size-4" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShareBtn, { onClick: () => share("facebook"), label: "Share on Facebook", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Facebook, { className: "size-4" }) })
                ] })
              ] })
            ] })
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-6xl mx-auto px-5 sm:px-8 pb-32 lg:pb-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-10 mt-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-[var(--pw-surface-2)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", children: "Overview" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "curriculum", children: "Curriculum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "reviews", children: "Reviews" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "faq", children: "FAQ" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "overview", className: "mt-6 space-y-8", children: [
            course.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl mb-3", children: "About this course" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-sm max-w-none text-[var(--pw-ink)]", dangerouslySetInnerHTML: {
                __html: course.description
              } })
            ] }),
            (course.learning_outcomes ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl mb-3", children: "What you'll learn" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "grid sm:grid-cols-2 gap-2 text-[14px]", children: (course.learning_outcomes ?? []).filter(Boolean).map((o, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 text-[var(--pw-accent-2)] mt-1 shrink-0" }),
                o
              ] }, i)) })
            ] }),
            ((course.prerequisites ?? []).length > 0 || (course.target_audience ?? []).length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid sm:grid-cols-2 gap-4", children: [
              (course.prerequisites ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mb-2", children: "Prerequisites" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-[13px] space-y-1 text-[var(--pw-ink-2)]", children: (course.prerequisites ?? []).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  "• ",
                  p
                ] }, p)) })
              ] }),
              (course.target_audience ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium mb-2", children: "Who this is for" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-[13px] space-y-1 text-[var(--pw-ink-2)]", children: (course.target_audience ?? []).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  "• ",
                  a
                ] }, a)) })
              ] })
            ] }),
            tutor && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl mb-3", children: "About the tutor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
                tutor.avatar_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: tutor.avatar_url, alt: "", className: "size-14 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-14 rounded-full bg-[var(--pw-accent-soft)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: tutor.display_name || tutor.full_name }),
                  tutor.headline && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] text-[var(--pw-ink-2)]", children: tutor.headline }),
                  tutor.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink-2)] mt-2 line-clamp-3", children: tutor.bio }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/tutor/$tutorId", params: {
                    tutorId: tutor.id
                  }, className: "text-[13px] text-[var(--pw-accent)] hover:underline mt-2 inline-block", children: "View full profile →" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "curriculum", className: "mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px] text-[var(--pw-ink-2)] mb-3", children: [
              sections.length,
              " sections · ",
              lessons.length,
              " lessons · ",
              totalMin,
              " min total"
            ] }),
            previewLesson && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-xl overflow-hidden border border-[var(--pw-border)] bg-black", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video", children: previewLesson.video_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: previewLesson.video_url, controls: true, autoPlay: true, className: "w-full h-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full grid place-items-center text-white/60", children: "No preview video" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-[var(--pw-surface)] text-[13px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Preview · ",
                  previewLesson.title
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPreviewLesson(null), className: "text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]", children: "Close" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Accordion, { type: "multiple", className: "space-y-2", children: [
              sections.map((s) => {
                const sLessons = lessons.filter((l) => l.section_id === s.id);
                const sMin = sLessons.reduce((a, l) => a + (l.duration_minutes ?? 0), 0);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, { value: s.id, className: "rounded-lg border border-[var(--pw-border)] bg-[var(--pw-surface)] px-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "hover:no-underline", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center justify-between pr-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-left", children: s.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[12px] text-[var(--pw-ink-2)] font-normal", children: [
                      sLessons.length,
                      " lessons · ",
                      sMin,
                      " min"
                    ] })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "border-t border-[var(--pw-border)] -mx-4", children: [
                    sLessons.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "px-4 py-2.5 flex items-center justify-between border-b border-[var(--pw-border)] last:border-0 text-[13px]", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 min-w-0", children: [
                        l.is_free_preview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
                          setPreviewLesson(l);
                          window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                          });
                        }, className: "flex items-center gap-2 text-[var(--pw-accent)] hover:underline", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-3.5" }),
                          " ",
                          l.title
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-[var(--pw-ink)]", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-3.5 text-[var(--pw-ink-2)]" }),
                          " ",
                          l.title
                        ] }),
                        l.is_free_preview && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-[var(--pw-accent)] uppercase font-semibold", children: "Preview" })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[var(--pw-ink-2)] shrink-0", children: [
                        l.duration_minutes,
                        " min"
                      ] })
                    ] }, l.id)),
                    sLessons.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-4 py-3 text-[12px] text-[var(--pw-ink-2)]", children: "No lessons yet." })
                  ] }) })
                ] }, s.id);
              }),
              sections.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] text-[var(--pw-ink-2)] py-8 text-center", children: "Curriculum coming soon." })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "reviews", className: "mt-6 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-6 grid sm:grid-cols-[180px_1fr] gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-5xl", children: ratingAvg ? ratingAvg.toFixed(1) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Stars, { value: ratingAvg, className: "justify-center mt-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)] mt-1", children: [
                  reviews.length,
                  " reviews"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5", children: [5, 4, 3, 2, 1].map((n) => {
                const count = ratingDist[n - 1];
                const pct = reviews.length ? count / reviews.length * 100 : 0;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[12px]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-8 text-[var(--pw-ink-2)]", children: [
                    n,
                    "★"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-2 bg-[var(--pw-surface-2)] rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-[var(--pw-accent-3)]", style: {
                    width: `${pct}%`
                  } }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-right text-[var(--pw-ink-2)]", children: count })
                ] }, n);
              }) })
            ] }),
            me && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium mb-2", children: "Write a review" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 mb-2", children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDraftRating(n), "aria-label": `${n} stars`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `size-5 ${n <= draftRating ? "fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" : "text-[var(--pw-ink-2)]"}` }) }, n)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: draftBody, onChange: (e) => setDraftBody(e.target.value), placeholder: "Share your experience…", rows: 3 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submitReview, className: "mt-2", disabled: !draftBody.trim(), children: "Submit review" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-3", children: [
              reviews.slice(0, reviewsShown).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewCard, { review: r }, r.id)),
              reviews.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-[13px] text-[var(--pw-ink-2)] py-6 text-center", children: "No reviews yet — be the first." })
            ] }),
            reviewsShown < reviews.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setReviewsShown((n) => n + 5), children: "Load more" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "faq", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Accordion, { type: "single", collapsible: true, className: "space-y-2", children: DEFAULT_FAQ.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, { value: `f-${i}`, className: "rounded-lg border border-[var(--pw-border)] bg-[var(--pw-surface)] px-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "hover:no-underline text-left font-medium", children: f.q }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { className: "text-[13px] text-[var(--pw-ink-2)]", children: f.a })
          ] }, i)) }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block" })
      ] }),
      related.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl mb-4", children: "Students also viewed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x", children: related.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/courses/$slug", params: {
          slug: r.slug ?? r.id
        }, className: "snap-start shrink-0 w-[260px] rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] overflow-hidden hover:shadow-md transition", children: [
          r.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: r.thumbnail_url, alt: r.title, className: "w-full aspect-[16/9] object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[16/9] bg-[var(--pw-surface-2)] grid place-items-center text-[var(--pw-ink-2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "size-8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-[14px] line-clamp-2", children: r.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12px] text-[var(--pw-ink-2)] mt-1", children: [
              r.discount_price ?? r.price ?? "—",
              " ",
              r.currency
            ] })
          ] })
        ] }, r.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--pw-surface)]/95 backdrop-blur border-t border-[var(--pw-border)] p-3 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[15px] font-semibold leading-none", children: [
          finalPrice != null ? `${finalPrice} ${course.currency}` : "—",
          hasDiscount && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 line-through text-[var(--pw-ink-2)] text-[12px] font-normal", children: course.price })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-[var(--pw-ink-2)] mt-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-3 text-[var(--pw-accent-2)]" }),
          " 14-day refund"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleWishlist, "aria-label": "Wishlist", className: "size-10 grid place-items-center rounded-md border border-[var(--pw-border)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `size-4 ${wishlisted ? "fill-[var(--pw-accent)] text-[var(--pw-accent)]" : ""}` }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/book/$tutorId", params: {
        tutorId: course.tutor_id
      }, className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90", children: "Enroll Now" }) })
    ] })
  ] });
}
function Stat({
  icon,
  label
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
    icon,
    label
  ] });
}
function Stars({
  value,
  className = ""
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center gap-0.5 ${className}`, children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `size-3.5 ${n <= Math.round(value) ? "fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" : "text-current opacity-30"}` }, n)) });
}
function ShareBtn({
  onClick,
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, "aria-label": label, title: label, className: "size-9 grid place-items-center rounded-md border border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]", children });
}
function ReviewCard({
  review
}) {
  const [author, setAuthor] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!review.student_id) return;
    supabase.from("profiles").select("display_name, full_name, avatar_url").eq("id", review.student_id).maybeSingle().then((r) => {
      const p = r.data;
      if (p) setAuthor({
        name: p.display_name || p.full_name || "Student",
        avatar: p.avatar_url ?? null
      });
    });
  }, [review.student_id]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      author?.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: author.avatar, alt: "", className: "size-9 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-full bg-[var(--pw-accent-soft)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[13px] font-medium", children: author?.name ?? "Student" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-[var(--pw-ink-2)]", children: new Date(review.created_at).toLocaleDateString() })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stars, { value: review.rating ?? 0 })
    ] }),
    review.body && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[13px] text-[var(--pw-ink)] mt-2", children: review.body })
  ] });
}
function setMeta(name, content, isProperty = false) {
  if (typeof document === "undefined") return;
  const attr = isProperty ? "property" : "name";
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
export {
  PublicCoursePage as component
};
