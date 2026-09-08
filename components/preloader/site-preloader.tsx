'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { criticalAssets, LOGO_SRC } from '@/lib/site-assets';

/** Floor for how long the curtain stays up, so a warm cache doesn't flash it. */
const MIN_DURATION_MS = 1500;
/** Ceiling, so a stalled asset can never trap the visitor behind the curtain. */
const MAX_DURATION_MS = 8000;
/** Length of the exit wipe. Must match the CSS duration below. */
const EXIT_DURATION_MS = 1100;

type Phase = 'loading' | 'exiting' | 'done';

/** Resolves once the image is decoded, and also on error — a broken asset must not block the page. */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

/** Resolves when the document has finished its own load event. */
function documentReady(): Promise<void> {
  if (typeof document === 'undefined' || document.readyState === 'complete') {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    window.addEventListener('load', () => resolve(), { once: true });
  });
}

export function SitePreloader() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [progress, setProgress] = useState(0);

  // The real completion ratio, written by the loaders and read by the rAF loop.
  // Kept in a ref so resolving an asset doesn't re-render on every step.
  const targetRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  const finish = useCallback(() => {
    setPhase((current) => (current === 'loading' ? 'exiting' : current));
  }, []);

  // Ease the displayed counter toward the real ratio. Without this the number
  // snaps from 0 to 100 the moment a cached asset resolves.
  useEffect(() => {
    if (phase !== 'loading') return;

    const step = () => {
      setProgress((current) => {
        const next = current + (targetRef.current - current) * 0.08;
        return targetRef.current - next < 0.1 ? targetRef.current : next;
      });
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [phase]);

  // Drive the real loading. Assets account for 90% of the bar; the document's
  // own load event closes the last 10%.
  useEffect(() => {
    let cancelled = false;
    const startedAt = performance.now();

    const bumpTarget = (() => {
      let settled = 0;
      return () => {
        settled += 1;
        targetRef.current = Math.max(
          targetRef.current,
          (settled / criticalAssets.length) * 90
        );
      };
    })();

    const run = async () => {
      await Promise.all(
        criticalAssets.map((src) => preloadImage(src).then(bumpTarget))
      );
      await documentReady();
      if (cancelled) return;

      targetRef.current = 100;

      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_DURATION_MS - elapsed);
      window.setTimeout(() => {
        if (!cancelled) finish();
      }, remaining);
    };

    void run();

    // Escape hatch: never hold the page hostage to a hanging request.
    const bailout = window.setTimeout(finish, MAX_DURATION_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(bailout);
    };
  }, [finish]);

  // Lock scrolling while the curtain is up, and always release it on unmount.
  useEffect(() => {
    if (phase === 'done') return;
    document.body.dataset.loading = 'true';
    return () => {
      delete document.body.dataset.loading;
    };
  }, [phase]);

  // Unmount once the wipe has played out, so the overlay stops costing a layer.
  useEffect(() => {
    if (phase !== 'exiting') return;
    const timer = window.setTimeout(() => setPhase('done'), EXIT_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === 'done') return null;

  const isExiting = phase === 'exiting';
  const shown = Math.round(progress);

  return (
    <div
      // aria-hidden: the loader is decorative, the page beneath it is the content.
      aria-hidden="true"
      className={[
        'fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden',
        'bg-[oklch(0.12_0_0)] text-white',
        'transition-[transform,opacity] duration-1100 ease-in-out-quint',
        isExiting ? '-translate-y-full opacity-90' : 'translate-y-0 opacity-100',
      ].join(' ')}
    >
      {/* Ambient purple wash so the black isn't flat */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="animate-aurora absolute -top-1/3 left-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.45_0.18_307/0.45),transparent_65%)] blur-3xl" />
      </div>
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />

      <div
        className={[
          'relative flex flex-col items-center gap-8 px-6 transition-all duration-700 ease-out-expo',
          isExiting ? 'scale-105 opacity-0' : 'scale-100 opacity-100',
        ].join(' ')}
      >
        <div className="relative">
          {/* Expanding ring, echoing the logo silhouette */}
          <span className="animate-pulse-ring absolute inset-0 rounded-full border border-white/25" />
          <Image
            src={LOGO_SRC}
            alt=""
            width={220}
            height={220}
            priority
            // Knocked back to white — the mark's navy and crimson disappear on black.
            className="animate-float relative h-36 w-auto object-contain brightness-0 invert drop-shadow-[0_0_40px_oklch(0.55_0.18_307/0.55)] md:h-48"
          />
        </div>

        <p className="text-shimmer text-center text-[0.65rem] font-semibold tracking-[0.55em] uppercase md:text-xs">
          Tuna Universitaria UCSP
        </p>
      </div>

      {/* Progress rail */}
      <div
        className={[
          'absolute right-0 bottom-0 left-0 px-6 pb-10 transition-opacity duration-500 md:px-12',
          isExiting ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-5xl items-end justify-between gap-6">
          <span className="font-mono text-[0.6rem] tracking-[0.35em] text-white/45 uppercase">
            Cargando experiencia
          </span>
          <span className="font-mono text-4xl leading-none font-light tabular-nums md:text-6xl">
            {String(shown).padStart(3, '0')}
          </span>
        </div>
        <div className="mx-auto mt-4 h-px w-full max-w-5xl overflow-hidden bg-white/15">
          <div
            className="h-full bg-white transition-[width] duration-300 ease-out"
            style={{ width: `${shown}%` }}
          />
        </div>
      </div>
    </div>
  );
}
