import { Link } from "@tanstack/react-router";
import { LandingCtas } from "./LandingCtas";

// Only pages that exist: the old columns linked "About", "Blog", "Status"… to "#".
const columns = [
  {
    heading: "Product",
    links: [
      { label: "Level check", to: "/quiz" },
      { label: "Roadmaps", to: "/roadmap" },
      { label: "Find a tutor", to: "/find-tutor" },
      { label: "Course library", to: "/library" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
] as const;

export function Footer({ lit = false }: { lit?: boolean }) {
  return (
    <footer className="relative overflow-hidden bg-qed-ground pt-32">
      <div data-journey="footer-copy" className="relative z-[2] px-6 pb-24 md:px-24">
        <div className="flex flex-col items-start justify-between gap-12 md:flex-row md:items-end">
          <div>
            <h2 className="mb-6 max-w-lg font-syne text-4xl uppercase sm:text-5xl leading-none tracking-[-0.025em] md:text-7xl">
              Know your level before you book.
            </h2>
            <p className="max-w-sm leading-relaxed text-qed-ink-2">
              Math and English tutoring in Moldova. You pay your tutor directly.
            </p>
          </div>
          <LandingCtas />
        </div>

        <div className="mt-24 grid grid-cols-2 gap-12">
          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="label-caps text-qed-ink-2">{col.heading}</h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="inline-flex min-h-11 items-center text-sm transition-colors hover:text-qed-amber"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="h-px w-full bg-qed-hairline" />

      <div className="flex items-center justify-between px-6 py-4 text-qed-ink-2 md:px-24">
        <span className="label-caps">
          © {new Date().getFullYear()} PathWise ·{" "}
          <Link to="/privacy" className="inline-block py-4 -my-4 hover:text-qed-amber">
            Privacy
          </Link>{" "}
          /{" "}
          <Link to="/terms" className="inline-block py-4 -my-4 hover:text-qed-amber">
            Terms
          </Link>
        </span>
        <span className="label-caps">
          Icons by{" "}
          <a
            href="https://www.streamlinehq.com"
            target="_blank"
            rel="noreferrer"
            className="inline-block py-4 -my-4 hover:text-qed-amber"
          >
            Streamline
          </a>
        </span>
      </div>

      <div
        data-journey="end"
        className="pointer-events-none -mb-[2.7vw] w-full overflow-hidden md:-mb-[4.5vw]"
        aria-hidden="true"
      >
        <p
          className={`whitespace-nowrap text-center font-syne text-[10.8vw] font-extrabold uppercase leading-none transition-colors duration-1000 ${
            lit ? "text-qed-ink/30" : "text-qed-hairline"
          }`}
        >
          PathWise
        </p>
      </div>
    </footer>
  );
}
Footer.displayName = "Footer";
