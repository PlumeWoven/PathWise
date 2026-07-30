import { useEffect, useRef, useCallback } from 'react';

export interface FloatingElementConfig {
    /** Unique ID for this element */
    id: string;
    /** CSS selector to find the element in the DOM */
    selector: string;
    /** Initial X position (px from left of container) */
    startX: number;
    /** Initial Y position (px from top of container) */
    startY: number;
    /** Speed in pixels per frame (default: 0.3) */
    speed?: number;
    /** Initial angle in radians (default: random) */
    angle?: number;
    /** Element width in px (for boundary detection) */
    width: number;
    /** Element height in px (for boundary detection) */
    height: number;
}

interface FloatingState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
}

/**
 * Hook that makes elements float around autonomously (DVD-logo style)
 * while also responding to cursor movement (parallax overlay).
 */
export function useFloatingElements(configs: FloatingElementConfig[]) {
    const statesRef = useRef<Map<string, FloatingState>>(new Map());
    const mouseRef = useRef({ x: 0, y: 0 });
    const mouseSmoothRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>(0);
    const containerRef = useRef<HTMLElement | null>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        mouseRef.current = {
            x: (e.clientX / window.innerWidth - 0.5) * 2,
            y: (e.clientY / window.innerHeight - 0.5) * 2,
        };
    }, []);

    useEffect(() => {
        containerRef.current = document.querySelector('[data-floating-container]') || document.body;

        // Initialize states from configs
        statesRef.current.clear();
        configs.forEach((cfg) => {
            const speed = cfg.speed ?? 0.3;
            const angle = cfg.angle ?? Math.random() * Math.PI * 2;

            statesRef.current.set(cfg.id, {
                x: cfg.startX,
                y: cfg.startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                width: cfg.width,
                height: cfg.height,
            });
        });

        // Attach mouse listener
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        const handleResize = () => {
            statesRef.current.forEach((state) => {
                // Clamp position to new viewport bounds
                state.x = Math.min(state.x, window.innerWidth - state.width);
                state.y = Math.min(state.y, window.innerHeight - state.height);
                state.x = Math.max(0, state.x);
                state.y = Math.max(0, state.y);
            });
        };

        window.addEventListener('resize', handleResize);

        const animate = () => {
            const container = containerRef.current;
            if (!container) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            const bounds = {
                width: window.innerWidth,
                height: window.innerHeight,
            };

            // Smooth mouse position
            mouseSmoothRef.current.x += (mouseRef.current.x - mouseSmoothRef.current.x) * 0.06;
            mouseSmoothRef.current.y += (mouseRef.current.y - mouseSmoothRef.current.y) * 0.06;

            const { x: mx, y: my } = mouseSmoothRef.current;

            // Define the "no-fly zone" — the center hero content area
            // Elements bounce away from this rectangle
            const heroCenterX = bounds.width / 2;
            const heroCenterY = bounds.height / 2;
            const heroHalfW = 280; // ~560px wide hero area
            const heroHalfH = 180; // ~360px tall hero area

            const noFlyZone = {
                left: heroCenterX - heroHalfW,
                right: heroCenterX + heroHalfW,
                top: heroCenterY - heroHalfH,
                bottom: heroCenterY + heroHalfH,
            };

            // Update each element
            statesRef.current.forEach((state, id) => {
                // Move position by velocity
                state.x += state.vx;
                state.y += state.vy;

                // Bounce off viewport edges
                if (state.x <= 0) {
                    state.x = 0;
                    state.vx = Math.abs(state.vx); // bounce right
                }
                if (state.x + state.width >= bounds.width) {
                    state.x = bounds.width - state.width;
                    state.vx = -Math.abs(state.vx); // bounce left
                }
                if (state.y <= 0) {
                    state.y = 0;
                    state.vy = Math.abs(state.vy); // bounce down
                }
                if (state.y + state.height >= bounds.height) {
                    state.y = bounds.height - state.height;
                    state.vy = -Math.abs(state.vy); // bounce up
                }

                // Bounce off the center no-fly zone
                const elCenterX = state.x + state.width / 2;
                const elCenterY = state.y + state.height / 2;

                // Check if element overlaps the no-fly zone
                const overlapsHorizontally = state.x + state.width > noFlyZone.left && state.x < noFlyZone.right;
                const overlapsVertically = state.y + state.height > noFlyZone.top && state.y < noFlyZone.bottom;

                if (overlapsHorizontally && overlapsVertically) {
                    // Push the element away from center
                    const dx = elCenterX - heroCenterX;
                    const dy = elCenterY - heroCenterY;

                    // Reflect based on which side is closer
                    if (Math.abs(dx) / heroHalfW > Math.abs(dy) / heroHalfH) {
                        // Bounce horizontally
                        state.vx = dx > 0 ? Math.abs(state.vx) : -Math.abs(state.vx);
                        // Push out of the zone
                        if (dx > 0) {
                            state.x = noFlyZone.right + 2;
                        } else {
                            state.x = noFlyZone.left - state.width - 2;
                        }
                    } else {
                        // Bounce vertically
                        state.vy = dy > 0 ? Math.abs(state.vy) : -Math.abs(state.vy);
                        if (dy > 0) {
                            state.y = noFlyZone.bottom + 2;
                        } else {
                            state.y = noFlyZone.top - state.height - 2;
                        }
                    }
                }

                // Find the DOM element
                const cfg = configs.find((c) => c.id === id);
                if (!cfg) return;

                const el = document.querySelector(cfg.selector) as HTMLElement | null;
                if (!el) return;

                // Parallax offset from cursor (subtle, adds on top of autonomous drift)
                const parallaxIntensity = 12;
                const px = mx * parallaxIntensity;
                const py = my * parallaxIntensity;

                // Add a subtle rotation based on velocity direction
                const rotation = state.vx * 3; // slight tilt in direction of movement

                // Apply combined transform: autonomous position + cursor parallax + rotation
                el.style.transform = `translate3d(${state.x + px}px, ${state.y + py}px, 0) rotate(${rotation}deg)`;
            });

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(rafRef.current);
        };
    }, [configs, handleMouseMove]);
}