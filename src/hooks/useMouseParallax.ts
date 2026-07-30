import { useEffect, useRef, useCallback } from 'react';

interface ParallaxConfig {
    /** CSS selector for elements that should move */
    selector: string;
    /** Movement intensity (higher = more movement). Default 20 */
    intensity?: number;
    /** Whether to invert the direction. Default false */
    invert?: boolean;
    /** Smoothing factor (0-1, lower = smoother). Default 0.1 */
    smoothing?: number;
}

/**
 * Hook that tracks mouse movement and applies parallax transforms
 * to floating elements. Uses refs and requestAnimationFrame for
 * smooth 60fps animation without React re-renders.
 */
export function useMouseParallax(configs: ParallaxConfig[]) {
    const mouseRef = useRef({ x: 0, y: 0 });
    const currentRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number>(0);
    const targetsRef = useRef<Map<Element, { intensity: number; invert: boolean; smoothing: number }>>(new Map());

    const handleMouseMove = useCallback((e: MouseEvent) => {
        // Normalize to -1...1 range from center of viewport
        mouseRef.current = {
            x: (e.clientX / window.innerWidth - 0.5) * 2,
            y: (e.clientY / window.innerHeight - 0.5) * 2,
        };
    }, []);

    useEffect(() => {
        // Find all target elements
        targetsRef.current.clear();
        configs.forEach((config) => {
            const elements = document.querySelectorAll(config.selector);
            elements.forEach((el) => {
                targetsRef.current.set(el, {
                    intensity: config.intensity ?? 20,
                    invert: config.invert ?? false,
                    smoothing: config.smoothing ?? 0.1,
                });
            });
        });

        // Attach mouse listener
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Animation loop
        const animate = () => {
            const { x: targetX, y: targetY } = mouseRef.current;

            // Smooth interpolation (lerp)
            currentRef.current.x += (targetX - currentRef.current.x) * 0.1;
            currentRef.current.y += (targetY - currentRef.current.y) * 0.1;

            const { x, y } = currentRef.current;

            // Apply transforms to each element
            targetsRef.current.forEach((config, el) => {
                const intensity = config.intensity ?? 20;
                const direction = config.invert ? -1 : 1;

                const translateX = x * intensity * direction;
                const translateY = y * intensity * direction;

                (el as HTMLElement).style.transform =
                    `translate3d(${translateX}px, ${translateY}px, 0)`;
            });

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, [configs, handleMouseMove]);
}