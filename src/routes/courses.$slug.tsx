import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  Play,
  Lock,
  Award,
  Star,
  Heart,
  Clock,
  Globe,
  BarChart3,
  Calendar,
  Share2,
  Copy,
  Twitter,
  Linkedin,
  Facebook,
  ShieldCheck,
  ChevronRight,
  Users,
} from "lucide-react";
import { PWHeader } from "../pathwise/Header";
import { supabase } from "@/integrations/supabase/client";
import { CourseRow, LessonRow, SectionRow, getCourseBySlug } from "../pathwise/courses";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const DEFAULT_FAQ = [
  { q: "Do I get lifetime access?", a: "Yes — once enrolled you can revisit any lesson at any time." },
  { q: "Is there a money-back guarantee?", a: "We offer a 14-day no-questions-asked refund on every paid course." },
  { q: "Will I receive a certificate?", a: "Certificates are issued automatically when the certificate option is enabled by the tutor." },
  { q: "Can I message the tutor?", a: "Yes — enrolled students can start a thread directly with their tutor from the dashboard." },
];

export const Route = createFileRoute("/courses/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: "Course — PathWise" },
      { name: "description", content: "Explore this course on PathWise — lessons, reviews, and tutor details." },
      { property: "og:title", content: "Course — PathWise" },
      { property: "og:description", content: "Explore this course on PathWise — lessons, reviews, and tutor details." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `/courses/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/courses/${params.slug}` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: DEFAULT_FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: PublicCoursePage,
});

interface ReviewRow {
  id: string;
  student_id: string | null;
  tutor_id: string | null;
  rating: number | null;
  body: string | null;
  created_at: string;
}

