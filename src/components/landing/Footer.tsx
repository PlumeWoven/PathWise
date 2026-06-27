const columns = [
  {
    heading: "Product",
    links: ["Level check", "Roadmaps", "Find a tutor", "Pricing"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
  {
    heading: "Resources",
    links: ["Help center", "Community", "Tutor guide", "Status"],
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-pw-bg px-5 pb-12 pt-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <span className="font-display text-2xl font-bold tracking-wide text-pw-ink">
              PathWise
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-pw-muted">
              Learn deliberately. Find exactly where you stand and the path to where you want to be.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-pw-muted">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-pw-ink transition-colors hover:text-pw-accent"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div
          className="mt-12 h-px w-full rounded-full"
          style={{
            boxShadow:
              "inset 0 1px 2px var(--pw-shadow-dark), inset 0 -1px 1px var(--pw-shadow-light)",
          }}
          aria-hidden="true"
        />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-sm text-pw-muted sm:flex-row">
          <span>© {new Date().getFullYear()} PathWise. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-pw-accent">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-pw-accent">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
