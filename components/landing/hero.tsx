'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountUp } from '@/components/motion/count-up';
import { useLanguage } from '@/app/providers';
import { LOGO_SRC } from '@/lib/site-assets';

export function Hero() {
  const { t } = useLanguage();
  const backdropRef = useRef<HTMLDivElement>(null);

  // Parallax: the backdrop drifts at ~35% of scroll speed. Written straight to
  // the style attribute inside rAF so it never triggers a React re-render.
  useEffect(() => {
    const node = backdropRef.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = Math.min(window.scrollY, window.innerHeight) * 0.35;
      node.style.transform = `translate3d(0, ${offset}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const stats = [
    { value: 500, suffix: '+', label: t.hero.stat1Label },
    { value: 15, suffix: '+', label: t.hero.stat2Label },
    { value: 100, suffix: '%', label: t.hero.stat3Label },
  ];

  return (
    // `isolate` scopes the backdrop's stacking context to this section, so the
    // photo layer can never slip behind the section's own background colour.
    <section className="relative isolate flex min-h-dvh items-center overflow-hidden bg-[oklch(0.12_0_0)] text-white">
      {/* Backdrop */}
      <div ref={backdropRef} className="absolute inset-0 -z-10 will-change-transform">
        <Image
          src="/Grupal1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="animate-ken-burns object-cover object-center"
        />
        {/* Legibility scrim: horizontal for the copy column, radial to vignette the edges */}
        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-[oklch(0.12_0_0)] via-transparent to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,oklch(0.12_0_0/0.55)_100%)]" />
        <div className="bg-noise absolute inset-0 opacity-[0.15] mix-blend-overlay" />
      </div>

      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" />

      <div className="relative container mx-auto px-4 pt-32 pb-40 md:pt-40">
        <div className="max-w-3xl">
          <div
            data-enter
            className="animate-enter mb-8 flex items-center gap-4"
            style={{ '--enter-delay': '100ms' } as React.CSSProperties}
          >
            <Image
              src={LOGO_SRC}
              alt="Tuna Universitaria UCSP"
              width={120}
              height={120}
              priority
              // The mark is navy-and-crimson on transparent; knocking it back to
              // white is the only way it holds up against the dark backdrop.
              className="h-20 w-auto object-contain brightness-0 invert drop-shadow-[0_0_24px_oklch(0.6_0.18_307/0.55)] md:h-24"
            />
            <span className="h-10 w-px bg-white/25" />
            <span className="font-mono text-[0.6rem] leading-relaxed tracking-[0.3em] text-white/60 uppercase md:text-xs">
              Arequipa · Perú
              <br />
              {t.hero.eyebrow}
            </span>
          </div>

          <h1
            data-enter
            className="animate-enter text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ '--enter-delay': '260ms' } as React.CSSProperties}
          >
            {t.hero.title}{' '}
            <span className="bg-linear-to-r from-[oklch(0.78_0.16_307)] via-[oklch(0.7_0.19_307)] to-[oklch(0.85_0.1_307)] bg-clip-text text-transparent">
              {t.hero.titleAccent}
            </span>
          </h1>

          <p
            data-enter
            className="animate-enter mt-7 max-w-xl text-base leading-relaxed text-balance text-white/70 md:text-lg"
            style={{ '--enter-delay': '400ms' } as React.CSSProperties}
          >
            {t.hero.subtitle}
          </p>

          <div
            data-enter
            className="animate-enter mt-10 flex flex-wrap gap-3"
            style={{ '--enter-delay': '540ms' } as React.CSSProperties}
          >
            <Button size="lg" asChild className="group h-12 px-7 text-base">
              <Link href="#contacto">
                {t.hero.cta1}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="group h-12 border-white/25 bg-white/5 px-7 text-base text-white backdrop-blur-sm hover:bg-white hover:text-black"
            >
              <Link href="#galeria">
                <Play className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                {t.hero.cta2}
              </Link>
            </Button>
          </div>

          <dl
            data-enter
            className="animate-enter mt-16 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-8"
            style={{ '--enter-delay': '700ms' } as React.CSSProperties}
          >
            {stats.map(({ value, suffix, label }) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <CountUp
                    to={value}
                    suffix={suffix}
                    className="block text-3xl font-bold tabular-nums md:text-4xl"
                  />
                  <span className="mt-1 block text-xs leading-snug text-white/55">{label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Scroll affordance */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-2">
        <span className="font-mono text-[0.55rem] tracking-[0.4em] text-white/40 uppercase">
          {t.hero.scroll}
        </span>
        <span className="relative flex h-10 w-px overflow-hidden bg-white/20">
          <span className="animate-scroll-hint absolute inset-x-0 top-0 h-4 bg-white" />
        </span>
      </div>
    </section>
  );
}
