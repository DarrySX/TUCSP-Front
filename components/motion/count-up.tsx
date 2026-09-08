'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  to: number;
  /** Rendered after the number, e.g. "+" or "%". */
  suffix?: string;
  durationMs?: number;
  className?: string;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * Counts from zero to `to` the first time it scrolls into view.
 *
 * The final value is rendered server-side and the animation only starts on the
 * client, so the real number is present for crawlers and for anyone who has
 * reduced motion enabled.
 */
export function CountUp({ to, suffix = '', durationMs = 1800, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') return;

    setValue(0);
    let frame: number;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / durationMs, 1);
          setValue(Math.round(easeOutExpo(progress) * to));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [to, durationMs]);

  return (
    <span ref={ref} className={className}>
      {value.toLocaleString('es-PE')}
      {suffix}
    </span>
  );
}
