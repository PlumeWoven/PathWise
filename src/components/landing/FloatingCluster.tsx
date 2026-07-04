import { useEffect, useRef, type ComponentType } from "react";
import { TargetIcon, ZapIcon, RouteIcon } from "lucide-react";

/*
 * FloatingCluster — six neomorphic chips/pods that drift around the hero.
 *
 * The previous version was a CSS grid + subtle keyframe bob (pw-float-1/2/3),
 * which read as motionless and could not react to the cursor or collide.
 * This version drives every body through a single requestAnimationFrame loop
 * writing `transform` via refs (no per-frame React re-renders), so we get:
 *   - a lively but calm ambient wander (smooth sinusoidal pseudo-noise)
 *   - a spring back to each home anchor (settle, never fly off)
 *   - pairwise collision (overlap correction + restitution rebound)
 *   - cursor repulsion scaled by proximity (flee, then drift back)
 *   - speed + position clamping so motion stays bounded and elegant
 *
 * Bounds: a reserved top band (HEADER_SAFE) keeps every body below the sticky
 * header; a central copy safe-zone (COPY_MAX_WIDTH) keeps bodies out of the
 * centered headline/subtext/CTAs, so homes live in the left/right periphery.
 * Positions recompute on resize via ResizeObserver. prefers-reduced-motion
 * parks each body statically at its home anchor. The cluster is lg+ only and
 * the container is pointer-events-none so CTAs stay clickable.
 *
 * Neomorphic markup, lucide icons, depth shadows, and pw-* tokens are unchanged.
 */

/* ---- tunable physics (lively but calm) ---- */
const HEADER_SAFE = 96; // reserved top band for the sticky header (px)
const EDGE_MARGIN = 18; // inset from container edges (px)
const COPY_MAX_WIDTH = 672; // max-w-2xl copy column width (px) — kept clear
const COPY_PAD = 24; // extra gap around the copy column (px)
const SPRING_K = 5.5; // spring-to-home stiffness (1/s^2 per px)
const LINEAR_DAMP = 2.0; // velocity damping (1/s) — moderate, keeps motion alive
const WANDER_ACCEL = 110; // ambient drift acceleration (px/s^2) — clearly visible
const MAX_SPEED = 140; // speed clamp (px/s) — prevents runaway
const COLLISION_PAD = 12; // extra gap kept between bodies (px)
const RESTITUTION = 0.55; // bounce energy on collision (0..1)
const POINTER_RADIUS = 170; // cursor influence radius (px)
const POINTER_FORCE = 950; // repulsion accel at contact (px/s^2) — strong, obvious

/* ---- body definitions (markup/content/icons preserved from the grid version) ---- */
type Depth = "sm" | "md" | "lg";

const depthShadow: Record<Depth, string> = {
  sm: "shadow-pw-raised-sm",
  md: "shadow-pw-raised",
  lg: "shadow-pw-raised-lg",
};

interface ChipData {
  kind: "chip";
  label: string;
  text: string;
  depth: Depth;
  side: "left" | "right";
  yf: number; // home vertical fraction within the floating zone
}

interface PodData {
  kind: "pod";
  value: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  depth: Depth;
  side: "left" | "right";
  yf: number;
}

const items: (ChipData | PodData)[] = [
  { kind: "chip", label: "Stage 01", text: "Foundations", depth: "sm", side: "left", yf: 0.06 },
  { kind: "chip", label: "Stage 02", text: "Core Skills", depth: "md", side: "right", yf: 0.1 },
  { kind: "pod", value: "3 min", label: "avg", icon: ZapIcon, depth: "sm", side: "left", yf: 0.42 },
  { kind: "pod", value: "94%", label: "accuracy", icon: TargetIcon, depth: "md", side: "right", yf: 0.46 },
  { kind: "pod", value: "No", label: "signup", icon: RouteIcon, depth: "lg", side: "left", yf: 0.84 },
  { kind: "chip", label: "Stage 05", text: "Your Goal", depth: "lg", side: "right", yf: 0.86 },
];

type Body = {
  el: HTMLDivElement | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  r: number;
  homeX: number;
  homeY: number;
  bandMinX: number; // left clamp for this body's side
  bandMaxX: number; // right clamp for this body's side
  phaseX: number;
  phaseY: number;
  freqX: number;
  freqY: number;
};

