'use client';

import { Quote, Star } from 'lucide-react';
import { Reveal } from '@/components/motion/reveal';
import { SpotlightCard } from '@/components/landing/spotlight-card';
import { SectionHeading } from '@/components/landing/section-heading';
import { useLanguage } from '@/app/providers';

export function Testimonials() {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: 'María García',
      event: t.testimonials.testimonial1Event,
      text: t.testimonials.testimonial1Text,
    },
    {
      name: 'Carlos López',
      event: t.testimonials.testimonial2Event,
      text: t.testimonials.testimonial2Text,
    },
    {
      name: 'Ana Martínez',
      event: t.testimonials.testimonial3Event,
      text: t.testimonials.testimonial3Text,
    },
  ];

  return (
    <section id="testimonios" className="relative scroll-mt-24 overflow-hidden py-24 md:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 h-160 w-160 translate-x-1/3 rounded-full bg-[radial-gradient(circle,oklch(0.6_0.18_307/0.08),transparent_70%)] blur-3xl"
      />

      <div className="relative container mx-auto px-4">
        <SectionHeading
          eyebrow={t.testimonials.eyebrow}
          title={t.testimonials.title}
          subtitle={t.testimonials.subtitle}
        />

        <ul className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map(({ name, event, text }, index) => (
            <Reveal as="li" key={name} delay={index * 120}>
              <SpotlightCard className="h-full">
                <figure className="flex h-full flex-col p-7">
                  <Quote
                    className="mb-5 h-8 w-8 text-primary/25 transition-colors duration-500 group-hover:text-primary/50"
                    strokeWidth={1.5}
                  />
                  <blockquote className="flex-1 text-sm leading-relaxed text-foreground/85">
                    {text}
                  </blockquote>
                  <figcaption className="mt-6 border-t border-border/60 pt-5">
                    <div className="mb-2 flex gap-0.5" aria-label="5 de 5 estrellas">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star key={star} className="h-3.5 w-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{event}</p>
                  </figcaption>
                </figure>
              </SpotlightCard>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
