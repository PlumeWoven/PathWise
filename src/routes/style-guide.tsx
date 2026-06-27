import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboardIcon,
  BookOpenIcon,
  CalendarIcon,
  MessageSquareIcon,
  DollarSignIcon,
  LineChartIcon,
  SettingsIcon,
  ShieldCheckIcon,
  LockIcon,
  TrendingUpIcon,
  PlayIcon,
  CheckIcon,
  ArrowRightIcon,
} from "lucide-react";
import { WaveSlider } from "@/components/styleguide/WaveSlider";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/style-guide")({
  head: () => ({
    meta: [
      { title: "PathWise — Design Language" },
      {
        name: "description",
        content:
          "The PathWise neomorphic component vocabulary: tokens, buttons, navigation, cards, inputs, badges, rows, and progress.",
      },
    ],
  }),
  component: StyleGuide,
});

/* -------------------------------------------------------------------------
   StyleGuide — a living reference for the PathWise neomorphic design system.
   Every section demonstrates a reusable class (defined in styles.css) and
   labels WHERE to apply it across the product (dashboard, roadmap, find-a-
   tutor, admin, quiz).
   ------------------------------------------------------------------------- */
interface SectionProps {
  id: string;
  title: string;
  applies: string;
  children: React.ReactNode;
}

function Section({ id, title, applies, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold tracking-wide text-pw-ink">{title}</h2>
        <p className="mt-1 text-sm text-pw-muted">
          <span className="font-semibold text-pw-accent">Apply to:</span> {applies}
        </p>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, varName }: { name: string; varName: string }) {
  return (
    <div className="pw-card !p-4">
      <div
        className="h-16 w-full rounded-2xl"
        style={{
          backgroundColor: `var(${varName})`,
          boxShadow:
            "inset 2px 2px 4px var(--pw-shadow-dark), inset -2px -2px 4px var(--pw-shadow-light)",
        }}
      />
      <p className="mt-3 text-sm font-semibold text-pw-ink">{name}</p>
      <p className="font-mono text-xs text-pw-muted">{varName}</p>
    </div>
  );
}

const navSections = [
  { id: "tokens", label: "Tokens" },
  { id: "buttons", label: "Buttons" },
  { id: "nav", label: "Navigation" },
  { id: "cards", label: "Cards & metrics" },
  { id: "inputs", label: "Inputs" },
  { id: "badges", label: "Badges & tags" },
  { id: "rows", label: "Rows & tables" },
  { id: "progress", label: "Progress & roadmap" },
];

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboardIcon },
  { id: "courses", label: "My Courses", Icon: BookOpenIcon },
  { id: "calendar", label: "Calendar", Icon: CalendarIcon },
  { id: "messages", label: "Messages", Icon: MessageSquareIcon },
  { id: "earnings", label: "Earnings", Icon: DollarSignIcon },
  { id: "analytics", label: "Analytics", Icon: LineChartIcon },
  { id: "settings", label: "Settings", Icon: SettingsIcon },
];

const metricCards = [
  { label: "Earnings (MTD)", value: "$0", trend: "0% vs last month" },
  { label: "Total students", value: "0", trend: "0% vs last month" },
  { label: "Sessions", value: "0", trend: "0% vs last month" },
  { label: "Avg rating", value: "—", trend: "vs last month —" },
];

const tableRows = [
  { label: "Profile views", value: "128" },
  { label: "Messages", value: "24" },
  { label: "Trial sessions", value: "6" },
  { label: "Paid sessions", value: "3" },
];