export function FloatingCluster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = container.clientWidth;
    let height = container.clientHeight;
    let top = HEADER_SAFE + EDGE_MARGIN;
    let bottom = height - EDGE_MARGIN;
    // copy column horizontal bounds — bodies stay outside this band
    let safeLeft = Math.max(EDGE_MARGIN, (width - Math.min(width, COPY_MAX_WIDTH)) / 2);
    let safeRight = Math.min(width - EDGE_MARGIN, safeLeft + Math.min(width, COPY_MAX_WIDTH));

    const bodies: Body[] = items.map(() => ({
      el: null,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      w: 0,
      h: 0,
      r: 0,
      homeX: 0,
      homeY: 0,
      bandMinX: 0,
      bandMaxX: 0,
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      freqX: 0.45 + Math.random() * 0.4,
      freqY: 0.45 + Math.random() * 0.4,
    }));

    const measure = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      top = HEADER_SAFE + EDGE_MARGIN;
      bottom = height - EDGE_MARGIN;
      safeLeft = Math.max(EDGE_MARGIN, (width - Math.min(width, COPY_MAX_WIDTH)) / 2);
      safeRight = Math.min(width - EDGE_MARGIN, safeLeft + Math.min(width, COPY_MAX_WIDTH));
      const zoneH = Math.max(40, bottom - top);
      bodies.forEach((b, i) => {
        const el = b.el;
        if (!el) return;
        b.w = el.offsetWidth;
        b.h = el.offsetHeight;
        b.r = Math.max(b.w, b.h) * 0.55;
        const side = items[i].side;
        if (side === "left") {
          b.bandMinX = EDGE_MARGIN;
          b.bandMaxX = Math.max(EDGE_MARGIN, safeLeft - COPY_PAD - b.w);
        } else {
          b.bandMinX = Math.min(width - EDGE_MARGIN - b.w, safeRight + COPY_PAD);
          b.bandMaxX = Math.max(b.bandMinX, width - EDGE_MARGIN - b.w);
        }
        // home anchor: centered horizontally within the side band, vertical by yf
        const bandW = Math.max(0, b.bandMaxX - b.bandMinX);
        b.homeX = b.bandMinX + bandW * (side === "left" ? 0.35 : 0.65);
        b.homeY = top + items[i].yf * Math.max(0, zoneH - b.h);
      });
    };

    const placeStatic = () => {
      bodies.forEach((b) => {
        if (!b.el) return;
        b.el.style.transform = `translate(${b.homeX}px, ${b.homeY}px)`;
        b.el.style.opacity = "1";
      });
    };

    measure();

    // pointer tracking — listeners on window; the container is pointer-events-none
    const pointer = { x: -9999, y: -9999 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onPointerLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const onPointerOut = (e: PointerEvent) => {
      if (!e.relatedTarget) onPointerLeave();
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    document.addEventListener("pointerout", onPointerOut);

    const ro = new ResizeObserver(() => {
      measure();
      if (reduceMotion.matches) placeStatic();
    });
    ro.observe(container);

    const clampBounds = (b: Body) => {
      const minY = top;
      const maxY = Math.max(top, bottom - b.h);
      if (b.x < b.bandMinX) {
        b.x = b.bandMinX;
        b.vx = Math.abs(b.vx) * 0.5;
      }
      if (b.x > b.bandMaxX) {
        b.x = b.bandMaxX;
        b.vx = -Math.abs(b.vx) * 0.5;
      }
      if (b.y < minY) {
        b.y = minY;
        b.vy = Math.abs(b.vy) * 0.5;
      }
      if (b.y > maxY) {
        b.y = maxY;
        b.vy = -Math.abs(b.vy) * 0.5;
      }
    };

    let raf = 0;
    let last = performance.now();
    let t0 = last;
    let running = false;

    const step = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;

      // 1) integrate per-body forces (wander + spring + cursor repulsion)
      for (const b of bodies) {
        // ambient wander: smooth, organic, non-repeating drift
        const nx =
          Math.sin(t * b.freqX + b.phaseX) +
          0.5 * Math.sin(t * b.freqX * 2.3 + b.phaseY);
        const ny =
          Math.cos(t * b.freqY + b.phaseY) +
          0.5 * Math.cos(t * b.freqY * 1.7 + b.phaseX);
        let ax = nx * WANDER_ACCEL;
        let ay = ny * WANDER_ACCEL;

        // spring to home so they settle instead of drifting away
        ax += (b.homeX - b.x) * SPRING_K;
        ay += (b.homeY - b.y) * SPRING_K;

        // cursor repulsion, scaled by proximity (closer = stronger)
        const cx = b.x + b.w / 2;
        const cy = b.y + b.h / 2;
        const dx = cx - pointer.x;
        const dy = cy - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < POINTER_RADIUS && d > 0.01) {
          const f = (1 - d / POINTER_RADIUS) * POINTER_FORCE;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }

        b.vx += ax * dt;
        b.vy += ay * dt;

        // frame-rate-independent damping (keeps motion alive, bounds energy)
        const damp = Math.exp(-LINEAR_DAMP * dt);
        b.vx *= damp;
        b.vy *= damp;

        // clamp speed so wander never accumulates into runaway velocity
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > MAX_SPEED) {
          b.vx = (b.vx / sp) * MAX_SPEED;
          b.vy = (b.vy / sp) * MAX_SPEED;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        clampBounds(b);
      }

      // 2) pairwise collision — separate overlaps and rebound along the normal
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          let dx = a.x + a.w / 2 - (b.x + b.w / 2);
          let dy = a.y + a.h / 2 - (b.y + b.h / 2);
          let d = Math.hypot(dx, dy);
          const minD = a.r + b.r + COLLISION_PAD;
          if (d < minD) {
            if (d < 0.01) {
              dx = 1;
              dy = 0;
              d = 0.01;
            }
            const nx = dx / d;
            const ny = dy / d;
            const overlap = (minD - d) / 2;
            a.x += nx * overlap;
            a.y += ny * overlap;
            b.x -= nx * overlap;
            b.y -= ny * overlap;
            const rvx = a.vx - b.vx;
            const rvy = a.vy - b.vy;
            const vAlong = rvx * nx + rvy * ny;
            if (vAlong < 0) {
              const jimp = (-(1 + RESTITUTION) * vAlong) / 2; // equal mass
              a.vx += jimp * nx;
              a.vy += jimp * ny;
              b.vx -= jimp * nx;
              b.vy -= jimp * ny;
            }
            clampBounds(a);
            clampBounds(b);
          }
        }
      }

      // 3) write transforms (no React re-render)
      for (const b of bodies) {
        if (b.el) b.el.style.transform = `translate(${b.x}px, ${b.y}px)`;
      }

      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (reduceMotion.matches) {
        placeStatic();
        return;
      }
      if (running) return;
      // start at home + a small offset/velocity so motion is visible immediately
      bodies.forEach((b) => {
        b.x = b.homeX + (Math.random() - 0.5) * 26;
        b.y = b.homeY + (Math.random() - 0.5) * 26;
        b.vx = (Math.random() - 0.5) * 34;
        b.vy = (Math.random() - 0.5) * 34;
        if (b.el) b.el.style.opacity = "1";
      });
      last = performance.now();
      t0 = last;
      running = true;
      raf = requestAnimationFrame(step);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onReduce = (e: MediaQueryListEvent) => {
      if (e.matches) {
        stop();
        placeStatic();
      } else {
        start();
      }
    };
    reduceMotion.addEventListener?.("change", onReduce);

    start();

    return () => {
      stop();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
      document.removeEventListener("pointerout", onPointerOut);
      ro.disconnect();
      reduceMotion.removeEventListener?.("change", onReduce);
    };
  }, []);

  const setRef = (i: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[i] = el;
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      aria-hidden="true"
    >
      {items.map((item, i) => (
        <div
          key={`${item.kind}-${i}`}
          ref={setRef(i)}
          className="absolute left-0 top-0"
          style={{ opacity: 0, willChange: "transform" }}
        >
          {item.kind === "chip" ? (
            <div
              className={`min-w-[140px] rounded-2xl bg-pw-surface px-5 py-4 text-center ${depthShadow[item.depth]}`}
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider text-pw-accent">
                {item.label}
              </span>
              <span className="mt-1 block text-sm font-semibold text-pw-ink">{item.text}</span>
            </div>
          ) : (
            <div
              className={`flex h-24 w-24 flex-col items-center justify-center rounded-[20px] bg-pw-surface px-2 text-center ${depthShadow[item.depth]}`}
            >
              <item.icon className="mb-1 h-4 w-4 text-pw-secondary" aria-hidden={true} />
              <span className="text-lg font-bold leading-none text-pw-accent">{item.value}</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-pw-muted">
                {item.label}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
