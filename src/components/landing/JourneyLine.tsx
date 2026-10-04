import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

type Pt = [number, number];
type Box = { l: number; r: number; t: number; b: number; w: number; h: number };

/**
 * Smooth curve through the points: centripetal Catmull-Rom (α = 0.5) → cubic Bézier.
 * Centripetal parametrisation never forms cusps or overshoot loops, so bends stay round.
 */
function smoothPath(p: Pt[]) {
  const n = (v: number) => +v.toFixed(1);
  const dist = (a: Pt, b: Pt) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])); // |ab|^0.5
  let d = `M ${n(p[0][0])} ${n(p[0][1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const d1 = dist(p0, p1);
    const d2 = dist(p1, p2);
    const d3 = dist(p2, p3);
    const c1 = (k: 0 | 1) =>
      d1 === 0
        ? p1[k]
        : (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) /
          (3 * d1 * (d1 + d2));
    const c2 = (k: 0 | 1) =>
      d3 === 0
        ? p2[k]
        : (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) /
          (3 * d3 * (d3 + d2));
    d += ` C ${n(c1(0))} ${n(c1(1))}, ${n(c2(0))} ${n(c2(1))}, ${n(p2[0])} ${n(p2[1])}`;
  }
  return d;
}

// Length of the amber accent along the track (px). Its tail fades out via a gradient.
const COMET_LEN = 260;

/**
 * Waypoints from the landing sections' `data-journey` anchors, placed in the gutters and gaps
 * so the line wraps around headings, the CTAs, the deck and the tables instead of crossing them.
 */
function route(root: HTMLElement): Pt[] | null {
  const box = root.getBoundingClientRect();
  const get = (k: string): Box | null => {
    const el = root.querySelector(`[data-journey="${k}"]`);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      l: r.left - box.left,
      r: r.right - box.left,
      t: r.top - box.top,
      b: r.bottom - box.top,
      w: r.width,
      h: r.height,
    };
  };
  const [S, H, C, K, R, V, F, E] = [
    "statement",
    "statement-heading",
    "deck-copy",
    "deck",
    "roster",
    "voices",
    "footer-copy",
    "end",
  ].map(get);
  if (!S || !H || !C || !K || !R || !V || !F || !E) return null;

  const W = box.width;
  const narrow = W < 768;
  const m = narrow ? 14 : 44; // distance kept from content edges
  // Phones: keep waypoints well inside the screen so the rounded bends don't bulge past the edge.
  const edge = narrow ? 22 : 10;
  const x = (v: number) => Math.min(W - edge, Math.max(narrow ? 12 : 10, v));
  // Right of the card stack when it sits beside the copy (lg); else the right gutter.
  const side = K.l > C.r ? K.r + 136 : W - m; // clears the fanned back cards (3 × 32px)

  return [
    [x(W * 0.86), S.t],
    [x(Math.max(H.r + 80, W * 0.72)), H.t + H.h * 0.5], // right of the heading
    [x(W * 0.88), S.t + S.h * 0.8],
    [x(side), K.t - 40], // around the card stack, clear of the copy and CTAs
    [x(side), K.b + 120], // past the progress row and its Next button
    [x(K.l + K.w * 0.5), K.b + 175], // swing under the deck
    [x(R.l - m), R.t - 24], // into the gutter before the "Your roadmap" label
    [x(R.l - m), R.t + R.h * 0.5],
    [x(R.l - m), R.b],
    [x(W * 0.5), V.t - 64], // across the testimonials' top padding
    [x(V.r + m), V.t + V.h * 0.25], // down the right gutter
    [x(V.r + m), V.b],
    [x(F.r - m), F.t + F.h * 0.5],
    [x(W * 0.78), E.t - E.h * 0.35],
    [x(W * 0.64), E.t + E.h * 0.05], // arc down into the wordmark
    [W * 0.5, E.t + E.h * 0.45], // into the PATHWISE wordmark
  ];
}

/**
 * A faint track from below the hero to the footer wordmark, with a short glowing amber comet that
 * flows along it. The comet's head sits ~65% down the viewport (spring-smoothed), then catches up to
 * the end over the last screen of scroll. Rendered after the sections at z-1: above their
 * backgrounds, below their (z-2) content.
 */
export function JourneyLine({ onArrive }: { onArrive: (arrived: boolean) => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<{ d: string; w: number; h: number } | null>(null);
  const samples = useRef<{ y: number[]; f: number[]; L: number }>({ y: [], f: [], L: 0 });
  const progress = useMotionValue(0);
  // Flow toward the scroll position instead of stepping with each wheel tick.
  const smooth = useSpring(progress, { stiffness: 60, damping: 20, mass: 0.8, restDelta: 0.0005 });
  const { scrollY } = useScroll();
  // Accent = the stretch [head − COMET_LEN, head] of the normalised track.
  const cometLen = useTransform(smooth, (v) =>
    Math.min(v, COMET_LEN / Math.max(samples.current.L, 1)),
  );
  const cometStart = useTransform(smooth, (v) =>
    Math.max(0, v - COMET_LEN / Math.max(samples.current.L, 1)),
  );
  // Amber tip dot rides the head of the comet.
  const tipX = useMotionValue(0);
  const tipY = useMotionValue(0);
  // Tail end of the accent: the gradient runs tail (transparent) → head (amber).
  const tailX = useMotionValue(0);
  const tailY = useMotionValue(0);
  // Visible while travelling; fades out once the wordmark lights up (and back in on the way up).
  const showTarget = useMotionValue(0);
  const show = useSpring(showTarget, { stiffness: 140, damping: 26 });
  const placeTip = (v: number) => {
    const p = pathRef.current;
    const { L } = samples.current;
    if (!p || !L) return;
    const pt = p.getPointAtLength(v * L);
    tipX.set(pt.x);
    tipY.set(pt.y);
    const tail = p.getPointAtLength(Math.max(0, v * L - COMET_LEN));
    tailX.set(tail.x);
    tailY.set(tail.y);
    showTarget.set(v > 0.002 && v <= 0.985 ? 1 : 0); // hidden before it sets off and after arrival
  };

  const sync = (sy: number) => {
    const root = svgRef.current?.parentElement;
    const { y, f } = samples.current;
    if (!root || !y.length) return;
    const vh = window.innerHeight;
    const rootTop = root.getBoundingClientRect().top + sy;
    const maxScroll = document.documentElement.scrollHeight - vh;
    const tail = Math.min(1, Math.max(0, (sy - (maxScroll - vh)) / vh)); // last screen of scroll
    const head = sy + vh * 0.65 + (vh * 0.35 + 40) * tail - rootTop;
    let i = 0;
    while (i < y.length && y[i] < head) i++;
    if (i >= y.length) return progress.set(1);
    if (i === 0) return progress.set(0);
    // Interpolate between the two samples around the head for a continuous value.
    const t = y[i] === y[i - 1] ? 1 : (head - y[i - 1]) / (y[i] - y[i - 1]);
    progress.set(f[i - 1] + (f[i] - f[i - 1]) * t);
  };

  useMotionValueEvent(scrollY, "change", sync);
  useMotionValueEvent(smooth, "change", (v) => {
    placeTip(v);
    onArrive(v > 0.985);
  });

  useLayoutEffect(() => {
    const root = svgRef.current?.parentElement;
    if (!root) return;
    const update = () => {
      const pts = route(root);
      if (pts) setGeo({ d: smoothPath(pts), w: root.clientWidth, h: root.clientHeight });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(root);
    document.fonts?.ready.then(update);
    return () => ro.disconnect();
  }, []);

  // Sample the drawn path: cumulative max y → length fraction, for the scroll-to-progress lookup.
  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p || !geo) return;
    const L = p.getTotalLength();
    const y: number[] = [];
    const f: number[] = [];
    let maxY = -Infinity;
    for (let i = 0; i <= 800; i++) {
      maxY = Math.max(maxY, p.getPointAtLength((L * i) / 800).y);
      y.push(maxY);
      f.push(i / 800);
    }
    samples.current = { y, f, L };
    sync(window.scrollY);
    placeTip(smooth.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      width={geo?.w ?? 0}
      height={geo?.h ?? 0}
      fill="none"
      className="pointer-events-none absolute left-0 top-0 z-[1] overflow-hidden"
    >
      {geo && (
        // The track: the whole route, faint and static.
        <path
          ref={pathRef}
          d={geo.d}
          stroke="var(--color-qed-ink)"
          strokeOpacity={0.12}
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {geo && (
        // Reduced motion: only the static track shows; the moving comet and tip are hidden.
        <motion.g style={{ opacity: show }} className="motion-reduce:hidden">
          <defs>
            <motion.linearGradient
              id="journey-comet"
              gradientUnits="userSpaceOnUse"
              x1={tailX}
              y1={tailY}
              x2={tipX}
              y2={tipY}
            >
              <stop offset="0%" stopColor="var(--color-qed-amber)" stopOpacity="0" />
              <stop offset="55%" stopColor="var(--color-qed-amber)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-qed-amber)" stopOpacity="1" />
            </motion.linearGradient>
            <radialGradient id="journey-tip-glow">
              <stop offset="0%" stopColor="var(--color-qed-amber)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--color-qed-amber)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* One accent length, three widths: soft glow, halo, core — all fading tail → head. */}
          {[
            { w: 10, o: 0.16 },
            { w: 4.5, o: 0.32 },
            { w: 1.75, o: 1 },
          ].map(({ w, o }) => (
            <motion.path
              key={w}
              d={geo.d}
              stroke="url(#journey-comet)"
              strokeOpacity={o}
              strokeWidth={w}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: cometLen, pathOffset: cometStart }}
            />
          ))}
          <motion.circle cx={tipX} cy={tipY} r={18} fill="url(#journey-tip-glow)" />
          <motion.circle cx={tipX} cy={tipY} r={4.5} fill="var(--color-qed-amber)" />
        </motion.g>
      )}
    </svg>
  );
}
