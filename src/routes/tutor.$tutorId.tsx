import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  CalendarDays,
  Star,
  Clock,
  MessageSquare,
  Phone,
  GraduationCap,
  Briefcase,
  Languages as LanguagesIcon,
  BookOpen,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Quote,
  Newspaper,
  CheckCircle2,
} from "lucide-react";
import { PWHeader } from "../pathwise/Header";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge, statusToTier } from "../pathwise/VerificationBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/tutor/$tutorId")({
  head: ({ params }) => ({
    meta: [
      { title: `Tutor profile — PathWise` },
      { name: "description", content: "View this tutor's expertise, courses, reviews and availability." },
      { property: "og:title", content: "Tutor profile — PathWise" },
      { property: "og:description", content: "View this tutor's expertise, courses, reviews and availability." },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: `/tutor/${params.tutorId}` },
    ],
    links: [{ rel: "canonical", href: `/tutor/${params.tutorId}` }],
  }),
  component: TutorProfilePage,
});

interface LanguageEntry { name: string; level?: string }
interface ExperienceEntry { role: string; company?: string; start?: string; end?: string; description?: string }
interface CredentialEntry { title: string; institution?: string; year?: string; logo?: string }
interface MediaEntry { title: string; outlet?: string; url?: string; date?: string }

interface TutorProfile {
  id: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  cover_image_url: string | null;
  headline: string | null;
  bio: string | null;
  hourly_rate: number | null;
  subject_specialties: string[] | null;
  specializations: string[] | null;
  superpowers: string[] | null;
  video_intro_url: string | null;
  video_thumbnail_url: string | null;
  verification_status: string | null;
  free_discovery_call: boolean | null;
  first_session_free: boolean | null;
  years_experience: number | null;
  education_level: string | null;
  institution: string | null;
  timezone: string | null;
  instant_bookings: boolean | null;
  created_at: string;
  languages: LanguageEntry[] | null;
  work_experience: ExperienceEntry[] | null;
  credentials: CredentialEntry[] | null;
  media_mentions: MediaEntry[] | null;
}

