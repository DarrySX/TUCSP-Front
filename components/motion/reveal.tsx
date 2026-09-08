'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Element to render. Defaults to a div; use `li`, `section`… to keep semantics. */
  as?: ElementType;
  /** Stagger, in milliseconds, applied once the element enters the viewport. */
  delay?: number;
  variant?: 'up' | 'fade' | 'scale';
  /** How much of the element must be visible before it animates (0–1). */
  threshold?: number;
}

/**
 * Reveals its children when they scroll into view, once.
 *
 * The hidden state lives in CSS (`.reveal`), not in React state, so server-rendered
 * markup is already in its starting position — there is no flash of fully laid-out
 * content before hydration. `prefers-reduced-motion` short-circuits the whole thing
 * in `globals.css`.
 */
export function Reveal({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
  variant = 'up',
  threshold = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || revealed) return;

    // Without IntersectionObserver, show the content rather than hiding it forever.
    if (typeof IntersectionObserver === 'undefined') {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed, threshold]);

  return (
    <Tag
      ref={ref}
      className={cn('reveal', className)}
      data-revealed={revealed || undefined}
      data-variant={variant}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
