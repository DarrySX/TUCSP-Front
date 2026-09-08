'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { SectionHeading } from '@/components/landing/section-heading';
import { Reveal } from '@/components/motion/reveal';
import { useLanguage } from '@/app/providers';
import { galleryImages } from '@/lib/site-assets';
import { cn } from '@/lib/utils';

/** Milliseconds between automatic slides. Paused on hover, focus and manual input. */
const AUTOPLAY_MS = 4500;

export function Gallery() {
  const { t } = useLanguage();
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelected(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    // Manual interaction ends autoplay for good — fighting the user is worse
    // than losing the animation.
    api.on('pointerDown', () => setPaused(true));
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [api, paused]);

  const scrollTo = useCallback(
    (index: number) => {
      setPaused(true);
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <section
      id="galeria"
      className="relative scroll-mt-24 overflow-hidden bg-[oklch(0.14_0_0)] py-24 text-white md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
      />
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay" />

      <div className="relative container mx-auto px-4">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            align="left"
            invert
            eyebrow={t.gallery.eyebrow}
            title={t.gallery.title}
            subtitle={t.gallery.subtitle}
          />

          <Reveal variant="fade" className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                api?.scrollPrev();
              }}
              aria-label={t.gallery.previous}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/10 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setPaused(true);
                api?.scrollNext();
              }}
              aria-label={t.gallery.next}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-300 hover:scale-105 hover:border-white/50 hover:bg-white/10 active:scale-95"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </Reveal>
        </div>
      </div>

      <Reveal variant="fade" className="mt-14">
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
        >
          <Carousel
            setApi={setApi}
            opts={{ loop: true, align: 'start', dragFree: false }}
            className="w-full"
          >
            {/* Negative margin bleeds the track to the viewport edge on desktop */}
            <CarouselContent className="-ml-4 px-4 md:px-[max(1rem,calc((100vw-80rem)/2))]">
              {galleryImages.map((image, index) => (
                <CarouselItem
                  key={image.src}
                  className={cn(
                    'basis-[85%] pl-4 sm:basis-[55%] lg:basis-[38%]',
                    image.wide && 'lg:basis-[52%]'
                  )}
                >
                  <figure className="group relative aspect-4/3 overflow-hidden rounded-2xl bg-white/5">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 55vw, 40vw"
                      className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
                    <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                      <span className="text-lg font-semibold tracking-tight text-white drop-shadow">
                        {image.caption}
                      </span>
                      <span className="font-mono text-xs text-white/50 tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </Reveal>

      {/* Slide indicators */}
      <div className="relative container mx-auto mt-10 px-4">
        <div className="flex items-center gap-2" role="tablist" aria-label={t.gallery.title}>
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-label={`${t.gallery.goTo} ${index + 1}: ${image.caption}`}
              onClick={() => scrollTo(index)}
              className={cn(
                'h-1 rounded-full transition-all duration-500 ease-out-expo',
                selected === index ? 'w-10 bg-primary' : 'w-4 bg-white/25 hover:bg-white/50'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
