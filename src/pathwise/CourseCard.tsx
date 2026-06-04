import { useState } from "react";
import { Star, Users, Clock, Play } from "lucide-react";

export interface CourseCardData {
  id?: string;
  title: string;
  thumbnailUrl?: string | null;
  trailerUrl?: string | null;
  tutorName: string;
  tutorAvatarUrl?: string | null;
  rating?: number;
  reviewCount?: number;
  priceFromPerHour?: number | null;
  multipleFormats?: boolean;
  outcomes?: string[];
  category?: string | null;
  durationMinutes?: number | null;
  studentsTaught?: number;
}

function Avatar({ name, src }: { name: string; src?: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src) {
    return <img src={src} alt={name} className="h-7 w-7 rounded-full object-cover" />;
  }
  return (
    <div className="h-7 w-7 rounded-full grid place-items-center text-[11px] font-semibold bg-[var(--pw-accent-soft)] text-[var(--pw-accent)]">
      {initials || "?"}
    </div>
  );
}

/** Netflix-style card with hover-reveal quick stats. */
export function CourseCard({ course }: { course: CourseCardData }) {
  const [hover, setHover] = useState(false);
  const rating = course.rating ?? 0;
  const reviews = course.reviewCount ?? 0;

  return (
    <div
      className="group relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-[var(--pw-surface-2)] border border-[var(--pw-border)] cursor-pointer transition-transform duration-200 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.25)]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Thumbnail or trailer */}
      {hover && course.trailerUrl ? (
        <video
          src={course.trailerUrl}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : course.thumbnailUrl ? (
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-[var(--pw-ink-2)]">
          <Play className="size-10 opacity-30" />
        </div>
      )}

      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
        {course.category && (
          <span className="pw-pill text-[10px] px-2 py-0.5 bg-black/60 text-white border border-white/10 uppercase pw-tracking-wide">
            {course.category}
          </span>
        )}
        {course.priceFromPerHour != null && (
          <span className="pw-pill text-[11px] px-2 py-0.5 bg-white/95 text-[var(--pw-ink)] border border-white/40">
            {course.multipleFormats ? "From " : ""}${course.priceFromPerHour}/hr
          </span>
        )}
      </div>

      {/* Bottom gradient + content */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/55 to-transparent text-white">
        <h3 className="font-semibold text-[15px] leading-tight line-clamp-2">{course.title}</h3>
        <div className="mt-1.5 flex items-center gap-2 text-[12px] text-white/85">
          <Avatar name={course.tutorName} src={course.tutorAvatarUrl} />
          <span className="truncate">{course.tutorName}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/80">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-[var(--pw-accent-3)] text-[var(--pw-accent-3)]" />
            {rating ? rating.toFixed(1) : "New"}
            {reviews > 0 && <span className="text-white/60">({reviews})</span>}
          </span>
          {course.durationMinutes && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> {course.durationMinutes}m
            </span>
          )}
          {course.studentsTaught != null && (
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" /> {course.studentsTaught}
            </span>
          )}
        </div>

        {/* Outcomes pills */}
        {course.outcomes && course.outcomes.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {course.outcomes.slice(0, 3).map((o, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/15 backdrop-blur text-white truncate max-w-[120px]"
              >
                {o}
              </span>
            ))}
          </div>
        )}

        {/* Hover-only quick stats / CTA */}
        <div
          className={`mt-2 transition-all duration-200 overflow-hidden ${
            hover ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <button className="w-full mt-1 text-[12px] font-medium bg-white text-[var(--pw-ink)] rounded-md py-1.5 hover:bg-white/90">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}