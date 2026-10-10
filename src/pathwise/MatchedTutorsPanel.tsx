/**
 * src/pathwise/MatchedTutorsPanel.tsx
 *
 * The "Your matched tutors" panel under the roadmap profile card. Lists real,
 * verified tutors for the roadmap's subject (via fetchMatchedTutors). When
 * there are none yet it says so instead of inventing any.
 */

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/Icon";
import type { Subject } from "./data";
import { BAND_META, type LevelBand } from "./levels";
import { fetchMatchedTutors } from "./api";

type MatchedTutor = Awaited<ReturnType<typeof fetchMatchedTutors>>[number];

interface Props {
  subject: Subject;
  /** Band the diagnostic placed the student in. */
  band: LevelBand;
  /** Band the stage they're currently on demands. */
  requiredBand: LevelBand;
  /** Title of the active stage, for the explanatory copy. */
  activeStageTitle: string | null;
  userId: string | null;
}

export function MatchedTutorsPanel({ subject, requiredBand, activeStageTitle }: Props) {
  const [tutors, setTutors] = useState<MatchedTutor[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMatchedTutors(subject)
      .then((rows) => !cancelled && setTutors(rows))
      .catch(() => !cancelled && setTutors([]));
    return () => {
      cancelled = true;
    };
  }, [subject]);

  const requiredMeta = BAND_META[requiredBand];

  return (
    <section aria-labelledby="matched-tutors-heading" className="pw-card p-6 mt-6">
      <header>
        <div className="label-caps text-[var(--pw-ink-2)]">Your matched tutors</div>
        <h2
          id="matched-tutors-heading"
          className="font-display font-bold uppercase tracking-[-0.025em] text-[1.25rem] leading-none mt-1"
        >
          {tutors === null
            ? "Matching…"
            : tutors.length > 0
              ? `${tutors.length} verified tutor${tutors.length === 1 ? "" : "s"} for ${subject}`
              : `No verified ${subject} tutors yet`}
        </h2>
        {tutors && tutors.length > 0 && (
          <p className="text-[0.8125rem] text-[var(--pw-ink-2)] mt-1.5">
            For your next step at{" "}
            <span className="inline-flex items-center gap-1 align-middle">
              <Icon name={requiredMeta.icon} className="h-4 w-4" />
              {requiredMeta.label}
            </span>
            {activeStageTitle ? ` — ${activeStageTitle}` : ""}.
          </p>
        )}
      </header>

      {tutors === null && (
        <div className="mt-4 space-y-3" aria-hidden="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-16 animate-pulse" style={{ background: "var(--pw-surface-2)" }} />
          ))}
        </div>
      )}

      {tutors && tutors.length > 0 && (
        <ul className="mt-4 space-y-3" role="list">
          {tutors.map((t) => (
            <TutorRow key={t.id} tutor={t} />
          ))}
        </ul>
      )}

      {tutors && tutors.length === 0 && (
        <div className="mt-4">
          <p className="text-[0.8125rem] text-[var(--pw-ink-2)]">
            We're onboarding tutors for {subject} now. Browse every verified tutor in the meantime.
          </p>
          <Link
            to="/matches"
            search={{} as never}
            className="pw-btn-outline inline-flex justify-center w-full mt-4 px-5 py-2.5"
          >
            See all tutors
          </Link>
        </div>
      )}
    </section>
  );
}

function TutorRow({ tutor }: { tutor: MatchedTutor }) {
  const name = tutor.display_name || tutor.full_name || "Tutor";
  return (
    <li className="pw-border p-3.5" style={{ background: "var(--pw-surface-2)" }}>
      <div className="flex items-start gap-3">
        {tutor.avatar_url ? (
          <img src={tutor.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-full flex items-center justify-center text-[0.9375rem] font-medium text-pw-on-accent shrink-0"
            style={{ background: "var(--pw-accent)" }}
          >
            {name[0]?.toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold uppercase text-[0.875rem]">{name}</span>
            <span style={{ color: "var(--pw-accent-2)" }} title="Verified tutor" aria-label="Verified tutor">
              <Icon name="check" className="h-3 w-3 text-inherit" />
            </span>
          </div>
          {tutor.headline && (
            <div className="text-[0.75rem] text-[var(--pw-ink-2)] mt-0.5 leading-snug">{tutor.headline}</div>
          )}
          <div className="text-[0.6875rem] text-[var(--pw-ink-2)] mt-1.5">
            ${Number(tutor.hourly_rate ?? 0).toFixed(0)}/hr
            {tutor.first_session_free && <span style={{ color: "var(--pw-accent-2)" }}> · 1st free</span>}
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Link
          to="/tutor/$tutorId"
          params={{ tutorId: tutor.id }}
          className="pw-btn-outline flex-1 text-center px-3 py-1.5"
        >
          View profile
        </Link>
        <Link
          to="/book/$tutorId"
          params={{ tutorId: tutor.id }}
          className="pw-btn-primary flex-1 text-center px-3 py-1.5"
        >
          Book
        </Link>
      </div>
    </li>
  );
}
