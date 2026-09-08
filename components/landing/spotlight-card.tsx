'use client';

import { useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Card with a cursor-following highlight.
 *
 * The pointer position is written to CSS custom properties rather than React
 * state, so moving the mouse never re-renders the tree. The highlight itself is
 * a `::before`-style overlay driven entirely by CSS, and is invisible on touch
 * devices where there is no cursor to follow.
 */
export function SpotlightCard({ children, className }: SpotlightCardProps) {
  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
    target.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
  }, []);

  return (
    <div
      onPointerMove={handlePointerMove}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/70 bg-card',
        'transition-[transform,border-color,box-shadow] duration-500 ease-out-expo',
        'hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_oklch(0.4_0.18_307/0.45)]',
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(320px circle at var(--spot-x, 50%) var(--spot-y, 50%), oklch(0.6 0.18 307 / 0.14), transparent 70%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
