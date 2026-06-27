import { useEffect, useRef, useState, type ComponentType } from "react";
import { TargetIcon, ZapIcon, RouteIcon } from "lucide-react";

type Depth = "sm" | "md" | "lg";

interface FloatingItem {
  kind: "chip" | "pod";
  depth: Depth;
  /** home anchor as fractions of the container (0..1) */
  home: {
    fx: number;
    fy: number;
  };
  /** half-extents in px (used for bounds + collision) */
  halfW: number;
  halfH: number;
  /** collision radius in px */
  radius: number;
}

interface ChipItem extends FloatingItem {
  kind: "chip";
  label: string;
  text: string;
}

interface PodItem extends FloatingItem {
  kind: "pod";
  value: string;
  label: string;
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean;
  }>;
}

const depthShadow: Record<Depth, string> = {
  sm: "shadow-pw-raised-sm",
  md: "shadow-pw-raised",
  lg: "shadow-pw-raised-lg",
};

// Evenly dispersed home anchors — biased to the perimeter so the centered
// hero copy stays readable, balanced left/right and across vertical thirds.
const items: (ChipItem | PodItem)[] = [
  {
    kind: "chip",
    label: "Stage 01",
    text: "Foundations",
    depth: "sm",
    home: { fx: 0.14, fy: 0.3 },
    halfW: 78,
    halfH: 34,
    radius: 74,
  },
  {
    kind: "chip",
    label: "Stage 02",
    text: "Core Skills",
    depth: "md",
    home: { fx: 0.86, fy: 0.27 },
    halfW: 78,
    halfH: 34,
    radius: 74,
  },
  {
    kind: "chip",
    label: "Stage 05",
    text: "Your Goal",
    depth: "lg",
    home: { fx: 0.5, fy: 0.86 },
    halfW: 78,
    halfH: 34,
    radius: 74,
  },
  {
    kind: "pod",
    value: "3 min",
    label: "avg",
    icon: ZapIcon,
    depth: "sm",
    home: { fx: 0.08, fy: 0.62 },
    halfW: 48,
    halfH: 48,
    radius: 56,
  },
  {
    kind: "pod",
    value: "94%",
    label: "accuracy",
    icon: TargetIcon,
    depth: "md",
    home: { fx: 0.92, fy: 0.58 },
    halfW: 48,
    halfH: 48,
    radius: 56,
  },
  {
    kind: "pod",
    value: "No",
    label: "signup",
    icon: RouteIcon,
    depth: "lg",
    home: { fx: 0.22, fy: 0.87 },
    halfW: 48,
    halfH: 48,
    radius: 56,
  },
];

// Reserve a band at the top so floating elements never clip the header.
const HEADER_SAFE = 104;
const EDGE_MARGIN = 16;

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // resolved home x (px)
  hy: number; // resolved home y (px)
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

export function FloatingCluster() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bodies = useRef<Body[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const frame = useRef<number | null>(null);
  const [ready, setReady] = useState(false);

  // Measure the container and (re)compute home anchors.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const seed = (w: number, h: number) => {
      sizeRef.current = { w, h };
      items.forEach((item, i) => {
        const hx = clamp(item.home.fx * w, EDGE_MARGIN + item.halfW, w - EDGE_MARGIN - item.halfW);
        const hy = clamp(item.home.fy * h, HEADER_SAFE + item.halfH, h - EDGE_MARGIN - item.halfH);
        const existing = bodies.current[i];
        bodies.current[i] = existing
          ? { ...existing, hx, hy }
          : { x: hx, y: hy, vx: 0, vy: 0, hx, hy };
      });
      setReady(true);
    };
    const rect = el.getBoundingClientRect();
    seed(rect.width, rect.height);
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r) seed(r.width, r.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pointer tracking (relative to container).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pointer.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const onLeave = () => {
      pointer.current = null;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Physics simulation.
  useEffect(() => {
    if (!ready) return;
    if (prefersReducedMotion()) {
      // Place statically at home anchors.
      bodies.current.forEach((b, i) => {
        const node = nodeRefs.current[i];
        if (node) {
          node.style.transform = `translate3d(${b.hx - items[i].halfW}px, ${b.hy - items[i].halfH}px, 0)`;
        }
      });
      return;
    }
    const REPEL_RADIUS = 170;
    const REPEL_FORCE = 1400;
    const SPRING = 0.014;
    const DAMPING = 0.9;
    const WANDER = 0.045;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16.6667, 2.5); // normalized to ~60fps
      last = now;
      const { w, h } = sizeRef.current;
      const bs = bodies.current;
      for (let i = 0; i < bs.length; i++) {
        const b = bs[i];
        // Soft spring back to home (keeps even dispersal).
        b.vx += (b.hx - b.x) * SPRING * dt;
        b.vy += (b.hy - b.y) * SPRING * dt;
        // Gentle idle wander so they never sit perfectly still.
        b.vx += (Math.random() - 0.5) * WANDER * dt;
        b.vy += (Math.random() - 0.5) * WANDER * dt;
        // Cursor repulsion — flee the pointer when in proximity.
        const p = pointer.current;
        if (p) {
          const dx = b.x - p.x;
          const dy = b.y - p.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          if (dist < REPEL_RADIUS) {
            const strength = (1 - dist / REPEL_RADIUS) * (REPEL_FORCE / (dist * dist + 400));
            b.vx += (dx / dist) * strength * dt;
            b.vy += (dy / dist) * strength * dt;
          }
        }
      }
      // Element-to-element collision (separate overlapping pairs).
      for (let i = 0; i < bs.length; i++) {
        for (let j = i + 1; j < bs.length; j++) {
          const a = bs[i];
          const c = bs[j];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const minDist = items[i].radius + items[j].radius;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            c.x += nx * overlap;
            c.y += ny * overlap;
            // Exchange a little push so they bounce apart.
            const push = overlap * 0.12 * dt;
            a.vx -= nx * push;
            a.vy -= ny * push;
            c.vx += nx * push;
            c.vy += ny * push;
          }
        }
      }
      // Integrate + clamp to bounds (header band is off-limits).
      for (let i = 0; i < bs.length; i++) {
        const b = bs[i];
        const it = items[i];
        b.vx *= DAMPING;
        b.vy *= DAMPING;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const minX = EDGE_MARGIN + it.halfW;
        const maxX = Math.max(minX, w - EDGE_MARGIN - it.halfW);
        const minY = HEADER_SAFE + it.halfH;
        const maxY = Math.max(minY, h - EDGE_MARGIN - it.halfH);
        if (b.x < minX) {
          b.x = minX;
          b.vx *= -0.4;
        } else if (b.x > maxX) {
          b.x = maxX;
          b.vx *= -0.4;
        }
        if (b.y < minY) {
          b.y = minY;
          b.vy *= -0.4;
        } else if (b.y > maxY) {
          b.y = maxY;
          b.vy *= -0.4;
        }
        const node = nodeRefs.current[i];
        if (node) {
          node.style.transform = `translate3d(${b.x - it.halfW}px, ${b.y - it.halfH}px, 0)`;
        }
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
  }, [ready]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
      aria-hidden="true"
    >
      {items.map((item, i) => (
        <div
          key={`${item.kind}-${i}`}
          ref={(node) => {
            nodeRefs.current[i] = node;
          }}
          className="absolute left-0 top-0 will-change-transform"
          style={{
            opacity: ready ? 1 : 0,
            transition: "opacity 0.6s ease",
          }}
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
