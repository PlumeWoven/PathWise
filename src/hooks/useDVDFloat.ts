import { useEffect } from "react";

export interface DVDFloatItem {
  /** CSS selector for the element to float (queried inside the container). */
  selector: string;
  /** Drift speed in px per 60fps frame. Defaults to 0.55. */
  speed?: number;
  /** Fallback size used only until the element can be measured. */
  width?: number;
  height?: number;
}

const CONTAINER_SELECTOR = "[data-floating-container]";
const NO_FLY_SELECTOR = "[data-hero-content]";

/**
 * Keeps elements clear of the container edge. The container is `overflow-hidden`,
 * so anything closer than this gets its neomorphic shadow (up to 16px of spread)
 * sliced off. Inset = shadow spread + the largest parallax offset.
 */
const EDGE_INSET = 30;
/** Breathing room around the hero copy so nothing crowds the headline. */
const NO_FLY_PADDING = 28;
/** Max parallax translation, in px, at full depth. */
const MAX_PARALLAX = 12;
/** Below this container width there is no usable band around the hero copy. */
const MIN_CONTAINER_WIDTH = 900;
const FRAME_MS = 1000 / 60;

/** Normalized spawn anchors hugging the edges, so elements never start clustered. */
const SPAWN_ANCHORS = [
  { x: 0.07, y: 0.2 },
  { x: 0.79, y: 0.14 },
  { x: 0.05, y: 0.63 },
  { x: 0.83, y: 0.55 },
  { x: 0.2, y: 0.83 },
  { x: 0.66, y: 0.86 },
];

interface Body {
  el: HTMLElement;
  /** Top-left offset within the container, in px. */
  x: number;
  y: number;
  /** Velocity in px per 60fps frame. */
  vx: number;
  vy: number;
  w: number;
  h: number;
  speed: number;
  /** Parallax multiplier — fakes depth between the elements. */
  depth: number;
  /** False while the element is unmeasurable (e.g. `display: none` below `lg`). */
  active: boolean;
  /** Whether the element has been given its starting position and velocity. */
  spawned: boolean;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function overlap(a: Rect, b: Rect) {
  return {
    x: Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x),
    y: Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y),
  };
}

/**
 * DVD-logo style autonomous float for the landing hero decorations.
 *
 * Elements drift, bounce off the container edges, bounce off each other, and
 * treat the hero copy as a solid obstacle. Everything stays inside the
 * container bounds (minus an inset for the shadow), so the `overflow-hidden`
 * hero never clips a card or its shadow.
 *
 * Elements are expected to be `position: absolute; top: 0; left: 0` — this hook
 * owns their `transform`.
 */