function StyleGuide() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [rating, setRating] = useState("any");
  const [price, setPrice] = useState(60);
  const [available, setAvailable] = useState(true);

  return (
    <main className="min-h-screen w-full bg-pw-bg px-5 py-10 text-pw-ink sm:px-8 lg:px-12">
      {/* Page header */}
      <header className="mx-auto mb-12 flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display text-2xl font-bold tracking-wide text-pw-ink">
            PathWise
          </span>
          <ThemeToggle />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-pw-ink">
            Design Language
          </h1>
          <p className="mt-1 text-sm text-pw-muted">
            Neomorphic component vocabulary for every PathWise screen.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[200px_1fr]">
        {/* Anchor nav */}
        <nav
          aria-label="Style guide sections"
          className="top-10 hidden h-fit flex-col gap-2 lg:sticky lg:flex"
        >
          {navSections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="pw-nav-item">
              {s.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-16">
          {/* TOKENS */}
          <Section
            id="tokens"
            title="Color tokens"
            applies="every surface. Use the CSS variables / tailwind tokens so dark mode inverts automatically."
          >
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
              <Swatch name="Background" varName="--pw-bg" />
              <Swatch name="Surface" varName="--pw-surface" />
              <Swatch name="Ink" varName="--pw-ink" />
              <Swatch name="Muted" varName="--pw-muted" />
              <Swatch name="Accent" varName="--pw-accent" />
              <Swatch name="Secondary" varName="--pw-secondary" />
            </div>
          </Section>

          {/* BUTTONS */}
          <Section
            id="buttons"
            title="Buttons"
            applies="primary CTAs (Get verified, Complete profile, Book trial), ghost actions (Find a tutor, View profile, Message, Clear filters)."
          >
            <div className="pw-card flex flex-wrap items-center gap-5">
              <button className="pw-btn-primary">
                Get verified <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button className="pw-btn-secondary text-pw-accent">
                Find a tutor <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
              <button className="pw-pill is-active">Daily</button>
              <button className="pw-pill">Weekly</button>
              <button className="pw-pill">Monthly</button>
              <span className="text-sm text-pw-muted">
                <code className="font-mono text-pw-ink">.pw-btn-primary</code> ·{" "}
                <code className="font-mono text-pw-ink">.pw-btn-secondary</code> ·{" "}
                <code className="font-mono text-pw-ink">.pw-pill.is-active</code>
              </span>
            </div>
          </Section>

          {/* NAVIGATION */}
          <Section
            id="nav"
            title="Navigation"
            applies="top nav pills (Dashboard, My Roadmap, Find a tutor) and the left sidebar (Dashboard, My Courses, Calendar…)."
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
              {/* Sidebar */}
              <div className="pw-card flex flex-col gap-2 !p-4">
                {sidebarItems.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveNav(id)}
                    className={`pw-nav-item ${activeNav === id ? "is-active" : ""}`}
                    aria-current={activeNav === id ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Top nav pills */}
              <div className="pw-card flex flex-wrap items-start gap-3">
                <button className="pw-pill is-active">Dashboard</button>
                <button className="pw-pill">My Roadmap</button>
                <button className="pw-pill">Find a tutor</button>
                <button className="pw-pill">My sessions</button>
                <button className="pw-pill">Admin</button>
                <p className="w-full text-sm text-pw-muted">
                  <code className="font-mono text-pw-ink">.pw-nav-item</code> for the sidebar,{" "}
                  <code className="font-mono text-pw-ink">.pw-pill</code> for the top bar — both
                  take <code className="font-mono text-pw-ink">.is-active</code>.
                </p>
              </div>
            </div>
          </Section>

          {/* CARDS & METRICS */}
          <Section
            id="cards"
            title="Cards & metric tiles"
            applies="metric cards (Earnings, Total students), chart panels, profile panels, admin stat tiles."
          >
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {metricCards.map((m) => (
                <motion.div
                  key={m.label}
                  whileHover={{
                    scale: 1.02,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className="pw-card"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-pw-muted">
                    {m.label}
                  </p>
                  <p className="mt-3 font-display text-3xl font-bold text-pw-accent">{m.value}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-pw-secondary">
                    <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {m.trend}
                  </p>
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-sm text-pw-muted">
              <code className="font-mono text-pw-ink">.pw-card</code> (raised) for tiles; nest a{" "}
              <code className="font-mono text-pw-ink">.pw-well</code> for chart areas and icon
              tiles.
            </p>
          </Section>

          {/* INPUTS */}
          <Section
            id="inputs"
            title="Inputs & filters"
            applies="the Find-a-tutor filter rail (search, price slider, checkboxes, rating pills, selects)."
          >
            <div className="pw-card grid grid-cols-1 gap-7 sm:grid-cols-2">
              <div className="flex flex-col gap-5">
                <div>
                  <label
                    htmlFor="sg-search"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-pw-muted"
                  >
                    Search
                  </label>
                  <input id="sg-search" className="pw-input" placeholder="Search tutors…" />
                </div>

                <div>
                  <label
                    htmlFor="sg-sort"
                    className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-pw-muted"
                  >
                    Sort by
                  </label>
                  <select id="sg-sort" className="pw-input">
                    <option>Best match</option>
                    <option>Lowest price</option>
                    <option>Highest rating</option>
                  </select>
                </div>

                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-pw-muted">
                    Price range · ${price}/hr
                  </span>
                  <WaveSlider
                    value={price}
                    onChange={setPrice}
                    min={0}
                    max={200}
                    ariaLabel={`Price range, ${price} per hour`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-pw-muted">
                    Availability
                  </span>
                  <div className="flex items-center gap-3 text-sm text-pw-ink">
                    <ToggleSwitch
                      checked={available}
                      onChange={setAvailable}
                      ariaLabel="Available this week"
                    />
                    Available this week
                  </div>
                </div>

                <div>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-pw-muted">
                    Minimum rating
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["any", "3★+", "4★+", "4.5★+"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRating(r)}
                        className={`pw-pill ${rating === r ? "is-active" : ""}`}
                      >
                        {r === "any" ? "Any" : r}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-pw-muted">
                  <code className="font-mono text-pw-ink">.pw-input</code> for fields & selects;
                  toggle pills reuse <code className="font-mono text-pw-ink">.pw-pill</code>.
                </p>
              </div>
            </div>
          </Section>

          {/* BADGES & TAGS */}
          <Section
            id="badges"
            title="Badges & tags"
            applies="status chips (EMAIL VERIFIED, Locked, 45% Match) and topic tags (Fractions, Decimals, Mathematics)."
          >
            <div className="pw-card flex flex-wrap items-center gap-3">
              <span className="pw-badge text-pw-secondary">
                <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Email verified
              </span>
              <span className="pw-badge">
                <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                Locked
              </span>
              <span className="pw-badge pw-badge-accent">45% Match</span>
              <span className="pw-badge">Fractions</span>
              <span className="pw-badge">Decimals</span>
              <span className="pw-badge">Mathematics</span>
              <p className="w-full text-sm text-pw-muted">
                <code className="font-mono text-pw-ink">.pw-badge</code> +{" "}
                <code className="font-mono text-pw-ink">.pw-badge-accent</code>.
              </p>
            </div>
          </Section>

          {/* ROWS & TABLES */}
          <Section
            id="rows"
            title="Rows & tables"
            applies="upcoming sessions, reviews, lead-funnel rows, and the admin Users table."
          >
            <div className="flex flex-col gap-3">
              {tableRows.map((row) => (
                <motion.div
                  key={row.label}
                  whileHover={{
                    scale: 1.01,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                  className="pw-row"
                >
                  <span className="text-sm font-semibold text-pw-ink">{row.label}</span>
                  <span className="font-display text-lg font-bold text-pw-accent">{row.value}</span>
                </motion.div>
              ))}
            </div>
            <div className="pw-divider my-6" />
            <p className="text-sm text-pw-muted">
              <code className="font-mono text-pw-ink">.pw-row</code> for each line; separate with{" "}
              <code className="font-mono text-pw-ink">.pw-divider</code> instead of hard borders.
            </p>
          </Section>

          {/* PROGRESS & ROADMAP */}
          <Section
            id="progress"
            title="Progress & roadmap stages"
            applies="roadmap progress, profile completeness, the quiz step bar, and roadmap stage cards."
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="pw-card">
                <p className="text-[11px] font-bold uppercase tracking-wider text-pw-muted">
                  Profile completeness
                </p>
                <p className="mt-2 mb-3 font-display text-2xl font-bold text-pw-ink">17%</p>
                <div
                  className="pw-progress"
                  role="progressbar"
                  aria-valuenow={17}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span
                    className="pw-progress-fill"
                    style={{
                      width: "17%",
                    }}
                  />
                </div>
              </div>

              <div className="pw-card">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-pw-accent text-white shadow-pw-raised-sm">
                    <PlayIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-pw-muted">
                    Stage 01
                  </p>
                </div>
                <h3 className="font-display text-xl font-bold text-pw-ink">Number Foundations</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="pw-badge">Fractions</span>
                  <span className="pw-badge">Decimals</span>
                  <span className="pw-badge">Ratios</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="pw-btn-primary !px-5 !py-2.5 text-sm">Start here</button>
                  <button className="pw-btn-secondary !px-5 !py-2.5 text-sm">
                    <CheckIcon className="h-4 w-4" aria-hidden="true" /> Mark complete
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-pw-muted">
              <code className="font-mono text-pw-ink">.pw-progress</code> +{" "}
              <code className="font-mono text-pw-ink">.pw-progress-fill</code>; stage cards are just{" "}
              <code className="font-mono text-pw-ink">.pw-card</code> + badges + buttons.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