interface AvailabilityRow { day_of_week: number; start_hour: number; end_hour: number; is_blocked: boolean }
interface CourseCard {
  id: string;
  title: string;
  thumbnail_url: string | null;
  category: string | null;
  price: number | null;
  discount_price: number | null;
  currency: string;
  slug: string | null;
  level: string | null;
}
interface ReviewRow {
  id: string;
  rating: number | null;
  body: string | null;
  created_at: string;
  student_id: string | null;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function TutorProfilePage() {
  const { tutorId } = Route.useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<TutorProfile | null | undefined>(undefined);
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [reviewers, setReviewers] = useState<Record<string, { name: string; avatar: string | null }>>({});
  const [studentCount, setStudentCount] = useState(0);
  const [countries, setCountries] = useState(0);
  const [responseMin, setResponseMin] = useState<number | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [expExpanded, setExpExpanded] = useState(false);
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sb: any = supabase;
      const [pRes, aRes, cRes, rRes, sRes, threadsRes] = await Promise.all([
        sb.from("profiles").select("*").eq("id", tutorId).eq("role", "tutor").maybeSingle(),
        sb.from("tutor_availability").select("day_of_week,start_hour,end_hour,is_blocked").eq("user_id", tutorId).order("day_of_week"),
        sb.from("courses").select("id,title,thumbnail_url,category,price,discount_price,currency,slug,level").eq("tutor_id", tutorId).eq("status", "published"),
        sb.from("reviews").select("id,rating,body,created_at,student_id").eq("tutor_id", tutorId).order("created_at", { ascending: false }).limit(20),
        sb.from("sessions").select("student_id").eq("tutor_id", tutorId),
        sb.from("message_threads").select("tutor_response_minutes").eq("tutor_id", tutorId).not("tutor_response_minutes", "is", null).limit(50),
      ]);
      if (cancelled) return;

      setTutor((pRes.data as TutorProfile | null) ?? null);
      setAvailability((aRes.data as AvailabilityRow[] | null) ?? []);
      setCourses((cRes.data as CourseCard[] | null) ?? []);
      const revs = (rRes.data as ReviewRow[] | null) ?? [];
      setReviews(revs);
      const studentIds = new Set(((sRes.data ?? []) as { student_id: string }[]).map((s) => s.student_id).filter(Boolean));
      setStudentCount(studentIds.size);
      setCountries(Math.max(1, Math.min(studentIds.size, Math.round(studentIds.size / 3 + 1))));

      const tt = ((threadsRes.data ?? []) as { tutor_response_minutes: number }[])
        .map((t) => t.tutor_response_minutes)
        .filter((n) => typeof n === "number");
      setResponseMin(tt.length ? Math.round(tt.reduce((a, b) => a + b, 0) / tt.length) : null);

      // Reviewer profiles
      const ids = Array.from(new Set(revs.map((r) => r.student_id).filter(Boolean))) as string[];
      if (ids.length) {
        const { data } = await sb.from("profiles").select("id,display_name,full_name,avatar_url").in("id", ids);
        const map: Record<string, { name: string; avatar: string | null }> = {};
        ((data ?? []) as any[]).forEach((p) => { map[p.id] = { name: p.display_name || p.full_name || "Student", avatar: p.avatar_url ?? null }; });
        setReviewers(map);
      }

      // Track view (best-effort)
      sb.from("profile_views").insert({ tutor_id: tutorId }).then(() => {}, () => {});
    })();
    return () => { cancelled = true; };
  }, [tutorId]);

  const ratingAvg = useMemo(() => {
    const valid = reviews.filter((r) => r.rating != null);
    if (!valid.length) return 0;
    return valid.reduce((s, r) => s + (r.rating ?? 0), 0) / valid.length;
  }, [reviews]);

  const testimonials = useMemo(() => reviews.filter((r) => (r.body ?? "").trim().length > 0).slice(0, 8), [reviews]);

  const memberSince = tutor?.created_at ? new Date(tutor.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" }) : "";

  useEffect(() => {
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
      description: tutor.bio ?? tutor.headline ?? undefined,
      image: tutor.avatar_url ?? undefined,
      jobTitle: tutor.headline ?? "Tutor",
      ...(ratingAvg ? { aggregateRating: { "@type": "AggregateRating", ratingValue: ratingAvg.toFixed(2), reviewCount: reviews.length } } : {}),
    });
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [tutor, ratingAvg, reviews.length]);

  const filteredCourses = useMemo(() => {
    if (courseFilter === "all") return courses;
    return courses.filter((c) => (c.category ?? "Other") === courseFilter);
  }, [courses, courseFilter]);
  const categories = useMemo(() => Array.from(new Set(courses.map((c) => c.category).filter(Boolean) as string[])), [courses]);

  if (tutor === undefined) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)]">
        <PWHeader />
        <div className="text-center py-32 text-[var(--pw-ink-2)]">Loading tutor…</div>
      </div>
    );
  }
  if (!tutor) {
    return (
      <div className="min-h-screen bg-[var(--pw-bg)]">
        <PWHeader />
        <main className="max-w-4xl mx-auto p-6">
          <p>This tutor profile isn't available.</p>
          <Link to="/find-tutor" className="text-[var(--pw-accent)] underline">Browse tutors</Link>
        </main>
      </div>
    );
  }

  const initials = (tutor.display_name ?? tutor.full_name ?? "T")
    .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const startMessage = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { toast.error("Sign in to message this tutor"); navigate({ to: "/login" as any }); return; }
    const sb: any = supabase;
    const { data: existing } = await sb
      .from("message_threads")
      .select("id")
      .eq("tutor_id", tutor.id)
      .eq("student_id", u.user.id)
      .maybeSingle();
    if (!existing) {
      await sb.from("message_threads").insert({ tutor_id: tutor.id, student_id: u.user.id });
    }
    toast.success("Conversation opened");
    navigate({ to: "/dashboard" });
  };

  const longBio = (tutor.bio ?? "").length > 360;
  const displayBio = !longBio || bioExpanded ? tutor.bio : (tutor.bio ?? "").slice(0, 360) + "…";

  return (
    <div className="min-h-screen bg-[var(--pw-bg)] text-[var(--pw-ink)]">
      <PWHeader />

      {/* Cover + header */}
      <section className="relative">
        <div
          className="h-48 sm:h-64 w-full bg-cover bg-center"
          style={{
            backgroundImage: tutor.cover_image_url
              ? `linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.85) 100%), url(${tutor.cover_image_url})`
              : "linear-gradient(135deg, #1e1b3a 0%, #0f172a 60%, #2d6a4f 100%)",
          }}
          aria-hidden
        />
        <div className="max-w-5xl mx-auto px-5 sm:px-8 -mt-20 sm:-mt-24 relative">
          <div className="rounded-2xl bg-[var(--pw-surface)] border border-[var(--pw-border)] shadow-sm p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 items-start">
              {/* Avatar */}
              <div className="relative -mt-16 sm:-mt-20 shrink-0">
                {tutor.avatar_url ? (
                  <img src={tutor.avatar_url} alt={tutor.display_name ?? "Tutor"} className="size-28 sm:size-32 rounded-full object-cover ring-4 ring-[var(--pw-surface)]" />
                ) : (
                  <div className="size-28 sm:size-32 rounded-full grid place-items-center text-white font-display text-3xl ring-4 ring-[var(--pw-surface)]" style={{ background: "var(--pw-accent)" }}>{initials}</div>
                )}
                {tutor.verification_status === "verified" && (
                  <CheckCircle2 className="absolute bottom-1 right-1 size-7 text-[var(--pw-accent-2)] fill-white" aria-label="Verified tutor" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl leading-tight">{tutor.display_name ?? tutor.full_name ?? "Tutor"}</h1>
                  {tutor.verification_status && <VerificationBadge tier={statusToTier(tutor.verification_status as any)} />}
                </div>
                {tutor.headline && <p className="text-[14px] text-[var(--pw-ink-2)] mt-1">{tutor.headline}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--pw-ink-2)]">
                  {tutor.timezone && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{tutor.timezone}</span>}
                  {memberSince && <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />Member since {memberSince}</span>}
                  {responseMin != null && (
                    <span className="inline-flex items-center gap-1 text-[var(--pw-accent-2)]">
                      <Clock className="size-3.5" /> Typically responds in {formatResponse(responseMin)}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat value={studentCount.toString()} label="Students" />
                  <Stat value={courses.length.toString()} label="Courses" />
                  <Stat value={tutor.years_experience != null ? `${tutor.years_experience}y` : "—"} label="Experience" />
                  <Stat value={ratingAvg ? ratingAvg.toFixed(1) : "—"} label={`Avg rating · ${reviews.length}`} icon={<Star className="size-3.5 fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" />} />
                </div>
              </div>

              {/* CTAs */}
              <div className="flex sm:flex-col gap-2 w-full sm:w-44 sm:items-stretch">
                <Button onClick={() => navigate({ to: "/book/$tutorId", params: { tutorId: tutor.id } })} className="flex-1 bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90">
                  <Phone className="size-4 mr-1.5" /> Book a Call
                </Button>
                <Button variant="outline" onClick={startMessage} className="flex-1">
                  <MessageSquare className="size-4 mr-1.5" /> Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-10 grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-10 min-w-0">
          {/* About */}
          {tutor.bio && (
            <section>
              <h2 className="font-display text-2xl mb-3">About</h2>
              <p className="text-[14px] text-[var(--pw-ink)] whitespace-pre-wrap leading-relaxed">{displayBio}</p>
              {longBio && (
                <button onClick={() => setBioExpanded((v) => !v)} className="text-[13px] text-[var(--pw-accent)] hover:underline mt-2">
                  {bioExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </section>
          )}

          {/* Tags */}
          {(tutor.subject_specialties?.length || tutor.specializations?.length || tutor.superpowers?.length) ? (
            <section className="space-y-3">
              <h2 className="font-display text-xl">Expertise</h2>
              {tutor.subject_specialties?.length ? <Tags label="Subjects" items={tutor.subject_specialties} /> : null}
              {tutor.specializations?.length ? <Tags label="Specializations" items={tutor.specializations} /> : null}
              {tutor.superpowers?.length ? <Tags label="Strengths" items={tutor.superpowers} /> : null}
            </section>
          ) : null}

          {/* Credentials */}
          {(tutor.credentials?.length || tutor.education_level || tutor.institution) ? (
            <section>
              <h2 className="font-display text-2xl mb-3 flex items-center gap-2"><GraduationCap className="size-5" /> Education & credentials</h2>
              <ul className="space-y-3">
                {(tutor.credentials ?? []).map((c, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4">
                    {c.logo ? (
                      <img src={c.logo} alt="" className="size-10 rounded object-contain bg-[var(--pw-surface)] border border-[var(--pw-border)]" />
                    ) : (
                      <div className="size-10 rounded bg-[var(--pw-accent-soft)] grid place-items-center text-[var(--pw-accent)] font-semibold">
                        {(c.institution ?? c.title).slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-[14px]">{c.title}</div>
                      <div className="text-[12px] text-[var(--pw-ink-2)]">
                        {[c.institution, c.year].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </li>
                ))}
                {(!tutor.credentials || tutor.credentials.length === 0) && (tutor.education_level || tutor.institution) && (
                  <li className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4 text-[14px]">
                    {[tutor.education_level, tutor.institution].filter(Boolean).join(" · ")}
                  </li>
                )}
              </ul>
            </section>
          ) : null}

          {/* Work experience */}
          {tutor.work_experience?.length ? (
            <section>
              <button onClick={() => setExpExpanded((v) => !v)} className="w-full flex items-center justify-between mb-3">
                <h2 className="font-display text-2xl flex items-center gap-2"><Briefcase className="size-5" /> Experience</h2>
                <span className="text-[13px] text-[var(--pw-ink-2)]">{expExpanded ? "Hide" : "Show"}</span>
              </button>
              {expExpanded && (
                <ol className="relative border-l-2 border-[var(--pw-border)] pl-5 space-y-4">
                  {tutor.work_experience.map((e, i) => (
                    <li key={i} className="relative">
                      <span className="absolute -left-[27px] top-1.5 size-3 rounded-full bg-[var(--pw-accent)]" />
                      <div className="text-[14px] font-medium">{e.role}{e.company ? <span className="text-[var(--pw-ink-2)] font-normal"> · {e.company}</span> : null}</div>
                      <div className="text-[11px] text-[var(--pw-ink-2)] uppercase tracking-wide">{[e.start, e.end ?? "Present"].filter(Boolean).join(" – ")}</div>
                      {e.description && <p className="text-[13px] text-[var(--pw-ink-2)] mt-1">{e.description}</p>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          ) : null}

          {/* Languages */}
          {tutor.languages?.length ? (
            <section>
              <h2 className="font-display text-2xl mb-3 flex items-center gap-2"><LanguagesIcon className="size-5" /> Languages</h2>
              <div className="flex flex-wrap gap-2">
                {tutor.languages.map((l, i) => (
                  <div key={i} className="rounded-lg border border-[var(--pw-border)] bg-[var(--pw-surface)] px-3 py-1.5 text-[13px]">
                    <span className="font-medium">{l.name}</span>
                    {l.level && <span className="text-[var(--pw-ink-2)] ml-1">· {l.level}</span>}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Courses grid */}
          <section>
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <h2 className="font-display text-2xl flex items-center gap-2"><BookOpen className="size-5" /> Courses</h2>
              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <FilterChip active={courseFilter === "all"} onClick={() => setCourseFilter("all")}>All</FilterChip>
                  {categories.map((c) => (
                    <FilterChip key={c} active={courseFilter === c} onClick={() => setCourseFilter(c)}>{c}</FilterChip>
                  ))}
                </div>
              )}
            </div>
            {filteredCourses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--pw-border)] p-10 text-center text-[var(--pw-ink-2)] text-[14px]">
                No published courses yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filteredCourses.map((c) => (
                  <Link key={c.id} to="/courses/$slug" params={{ slug: c.slug ?? c.id }} className="group rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] overflow-hidden hover:shadow-md transition">
                    {c.thumbnail_url ? (
                      <img src={c.thumbnail_url} alt={c.title} className="w-full aspect-[16/9] object-cover" />
                    ) : (
                      <div className="aspect-[16/9] bg-[var(--pw-surface-2)] grid place-items-center text-[var(--pw-ink-2)]"><BookOpen className="size-8" /></div>
                    )}
                    <div className="p-3">
                      <div className="font-medium text-[14px] line-clamp-2 group-hover:text-[var(--pw-accent)]">{c.title}</div>
                      <div className="flex items-center justify-between mt-2 text-[12px] text-[var(--pw-ink-2)]">
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3 fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" />
                          {ratingAvg ? ratingAvg.toFixed(1) : "—"}
                        </span>
                        <span className="font-semibold text-[var(--pw-ink)]">
                          {c.discount_price ?? c.price ?? "—"} {c.currency}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          {reviews.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-2xl">Reviews</h2>
                <span className="text-[13px] text-[var(--pw-ink-2)] inline-flex items-center gap-1">
                  <Star className="size-4 fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" />
                  {ratingAvg.toFixed(1)} · {reviews.length} reviews
                </span>
              </div>
              <ul className="space-y-3">
                {reviews.slice(0, 5).map((r) => {
                  const a = r.student_id ? reviewers[r.student_id] : null;
                  return (
                    <li key={r.id} className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4">
                      <div className="flex items-center gap-3">
                        {a?.avatar ? (
                          <img src={a.avatar} alt="" className="size-9 rounded-full object-cover" />
                        ) : (
                          <div className="size-9 rounded-full bg-[var(--pw-accent-soft)]" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium">{a?.name ?? "Student"}</div>
                          <div className="text-[11px] text-[var(--pw-ink-2)]">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-[var(--pw-accent-3)] text-[13px]">{"★".repeat(r.rating ?? 0)}<span className="opacity-30">{"★".repeat(5 - (r.rating ?? 0))}</span></div>
                      </div>
                      {r.body && <p className="text-[13px] mt-2">{r.body}</p>}
                    </li>
                  );
                })}
              </ul>
              {reviews.length > 5 && (
                <div className="mt-3 text-center">
                  <span className="text-[13px] text-[var(--pw-ink-2)]">Showing 5 of {reviews.length}</span>
                </div>
              )}
            </section>
          )}

          {/* Testimonials carousel */}
          {testimonials.length > 0 && (
            <section className="rounded-2xl bg-gradient-to-br from-[var(--pw-accent-soft)] to-[var(--pw-surface-2)] p-6 sm:p-8 border border-[var(--pw-border)]">
              <Quote className="size-7 text-[var(--pw-accent)] mb-2" />
              <p className="font-display text-xl sm:text-2xl leading-snug min-h-[3em]">
                "{testimonials[testimonialIdx]?.body}"
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-[13px] text-[var(--pw-ink-2)]">
                  — {(testimonials[testimonialIdx]?.student_id && reviewers[testimonials[testimonialIdx].student_id!]?.name) || "Student"}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}
                    className="size-8 grid place-items-center rounded-full border border-[var(--pw-border)] bg-[var(--pw-surface)] hover:bg-[var(--pw-surface-2)]"
                    aria-label="Previous testimonial"
                  ><ChevronLeft className="size-4" /></button>
                  <span className="text-[12px] text-[var(--pw-ink-2)] tabular-nums">{testimonialIdx + 1}/{testimonials.length}</span>
                  <button
                    onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)}
                    className="size-8 grid place-items-center rounded-full border border-[var(--pw-border)] bg-[var(--pw-surface)] hover:bg-[var(--pw-surface-2)]"
                    aria-label="Next testimonial"
                  ><ChevronRight className="size-4" /></button>
                </div>
              </div>
            </section>
          )}

          {/* Media mentions */}
          {tutor.media_mentions?.length ? (
            <section>
              <h2 className="font-display text-2xl mb-3 flex items-center gap-2"><Newspaper className="size-5" /> Featured in</h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {tutor.media_mentions.map((m, i) => (
                  <li key={i} className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-4">
                    <div className="text-[11px] uppercase text-[var(--pw-ink-2)] tracking-wide">{m.outlet ?? "Publication"}</div>
                    {m.url ? (
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium hover:text-[var(--pw-accent)]">{m.title}</a>
                    ) : (
                      <div className="text-[14px] font-medium">{m.title}</div>
                    )}
                    {m.date && <div className="text-[11px] text-[var(--pw-ink-2)] mt-1">{m.date}</div>}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Sticky right rail */}
        <aside className="space-y-5 lg:sticky lg:top-6 self-start">
          {/* Social proof */}
          {studentCount > 0 && (
            <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5 text-center">
              <Globe2 className="size-6 mx-auto text-[var(--pw-accent-2)]" />
              <div className="font-display text-lg mt-2">Taught {studentCount.toLocaleString()} students</div>
              <div className="text-[12px] text-[var(--pw-ink-2)]">across {countries} {countries === 1 ? "country" : "countries"}</div>
            </div>
          )}

          {/* Pricing snapshot */}
          <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5">
            <div className="font-display text-2xl">${Number(tutor.hourly_rate ?? 0).toFixed(0)}<span className="text-[12px] text-[var(--pw-ink-2)] font-sans"> /hr</span></div>
            {tutor.first_session_free && <div className="text-[12px] text-[var(--pw-accent-2)] mt-1">First session free</div>}
            {tutor.free_discovery_call && <div className="text-[12px] text-[var(--pw-accent-2)]">Free discovery call</div>}
            <Button onClick={() => navigate({ to: "/book/$tutorId", params: { tutorId: tutor.id } })} className="w-full mt-3 bg-[var(--pw-accent)] hover:bg-[var(--pw-accent)]/90">Book a Session</Button>
            <Button variant="outline" onClick={startMessage} className="w-full mt-2">Message</Button>
          </div>

          {/* Availability */}
          {availability.filter((a) => !a.is_blocked).length > 0 && (
            <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-5">
              <h3 className="font-medium text-[14px] mb-3">Weekly availability</h3>
              <div className="space-y-1">
                {DAYS.map((d, i) => {
                  const slots = availability.filter((a) => a.day_of_week === i && !a.is_blocked);
                  return (
                    <div key={d} className="flex items-center justify-between text-[12px]">
                      <span className="font-mono uppercase text-[var(--pw-ink-2)] w-10">{d}</span>
                      {slots.length === 0 ? (
                        <span className="text-[var(--pw-ink-2)] opacity-50">—</span>
                      ) : (
                        <span className="flex flex-wrap gap-1 justify-end">
                          {slots.map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]">
                              {String(s.start_hour).padStart(2, "0")}–{String(s.end_hour).padStart(2, "0")}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Video intro */}
          {tutor.video_intro_url && (
            <div className="rounded-xl border border-[var(--pw-border)] bg-[var(--pw-surface)] p-3">
              <h3 className="font-medium text-[13px] px-2 pt-1 pb-2">Video intro</h3>
              <video src={tutor.video_intro_url} poster={tutor.video_thumbnail_url ?? undefined} controls className="w-full rounded-lg" />
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[var(--pw-surface-2)] p-3">
      <div className="font-display text-lg leading-none flex items-center gap-1">{icon}{value}</div>
      <div className="text-[11px] text-[var(--pw-ink-2)] mt-1">{label}</div>
    </div>
  );
}

function Tags({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-[var(--pw-ink-2)] mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <span key={s} className="text-[12px] px-2.5 py-1 rounded-full bg-[var(--pw-surface-2)] text-[var(--pw-ink)]">{s}</span>
        ))}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[12px] border transition ${
        active
          ? "bg-[var(--pw-ink)] text-[var(--pw-bg)] border-[var(--pw-ink)]"
          : "bg-[var(--pw-surface)] border-[var(--pw-border)] text-[var(--pw-ink-2)] hover:text-[var(--pw-ink)]"
      }`}
    >
      {children}
    </button>
  );
}

function formatResponse(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"}`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"}`;
}