export function useDVDFloat(items: DVDFloatItem[]) {
  useEffect(() => {
    const container = document.querySelector<HTMLElement>(CONTAINER_SELECTOR);
    if (!container) return;

    const bodies: Body[] = [];
    for (const [i, item] of items.entries()) {
      const el = container.querySelector<HTMLElement>(item.selector);
      if (!el) continue;
      bodies.push({
        el,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        w: item.width ?? 120,
        h: item.height ?? 60,
        speed: item.speed ?? 0.55,
        depth: 0.6 + (i % 3) * 0.2,
        active: false,
        spawned: false,
      });
    }
    if (bodies.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cw = 0;
    let ch = 0;
    let noFly: Rect | null = null;

    const render = (body: Body, parallaxX: number, parallaxY: number) => {
      const tx = body.x + parallaxX * body.depth;
      const ty = body.y + parallaxY * body.depth;
      body.el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
    };

    const clampToBounds = (body: Body) => {
      const maxX = cw - EDGE_INSET - body.w;
      const maxY = ch - EDGE_INSET - body.h;
      body.x = maxX < EDGE_INSET ? (cw - body.w) / 2 : Math.min(Math.max(body.x, EDGE_INSET), maxX);
      body.y = maxY < EDGE_INSET ? (ch - body.h) / 2 : Math.min(Math.max(body.y, EDGE_INSET), maxY);
    };

    /** Pushes a body out of the no-fly zone along its shallowest axis. */
    const resolveNoFly = (body: Body, bounce: boolean) => {
      if (!noFly) return;
      const rect: Rect = { x: body.x, y: body.y, w: body.w, h: body.h };
      const o = overlap(rect, noFly);
      if (o.x <= 0 || o.y <= 0) return;

      const minX = EDGE_INSET;
      const maxX = cw - EDGE_INSET - body.w;
      const minY = EDGE_INSET;
      const maxY = ch - EDGE_INSET - body.h;

      if (o.x < o.y) {
        const left = noFly.x - body.w;
        const right = noFly.x + noFly.w;
        const goLeft = body.x + body.w / 2 < noFly.x + noFly.w / 2;
        const first = goLeft ? left : right;
        const second = goLeft ? right : left;
        const target = first >= minX && first <= maxX ? first : second;
        if (target < minX || target > maxX) return; // no room either side — leave it
        body.x = target;
        if (bounce) body.vx = target === left ? -Math.abs(body.vx) : Math.abs(body.vx);
      } else {
        const above = noFly.y - body.h;
        const below = noFly.y + noFly.h;
        const goUp = body.y + body.h / 2 < noFly.y + noFly.h / 2;
        const first = goUp ? above : below;
        const second = goUp ? below : above;
        const target = first >= minY && first <= maxY ? first : second;
        if (target < minY || target > maxY) return;
        body.y = target;
        if (bounce) body.vy = target === above ? -Math.abs(body.vy) : Math.abs(body.vy);
      }
    };

    /** Measures the container, the hero copy and every element. */
    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      cw = containerRect.width;

      // The hero is `h-screen` but sits below the header, so its bottom band
      // falls under the fold. Clamp the play area to the part that is on screen
      // with the page at the top, otherwise elements drift out of sight.
      // Measured from the document top so scroll position can't skew it.
      const containerTop = containerRect.top + window.scrollY;
      const visibleHeight = window.innerHeight - containerTop;
      ch =
        visibleHeight > 200 ? Math.min(containerRect.height, visibleHeight) : containerRect.height;

      const heroContent = container.querySelector<HTMLElement>(NO_FLY_SELECTOR);
      if (heroContent && cw >= MIN_CONTAINER_WIDTH) {
        const r = heroContent.getBoundingClientRect();
        noFly = {
          x: r.left - containerRect.left - NO_FLY_PADDING,
          y: r.top - containerRect.top - NO_FLY_PADDING,
          w: r.width + NO_FLY_PADDING * 2,
          h: r.height + NO_FLY_PADDING * 2,
        };
      } else {
        noFly = null;
      }

      for (const body of bodies) {
        // Measure the real rendered box — hardcoded sizes let elements bounce
        // late and slide under the clipping edge.
        const w = body.el.offsetWidth;
        const h = body.el.offsetHeight;
        body.active = w > 0 && h > 0 && cw > 0 && ch > 0;
        if (!body.active) continue;
        body.w = w;
        body.h = h;
      }
    };

    /**
     * Gives every newly measurable body its edge anchor and velocity. Runs on
     * init and after resizes — an element that was `display: none` below `lg`
     * measures 0×0 and can only be placed once it actually has a box.
     */
    const spawnPending = () => {
      let spawnedAny = false;
      for (const [i, body] of bodies.entries()) {
        if (!body.active || body.spawned) continue;
        spawnedAny = true;
        body.spawned = true;
        const anchor = SPAWN_ANCHORS[i % SPAWN_ANCHORS.length];
        body.x = anchor.x * cw;
        body.y = anchor.y * ch;
        clampToBounds(body);
        resolveNoFly(body, false);
        clampToBounds(body);

        const angle = Math.PI / 5 + (i * Math.PI) / 3 + Math.random() * 0.5;
        body.vx = Math.cos(angle) * body.speed;
        body.vy = Math.sin(angle) * body.speed;
      }
      if (spawnedAny) separate(false);
    };

    /** Re-clamps already-placed bodies after the container changes size. */
    const reflow = () => {
      for (const body of bodies) {
        if (!body.active || !body.spawned) continue;
        clampToBounds(body);
        resolveNoFly(body, false);
        clampToBounds(body);
      }
    };

    /** Equal-mass elastic response between elements. */
    const separate = (bounce: boolean) => {
      for (let i = 0; i < bodies.length; i += 1) {
        const a = bodies[i];
        if (!a.active) continue;
        for (let j = i + 1; j < bodies.length; j += 1) {
          const b = bodies[j];
          if (!b.active) continue;
          const o = overlap(a, b);
          if (o.x <= 0 || o.y <= 0) continue;

          if (o.x < o.y) {
            const shift = (o.x / 2) * (a.x < b.x ? -1 : 1);
            a.x += shift;
            b.x -= shift;
            if (bounce) {
              const t = a.vx;
              a.vx = b.vx;
              b.vx = t;
            }
          } else {
            const shift = (o.y / 2) * (a.y < b.y ? -1 : 1);
            a.y += shift;
            b.y -= shift;
            if (bounce) {
              const t = a.vy;
              a.vy = b.vy;
              b.vy = t;
            }
          }
          clampToBounds(a);
          clampToBounds(b);
        }
      }
    };

    // ── Mouse parallax ────────────────────────────────────────────────────
    let parallaxX = 0;
    let parallaxY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;

    const onPointerMove = (event: PointerEvent) => {
      targetParallaxX = (event.clientX / window.innerWidth - 0.5) * 2 * MAX_PARALLAX;
      targetParallaxY = (event.clientY / window.innerHeight - 0.5) * 2 * MAX_PARALLAX;
    };

    // ── Static fallback for reduced motion ────────────────────────────────
    if (reduceMotion) {
      const paint = () => {
        measure();
        spawnPending();
        reflow();
        for (const body of bodies) {
          if (body.active) render(body, 0, 0);
        }
      };
      paint();
      const onResizeStatic = () => paint();
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    // ── Animation loop ────────────────────────────────────────────────────
    let raf = 0;
    let last = 0;

    const step = (now: number) => {
      const dt = last === 0 ? 1 : Math.min((now - last) / FRAME_MS, 3);
      last = now;

      parallaxX += (targetParallaxX - parallaxX) * 0.06;
      parallaxY += (targetParallaxY - parallaxY) * 0.06;

      for (const body of bodies) {
        if (!body.active) continue;

        body.x += body.vx * dt;
        body.y += body.vy * dt;

        const maxX = cw - EDGE_INSET - body.w;
        const maxY = ch - EDGE_INSET - body.h;
        if (maxX > EDGE_INSET) {
          if (body.x < EDGE_INSET) {
            body.x = EDGE_INSET;
            body.vx = Math.abs(body.vx);
          } else if (body.x > maxX) {
            body.x = maxX;
            body.vx = -Math.abs(body.vx);
          }
        }
        if (maxY > EDGE_INSET) {
          if (body.y < EDGE_INSET) {
            body.y = EDGE_INSET;
            body.vy = Math.abs(body.vy);
          } else if (body.y > maxY) {
            body.y = maxY;
            body.vy = -Math.abs(body.vy);
          }
        }

        resolveNoFly(body, true);
      }

      separate(true);

      for (const body of bodies) {
        if (body.active) render(body, parallaxX, parallaxY);
      }

      raf = requestAnimationFrame(step);
    };

    const start = () => {
      measure();
      spawnPending();
      reflow();
      last = 0;
      raf = requestAnimationFrame(step);
    };

    // Wait one frame so fonts/layout have settled before measuring.
    const initRaf = requestAnimationFrame(start);

    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        measure();
        spawnPending();
        reflow();
      });
    };

    const onVisibilityChange = () => {
      // Avoid a giant dt (and a teleport) after the tab comes back.
      last = 0;
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);
    const heroContent = container.querySelector<HTMLElement>(NO_FLY_SELECTOR);
    if (heroContent) resizeObserver.observe(heroContent);

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(initRaf);
      cancelAnimationFrame(resizeRaf);
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
