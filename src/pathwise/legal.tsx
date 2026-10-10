import type { ReactNode } from "react";

/**
 * Who runs PathWise and how to reach them. Shown on /privacy, /terms and
 * /contact. Both must be filled in before these pages go live.
 */
export const OPERATOR = "";
export const CONTACT_EMAIL = "";
export const LEGAL_LAST_UPDATED = "10 October 2026";

/** Shared shell for the plain-text legal pages. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="max-w-2xl mx-auto px-5 sm:px-8 py-12">
      <div className="label-caps text-[var(--pw-ink-2)]">Last updated {LEGAL_LAST_UPDATED}</div>
      <h1 className="font-display text-[2rem] uppercase tracking-[-0.025em] leading-none mt-2">
        {title}
      </h1>
      <div className="mt-8 space-y-6 text-[0.9375rem] leading-relaxed text-[var(--pw-ink-2)] [&_h2]:font-display [&_h2]:uppercase [&_h2]:text-[1.125rem] [&_h2]:text-[var(--pw-ink)] [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:underline [&_a]:text-[var(--pw-ink)]">
        {children}
      </div>
    </main>
  );
}

export function ContactLink() {
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}