function PublicCoursePage() {
  const { slug } = useParams({ from: "/courses/$slug" });
  const [course, setCourse] = useState<CourseRow | null | undefined>(undefined);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [tutor, setTutor] = useState<any>(null);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [related, setRelated] = useState<CourseRow[]>([]);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [reviewsShown, setReviewsShown] = useState(5);
  const [tab, setTab] = useState("overview");
  const [draftRating, setDraftRating] = useState(5);
  const [draftBody, setDraftBody] = useState("");
  const [previewLesson, setPreviewLesson] = useState<LessonRow | null>(null);

  // Load auth user (client-only to avoid SSR mismatch)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user ? { id: data.user.id } : null));
  }, []);

  // Wishlist (localStorage)
  useEffect(() => {
    if (!course) return;
    try {
      const list: string[] = JSON.parse(localStorage.getItem("pw_wishlist") ?? "[]");
      setWishlisted(list.includes(course.id));
    } catch { /* ignore */ }
  }, [course]);

  const toggleWishlist = () => {
    if (!course) return;
    try {
      const list: string[] = JSON.parse(localStorage.getItem("pw_wishlist") ?? "[]");
      const next = list.includes(course.id) ? list.filter((x) => x !== course.id) : [...list, course.id];
      localStorage.setItem("pw_wishlist", JSON.stringify(next));
      setWishlisted(next.includes(course.id));
      toast.success(next.includes(course.id) ? "Saved to wishlist" : "Removed from wishlist");
    } catch { /* ignore */ }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await getCourseBySlug(slug);
      if (cancelled) return;
      setCourse(c);
      if (!c) return;
      const sb: any = supabase;
      const [secs, less, prof, revs, rel, students] = await Promise.all([
        sb.from("course_sections").select("*").eq("course_id", c.id).order("position"),
        sb.from("course_lessons").select("*").eq("course_id", c.id).order("position"),
        sb.from("profiles").select("*").eq("id", c.tutor_id).maybeSingle(),
        sb.from("reviews").select("*").eq("tutor_id", c.tutor_id).order("created_at", { ascending: false }),
        c.category
          ? sb
              .from("courses")
              .select("*")
              .eq("status", "published")
              .eq("category", c.category)
              .neq("id", c.id)
              .limit(8)
          : Promise.resolve({ data: [] }),
        sb.from("sessions").select("student_id", { count: "exact", head: false }).eq("tutor_id", c.tutor_id),
      ]);
      if (cancelled) return;
      setSections(secs.data ?? []);
      setLessons(less.data ?? []);
      setTutor(prof.data ?? null);
      setReviews(revs.data ?? []);
      setRelated((rel.data ?? []) as CourseRow[]);
      const uniq = new Set(((students.data ?? []) as { student_id: string }[]).map((s) => s.student_id).filter(Boolean));
      setStudentCount(uniq.size);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // SEO: dynamic doc head + JSON-LD (client only)
  useEffect(() => {
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
      provider: { "@type": "Organization", name: "PathWise", sameAs: typeof window !== "undefined" ? window.location.origin : undefined },
      ...(course.thumbnail_url ? { image: course.thumbnail_url } : {}),
      ...(tutor ? { instructor: { "@type": "Person", name: tutor.display_name || tutor.full_name } } : {}),
    };
    let s = document.getElementById("ld-course") as HTMLScriptElement | null;
    if (!s) {
      s = document.createElement("script");
      s.id = "ld-course";
      s.type = "application/ld+json";
      document.head.appendChild(s);
    }
    s.textContent = JSON.stringify(ld);
  }, [course, tutor]);

  const totalMin = useMemo(() => lessons.reduce((s, l) => s + (l.duration_minutes ?? 0), 0), [lessons]);
  const ratingAvg = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length;
  }, [reviews]);
  const ratingDist = useMemo(() => {
    const d = [0, 0, 0, 0, 0];
    reviews.forEach((r) => { if (r.rating && r.rating >= 1 && r.rating <= 5) d[r.rating - 1]++; });
    return d;
  }, [reviews]);

  if (course === undefined) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)]">
        <PWHeader />
        <div className="text-center py-32 text-[var(--pw-ink-2)]">Loading…</div>
      </div>
    );
  }
  if (!course || course.status !== "published") {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)]">
        <PWHeader />
        <div className="text-center py-32">
          <h1 className="font-display text-2xl">Course not available</h1>
          <p className="text-[var(--pw-ink-2)] mt-2">This course may not be published yet.</p>
          <Link to="/find-tutor" className="text-[var(--pw-accent)] underline mt-4 inline-block">
            Browse tutors
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = course.discount_price ?? course.price;
  const hasDiscount = course.discount_price != null && course.price != null && course.discount_price < course.price;
  const discountPct = hasDiscount && course.price ? Math.round((1 - (course.discount_price! / course.price)) * 100) : 0;
  const updatedDate = new Date(course.updated_at).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  const submitReview = async () => {
    if (!me) { toast.error("Sign in to leave a review"); return; }
    if (!course.tutor_id) return;
    const { error } = await (supabase as any).from("reviews").insert({
      student_id: me.id,
      tutor_id: course.tutor_id,
      rating: draftRating,
      body: draftBody,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Review submitted");
    setDraftBody("");
    const { data } = await (supabase as any).from("reviews").select("*").eq("tutor_id", course.tutor_id).order("created_at", { ascending: false });
    setReviews(data ?? []);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const share = (network: "copy" | "twitter" | "linkedin" | "facebook") => {
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
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    };
    window.open(map[network], "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {course.thumbnail_url && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${course.thumbnail_url})` }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b3a] to-[#0b1226]" aria-hidden />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-8 pb-12 text-white">
          {/* Breadcrumb */}
          <nav className="text-[12px] text-white/70 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="size-3" />
            <Link to="/find-tutor" className="hover:text-white">Courses</Link>
            {course.category && (
              <>
                <ChevronRight className="size-3" />
                <span>{course.category}</span>
              </>
            )}
            <ChevronRight className="size-3" />
            <span className="text-white truncate max-w-[40ch]">{course.title}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_360px] gap-10 mt-6 items-start">
            <div>
              <h1 className="font-display text-3xl sm:text-5xl leading-tight">{course.title}</h1>
              {course.subtitle && <p className="text-white/80 text-[16px] sm:text-[18px] mt-3 max-w-2xl">{course.subtitle}</p>}

              {/* Rating + students */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-[13px]">
                <div className="flex items-center gap-1.5">
                  <Stars value={ratingAvg} />
                  <span className="font-medium">{ratingAvg ? ratingAvg.toFixed(1) : "—"}</span>
                  <span className="text-white/60">({reviews.length} reviews)</span>
                </div>
                <span className="flex items-center gap-1.5 text-white/80">
                  <Users className="size-3.5" /> {studentCount} students
                </span>
              </div>

              {/* Tutor */}
              {tutor && (
                <Link
                  to="/tutor/$tutorId"
                  params={{ tutorId: tutor.id }}
                  className="mt-4 inline-flex items-center gap-2 text-[13px] text-white/90 hover:text-white"
                >
                  {tutor.avatar_url ? (
                    <img src={tutor.avatar_url} alt="" className="size-8 rounded-full object-cover ring-2 ring-white/20" />
                  ) : (
                    <div className="size-8 rounded-full bg-white/10" />
                  )}
                  <span>Created by <span className="underline">{tutor.display_name || tutor.full_name}</span></span>
                </Link>
              )}

              {/* Stat row */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-white/80">
                <Stat icon={<Clock className="size-3.5" />} label={`${totalMin} min`} />
                <Stat icon={<BookOpen className="size-3.5" />} label={`${lessons.length} lessons`} />
                {course.difficulty && <Stat icon={<BarChart3 className="size-3.5" />} label={course.difficulty} />}
                {course.language && <Stat icon={<Globe className="size-3.5" />} label={course.language} />}
                <Stat icon={<Calendar className="size-3.5" />} label={`Updated ${updatedDate}`} />
              </div>

              {/* CTAs (mobile-visible duplicates) */}
              <div className="mt-6 flex items-center gap-3 lg:hidden">
                <Link to="/book/$tutorId" params={{ tutorId: course.tutor_id }} className="flex-1">
                  <Button className="w-full bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90">Enroll Now</Button>
                </Link>
                <button
                  onClick={toggleWishlist}
                  aria-label="Add to wishlist"
                  className="size-10 grid place-items-center rounded-md border border-white/20 hover:bg-white/10"
                >
                  <Heart className={`size-4 ${wishlisted ? "fill-[var(--pw-accent)] text-[var(--pw-accent)]" : ""}`} />
                </button>
              </div>
            </div>

            {/* Sidebar card (desktop sticky) */}
            <aside className="hidden lg:block sticky top-6">
              <div className="rounded-2xl border border-white/10 bg-white text-[var(--pw-ink)] shadow-2xl overflow-hidden">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-[16/9] object-cover" />
                ) : (
                  <div className="aspect-[16/9] bg-[var(--pw-surface-2)] grid place-items-center text-[var(--pw-ink-2)]">
                    <BookOpen className="size-10" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-baseline gap-3">
                    {finalPrice != null ? (
                      <span className="text-3xl font-semibold">{finalPrice} {course.currency}</span>
                    ) : (
                      <span className="text-[var(--pw-ink-2)]">Contact for pricing</span>
                    )}
                    {hasDiscount && (
                      <>
                        <span className="line-through text-[var(--pw-ink-2)] text-[14px]">{course.price}</span>
                        <span className="text-[11px] font-semibold text-[var(--pw-accent)] bg-[var(--pw-accent-soft)] px-1.5 py-0.5 rounded">
                          -{discountPct}%
                        </span>
                      </>
                    )}
                  </div>
                  <Link to="/book/$tutorId" params={{ tutorId: course.tutor_id }}>
                    <Button className="w-full mt-4 bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90">Enroll Now</Button>
                  </Link>
                  <button
                    onClick={toggleWishlist}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 h-10 rounded-md border border-[var(--pw-border)] text-[14px] hover:bg-[var(--pw-surface-2)]"
                  >
                    <Heart className={`size-4 ${wishlisted ? "fill-[var(--pw-accent)] text-[var(--pw-accent)]" : ""}`} />
                    {wishlisted ? "Wishlisted" : "Add to Wishlist"}
                  </button>
                  <div className="mt-4 flex items-center gap-2 text-[12px] text-[var(--pw-ink-2)]">
                    <ShieldCheck className="size-4 text-[var(--pw-accent-2)]" />
                    14-day money-back guarantee
                  </div>
                  {course.certificate_enabled && (
                    <div className="mt-2 flex items-center gap-2 text-[12px] text-[var(--pw-ink-2)]">
                      <Award className="size-4 text-[var(--pw-accent-3)]" />
                      Certificate of completion
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-[var(--pw-border)]">
                    <div className="text-[11px] uppercase tracking-wide text-[var(--pw-ink-2)] mb-2 flex items-center gap-1.5">
                      <Share2 className="size-3" /> Share
                    </div>
                    <div className="flex gap-2">
                      <ShareBtn onClick={() => share("copy")} label="Copy link"><Copy className="size-4" /></ShareBtn>
                      <ShareBtn onClick={() => share("twitter")} label="Share on Twitter"><Twitter className="size-4" /></ShareBtn>
                      <ShareBtn onClick={() => share("linkedin")} label="Share on LinkedIn"><Linkedin className="size-4" /></ShareBtn>
                      <ShareBtn onClick={() => share("facebook")} label="Share on Facebook"><Facebook className="size-4" /></ShareBtn>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 pb-32 lg:pb-20">
        <div className="grid lg:grid-cols-[1fr_360px] gap-10 mt-10">
          {/* Tabs */}
          <div className="min-w-0">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="bg-[var(--pw-surface-2)]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="mt-6 space-y-8">
                {course.description && (
                  <section>
                    <h2 className="font-display text-2xl mb-3">About this course</h2>
                    <div className="prose prose-sm max-w-none text-[var(--pw-ink)]" dangerouslySetInnerHTML={{ __html: course.description }} />
                  </section>
                )}
                {(course.learning_outcomes ?? []).length > 0 && (
                  <section className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-6">
                    <h2 className="font-display text-xl mb-3">What you'll learn</h2>
                    <ul className="grid sm:grid-cols-2 gap-2 text-[14px]">
                      {(course.learning_outcomes ?? []).filter(Boolean).map((o, i) => (
                        <li key={i} className="flex gap-2">
                          <Check className="size-4 text-[var(--pw-accent-2)] mt-1 shrink-0" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {((course.prerequisites ?? []).length > 0 || (course.target_audience ?? []).length > 0) && (
                  <section className="grid sm:grid-cols-2 gap-4">
                    {(course.prerequisites ?? []).length > 0 && (
                      <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5">
                        <h3 className="font-medium mb-2">Prerequisites</h3>
                        <ul className="text-[13px] space-y-1 text-[var(--pw-ink-2)]">
                          {(course.prerequisites ?? []).map((p) => <li key={p}>• {p}</li>)}
                        </ul>
                      </div>
                    )}
                    {(course.target_audience ?? []).length > 0 && (
                      <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5">
                        <h3 className="font-medium mb-2">Who this is for</h3>
                        <ul className="text-[13px] space-y-1 text-[var(--pw-ink-2)]">
                          {(course.target_audience ?? []).map((a) => <li key={a}>• {a}</li>)}
                        </ul>
                      </div>
                    )}
                  </section>
                )}
                {tutor && (
                  <section className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-6">
                    <h2 className="font-display text-xl mb-3">About the tutor</h2>
                    <div className="flex items-start gap-4">
                      {tutor.avatar_url ? (
                        <img src={tutor.avatar_url} alt="" className="size-14 rounded-full object-cover" />
                      ) : (
                        <div className="size-14 rounded-full bg-[var(--pw-accent-soft)]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{tutor.display_name || tutor.full_name}</div>
                        {tutor.headline && <div className="text-[13px] text-[var(--pw-ink-2)]">{tutor.headline}</div>}
                        {tutor.bio && <p className="text-[13px] text-[var(--pw-ink-2)] mt-2 line-clamp-3">{tutor.bio}</p>}
                        <Link to="/tutor/$tutorId" params={{ tutorId: tutor.id }} className="text-[13px] text-[var(--pw-accent)] hover:underline mt-2 inline-block">
                          View full profile →
                        </Link>
                      </div>
                    </div>
                  </section>
                )}
              </TabsContent>

              {/* Curriculum */}
              <TabsContent value="curriculum" className="mt-6">
                <div className="text-[13px] text-[var(--pw-ink-2)] mb-3">
                  {sections.length} sections · {lessons.length} lessons · {totalMin} min total
                </div>
                {previewLesson && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-[var(--pw-border)] bg-black">
                    <div className="aspect-video">
                      {previewLesson.video_url ? (
                        <video src={previewLesson.video_url} controls autoPlay className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-white/60">No preview video</div>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--pw-surface)] text-[13px]">
                      <span>Preview · {previewLesson.title}</span>
                      <button onClick={() => setPreviewLesson(null)} className="text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]">Close</button>
                    </div>
                  </div>
                )}
                <Accordion type="multiple" className="space-y-2">
                  {sections.map((s) => {
                    const sLessons = lessons.filter((l) => l.section_id === s.id);
                    const sMin = sLessons.reduce((a, l) => a + (l.duration_minutes ?? 0), 0);
                    return (
                      <AccordionItem key={s.id} value={s.id} className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-surface)] px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex-1 flex items-center justify-between pr-3">
                            <span className="font-medium text-left">{s.title}</span>
                            <span className="text-[12px] text-[var(--pw-ink-2)] font-normal">
                              {sLessons.length} lessons · {sMin} min
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="border-t border-[var(--pw-border)] -mx-4">
                            {sLessons.map((l) => (
                              <li key={l.id} className="px-4 py-2.5 flex items-center justify-between border-b border-[var(--pw-border)] last:border-0 text-[13px]">
                                <span className="flex items-center gap-2 min-w-0">
                                  {l.is_free_preview ? (
                                    <button onClick={() => { setPreviewLesson(l); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex items-center gap-2 text-[var(--pw-accent)] hover:underline">
                                      <Play className="size-3.5" /> {l.title}
                                    </button>
                                  ) : (
                                    <span className="flex items-center gap-2 text-[var(--pw-ink)]">
                                      <Lock className="size-3.5 text-[var(--pw-ink-2)]" /> {l.title}
                                    </span>
                                  )}
                                  {l.is_free_preview && <span className="text-[10px] text-[var(--pw-accent)] uppercase font-semibold">Preview</span>}
                                </span>
                                <span className="text-[var(--pw-ink-2)] shrink-0">{l.duration_minutes} min</span>
                              </li>
                            ))}
                            {sLessons.length === 0 && (
                              <li className="px-4 py-3 text-[12px] text-[var(--pw-ink-2)]">No lessons yet.</li>
                            )}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                  {sections.length === 0 && (
                    <div className="text-[13px] text-[var(--pw-ink-2)] py-8 text-center">Curriculum coming soon.</div>
                  )}
                </Accordion>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="mt-6 space-y-6">
                <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-6 grid sm:grid-cols-[180px_1fr] gap-6">
                  <div className="text-center">
                    <div className="font-display text-5xl">{ratingAvg ? ratingAvg.toFixed(1) : "—"}</div>
                    <Stars value={ratingAvg} className="justify-center mt-1" />
                    <div className="text-[12px] text-[var(--pw-ink-2)] mt-1">{reviews.length} reviews</div>
                  </div>
                  <div className="space-y-1.5">
                    {[5, 4, 3, 2, 1].map((n) => {
                      const count = ratingDist[n - 1];
                      const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={n} className="flex items-center gap-3 text-[12px]">
                          <span className="w-8 text-[var(--pw-ink-2)]">{n}★</span>
                          <div className="flex-1 h-2 bg-[var(--pw-surface-2)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--pw-accent-3)]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-[var(--pw-ink-2)]">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {me && (
                  <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5">
                    <div className="font-medium mb-2">Write a review</div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setDraftRating(n)} aria-label={`${n} stars`}>
                          <Star className={`size-5 ${n <= draftRating ? "fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" : "text-[var(--pw-ink-2)]"}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea value={draftBody} onChange={(e) => setDraftBody(e.target.value)} placeholder="Share your experience…" rows={3} />
                    <Button onClick={submitReview} className="mt-2" disabled={!draftBody.trim()}>Submit review</Button>
                  </div>
                )}

                <ul className="space-y-3">
                  {reviews.slice(0, reviewsShown).map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                  {reviews.length === 0 && (
                    <li className="text-[13px] text-[var(--pw-ink-2)] py-6 text-center">No reviews yet — be the first.</li>
                  )}
                </ul>
                {reviewsShown < reviews.length && (
                  <div className="text-center">
                    <Button variant="outline" onClick={() => setReviewsShown((n) => n + 5)}>Load more</Button>
                  </div>
                )}
              </TabsContent>

              {/* FAQ */}
              <TabsContent value="faq" className="mt-6">
                <Accordion type="single" collapsible className="space-y-2">
                  {DEFAULT_FAQ.map((f, i) => (
                    <AccordionItem key={i} value={`f-${i}`} className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-surface)] px-4">
                      <AccordionTrigger className="hover:no-underline text-left font-medium">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-[13px] text-[var(--pw-ink-2)]">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
            </Tabs>
          </div>
          {/* Right column placeholder so grid keeps the same width below the hero */}
          <div className="hidden lg:block" />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl mb-4">Students also viewed</h2>
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to="/courses/$slug"
                  params={{ slug: r.slug ?? r.id }}
                  className="snap-start shrink-0 w-[260px] rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] overflow-hidden hover:shadow-md transition"
                >
                  {r.thumbnail_url ? (
                    <img src={r.thumbnail_url} alt={r.title} className="w-full aspect-[16/9] object-cover" />
                  ) : (
                    <div className="aspect-[16/9] bg-[var(--pw-surface-2)] grid place-items-center text-[var(--pw-ink-2)]">
                      <BookOpen className="size-8" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="font-medium text-[14px] line-clamp-2">{r.title}</div>
                    <div className="text-[12px] text-[var(--pw-ink-2)] mt-1">
                      {r.discount_price ?? r.price ?? "—"} {r.currency}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--pw-surface)]/95 backdrop-blur border-t border-[var(--pw-border)] p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold leading-none">
            {finalPrice != null ? `${finalPrice} ${course.currency}` : "—"}
            {hasDiscount && <span className="ml-2 line-through text-[var(--pw-ink-2)] text-[12px] font-normal">{course.price}</span>}
          </div>
          <div className="text-[10px] text-[var(--pw-ink-2)] mt-1 flex items-center gap-1">
            <ShieldCheck className="size-3 text-[var(--pw-accent-2)]" /> 14-day refund
          </div>
        </div>
        <button onClick={toggleWishlist} aria-label="Wishlist" className="size-10 grid place-items-center rounded-md border border-[var(--pw-border)]">
          <Heart className={`size-4 ${wishlisted ? "fill-[var(--pw-accent)] text-[var(--pw-accent)]" : ""}`} />
        </button>
        <Link to="/book/$tutorId" params={{ tutorId: course.tutor_id }} className="flex-1">
          <Button className="w-full bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90">Enroll Now</Button>
        </Link>
      </div>
    </div>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {label}
    </span>
  );
}

function Stars({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`size-3.5 ${n <= Math.round(value) ? "fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" : "text-current opacity-30"}`} />
      ))}
    </span>
  );
}

function ShareBtn({ onClick, label, children }: { onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="size-9 grid place-items-center rounded-md border border-[var(--pw-border)] hover:bg-[var(--pw-surface-2)] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]"
    >
      {children}
    </button>
  );
}

function ReviewCard({ review }: { review: ReviewRow }) {
  const [author, setAuthor] = useState<{ name: string; avatar: string | null } | null>(null);
  useEffect(() => {
    if (!review.student_id) return;
    (supabase as any)
      .from("profiles")
      .select("display_name, full_name, avatar_url")
      .eq("id", review.student_id)
      .maybeSingle()
      .then((r: any) => {
        const p = r.data;
        if (p) setAuthor({ name: p.display_name || p.full_name || "Student", avatar: p.avatar_url ?? null });
      });
  }, [review.student_id]);
  return (
    <li className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4">
      <div className="flex items-center gap-3">
        {author?.avatar ? (
          <img src={author.avatar} alt="" className="size-9 rounded-full object-cover" />
        ) : (
          <div className="size-9 rounded-full bg-[var(--pw-accent-soft)]" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium">{author?.name ?? "Student"}</div>
          <div className="text-[11px] text-[var(--pw-ink-2)]">{new Date(review.created_at).toLocaleDateString()}</div>
        </div>
        <Stars value={review.rating ?? 0} />
      </div>
      {review.body && <p className="text-[13px] text-[var(--pw-ink)] mt-2">{review.body}</p>}
    </li>
  );
}

function setMeta(name: string, content: string, isProperty = false) {
  if (typeof document === "undefined") return;
  const attr = isProperty ? "property" : "name";
  let el = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
