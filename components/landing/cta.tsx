'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { useLanguage } from '@/app/providers';
import { LOGO_SRC } from '@/lib/site-assets';

export function CTA() {
  const { t } = useLanguage();

  // Duplicated so the marquee can loop seamlessly at -50%.
  const marqueeWords = [t.cta.word1, t.cta.word2, t.cta.word3, t.cta.word4];

  return (
    <section className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Oversized logo watermark */}
      <Image
        src={LOGO_SRC}
        alt=""
        aria-hidden="true"
        width={900}
        height={900}
        className="pointer-events-none absolute -right-24 -bottom-32 w-xl max-w-none opacity-[0.06] mix-blend-overlay select-none"
      />
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />

      {/* Scrolling word band */}
      <div className="relative flex overflow-hidden border-b border-white/15 py-5">
        <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8">
          {[...marqueeWords, ...marqueeWords, ...marqueeWords, ...marqueeWords].map(
            (word, index) => (
              <span
                key={`${word}-${index}`}
                className="flex shrink-0 items-center gap-8 font-mono text-xs tracking-[0.3em] whitespace-nowrap text-white/60 uppercase"
              >
                {word}
                <span className="h-1 w-1 rounded-full bg-white/40" />
              </span>
            )
          )}
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-24 text-center md:py-32">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">
            {t.cta.title}
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-5 max-w-xl text-base text-balance text-white/80 md:text-lg">
            {t.cta.subtitle}
          </p>
        </Reveal>
        <Reveal delay={240} variant="scale">
          <Button size="lg" variant="secondary" asChild className="group mt-10 h-13 px-8 text-base font-semibold">
            <Link href="#contacto">
              {t.cta.button1}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
